import { describe, expect, it } from "vitest";
import { createAssetRecord } from "./metadata";
import { markIssueReviewed, visibleIssues } from "./review";
import { validateAssets } from "./rules";

describe("reviewed warning behavior", () => {
  it("marks warning issues as reviewed without removing them from asset history", () => {
    const [asset] = validateAssets([
      createAssetRecord({
        id: "messy-audio",
        name: "Forest Theme.mp3",
        originalPath: "Audio/Forest Theme.mp3",
        sizeBytes: 1024,
        tags: []
      })
    ]);

    const reviewedAsset = markIssueReviewed(asset, "spaces_in_name");

    expect(reviewedAsset.reviewedIssueCodes).toContain("spaces_in_name");
    expect(reviewedAsset.issues.some((issue) => issue.code === "spaces_in_name")).toBe(true);
    expect(visibleIssues(reviewedAsset).some((issue) => issue.code === "spaces_in_name")).toBe(false);
  });

  it("does not mark blocking errors as reviewed", () => {
    const [asset] = validateAssets([
      createAssetRecord({
        id: "unsupported-texture",
        name: "wall-normal.tga",
        originalPath: "textures/wall-normal.tga",
        sizeBytes: 1024,
        tags: ["environment"]
      })
    ]);

    const reviewedAsset = markIssueReviewed(asset, "unsupported_type");

    expect(reviewedAsset.reviewedIssueCodes).not.toContain("unsupported_type");
    expect(visibleIssues(reviewedAsset).some((issue) => issue.code === "unsupported_type")).toBe(true);
  });
});
