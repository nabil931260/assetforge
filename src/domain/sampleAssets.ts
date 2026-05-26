import type { AssetRecord } from "./assets";
import { createAssetRecord } from "./metadata";
import { validateAssets } from "./rules";

const rawSampleAssets = [
  {
    id: "sprite-player-idle",
    name: "player_idle.png",
    originalPath: "sprites/player_idle.png",
    sizeBytes: 18342,
    dimensions: { width: 64, height: 64 },
    tags: ["player", "idle"]
  },
  {
    id: "sprite-enemy-slime",
    name: "enemy_slime.png",
    originalPath: "sprites/enemy_slime.png",
    sizeBytes: 22110,
    dimensions: { width: 48, height: 48 },
    tags: ["enemy"]
  },
  {
    id: "audio-forest-theme",
    name: "Forest Theme.mp3",
    originalPath: "Audio/Forest Theme.mp3",
    sizeBytes: 11_950_000,
    tags: []
  },
  {
    id: "model-ruined-gate",
    name: "ruined_gate.glb",
    originalPath: "models/ruined_gate.glb",
    sizeBytes: 3_200_000,
    tags: ["environment"]
  },
  {
    id: "model-boss-statue",
    name: "Boss Statue.FBX",
    originalPath: "models/Boss Statue.FBX",
    sizeBytes: 8_400_000,
    tags: ["boss", "prop"]
  },
  {
    id: "data-item-table",
    name: "item_table.json",
    originalPath: "data/item_table.json",
    sizeBytes: 14_200,
    tags: ["items"]
  },
  {
    id: "texture-wall-normal",
    name: "wall-normal.tga",
    originalPath: "textures/wall-normal.tga",
    sizeBytes: 2_100_000,
    tags: ["environment"]
  },
  {
    id: "sprite-enemy-slime-alt",
    name: "enemy slime.png",
    originalPath: "sprites/enemy slime.png",
    sizeBytes: 22300,
    dimensions: { width: 48, height: 48 },
    tags: []
  }
];

export function loadSampleAssets(): AssetRecord[] {
  return validateAssets(rawSampleAssets.map(createAssetRecord));
}
