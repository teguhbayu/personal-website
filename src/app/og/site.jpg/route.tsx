import { getOwner } from "@/lib/data";
import { renderOgJpegResponse, resolveOgImageSrc } from "@/lib/og-image";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const owner = await getOwner();
  const portraitSrc = await resolveOgImageSrc(
    owner.portrait,
    "w_400,h_500,c_limit,f_png,q_85",
  );

  return renderOgJpegResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(180deg, #7AB8F5 0%, #B8DCFA 56%, #DCEFFF 100%)",
        padding: 40,
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 72,
          width: 240,
          height: 84,
          borderRadius: 999,
          backgroundColor: "rgba(255, 255, 255, 0.48)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 90,
          width: 280,
          height: 92,
          borderRadius: 999,
          backgroundColor: "rgba(255, 255, 255, 0.52)",
          display: "flex",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F5F2EB",
          color: "#07142B",
          border: "2px solid rgba(7, 20, 43, 0.18)",
          borderRadius: 12,
          padding: "44px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 9,
            backgroundColor: "#C81038",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 44,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 18,
              flex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#C81038",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#C81038",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {owner.location}
              </span>
            </div>

            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                color: "#07142B",
                display: "flex",
              }}
            >
              {owner.fullName}
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#2E4263",
                display: "flex",
              }}
            >
              {owner.role} · {owner.school}
            </div>

            <div
              style={{
                fontSize: 22,
                lineHeight: 1.42,
                color: "#2E4263",
                maxWidth: 680,
                display: "flex",
              }}
            >
              {owner.leadStatement}
            </div>
          </div>

          {portraitSrc && (
            <div
              style={{
                width: 280,
                height: 336,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                backgroundColor: "#E9E4D8",
                border: "2px solid rgba(7, 20, 43, 0.16)",
                borderRadius: 10,
                overflow: "hidden",
                paddingTop: 18,
                flexShrink: 0,
              }}
            >
              <img
                src={portraitSrc}
                alt={owner.fullName}
                width={260}
                height={318}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "bottom",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(7, 20, 43, 0.16)",
            paddingTop: 20,
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: "#2E4263",
            }}
          >
            {owner.email}
          </span>

          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#07142B",
            }}
          >
            teguhbayu.xyz
          </span>
        </div>
      </div>
    </div>,
  );
}
