"use client";

/**
 * モデル選択コンポーネント
 */
import * as React from "react";
import * as posedetection from "@tensorflow-models/pose-detection";

interface ModelSelectorProps {
  isLoading: boolean;
  selectedModel: posedetection.SupportedModels;
  onToggle: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isLoading,
  selectedModel,
  onToggle,
}) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <button
        onClick={onToggle}
        style={{ padding: "8px 12px" }}
        disabled={isLoading}
      >
        {isLoading ? "モデル切り替え中..." : "モデル切り替え "}
        {selectedModel === posedetection.SupportedModels.MoveNet
          ? "MoveNet"
          : "BlazePose"}
      </button>
    </div>
  );
};