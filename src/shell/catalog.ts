import catalogRaw from "../games/index.json";

export interface CatalogEntry {
  id: string;
  slug: string;
  title: string;
  system: string;
  category: string;
  cover: string;
  weight: number;
}

export function loadCatalog(): CatalogEntry[] {
  return [...(catalogRaw as CatalogEntry[])].sort((a, b) => b.weight - a.weight);
}
