import type { AssetRecord } from "./assets";
import { canExport } from "./rules";

type ManifestAsset = {
  name: string;
  kind: AssetRecord["kind"];
  category: AssetRecord["category"];
  path: string;
  tags: string[];
  metadata: {
    sizeBytes: number;
    width?: number;
    height?: number;
    extension: string;
    originalPath: string;
  };
};

export type AssetManifest = {
  engine: "godot";
  generatedBy: "AssetForge";
  generatedAt: string;
  assets: ManifestAsset[];
};

export function buildManifest(assets: AssetRecord[], generatedAt = new Date().toISOString()): AssetManifest {
  return {
    engine: "godot",
    generatedBy: "AssetForge",
    generatedAt,
    assets: assets.filter(canExport).map((asset) => ({
      name: asset.name,
      kind: asset.kind,
      category: asset.category,
      path: asset.godotPath,
      tags: asset.tags,
      metadata: {
        sizeBytes: asset.sizeBytes,
        width: asset.dimensions?.width,
        height: asset.dimensions?.height,
        extension: asset.extension,
        originalPath: asset.originalPath
      }
    }))
  };
}

export function manifestToJson(assets: AssetRecord[]): string {
  return JSON.stringify(buildManifest(assets), null, 2);
}

export function buildImportNotes(assets: AssetRecord[]): string {
  const blockedAssets = assets.filter((asset) => !canExport(asset));
  const assetsWithIssues = assets.filter((asset) => asset.issues.length > 0);
  const renameIssues = assets.flatMap((asset) =>
    asset.issues
      .filter((issue) => ["spaces_in_name", "not_lowercase", "not_snake_case", "duplicate_base_name"].includes(issue.code))
      .map((issue) => ({ asset, issue }))
  );
  const manualReviews = assets.flatMap((asset) =>
    asset.issues
      .filter((issue) => !["spaces_in_name", "not_lowercase", "not_snake_case", "duplicate_base_name"].includes(issue.code))
      .map((issue) => ({ asset, issue }))
  );

  const lines = [
    "# Godot Import Notes",
    "",
    "## Summary",
    `- ${assets.length} assets reviewed`,
    `- ${assetsWithIssues.length} assets need attention`,
    `- ${blockedAssets.length} assets blocked from export`,
    "",
    "## Blocked From Export"
  ];

  if (blockedAssets.length === 0) {
    lines.push("- No blocked assets.");
  } else {
    blockedAssets.forEach((asset) => {
      lines.push(`- \`${asset.originalPath}\` should be removed or converted before import.`);
    });
  }

  lines.push("", "## Rename Before Import");
  if (renameIssues.length === 0) {
    lines.push("- No rename issues found.");
  } else {
    renameIssues.forEach(({ asset, issue }) => {
      lines.push(`- \`${asset.name}\`: ${issue.message}${issue.suggestion ? ` ${issue.suggestion}` : ""}`);
    });
  }

  lines.push("", "## Review Manually");
  if (manualReviews.length === 0) {
    lines.push("- No manual review items found.");
  } else {
    manualReviews.forEach(({ asset, issue }) => {
      lines.push(`- \`${asset.name}\`: ${issue.message}${issue.suggestion ? ` ${issue.suggestion}` : ""}`);
    });
  }

  return `${lines.join("\n")}\n`;
}
