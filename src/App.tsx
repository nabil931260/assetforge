import { useMemo, useState } from "react";
import type { AssetCategory, AssetRecord } from "./domain/assets";
import { buildImportNotes, manifestToJson } from "./domain/exporters";
import { formatBytes, toGodotPath } from "./domain/metadata";
import { loadSampleAssets } from "./domain/sampleAssets";
import { canExport, getIssueSummary, validateAssets } from "./domain/rules";

const categories: AssetCategory[] = ["sprites", "audio", "models", "data", "misc"];

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function updateAsset(assets: AssetRecord[], assetId: string, update: Partial<AssetRecord>) {
  const nextAssets = assets.map((asset) => {
    if (asset.id !== assetId) return asset;

    const updatedAsset = {
      ...asset,
      ...update
    };

    return {
      ...updatedAsset,
      godotPath: toGodotPath(updatedAsset)
    };
  });

  return validateAssets(nextAssets);
}

export default function App() {
  const [assets, setAssets] = useState<AssetRecord[]>(() => loadSampleAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>("sprite-player-idle");
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];
  const issueSummary = getIssueSummary(assets);
  const exportableCount = assets.filter(canExport).length;
  const manifestJson = useMemo(() => manifestToJson(assets), [assets]);
  const importNotes = useMemo(() => buildImportNotes(assets), [assets]);

  function handleLoadSamples() {
    const sampleAssets = loadSampleAssets();
    setAssets(sampleAssets);
    setSelectedAssetId(sampleAssets[0]?.id ?? "");
  }

  function handleCategoryChange(category: AssetCategory) {
    if (!selectedAsset) return;
    setAssets((current) => updateAsset(current, selectedAsset.id, { category }));
  }

  function handleTagChange(value: string) {
    if (!selectedAsset) return;
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setAssets((current) => updateAsset(current, selectedAsset.id, { tags }));
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Godot asset pipeline inspector</p>
          <h1>AssetForge</h1>
        </div>
        <button className="primary-button" onClick={handleLoadSamples}>
          Load sample assets
        </button>
      </header>

      <section className="summary-grid" aria-label="Validation summary">
        <div className="summary-card">
          <span>Total assets</span>
          <strong>{assets.length}</strong>
        </div>
        <div className="summary-card">
          <span>Exportable</span>
          <strong>{exportableCount}</strong>
        </div>
        <div className="summary-card warning">
          <span>Warnings</span>
          <strong>{issueSummary.warnings}</strong>
        </div>
        <div className="summary-card error">
          <span>Errors</span>
          <strong>{issueSummary.errors}</strong>
        </div>
      </section>

      <section className="workspace">
        <div className="panel asset-list-panel">
          <div className="panel-heading">
            <h2>Imported Assets</h2>
            <span>{assets.length} files</span>
          </div>
          <div className="asset-table">
            <div className="asset-row header-row">
              <span>Name</span>
              <span>Kind</span>
              <span>Size</span>
              <span>Issues</span>
            </div>
            {assets.map((asset) => (
              <button
                className={`asset-row ${asset.id === selectedAsset?.id ? "selected" : ""}`}
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
              >
                <span>
                  <strong>{asset.name}</strong>
                  <small>{asset.godotPath}</small>
                </span>
                <span className={`pill ${asset.kind}`}>{asset.kind}</span>
                <span>{formatBytes(asset.sizeBytes)}</span>
                <span className={asset.issues.some((issue) => issue.severity === "error") ? "issue-error" : "issue-count"}>
                  {asset.issues.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel inspector-panel">
          <div className="panel-heading">
            <h2>Inspector</h2>
            {selectedAsset && <span>{selectedAsset.kind}</span>}
          </div>

          {selectedAsset && (
            <>
              <div className="detail-stack">
                <label>
                  Category
                  <select value={selectedAsset.category ?? "misc"} onChange={(event) => handleCategoryChange(event.target.value as AssetCategory)}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tags
                  <input value={selectedAsset.tags.join(", ")} onChange={(event) => handleTagChange(event.target.value)} placeholder="enemy, ui, prop" />
                </label>

                <div className="metadata-box">
                  <span>Original path</span>
                  <strong>{selectedAsset.originalPath}</strong>
                  <span>Godot path</span>
                  <strong>{selectedAsset.godotPath}</strong>
                  {selectedAsset.dimensions && (
                    <>
                      <span>Dimensions</span>
                      <strong>
                        {selectedAsset.dimensions.width} x {selectedAsset.dimensions.height}
                      </strong>
                    </>
                  )}
                </div>
              </div>

              <div className="issues">
                <h3>Validation</h3>
                {selectedAsset.issues.length === 0 ? (
                  <p className="empty-state">No issues found for this asset.</p>
                ) : (
                  selectedAsset.issues.map((issue) => (
                    <div className={`issue ${issue.severity}`} key={`${selectedAsset.id}-${issue.code}`}>
                      <strong>{issue.message}</strong>
                      {issue.suggestion && <span>{issue.suggestion}</span>}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="export-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>manifest.json</h2>
            <button onClick={() => downloadText("manifest.json", manifestJson)}>Download</button>
          </div>
          <pre>{manifestJson}</pre>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h2>import_notes.md</h2>
            <button onClick={() => downloadText("import_notes.md", importNotes)}>Download</button>
          </div>
          <pre>{importNotes}</pre>
        </div>
      </section>
    </main>
  );
}
