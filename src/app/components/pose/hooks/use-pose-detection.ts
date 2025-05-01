"use client";

/**
 * ポーズ検出のロジックをカスタムフックとして提供
 */
import * as React from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

import { KeypointTrails } from "../types";
import { modelConfig, defaultModel, Model } from "../config/models";
import { setupCanvas, isVideoReady, drawVideoToCanvas, clearCanvas } from "../utils/canvas";
import { drawAllTrails, updateKeypointTrail } from "../utils/trail";

export const usePoseDetection = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const detectorRef = React.useRef<posedetection.PoseDetector | null>(null);
  
  // 各キーポイントの移動経路を保存する状態
  const keypointTrailsRef = React.useRef<KeypointTrails>({});
  
  // 選択されたモデル
  const [selectedModel, setSelectedModel] = React.useState<Model>(defaultModel);
  
  // 描画ループ用の参照を保持
  const requestAnimationFrameRef = React.useRef<number | null>(null);

  // モデル初期化関数
  const initializeModel = React.useCallback(async (model: Model) => {
    try {
      // 既存のデテクタがあればクリーンアップ
      if (detectorRef.current) {
        await detectorRef.current.dispose();
        detectorRef.current = null;
      }

      // 新しいデテクタを初期化
      detectorRef.current = await posedetection.createDetector(
        model,
        modelConfig[model].detector
      );

      return true;
    } catch (error) {
      console.error("モデル初期化エラー:", error);
      setErrorMessage(`モデル初期化エラー: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, []);

  // キャンバスの初期化
  const setupCanvasWithVideo = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return false;
    return setupCanvas(videoRef.current, canvasRef.current, trailCanvasRef.current);
  }, []);

  // 推論ループ
  const renderLoop = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !detectorRef.current) {
      requestAnimationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // ビデオの準備ができているか確認
    if (!isVideoReady(videoRef.current)) {
      requestAnimationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // キャンバスサイズが設定されていない場合は再設定
    if (
      canvasRef.current.width === 0 ||
      canvasRef.current.height === 0 ||
      trailCanvasRef.current?.width === 0 ||
      trailCanvasRef.current?.height === 0
    ) {
      setupCanvasWithVideo();
    }

    // キャンバスをクリアしてビデオフレームを描画
    const ctx = clearCanvas(canvasRef.current);
    drawVideoToCanvas(videoRef.current, canvasRef.current);

    try {
      // ポーズ検出の実行
      const poses = await detectorRef.current.estimatePoses(videoRef.current);

      // 現在のタイムスタンプを記録
      const timestamp = Date.now();

      poses.forEach((pose) => {
        // キーポイントを名前でマッピングして検索しやすくする
        const keypointMap = new Map();
        pose.keypoints.forEach((kp) => {
          if (!kp.name) return; // 名前のないキーポイントはスキップ
          keypointMap.set(kp.name, kp);

          // 移動経路を記録する処理
          if (kp.name) {
            updateKeypointTrail(
              keypointTrailsRef.current,
              kp.name,
              kp.x,
              kp.y,
              kp.score,
              timestamp,
              modelConfig[selectedModel].scoreThreshold
            );
          }
        });

        // 選択されたモデルに基づいて接続関係を決定
        const poseConnections = modelConfig[selectedModel].connections;

        // 線を描画する（キーポイント間の接続）
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;

        poseConnections.forEach(([startName, endName]) => {
          const startPoint = keypointMap.get(startName);
          const endPoint = keypointMap.get(endName);

          if (
            startPoint &&
            endPoint &&
            (startPoint.score ?? 0) > modelConfig[selectedModel].scoreThreshold &&
            (endPoint.score ?? 0) > modelConfig[selectedModel].scoreThreshold
          ) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
          }
        });

        // キーポイントを描画する（関節の点）
        pose.keypoints.forEach((kp) => {
          if ((kp.score ?? 0) > modelConfig[selectedModel].scoreThreshold) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
          }
        });
      });

      // 移動経路を描画する処理
      if (trailCanvasRef.current) {
        drawAllTrails(trailCanvasRef.current, keypointTrailsRef.current, timestamp);
      }
    } catch (error) {
      console.error("ポーズ検出エラー:", error);
      setErrorMessage(`ポーズ検出エラー: ${error instanceof Error ? error.message : String(error)}`);
    }

    requestAnimationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [selectedModel, setupCanvasWithVideo]);

  // コンポーネント初期化
  React.useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. TensorFlow.js バックエンド設定
        await tf.setBackend("webgl");
        await tf.ready();

        // 2. カメラ映像の取得
        if (!videoRef.current?.srcObject) {
          try {
            console.log("カメラ映像を取得中...");
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: "user"
              },
              audio: false
            });
            
            if (videoRef.current) {
              console.log("ビデオ要素にストリームを設定");
              videoRef.current.srcObject = stream;
              
              // メディアが読み込まれた時のログ追加
              videoRef.current.onloadedmetadata = () => {
                console.log("ビデオメタデータ読み込み完了", { 
                  width: videoRef.current?.videoWidth, 
                  height: videoRef.current?.videoHeight 
                });
              };

              // ビデオが読み込まれるまで待つ
              await new Promise<void>((resolve) => {
                const handleLoadedData = () => {
                  console.log("ビデオデータ読み込み完了", { 
                    width: videoRef.current?.videoWidth, 
                    height: videoRef.current?.videoHeight,
                    readyState: videoRef.current?.readyState 
                  });
                  videoRef.current?.removeEventListener("loadeddata", handleLoadedData);
                  resolve();
                };
                
                // すでに読み込まれている場合はすぐに解決
                if (videoRef.current.readyState >= 2) {
                  console.log("ビデオはすでに読み込まれています");
                  resolve();
                } else {
                  videoRef.current.addEventListener("loadeddata", handleLoadedData);
                }
              });

              console.log("ビデオ再生開始");
              try {
                await videoRef.current.play();
                console.log("ビデオ再生成功", {
                  playing: !videoRef.current.paused,
                  width: videoRef.current.videoWidth,
                  height: videoRef.current.videoHeight
                });
                
                // ビデオが再生開始したら少し待ってからキャンバスを設定
                // これによりvideoWidthとvideoHeightが確実に設定される
                await new Promise(resolve => setTimeout(resolve, 100));
                
              } catch (e) {
                console.error("ビデオ再生エラー:", e);
                setErrorMessage(`ビデオ再生エラー: ${e instanceof Error ? e.message : String(e)}`);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("カメラアクセスエラー:", e);
            setErrorMessage(`カメラアクセスエラー: ${e instanceof Error ? e.message : String(e)}\nブラウザのカメラへのアクセス許可を確認してください。`);
            setIsLoading(false);
            return;
          }
        }

        // 3. キャンバスの設定
        console.log("キャンバス設定開始");
        if (videoRef.current) {
          console.log("キャンバス設定前のビデオサイズ:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
        }
        
        // キャンバス設定を複数回試みる（ビデオのサイズが取得できるまで）
        let canvasSetupAttempts = 0;
        let canvasSetup = false;
        
        while (!canvasSetup && canvasSetupAttempts < 5) {
          canvasSetup = setupCanvasWithVideo();
          if (!canvasSetup) {
            console.log(`キャンバス設定失敗（試行 ${canvasSetupAttempts + 1}/5）、100ms後に再試行`);
            await new Promise(resolve => setTimeout(resolve, 100));
            canvasSetupAttempts++;
          }
        }
        
        console.log("キャンバス設定結果:", canvasSetup);
        if (canvasRef.current) {
          console.log("キャンバスサイズ:", canvasRef.current.width, "x", canvasRef.current.height);
        }

        // 4. ポーズ検出モデルの初期化
        console.log("モデル初期化開始:", selectedModel);
        const modelInitialized = await initializeModel(selectedModel);
        console.log("モデル初期化結果:", modelInitialized);
        if (!modelInitialized) {
          throw new Error("モデルの初期化に失敗しました");
        }

        setIsLoading(false);

        // 5. 推論ループの開始
        if (requestAnimationFrameRef.current) {
          cancelAnimationFrame(requestAnimationFrameRef.current);
        }
        console.log("推論ループ開始");
        requestAnimationFrameRef.current = requestAnimationFrame(renderLoop);
      } catch (error) {
        console.error("初期化エラー:", error);
        setErrorMessage(`初期化エラー: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    }
    init();

    // クリーンアップ関数
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      
      // カメラストリームのクリーンアップ
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedModel, initializeModel, renderLoop, setupCanvasWithVideo]);

  // モデルの切り替え機能
  const toggleModel = React.useCallback(() => {
    setSelectedModel((prevModel) =>
      prevModel === posedetection.SupportedModels.MoveNet
        ? posedetection.SupportedModels.BlazePose
        : posedetection.SupportedModels.MoveNet
    );
    // モデル切り替え時に軌跡をクリア
    keypointTrailsRef.current = {};
  }, []);

  return {
    videoRef,
    canvasRef,
    trailCanvasRef,
    isLoading,
    selectedModel,
    toggleModel,
    errorMessage
  };
};