import "server-only";
import { notFound } from "next/navigation";
import type en from "@/dictionaries/en.json";
import { isLocale, type Locale } from "./config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default as Dictionary),
};

/** Resolves a validated locale param to its dictionary; 404s on unknown locales. */
export async function getDictionary(lang: string): Promise<Dictionary> {
  if (!isLocale(lang)) notFound();
  return dictionaries[lang]();
}
