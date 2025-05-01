/**
 * ポーズ検出に関する型定義
 */

// キーポイントの移動経路を保存する型定義
export type KeypointTrail = {
  x: number;
  y: number;
  timestamp: number;
  score?: number;
};

// 各キーポイントの移動経路を保存する型定義
export type KeypointTrails = {
  [keypointName: string]: KeypointTrail[];
};