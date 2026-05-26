import { describe, expect, it } from "vitest";
import type { AssetRecord } from "./assets";
import { filterAssets } from "./filters";
import { createAssetRecord } from "./metadata";
import { markIssueReviewed } from "./review";
import { validateAssets } from "./rules";

function sampleAssets(): AssetRecord[] {
  const assets = validateAssets([
    createAssetRecord({
      id: "player",
      name: "player_idle.png",
      originalPath: "sprites/player_idle.png",
      sizeBytes: 100,
      tags: ["player", "idle"]
    }),
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
      sizeBytes: 100,
      tags: ["environment"]
    })
  ]);

  return assets.map((asset) =>
    asset.id === "music"
      ? asset.issues.reduce((reviewedAsset, issue) => markIssueReviewed(reviewedAsset, issue.code), asset)
      : asset
  );
}

describe("asset filters", () => {
  it("searches by filename, path, and tag", () => {
    const assets = sampleAssets();

    expect(filterAssets(assets, { query: "player", status: "all", kind: "all" }).map((asset) => asset.id)).toEqual(["player"]);
    expect(filterAssets(assets, { query: "Audio", status: "all", kind: "all" }).map((asset) => asset.id)).toEqual(["music"]);
    expect(filterAssets(assets, { query: "environment", status: "all", kind: "all" }).map((asset) => asset.id)).toEqual(["bad"]);
  });

  it("filters by review status", () => {
    const assets = sampleAssets();

    expect(filterAssets(assets, { query: "", status: "reviewed", kind: "all" }).map((asset) => asset.id)).toEqual([
      "player",
      "music"
    ]);
    expect(filterAssets(assets, { query: "", status: "needs_attention", kind: "all" }).map((asset) => asset.id)).toEqual([
      "bad"
    ]);
    expect(filterAssets(assets, { query: "", status: "blocked", kind: "all" }).map((asset) => asset.id)).toEqual(["bad"]);
  });

  it("filters by asset kind", () => {
    const assets = sampleAssets();

    expect(filterAssets(assets, { query: "", status: "all", kind: "image" }).map((asset) => asset.id)).toEqual(["player"]);
    expect(filterAssets(assets, { query: "", status: "all", kind: "unknown" }).map((asset) => asset.id)).toEqual(["bad"]);
  });
});
