/**
 * 軌跡描画に関する関数を定義
 */
import { KeypointTrail, KeypointTrails } from "../types";
import { sharedConfig } from "../config/models";

/**
 * 時間ベースのフィルタリングを適用した軌跡を取得する
 */
export function getFilteredTrail(
  trail: KeypointTrail[],
  currentTime: number
): KeypointTrail[] {
  if (!sharedConfig.trail.timeFiltering.enabled) {
    return trail;
  }

  const cutoffTime = currentTime - sharedConfig.trail.timeFiltering.duration;
  return trail.filter((point) => point.timestamp >= cutoffTime);
}

/**
 * 軌跡を単一のグラデーションパスとして描画する
 */
export function drawTrailWithGradient(
  ctx: CanvasRenderingContext2D,
  trail: KeypointTrail[],
  baseColor: string,
  currentTime: number
): void {
  if (trail.length < 2) return;

  ctx.beginPath();
  ctx.lineWidth = sharedConfig.trail.lineWidth;

  // 最初のポイントへ移動
  ctx.moveTo(trail[0].x, trail[0].y);

  // 残りのポイントを線で結ぶ
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }

  // 経過時間に基づいてグラデーションを作成
  const gradient = ctx.createLinearGradient(
    trail[0].x, trail[0].y,
    trail[trail.length - 1].x, trail[trail.length - 1].y
  );
  
  // 古い点は透明に、新しい点は不透明に
  const baseColorPrefix = baseColor.replace(/[\d.]+\)$/, '');
  gradient.addColorStop(0, baseColorPrefix + '0.1)'); // 古い点（フェードアウト）
  gradient.addColorStop(1, baseColorPrefix + '0.8)'); // 新しい点（はっきり表示）
  
  ctx.strokeStyle = gradient;
  ctx.stroke();
}

/**
 * 軌跡を単色のパスとして描画する
 */
export function drawTrailWithSingleColor(
  ctx: CanvasRenderingContext2D,
  trail: KeypointTrail[],
  baseColor: string
): void {
  if (trail.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = sharedConfig.trail.lineWidth;

  // 最初のポイントへ移動
  ctx.moveTo(trail[0].x, trail[0].y);

  // 残りのポイントを線で結ぶ
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }

  ctx.stroke();
}

/**
 * すべての軌跡を描画する
 */
export function drawAllTrails(
  trailCanvas: HTMLCanvasElement,
  keypointTrails: KeypointTrails,
  currentTime: number
): void {
  const trailCtx = trailCanvas.getContext("2d")!;
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  // 各キーポイントの軌跡を描画
  Object.entries(keypointTrails).forEach(([keypointName, trail]) => {
    // 時間ベースのフィルタリングを適用
    const filteredTrail = getFilteredTrail(trail, currentTime);
    
    if (filteredTrail.length < 2) return; // 少なくとも2点必要

    const baseColor =
      sharedConfig.trail.colors[
        keypointName as keyof typeof sharedConfig.trail.colors
      ] || "rgba(255, 0, 0, 0.5)";

    // フェードアウト効果が有効な場合、グラデーション描画
    if (
      sharedConfig.trail.timeFiltering.enabled &&
      sharedConfig.trail.timeFiltering.fadeOut
    ) {
      drawTrailWithGradient(trailCtx, filteredTrail, baseColor, currentTime);
    } else {
      // 従来の方法（単一の色で全体を描画）
      drawTrailWithSingleColor(trailCtx, filteredTrail, baseColor);
    }
  });
}

/**
 * キーポイントの軌跡を更新する
 */
export function updateKeypointTrail(
  keypointTrails: KeypointTrails,
  keypointName: string,
  x: number,
  y: number,
  score: number | undefined,
  timestamp: number,
  scoreThreshold: number
): void {
  if (!sharedConfig.trail.trackedKeypoints.includes(keypointName) || 
      (score ?? 0) <= scoreThreshold) {
    return;
  }

  // キーポイントごとの移動経路配列を初期化（まだなければ）
  if (!keypointTrails[keypointName]) {
    keypointTrails[keypointName] = [];
  }

  // 新しい位置を追加
  keypointTrails[keypointName].push({
    x,
    y,
    timestamp,
    score
  });

  // 移動経路の長さを制限
  if (keypointTrails[keypointName].length > sharedConfig.trail.maxLength) {
    keypointTrails[keypointName].shift();
  }
}