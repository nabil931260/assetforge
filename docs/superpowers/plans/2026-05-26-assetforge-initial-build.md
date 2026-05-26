# AssetForge Initial Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable browser version of AssetForge: sample asset review, Godot-oriented validation, editable categories/tags, and manifest/import-notes export.

**Architecture:** Use a Vite React TypeScript app with small domain modules for asset metadata, validation rules, sample data, and exporters. Keep the first commit substantial but honest: a working local app with tests, README, and design docs.

**Tech Stack:** Vite, React, TypeScript, Vitest, plain CSS.

---

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`: Vite entry HTML.
- `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`: TypeScript and Vite config.
- `src/main.tsx`: React entry point.
- `src/App.tsx`: page composition and state wiring.
- `src/styles.css`: app styling.
- `src/domain/assets.ts`: shared asset and issue types.
- `src/domain/metadata.ts`: asset kind/category/path inference.
- `src/domain/rules.ts`: Godot-oriented validation rules.
- `src/domain/sampleAssets.ts`: built-in demo dataset.
- `src/domain/exporters.ts`: manifest and import-notes generation.
- `src/domain/*.test.ts`: unit tests for core behavior.
- `README.md`: short portfolio-facing project overview.
- `docs/superpowers/specs/2026-05-26-assetforge-design.md`: approved design spec.

## Task 1: Project Scaffold And Domain Types

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/domain/assets.ts`

- [ ] **Step 1: Create Vite/React project files**

Add standard Vite React TypeScript config with scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "vitest": "latest",
    "@testing-library/react": "latest",
    "@testing-library/jest-dom": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest"
  }
}
```

- [ ] **Step 2: Define shared asset types**

Create `src/domain/assets.ts` with:

```ts
export type AssetKind = "image" | "audio" | "model" | "data" | "unknown";
export type AssetCategory = "sprites" | "audio" | "models" | "data" | "misc";
export type IssueSeverity = "warning" | "error";

export type ValidationIssue = {
  code: string;
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
};

export type AssetRecord = {
  id: string;
  name: string;
  originalPath: string;
  extension: string;
  kind: AssetKind;
  sizeBytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  category?: AssetCategory;
  tags: string[];
  godotPath: string;
  issues: ValidationIssue[];
};
```

- [ ] **Step 3: Verify scaffold**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

## Task 2: Metadata, Sample Assets, And Validation

**Files:**
- Create: `src/domain/metadata.ts`
- Create: `src/domain/sampleAssets.ts`
- Create: `src/domain/rules.ts`
- Create: `src/domain/metadata.test.ts`
- Create: `src/domain/rules.test.ts`

- [ ] **Step 1: Implement metadata helpers**

Create helpers that infer extension, kind, suggested category, and Godot path.

Required behavior:

- `.png`, `.jpg`, `.jpeg`, `.webp` => `image`
- `.wav`, `.ogg`, `.mp3` => `audio`
- `.glb`, `.gltf`, `.fbx`, `.obj` => `model`
- `.json`, `.csv`, `.txt` => `data`
- unknown extensions => `unknown`

- [ ] **Step 2: Add sample assets**

Create a dataset with a mix of clean and messy assets:

- `sprites/player_idle.png`
- `sprites/enemy_slime.png`
- `Audio/Forest Theme.mp3`
- `models/ruined_gate.glb`
- `models/Boss Statue.FBX`
- `data/item_table.json`
- `textures/wall-normal.tga`
- `sprites/enemy slime.png`

- [ ] **Step 3: Implement validation rules**

Rules must flag:

- unsupported file type as `error`
- duplicate base names as `warning`
- spaces in filename as `warning`
- non-lowercase name as `warning`
- not snake_case as `warning`
- missing category as `warning`
- empty tags as `warning`
- files above practical thresholds as `warning`

- [ ] **Step 4: Test metadata and rules**

Run: `npm test`

Expected: tests pass for asset classification, path generation, unsupported files, spaces/case warnings, and duplicate detection.

## Task 3: Exporters

**Files:**
- Create: `src/domain/exporters.ts`
- Create: `src/domain/exporters.test.ts`

- [ ] **Step 1: Generate manifest JSON**

The manifest should include:

- `engine: "godot"`
- `generatedBy: "AssetForge"`
- `generatedAt`
- exported assets excluding unsupported files
- each asset's name, kind, category, `res://` path, tags, and metadata

- [ ] **Step 2: Generate import notes markdown**

The notes should include:

- summary counts
- blocked unsupported files
- rename suggestions
- manual review list

- [ ] **Step 3: Test exporters**

Run: `npm test`

Expected: manifest excludes unsupported files and notes include warnings for messy assets.

## Task 4: Main App UI

**Files:**
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Build the working screen**

Create a tool-style layout with:

- header and short project title
- import panel with sample data button
- validation summary
- asset table
- selected asset inspector
- export preview panel

- [ ] **Step 2: Add state updates**

Allow the user to:

- load sample assets
- select an asset
- edit category
- edit tags as a comma-separated field
- regenerate issues after edits
- preview manifest
- preview import notes
- download both export files

- [ ] **Step 3: Add readable styling**

Use a utilitarian dashboard look: clear table, compact panels, restrained colors, and no marketing hero.

- [ ] **Step 4: Verify app build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

## Task 5: README And First Commit

**Files:**
- Create: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Write README**

README sections:

- what AssetForge is
- why it exists
- current features
- supported file types
- how to run
- what is intentionally out of scope

- [ ] **Step 2: Add `.gitignore`**

Ignore:

- `node_modules/`
- `dist/`
- `.superpowers/`
- `.env`
- `.env.*`

- [ ] **Step 3: Run final verification**

Run:

```bash
npm test
npm run build
```

Expected: both pass.

- [ ] **Step 4: Commit the substantial first version**

Commit message:

```bash
git add .
git commit -m "Build initial AssetForge prototype"
```

This is the first push candidate.
