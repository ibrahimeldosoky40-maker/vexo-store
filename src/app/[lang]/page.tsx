import { notFound } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { QuickCategories, TrustBar } from "@/components/home/QuickCategories";
import { Bestsellers, SocialProof } from "@/components/home/Sections";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <QuickCategories lang={lang} dict={dict} />
      <Bestsellers lang={lang} dict={dict} />
      <TrustBar dict={dict} />
      <SocialProof dict={dict} />
    </>
  );
}
