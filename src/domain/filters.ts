import type { AssetKind, AssetRecord } from "./assets";
import { visibleIssues } from "./review";

export type StatusFilter = "all" | "needs_attention" | "reviewed" | "blocked";
export type KindFilter = AssetKind | "all";

export type AssetFilters = {
  query: string;
  status: StatusFilter;
  kind: KindFilter;
};

function hasBlockingError(asset: AssetRecord): boolean {
  return asset.issues.some((issue) => issue.severity === "error");
}

function matchesStatus(asset: AssetRecord, status: StatusFilter): boolean {
  switch (status) {
    case "all":
      return true;
    case "needs_attention":
      return visibleIssues(asset).length > 0;
    case "reviewed":
      return visibleIssues(asset).length === 0;
    case "blocked":
      return hasBlockingError(asset);
  }
}

function matchesQuery(asset: AssetRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [asset.name, asset.originalPath, asset.godotPath, asset.kind, asset.category ?? "", ...asset.tags]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export function filterAssets(assets: AssetRecord[], filters: AssetFilters): AssetRecord[] {
  return assets.filter((asset) => {
    const kindMatches = filters.kind === "all" || asset.kind === filters.kind;
    return kindMatches && matchesStatus(asset, filters.status) && matchesQuery(asset, filters.query);
  });
}
