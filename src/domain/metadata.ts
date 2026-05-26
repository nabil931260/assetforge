import type { AssetCategory, AssetKind, AssetRecord } from "./assets";

const imageExtensions = new Set(["png", "jpg", "jpeg", "webp"]);
const audioExtensions = new Set(["wav", "ogg", "mp3"]);
const modelExtensions = new Set(["glb", "gltf", "fbx", "obj"]);
const dataExtensions = new Set(["json", "csv", "txt"]);

export type RawAssetInput = {
  id: string;
  name: string;
  originalPath?: string;
  sizeBytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  tags?: string[];
};

export function getExtension(name: string): string {
  const lastPart = name.split("/").pop() ?? name;
  const dotIndex = lastPart.lastIndexOf(".");

  if (dotIndex === -1 || dotIndex === lastPart.length - 1) {
    return "";
  }

  return lastPart.slice(dotIndex + 1).toLowerCase();
}

export function getBaseName(name: string): string {
  const lastPart = name.split("/").pop() ?? name;
  const dotIndex = lastPart.lastIndexOf(".");
  return dotIndex === -1 ? lastPart : lastPart.slice(0, dotIndex);
}

export function inferKind(extension: string): AssetKind {
  if (imageExtensions.has(extension)) return "image";
  if (audioExtensions.has(extension)) return "audio";
  if (modelExtensions.has(extension)) return "model";
  if (dataExtensions.has(extension)) return "data";
  return "unknown";
}

export function inferCategory(kind: AssetKind, path = ""): AssetCategory | undefined {
  const normalized = path.toLowerCase();

  if (normalized.includes("sprite") || normalized.includes("texture")) return "sprites";
  if (normalized.includes("audio") || normalized.includes("sound") || normalized.includes("music")) return "audio";
  if (normalized.includes("model") || normalized.includes("mesh")) return "models";
  if (normalized.includes("data") || normalized.includes("config")) return "data";

  switch (kind) {
    case "image":
      return "sprites";
    case "audio":
      return "audio";
    case "model":
      return "models";
    case "data":
      return "data";
    default:
      return undefined;
  }
}

export function toGodotPath(asset: Pick<AssetRecord, "category" | "name">): string {
  const folder = asset.category ?? "misc";
  return `res://${folder}/${asset.name}`;
}

export function createAssetRecord(input: RawAssetInput): AssetRecord {
  const originalPath = input.originalPath ?? input.name;
  const extension = getExtension(input.name);
  const kind = inferKind(extension);
  const category = inferCategory(kind, originalPath);

  const asset: AssetRecord = {
    id: input.id,
    name: input.name.split("/").pop() ?? input.name,
    originalPath,
    extension,
    kind,
    sizeBytes: input.sizeBytes,
    dimensions: input.dimensions,
    category,
    tags: input.tags ?? [],
    godotPath: "",
    issues: [],
    reviewedIssueCodes: []
  };

  return {
    ...asset,
    godotPath: toGodotPath(asset)
  };
}

export function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
