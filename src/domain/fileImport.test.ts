import { describe, expect, it } from "vitest";
import { filesToAssetRecords } from "./fileImport";

function makeFile(name: string, size: number, type = "application/octet-stream", relativePath?: string): File {
  const file = new File([new Uint8Array(size)], name, { type });
  if (relativePath) {
    Object.defineProperty(file, "webkitRelativePath", {
      value: relativePath
    });
  }
  return file;
}

describe("file import", () => {
  it("converts uploaded files into validated asset records", async () => {
    const assets = await filesToAssetRecords(
      [makeFile("player_idle.png", 1024, "image/png"), makeFile("wall-normal.tga", 1024, "image/x-tga")],
      async () => undefined
    );

    expect(assets).toHaveLength(2);
    expect(assets[0]).toMatchObject({
      name: "player_idle.png",
      kind: "image",
      category: "sprites",
      godotPath: "res://sprites/player_idle.png"
    });
    expect(assets[1].issues.some((issue) => issue.code === "unsupported_type")).toBe(true);
  });

  it("preserves browser directory paths when available", async () => {
    const assets = await filesToAssetRecords(
      [makeFile("Forest Theme.mp3", 2048, "audio/mpeg", "Audio/Forest Theme.mp3")],
      async () => undefined
    );

    expect(assets[0].originalPath).toBe("Audio/Forest Theme.mp3");
    expect(assets[0].category).toBe("audio");
  });

  it("attaches image dimensions when a dimension reader is provided", async () => {
    const assets = await filesToAssetRecords(
      [makeFile("enemy_slime.png", 1024, "image/png")],
      async () => ({ width: 48, height: 48 })
    );

    expect(assets[0].dimensions).toEqual({ width: 48, height: 48 });
  });
});
