import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // This perfectly mimics your navigation logo's styling
      <div
        style={{
          fontSize: 20,
          background: "#10b981", // Tailwind emerald-500
          color: "#0f172a",      // Tailwind slate-950
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          fontWeight: "bold",
          transform: "rotate(3deg)",
        }}
      >
        V
      </div>
    ),
    {
      ...size,
    }
  );
}