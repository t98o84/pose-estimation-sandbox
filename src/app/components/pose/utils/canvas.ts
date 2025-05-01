/**
 * キャンバス操作のユーティリティ関数
 */

/**
 * ビデオの準備状態をチェックする関数
 */
export function isVideoReady(video: HTMLVideoElement): boolean {
  const ready = video.readyState >= 2 && // HAVE_CURRENT_DATA
    video.videoWidth !== 0 &&
    video.videoHeight !== 0;
  
  if (!ready) {
    console.log("ビデオ準備状態:", {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });
  }
  
  return ready;
}

/**
 * キャンバスのサイズをビデオに合わせて調整する
 */
export function setupCanvas(
  videoElement: HTMLVideoElement,
  mainCanvas: HTMLCanvasElement,
  trailCanvas?: HTMLCanvasElement | null
): boolean {
  if (!isVideoReady(videoElement)) {
    console.log("ビデオが準備できていません");
    // 準備ができていない場合でも最低限のサイズを設定
    const defaultWidth = 320;
    const defaultHeight = 240;
    
    console.log(`デフォルトのキャンバスサイズを設定: ${defaultWidth}x${defaultHeight}`);
    
    mainCanvas.width = defaultWidth;
    mainCanvas.height = defaultHeight;
    
    if (trailCanvas) {
      trailCanvas.width = defaultWidth;
      trailCanvas.height = defaultHeight;
    }
    
    return false;
  }

  // ビデオサイズをログ出力
  console.log("ビデオサイズ:", videoElement.videoWidth, "x", videoElement.videoHeight);
  
  // 固定サイズまたはビデオサイズのどちらか大きい方を使用
  const width = Math.max(320, videoElement.videoWidth);
  const height = Math.max(240, videoElement.videoHeight);

  console.log(`キャンバスサイズを設定: ${width}x${height}`);

  // メインキャンバスのサイズを調整
  mainCanvas.width = width;
  mainCanvas.height = height;

  // 軌跡用キャンバスが存在する場合は同じサイズに設定
  if (trailCanvas) {
    trailCanvas.width = width;
    trailCanvas.height = height;
  }

  return true;
}

/**
 * キャンバスの内容をクリアする
 */
export function clearCanvas(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

/**
 * ビデオフレームをキャンバスに描画する
 */
export function drawVideoToCanvas(
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement
): void {
  if (!isVideoReady(videoElement)) {
    console.log("ビデオが準備できていないため、描画をスキップします");
    return;
  }

  const ctx = canvas.getContext("2d")!;
  
  // キャンバスサイズを確認
  if (canvas.width === 0 || canvas.height === 0) {
    console.log("キャンバスサイズが0です。サイズを設定します。");
    canvas.width = Math.max(320, videoElement.videoWidth);
    canvas.height = Math.max(240, videoElement.videoHeight);
  }
  
  console.log(`描画: ビデオサイズ ${videoElement.videoWidth}x${videoElement.videoHeight} -> キャンバスサイズ ${canvas.width}x${canvas.height}`);
  
  // ビデオをキャンバスに描画
  try {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.error("ビデオフレーム描画エラー:", e);
    console.error("エラー詳細:", { 
      videoWidth: videoElement.videoWidth, 
      videoHeight: videoElement.videoHeight,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      videoReady: isVideoReady(videoElement)
    });
  }
}