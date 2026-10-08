"""
Generates all Vexo Store brand assets from the original logo mockup.

Usage (from the project root):
    python scripts/generate-brand-assets.py

Input : public/brand/logo-source.jpg   (original high-res logo on a paper background)
Output:
    public/brand/logo.png          full logo (icon + "VEXO STORE" + subtitle), transparent bg  -> header
    public/brand/icon.png          ONLY the graphic mark (no text), transparent, 512x512
    public/favicon.ico             graphic mark only, 16/32/48/64 px
    public/apple-touch-icon.png    graphic mark only, 180x180 on opaque white (iOS has no transparency)

The paper background is removed by estimating the local background colour
(grey closing + blur) and solving for the foreground colour/alpha per pixel,
so edges stay clean on both light and dark surfaces.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "brand" / "logo-source.jpg"
BRAND = ROOT / "public" / "brand"

# Pixel bounds measured from the source image (saturation analysis).
ICON_BOX = (394, 113, 630, 342)      # x0, y0, x1, y1 — graphic mark only
FULL_BOX = (284, 113, 739, 446)      # mark + wordmark + subtitle


def key_out_background(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)

    # Local background estimate: closing removes dark/saturated objects, blur smooths texture.
    bg = np.stack(
        [ndimage.grey_closing(rgb[..., c], size=(45, 45)) for c in range(3)], axis=-1
    )
    bg = ndimage.gaussian_filter(bg, sigma=(10, 10, 0))

    diff = np.abs(rgb - bg).max(axis=-1)
    alpha = np.clip((diff - 20.0) / 30.0, 0.0, 1.0)

    # Embossed shadows and paper grain are light + desaturated; the logo itself is
    # either saturated (teal/orange/yellow/blue) or dark. Drop the former.
    sat = rgb.max(axis=-1) - rgb.min(axis=-1)
    lum = rgb.mean(axis=-1)
    alpha = np.where((sat < 28) & (lum > 140), 0.0, alpha)

    # Remove isolated specks, then feather the edge slightly.
    solid = ndimage.binary_opening(alpha > 0.5, structure=np.ones((2, 2)))
    near = ndimage.binary_dilation(solid, iterations=3)
    alpha = np.where(near, alpha, 0.0)
    alpha = ndimage.gaussian_filter(alpha, 0.6)

    # Solve pix = a*fg + (1-a)*bg for fg to avoid light halos around edges.
    a = np.maximum(alpha[..., None], 1e-3)
    fg = np.clip((rgb - (1.0 - a) * bg) / a, 0, 255)
    fg = np.where(alpha[..., None] > 0.02, fg, 0)

    out = np.dstack([fg, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def pad_box(box, pad, size):
    x0, y0, x1, y1 = box
    return (max(x0 - pad, 0), max(y0 - pad, 0), min(x1 + pad, size[0]), min(y1 + pad, size[1]))


def square_canvas(img: Image.Image, side: int, margin_ratio: float, bg=(0, 0, 0, 0)) -> Image.Image:
    inner = int(side * (1 - 2 * margin_ratio))
    scale = inner / max(img.size)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (side, side), bg)
    canvas.alpha_composite(resized, ((side - resized.width) // 2, (side - resized.height) // 2))
    return canvas


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    keyed = key_out_background(src)

    # 1) Full logo for the header (transparent, small safe margin).
    full = keyed.crop(pad_box(FULL_BOX, 14, src.size))
    full.save(BRAND / "logo.png", optimize=True)

    # 2) Graphic mark only — cropped from the *source* so no text can leak in.
    mark = keyed.crop(pad_box(ICON_BOX, 6, src.size))
    square_canvas(mark, 512, 0.04).save(BRAND / "icon.png", optimize=True)

    # 3) favicon.ico (transparent, tight margin so the mark stays legible at 16px)
    fav_master = square_canvas(mark, 256, 0.02)
    fav_master.save(
        ROOT / "public" / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )

    # 4) apple-touch-icon.png (opaque white, iOS rounds the corners itself)
    apple = square_canvas(mark, 180, 0.14, bg=(255, 255, 255, 255)).convert("RGB")
    apple.save(ROOT / "public" / "apple-touch-icon.png", optimize=True)

    print("full logo :", full.size)
    print("mark      :", mark.size)
    print("done")


if __name__ == "__main__":
    main()
