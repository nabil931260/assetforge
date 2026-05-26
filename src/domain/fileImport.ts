import type { AssetRecord } from "./assets";
import { createAssetRecord } from "./metadata";
import { validateAssets } from "./rules";

type ImageDimensions = {
  width: number;
  height: number;
};

export type DimensionReader = (file: File) => Promise<ImageDimensions | undefined>;

function getRelativePath(file: File): string {
  const fileWithPath = file as File & { webkitRelativePath?: string };
  return fileWithPath.webkitRelativePath || file.name;
}

export async function readImageDimensions(file: File): Promise<ImageDimensions | undefined> {
  if (!file.type.startsWith("image/")) return undefined;

  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<ImageDimensions>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error(`Unable to read image dimensions for ${file.name}`));
      image.src = objectUrl;
    });
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function filesToAssetRecords(files: File[], dimensionReader: DimensionReader = readImageDimensions): Promise<AssetRecord[]> {
  const records = await Promise.all(
    files.map(async (file, index) => {
      const dimensions = await dimensionReader(file);

      return createAssetRecord({
        id: `upload-${index}-${file.name}`,
        name: file.name,
        originalPath: getRelativePath(file),
        sizeBytes: file.size,
        dimensions,
        tags: []
      });
    })
  );

  return validateAssets(records);
}
