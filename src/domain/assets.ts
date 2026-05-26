export type AssetKind = "image" | "audio" | "model" | "data" | "unknown";
export type AssetCategory = "sprites" | "audio" | "models" | "data" | "misc";
export type IssueSeverity = "warning" | "error";

export type ValidationIssue = {
  code: string;
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
};

export type AssetRecord = {
  id: string;
  name: string;
  originalPath: string;
  extension: string;
  kind: AssetKind;
  sizeBytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  category?: AssetCategory;
  tags: string[];
  godotPath: string;
  issues: ValidationIssue[];
};
