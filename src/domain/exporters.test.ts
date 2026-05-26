import { describe, expect, it } from "vitest";
import { buildImportNotes, buildManifest } from "./exporters";
import { createAssetRecord } from "./metadata";
import { validateAssets } from "./rules";

describe("exporters", () => {
  it("exports only assets without blocking errors", () => {
    const assets = validateAssets([
      createAssetRecord({
        id: "good",
        name: "enemy_slime.png",
        originalPath: "sprites/enemy_slime.png",
        sizeBytes: 2048,
        dimensions: { width: 48, height: 48 },
        tags: ["enemy"]
      }),
      createAssetRecord({
        id: "bad",
        name: "wall-normal.tga",
        originalPath: "textures/wall-normal.tga",
        sizeBytes: 2048,
        tags: ["environment"]
      })
    ]);

    const manifest = buildManifest(assets, "2026-05-26T00:00:00.000Z");
    expect(manifest.assets).toHaveLength(1);
    expect(manifest.assets[0].path).toBe("res://sprites/enemy_slime.png");
    expect(manifest.assets[0].metadata.width).toBe(48);
  });

  it("writes readable import notes for blocked and messy assets", () => {
    const assets = validateAssets([
      createAssetRecord({
        id: "music",
        name: "Forest Theme.mp3",
        originalPath: "Audio/Forest Theme.mp3",
        sizeBytes: 12_000_000,
        tags: []
      }),
      createAssetRecord({
        id: "bad",
        name: "wall-normal.tga",
        originalPath: "textures/wall-normal.tga",
        sizeBytes: 2048,
        tags: ["environment"]
      })
    ]);

    const notes = buildImportNotes(assets);
    expect(notes).toContain("2 assets reviewed");
    expect(notes).toContain("Blocked From Export");
    expect(notes).toContain("wall-normal.tga");
    expect(notes).toContain("Forest Theme.mp3");
  });
});
