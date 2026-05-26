import type { AssetRecord, ValidationIssue } from "./assets";
import { getBaseName, toGodotPath } from "./metadata";

const maxPracticalSizeByKind: Record<AssetRecord["kind"], number> = {
  image: 4 * 1024 * 1024,
  audio: 8 * 1024 * 1024,
  model: 6 * 1024 * 1024,
  data: 512 * 1024,
  unknown: 0
};

function isSnakeCaseFileName(name: string): boolean {
  const base = getBaseName(name);
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(base);
}

function issue(code: string, severity: ValidationIssue["severity"], message: string, suggestion?: string): ValidationIssue {
  return { code, severity, message, suggestion };
}

export function validateAssets(assets: AssetRecord[]): AssetRecord[] {
  const baseNameCounts = assets.reduce<Record<string, number>>((counts, asset) => {
    const key = getBaseName(asset.name).replace(/[\s-]+/g, "_").toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return assets.map((asset) => {
    const issues: ValidationIssue[] = [];
    const baseNameKey = getBaseName(asset.name).replace(/[\s-]+/g, "_").toLowerCase();
    const maxSize = maxPracticalSizeByKind[asset.kind];

    if (asset.kind === "unknown") {
      issues.push(
        issue(
          "unsupported_type",
          "error",
          `.${asset.extension || "unknown"} is not part of the supported Godot asset review set.`,
          "Move this file out of the import batch or convert it to a supported format."
        )
      );
    }

    if (baseNameCounts[baseNameKey] > 1) {
      issues.push(
        issue(
          "duplicate_base_name",
          "warning",
          "Another asset has the same normalized base name.",
          "Rename one file so exported resources stay easy to search in Godot."
        )
      );
    }

    if (/\s/.test(asset.name)) {
      issues.push(
        issue("spaces_in_name", "warning", "Filename contains spaces.", "Use lowercase snake_case for Godot asset names.")
      );
    }

    if (asset.name !== asset.name.toLowerCase()) {
      issues.push(
        issue("not_lowercase", "warning", "Filename uses uppercase characters.", "Rename the file to lowercase.")
      );
    }

    if (!isSnakeCaseFileName(asset.name)) {
      issues.push(
        issue("not_snake_case", "warning", "Filename is not snake_case.", "Use names like enemy_slime.png.")
      );
    }

    if (!asset.category) {
      issues.push(
        issue("missing_category", "warning", "No import category is set.", "Choose sprites, audio, models, data, or misc.")
      );
    }

    if (asset.tags.length === 0) {
      issues.push(issue("missing_tags", "warning", "No tags are assigned.", "Add one or two tags for search and review."));
    }

    if (maxSize > 0 && asset.sizeBytes > maxSize) {
      issues.push(
        issue(
          "large_file",
          "warning",
          "File is larger than the current lightweight prototype threshold.",
          "Review compression, trimming, or whether this belongs in the first import pass."
        )
      );
    }

    return {
      ...asset,
      godotPath: toGodotPath(asset),
      issues
    };
  });
}

export function getIssueSummary(assets: AssetRecord[]) {
  return assets.reduce(
    (summary, asset) => {
      summary.total += asset.issues.length;
      summary.errors += asset.issues.filter((issueItem) => issueItem.severity === "error").length;
      summary.warnings += asset.issues.filter((issueItem) => issueItem.severity === "warning").length;
      return summary;
    },
    { total: 0, errors: 0, warnings: 0 }
  );
}

export function canExport(asset: AssetRecord): boolean {
  return !asset.issues.some((issueItem) => issueItem.severity === "error");
}
