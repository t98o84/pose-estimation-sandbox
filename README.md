## Getting Started

```bash
make setup
make up
# Browse http://localhost:3000
```

## Summary

以下の流れで姿勢推定を行う

1. 動画 → フレーム分割：動画を連続した静止画（フレーム）に分割
2. 前処理：リサイズ・正規化など、モデル入力に適した形へ変換
3. キー ポイント検出：各フレーム毎に人体の関節位置（キーポイント）を推定
4. 追跡・スムージング：時系列情報を活用してフレーム間の対応付けやノイズ除去
5. 可視化・解析：推定結果をオーバーレイ表示したり、角度計算などに応用

## Tool
- **Preprocessing & Execution Environment**: Browser (WebAssembly/WebGL) or Node.js
- **Machine Learning Libraries**: TensorFlow.js, MediaPipe JS, ml5.js, ONNX Runtime Web
- **Frame Extraction & Rendering**: HTMLVideoElement + Canvas (Browser) or fluent-ffmpeg + @tensorflow/tfjs-node (Node.js)
- **Visualization/UI**: Three.js, React (Next.js), PixiJS, etc.

