import { describe, expect, it } from "vitest";
import { createAssetRecord } from "./metadata";
import { canExport, getIssueSummary, validateAssets } from "./rules";

describe("validation rules", () => {
  it("flags unsupported files as export-blocking errors", () => {
    const [asset] = validateAssets([
      createAssetRecord({
        id: "bad-texture",
        name: "wall-normal.tga",
        originalPath: "textures/wall-normal.tga",
        sizeBytes: 1024,
        tags: ["environment"]
      })
    ]);

    expect(asset.issues.some((issue) => issue.code === "unsupported_type")).toBe(true);
    expect(canExport(asset)).toBe(false);
  });

  it("flags Godot naming problems", () => {
    const [asset] = validateAssets([
      createAssetRecord({
        id: "music",
        name: "Forest Theme.mp3",
        originalPath: "Audio/Forest Theme.mp3",
        sizeBytes: 1024,
        tags: []
      })
    ]);

    expect(asset.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["spaces_in_name", "not_lowercase", "not_snake_case", "missing_tags"])
    );
  });

  it("flags duplicate normalized base names", () => {
    const assets = validateAssets([
      createAssetRecord({ id: "a", name: "enemy_slime.png", originalPath: "sprites/enemy_slime.png", sizeBytes: 100 }),
      createAssetRecord({ id: "b", name: "enemy slime.png", originalPath: "sprites/enemy slime.png", sizeBytes: 100 })
    ]);

    expect(assets.every((asset) => asset.issues.some((issue) => issue.code === "duplicate_base_name"))).toBe(true);
  });

  it("summarizes warning and error totals", () => {
    const assets = validateAssets([
      createAssetRecord({ id: "good", name: "player_idle.png", originalPath: "sprites/player_idle.png", sizeBytes: 100 }),
      createAssetRecord({ id: "bad", name: "notes.md", originalPath: "docs/notes.md", sizeBytes: 100 })
    ]);

    const summary = getIssueSummary(assets);
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.errors).toBe(1);
  });
});
