import { ImageResponse } from "next/og";

export const alt = "FFMI and Body Composition Calculator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #052e16, #166534 55%, #14532d)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "80px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 74, fontWeight: 700 }}>
          FFMI and Body Composition
        </div>
        <div
          style={{
            color: "#bbf7d0",
            display: "flex",
            fontSize: 38,
            marginTop: "32px",
          }}
        >
          Muscle-gain and dynamic fat-loss projections
        </div>
      </div>
    ),
    size,
  );
}
