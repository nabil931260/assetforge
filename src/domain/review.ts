import type { AssetRecord, ValidationIssue } from "./assets";

function reviewedSet(asset: AssetRecord): Set<string> {
  return new Set(asset.reviewedIssueCodes);
}

export function isIssueReviewed(asset: AssetRecord, issue: ValidationIssue): boolean {
  return issue.severity === "warning" && reviewedSet(asset).has(issue.code);
}

export function visibleIssues(asset: AssetRecord): ValidationIssue[] {
  return asset.issues.filter((issue) => !isIssueReviewed(asset, issue));
}

export function reviewedIssues(asset: AssetRecord): ValidationIssue[] {
  return asset.issues.filter((issue) => isIssueReviewed(asset, issue));
}

export function markIssueReviewed(asset: AssetRecord, issueCode: string): AssetRecord {
  const issue = asset.issues.find((currentIssue) => currentIssue.code === issueCode);

  if (!issue || issue.severity === "error") {
    return asset;
  }

  return {
    ...asset,
    reviewedIssueCodes: Array.from(new Set([...asset.reviewedIssueCodes, issueCode]))
  };
}
