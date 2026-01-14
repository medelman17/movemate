import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "MoveMate - Smart Moving Inventory Manager"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 180 180"
            fill="none"
          >
            <rect fill="#ffffff" width="180" height="180" rx="37" />
            <g style={{ transform: "scale(0.95)", transformOrigin: "center" }}>
              <path
                fill="#000000"
                d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
              />
              <path
                fill="#000000"
                d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
              />
            </g>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          MoveMate
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a0aec0",
            marginBottom: 48,
          }}
        >
          Smart Moving Inventory Manager
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 48,
          }}
        >
          {["AI-Powered", "Photo Identification", "Easy Tracking"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#68d391",
                  fontSize: 20,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#68d391"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
