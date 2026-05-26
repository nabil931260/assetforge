import { describe, expect, it } from "vitest";
import { createAssetRecord, getBaseName, getExtension, inferCategory, inferKind } from "./metadata";

describe("metadata helpers", () => {
  it("detects extensions and base names", () => {
    expect(getExtension("sprites/enemy_slime.PNG")).toBe("png");
    expect(getExtension("README")).toBe("");
    expect(getBaseName("sprites/enemy_slime.png")).toBe("enemy_slime");
  });

  it("classifies supported asset kinds", () => {
    expect(inferKind("png")).toBe("image");
    expect(inferKind("ogg")).toBe("audio");
    expect(inferKind("glb")).toBe("model");
    expect(inferKind("json")).toBe("data");
    expect(inferKind("tga")).toBe("unknown");
  });

  it("suggests categories from kind and path", () => {
    expect(inferCategory("image", "sprites/player.png")).toBe("sprites");
    expect(inferCategory("audio", "music/theme.ogg")).toBe("audio");
    expect(inferCategory("model", "models/gate.glb")).toBe("models");
    expect(inferCategory("unknown", "loose/readme.md")).toBeUndefined();
  });

  it("creates normalized asset records", () => {
    const asset = createAssetRecord({
      id: "asset-1",
      name: "player_idle.png",
      originalPath: "sprites/player_idle.png",
      sizeBytes: 1024,
      tags: ["player"]
    });

    expect(asset.kind).toBe("image");
    expect(asset.category).toBe("sprites");
    expect(asset.godotPath).toBe("res://sprites/player_idle.png");
  });
});
