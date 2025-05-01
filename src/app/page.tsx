import { PoseClient } from "./components/pose/components/pose-client";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6rem",
        minHeight: "100vh",
      }}
    >
      <PoseClient />
    </main>
  );
}
