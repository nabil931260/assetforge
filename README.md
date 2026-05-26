# AssetForge

AssetForge is a browser-based asset pipeline inspector for Godot-style game projects. It helps review messy game assets before they move into an engine project.

The first version focuses on a practical workflow:

1. Load a sample game asset set.
2. Import local files with drag-and-drop or a file picker.
3. Review detected metadata.
4. Check Godot-oriented naming and grouping rules.
5. Edit categories and tags.
6. Export a `manifest.json` and `import_notes.md`.

## Current Features

- Sample 2D, audio, model, and data assets
- Drag-and-drop and file picker import
- Image dimension detection for imported browser files
- Lightweight 3D metadata support for `.glb`, `.gltf`, `.fbx`, and `.obj`
- Godot-style `res://` path generation
- Validation for unsupported files, duplicate names, spaces, casing, snake_case, missing tags, and large files
- Editable categories and tags
- Manifest and import-notes previews
- Download buttons for both export files
- Unit tests for metadata, validation, and exporters

## Supported File Types

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`
- Audio: `.wav`, `.ogg`, `.mp3`
- Models: `.glb`, `.gltf`, `.fbx`, `.obj`
- Data/config: `.json`, `.csv`, `.txt`

## Run Locally

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

## Intentional Scope

AssetForge does not try to replace Godot's importer. It does not render 3D models, edit image/audio content, generate `.tres` files, or require accounts/backend services. The current goal is a focused browser workflow for asset review and export.
