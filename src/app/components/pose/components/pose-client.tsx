"use client";

/**
 * ポーズ検出のメインコンポーネント
 */
import * as React from "react";

import { usePoseDetection } from "../hooks/use-pose-detection";
import { ModelSelector } from "./model-selector";
import { VideoCanvas } from "./video-canvas";

export const PoseClient: React.FC = () => {
  const {
    videoRef,
    canvasRef,
    trailCanvasRef,
    isLoading,
    selectedModel,
    toggleModel,
    errorMessage,
  } = usePoseDetection();

  return (
    <>
      <ModelSelector
        isLoading={isLoading}
        selectedModel={selectedModel}
        onToggle={toggleModel}
      />
      {errorMessage && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}
        >
          {errorMessage}
        </div>
      )}
      <VideoCanvas
        videoRef={videoRef}
        canvasRef={canvasRef}
        trailCanvasRef={trailCanvasRef}
        isLoading={isLoading}
      />
    </>
  );
};
