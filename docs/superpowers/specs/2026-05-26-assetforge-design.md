# AssetForge Design

## Purpose

AssetForge is a browser-based asset pipeline inspector for Godot-style game projects. It is meant to feel like a practical portfolio project: small enough to understand quickly, but real enough to show game-development workflow judgment.

The tool helps a developer drop in messy game assets, review detected metadata, catch common pipeline problems, and export a clean Godot-friendly manifest plus import notes.

## Product Shape

The core workflow is:

1. Import game assets.
2. Review detected metadata.
3. Validate against Godot-oriented rules.
4. Fix labels, tags, and status inside the tool.
5. Export `manifest.json` and `import_notes.md`.

The first version should support 2D assets strongly and 3D assets at a lightweight metadata level. It should not try to render or edit 3D models.

Supported asset types:

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`
- Audio: `.wav`, `.ogg`, `.mp3`
- Models: `.glb`, `.gltf`, `.fbx`, `.obj`
- Data/config: `.json`, `.csv`, `.txt`

## Validation Rules

The validator should focus on practical Godot-oriented checks:

- unsupported file type
- duplicate base name
- spaces in filenames
- non-lowercase filenames
- filenames that are not snake_case
- missing category or tag
- unusually large files
- missing folder grouping when path data is available

Warnings should not block export. Unsupported files should stay visible in the list but be marked as blocked from export.

## Godot Framing

The app should make the Godot connection clear without pretending to replace Godot's importer.

Godot-oriented behavior:

- generate `res://` paths
- suggest categories like `sprites`, `audio`, `models`, `data`, and `misc`
- write import notes that explain what should be renamed, regrouped, or reviewed before moving assets into a Godot project

The first version should avoid:

- real 3D rendering
- image/audio editing
- actual `.tres` generation
- desktop filesystem scanning
- accounts, login, or backend services

## Technical Design

AssetForge should be a browser-only React and TypeScript app built with Vite. There is no backend in the first version.

Main modules:

- `fileImport`: handles drag/drop and file picker input, then normalizes files into asset records.
- `metadata`: detects file size, extension, kind, image dimensions when possible, and lightweight model metadata from file information.
- `rules`: runs validation checks and returns warnings or blocking issues.
- `assetStore`: keeps imported assets, detected metadata, manual tags, categories, ignored warnings, and export state.
- `exporters`: generates `manifest.json` and `import_notes.md`.
- `sampleAssets`: provides a demo dataset so the app can be tested without uploading files.

Expected stack:

- Vite
- React
- TypeScript
- Vitest
- Plain CSS or CSS modules

## Interface

The app should use a focused tool layout rather than a marketing landing page.

Primary UI areas:

- Import panel: drag/drop zone, file picker, and sample asset button.
- Asset table: dense list with type, size, category, status, and warning count.
- Inspector panel: selected asset details, validation messages, editable category and tags.
- Validation summary: counts warnings/errors by type and highlights what needs attention.
- Export panel: preview/download controls for `manifest.json` and `import_notes.md`.

The interface should feel utilitarian and game-tool oriented: clear, readable, and quick to scan.

## Asset Data Model

Each imported file becomes an internal asset record:

```ts
type AssetRecord = {
  id: string;
  name: string;
  originalPath: string;
  extension: string;
  kind: "image" | "audio" | "model" | "data" | "unknown";
  sizeBytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  category?: "sprites" | "audio" | "models" | "data" | "misc";
  tags: string[];
  godotPath: string;
  issues: ValidationIssue[];
};
```

## Export Design

The generated `manifest.json` should be simple and honest:

```json
{
  "engine": "godot",
  "generatedBy": "AssetForge",
  "assets": [
    {
      "name": "enemy_slime.png",
      "kind": "image",
      "category": "sprites",
      "path": "res://sprites/enemy_slime.png",
      "tags": ["enemy"],
      "metadata": {
        "sizeBytes": 18342,
        "width": 64,
        "height": 64
      }
    }
  ]
}
```

The generated `import_notes.md` should read like a short checklist:

```md
# Godot Import Notes

## Summary
- 12 assets reviewed
- 3 assets need attention
- 1 unsupported file type

## Rename Before Import
- `Enemy Boss.PNG` should be renamed to `enemy_boss.png`

## Review Manually
- `forest_theme.mp3` is larger than expected for a lightweight prototype.
```

## Testing Plan

Tests should focus on the rules and export logic:

- metadata classification for supported and unsupported file types
- filename validation rules
- category and tag validation
- duplicate-name detection
- manifest generation
- import notes generation
- smoke test using sample assets

## First Implementation Slice

The first implementation slice should prove the full workflow with sample data before adding file upload:

1. Build the React/Vite app shell.
2. Add the sample asset dataset.
3. Show the asset table and validation summary.
4. Allow selecting one asset and viewing its issues.
5. Generate preview text for `manifest.json` and `import_notes.md`.

After that works, the next slice can add real drag/drop file import.
