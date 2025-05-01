/**
 * ビデオとキャンバス表示のコンポーネント
 */
import * as React from "react";

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  trailCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  videoRef,
  canvasRef,
  trailCanvasRef,
  isLoading,
}) => {
  return (
    <>
      {isLoading && <div style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
      }}>Now loading...</div>}
      <video
        ref={videoRef}
        style={{ display: "none" }} // ビデオは非表示にする
      />

      <h3 style={{
        marginBottom: '0.5rem',
      }}>ポーズ検出結果</h3>
      <div style={{
        position: 'relative',
        border: '1px solid #ccc',
        width: '100%',
        maxWidth: '640px',
        aspectRatio: '4 / 3',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}>
        {/* メインキャンバス - ポーズ検出の結果を表示 */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)', /* 水平方向に反転 */
            zIndex: 1,
          }}
        />
        {/* 軌跡キャンバス - 動きの軌跡を表示 */}
        <canvas
          ref={trailCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)', /* 水平方向に反転 */
            zIndex: 2,
          }}
        />
      </div>
    </>
  );
};
