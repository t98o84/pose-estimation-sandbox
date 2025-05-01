/**
 * ポーズ検出モデルの設定ファイル
 * MoveNetやBlazePoseの設定を定義
 */

import * as posedetection from "@tensorflow-models/pose-detection";

// 共通設定
export const sharedConfig = {
  // 描画関連の設定
  point: {
    color: "red",
    size: 4,
  },
  connection: {
    color: "blue",
    width: 2,
  },
  // 移動経路の設定
  trail: {
    enabled: true,
    trackedKeypoints: [
      "left_wrist",
      "right_wrist",
      "left_ankle",
      "right_ankle",
      // 新しく追加する部位
      "left_elbow",
      "right_elbow",
      "left_shoulder",
      "right_shoulder",
      "left_knee",
      "right_knee",
      "nose"
    ],
    colors: {
      left_wrist: "rgba(255, 0, 0, 0.5)",
      right_wrist: "rgba(0, 255, 0, 0.5)",
      left_ankle: "rgba(0, 0, 255, 0.5)",
      right_ankle: "rgba(255, 255, 0, 0.5)",
      left_elbow: "rgba(255, 0, 255, 0.5)",
      right_elbow: "rgba(0, 255, 255, 0.5)",
      left_shoulder: "rgba(128, 0, 128, 0.5)",
      right_shoulder: "rgba(0, 128, 128, 0.5)",
      left_knee: "rgba(128, 128, 0, 0.5)",
      right_knee: "rgba(255, 128, 0, 0.5)",
      nose: "rgba(255, 255, 255, 0.5)"
    },
    maxLength: 100,
    timeFiltering: {
      enabled: true,
      duration: 10000,
      fadeOut: true,
    },
    lineWidth: 2,
  },
} as const;

// MoveNet 固有の設定
export const moveNetConfig = {
  connections: [
    // 上半身
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["right_shoulder", "right_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_elbow", "right_wrist"],
    // 下半身
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["right_hip", "right_knee"],
    ["left_knee", "left_ankle"],
    ["right_knee", "right_ankle"],
  ],
  detector: {
    modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  },
  scoreThreshold: 0.5,
} as const;

// BlazePose 固有の設定
export const blazePoseConfig = {
  connections: [
    // 顔
    ["nose", "left_eye"],
    ["nose", "right_eye"],
    ["left_eye", "left_ear"],
    ["right_eye", "right_ear"],
    // 上半身
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["right_shoulder", "right_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_elbow", "right_wrist"],
    // 手の指
    ["left_wrist", "left_pinky"],
    ["left_wrist", "left_index"],
    ["left_wrist", "left_thumb"],
    ["right_wrist", "right_pinky"],
    ["right_wrist", "right_index"],
    ["right_wrist", "right_thumb"],
    // 下半身
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["right_hip", "right_knee"],
    ["left_knee", "left_ankle"],
    ["right_knee", "right_ankle"],
    // 足
    ["left_ankle", "left_heel"],
    ["left_ankle", "left_foot_index"],
    ["left_heel", "left_foot_index"],
    ["right_ankle", "right_heel"],
    ["right_ankle", "right_foot_index"],
    ["right_heel", "right_foot_index"],
  ],
  detector: {
    runtime: "tfjs", // 'tfjs' または 'mediapipe'
    enableSmoothing: true,
    modelType: "full", // 'lite', 'full', または 'heavy'
  },
  scoreThreshold: 0.2, // BlazePoseはスコアが低めになることがあるため閾値を下げる
} as const;

// モデルごとの設定をまとめたマップ
export const modelConfig = {
  [posedetection.SupportedModels.MoveNet]: moveNetConfig,
  [posedetection.SupportedModels.BlazePose]: blazePoseConfig,
} as const;

// デフォルトで使用するモデル
export const defaultModel = posedetection.SupportedModels.MoveNet;

// モデルの型定義
export type Model = keyof typeof modelConfig;