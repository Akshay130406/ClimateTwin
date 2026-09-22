import { useEffect, useMemo, useState } from "react";
import ClimateMap from "../ClimateMap";

const API = "https://climatetwin.onrender.com";

/* =========================================================
   SMALL REUSABLE COMPONENTS
   ========================================================= */

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div
      className="section-reveal"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "24px",
        marginBottom: "22px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              width: "28px",
              height: "3px",
              borderRadius: "999px",
              background:
                "linear-gradient(90deg, #36a269, #159c9a)",
              display: "inline-block",
            }}
          />

          <span
            style={{
              color: "#36a269",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "1.7px",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            color: "#123c35",
            fontSize: "clamp(24px, 3vw, 31px)",
            lineHeight: "1.1",
            letterSpacing: "-1px",
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              margin: "9px 0 0",
              color: "#667b74",
              fontSize: "14px",
              lineHeight: "1.65",
              maxWidth: "720px",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}


function AnimatedOrb({ size = 220, top, right, left, bottom, opacity = 1 }) {
  return (
    <div
      className="climate-orb"
      style={{
        width: size,
        height: size,
        top,
        right,
        left,
        bottom,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}


/* =========================================================
   KPI CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  subtitle,
  accent = "#36a269",
  className = "",
}) {
  return (
    <div
      className={`kpi-card climate-card ${className}`}
      style={{
        minHeight: "185px",
        padding: "21px",
        position: "relative",
      }}
    >
      {/* top gradient line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />

      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          width: "130px",
          height: "130px",
          right: "-65px",
          top: "-65px",
          borderRadius: "50%",
          background: `${accent}14`,
          filter: "blur(4px)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "21px",
            background: `${accent}12`,
            border: `1px solid ${accent}20`,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 0 5px ${accent}12`,
            marginTop: "7px",
            marginRight: "5px",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "18px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            color: "#6a7d77",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <div
          className="kpi-number"
          style={{
            color: "#123c35",
            fontSize: "31px",
            lineHeight: "1.1",
            fontWeight: "850",
            letterSpacing: "-1.3px",
          }}
        >
          {value}
        </div>

        {subtitle && (
          <div
            style={{
              marginTop: "7px",
              color: "#8a9b95",
              fontSize: "11px",
              lineHeight: "1.45",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   RISK CARD
   ========================================================= */

function RiskCard({
  label,
  count,
  icon,
  accent,
  description,
  percentage,
}) {
  return (
    <div
      className="climate-card risk-card"
      style={{
        padding: "21px",
        position: "relative",
        overflow: "hidden",
        minHeight: "175px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: accent,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          right: "-35px",
          bottom: "-45px",
          borderRadius: "50%",
          background: `${accent}10`,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#687b75",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: "850",
              color: "#183b33",
              lineHeight: 1,
              letterSpacing: "-1px",
            }}
          >
            {count}
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#899993",
              fontSize: "11px",
            }}
          >
            analyzed grid cells
          </div>
        </div>

        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}12`,
            border: `1px solid ${accent}20`,
            fontSize: "21px",
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "17px",
        }}
      >
        <div
          style={{
            height: "5px",
            borderRadius: "999px",
            background: "#edf2ef",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, percentage || 0))}%`,
              background: accent,
              borderRadius: "999px",
              transition: "width 1s ease",
            }}
          />
        </div>

        {description && (
          <div
            style={{
              marginTop: "7px",
              color: "#8a9993",
              fontSize: "10px",
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   INSIGHT CARD
   ========================================================= */

function InsightCard({
  icon,
  eyebrow,
  title,
  text,
  accent,
}) {
  return (
    <div
      className="climate-card section-reveal"
      style={{
        padding: "24px",
        minHeight: "205px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background:
            `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />

      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${accent}12`,
          border: `1px solid ${accent}18`,
          fontSize: "21px",
          marginBottom: "17px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: accent,
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          marginBottom: "7px",
        }}
      >
        {eyebrow}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          color: "#173b32",
          fontSize: "18px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#697c76",
          fontSize: "13px",
          lineHeight: "1.65",
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, riskResponse] =
          await Promise.all([
            fetch(`${API}/dashboard/stats`),
            fetch(`${API}/heat-risk`),
          ]);

        if (!statsResponse.ok || !riskResponse.ok) {
          throw new Error(
            "Unable to load dashboard data."
          );
        }

        const statsData = await statsResponse.json();
        const riskData = await riskResponse.json();

        console.log("Dashboard stats:", statsData);
        console.log("Heat risk data:", riskData);

        setStats(statsData);
        setRisk(riskData);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to connect to ClimateTwin backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const getValue = (
    object,
    keys,
    fallback = "—"
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return fallback;
  };


  /* =======================================================
     RISK COUNTS
     ======================================================= */

  const calculateRiskCounts = (data) => {
    const counts = {
      "Very High": 0,
      High: 0,
      Moderate: 0,
      Low: 0,
    };

    if (!data) return counts;

    if (Array.isArray(data)) {
      data.forEach((cell) => {
        const level =
          cell.risk_level ??
          cell.risk ??
          cell.heat_risk ??
          cell.risk_category ??
          cell.category ??
          cell.riskLevel ??
          cell.heatRisk;

        if (level !== undefined && level !== null) {
          const normalized = String(level)
            .trim()
            .toLowerCase();

          if (
            normalized === "very high" ||
            normalized === "very_high" ||
            normalized === "very-high"
          ) {
            counts["Very High"]++;
          } else if (normalized === "high") {
            counts.High++;
          } else if (normalized === "moderate") {
            counts.Moderate++;
          } else if (normalized === "low") {
            counts.Low++;
          }
        }
      });

      return counts;
    }

    if (typeof data === "object") {
      counts["Very High"] = Number(
        data["Very High"] ??
          data["very_high"] ??
          data["very_high_risk"] ??
          data["Very_High"] ??
          0
      );

      counts.High = Number(
        data["High"] ??
          data["high"] ??
          data["high_risk"] ??
          0
      );

      counts.Moderate = Number(
        data["Moderate"] ??
          data["moderate"] ??
          data["moderate_risk"] ??
          0
      );

      counts.Low = Number(
        data["Low"] ??
          data["low"] ??
          data["low_risk"] ??
          0
      );
    }

    return counts;
  };

  const riskCounts = calculateRiskCounts(risk);

  const lowRisk = riskCounts.Low;
  const moderateRisk = riskCounts.Moderate;
  const highRisk = riskCounts.High;
  const veryHighRisk = riskCounts["Very High"];

  const totalRiskCells =
    lowRisk +
    moderateRisk +
    highRisk +
    veryHighRisk;

  const riskPercent = (value) =>
    totalRiskCells
      ? (value / totalRiskCells) * 100
      : 0;


  /* =======================================================
     STATS
     ======================================================= */

  const population = getValue(
    stats,
    [
      "population",
      "total_population",
      "city_population",
    ],
    "—"
  );

  const cells = getValue(
    stats,
    [
      "cells",
      "total_cells",
      "grid_cells",
      "cell_count",
    ],
    "—"
  );

  const avgTemperature = getValue(
    stats,
    [
      "avg_lst",
      "average_lst",
      "mean_lst",
      "hotseason_lst",
    ],
    "—"
  );

  const avgNDVI = getValue(
    stats,
    [
      "avg_ndvi",
      "average_ndvi",
      "mean_ndvi",
      "ndvi",
    ],
    "—"
  );


  const formatNumber = (value) => {
    if (typeof value !== "number") return value;

    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  const formatDecimal = (value) => {
    if (typeof value !== "number") return value;

    return value.toFixed(2);
  };


  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const riskSummary = useMemo(() => {
    if (!totalRiskCells) return "No risk data";

    return `${formatNumber(
      highRisk + veryHighRisk
    )} cells require elevated attention`;
  }, [
    totalRiskCells,
    highRisk,
    veryHighRisk,
  ]);


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "28px",
          background:
            "linear-gradient(135deg,#eef7f3,#f5faf8)",
        }}
      >
        <div
          className="loading-shimmer"
          style={{
            height: "330px",
            borderRadius: "28px",
            marginBottom: "22px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "17px",
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="loading-shimmer"
              style={{
                height: "185px",
                borderRadius: "20px",
              }}
            />
          ))}
        </div>
      </div>
    );
  }


  /* =======================================================
     MAIN
     ======================================================= */

  return (
    <div
      className="page-enter"
      style={{
        minHeight: "100vh",
        paddingBottom: "70px",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* ===================================================
          HERO
          =================================================== */}

      <section
        className="climate-hero"
        style={{
          margin: "22px",
          minHeight: "385px",
          padding: "46px",
          position: "relative",
        }}
      >
        <AnimatedOrb
          size={300}
          top="-130px"
          right="-60px"
          opacity={0.75}
        />

        <AnimatedOrb
          size={210}
          bottom="-120px"
          left="32%"
          opacity={0.38}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,rgba(0,0,0,0.12),transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: "850px",
          }}
        >
          {/* live label */}

          <div
            className="live-indicator"
            style={{
              color: "#bde9d4",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              marginBottom: "19px",
            }}
          >
            Live climate intelligence
          </div>

          <h1
            style={{
              color: "#ffffff",
              fontSize:
                "clamp(37px,5.5vw,66px)",
              lineHeight: "1.01",
              letterSpacing: "-3px",
              margin: 0,
              maxWidth: "850px",
            }}
          >
            Understand Pune's climate.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg,#9be2bd,#72d6e8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Decide what happens next.
            </span>
          </h1>

          <p
            style={{
              color: "#d5e8e0",
              fontSize: "16px",
              lineHeight: "1.75",
              maxWidth: "710px",
              margin:
                "21px 0 27px",
            }}
          >
            ClimateTwin transforms satellite observations,
            urban structure and population data into a
            city-scale climate intelligence system for
            understanding risk and supporting better
            decisions.
          </p>

          {/* hero tags */}

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
            }}
          >
            {[
              ["◉", "Satellite intelligence"],
              ["✦", "AI-powered analysis"],
              ["↗", "Decision support"],
            ].map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding:
                    "9px 13px",
                  borderRadius: "999px",
                  color: "#e6f5ef",
                  background:
                    "rgba(255,255,255,0.075)",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  backdropFilter:
                    "blur(12px)",
                  fontSize: "11px",
                  fontWeight: "650",
                }}
              >
                <span
                  style={{
                    color: "#82d5ae",
                  }}
                >
                  {icon}
                </span>

                {text}
              </div>
            ))}
          </div>
        </div>

        {/* floating mini intelligence panel */}

        <div
          className="climate-glass float"
          style={{
            position: "absolute",
            right: "35px",
            bottom: "30px",
            zIndex: 4,
            width: "190px",
            padding: "16px",
            borderRadius: "18px",
            background:
              "rgba(255,255,255,0.10)",
            border:
              "1px solid rgba(255,255,255,0.16)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "1.2px",
              textTransform:
                "uppercase",
              color: "#a9d9c5",
              fontWeight: "800",
              marginBottom: "7px",
            }}
          >
            Analysis coverage
          </div>

          <div
            style={{
              fontSize: "25px",
              fontWeight: "850",
              letterSpacing: "-1px",
            }}
          >
            {formatNumber(cells)}
          </div>

          <div
            style={{
              marginTop: "3px",
              color: "#c4dcd3",
              fontSize: "10px",
            }}
          >
            spatial cells analyzed
          </div>
        </div>
      </section>


      {/* ===================================================
          CITY INTELLIGENCE
          =================================================== */}

      <section
        style={{
          padding: "25px 22px 0",
        }}
      >
        <SectionHeading
          eyebrow="City intelligence"
          title="Pune at a glance"
          description="A city-scale snapshot of the environmental conditions analyzed by ClimateTwin."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "17px",
          }}
        >
          <StatCard
            icon="🌡️"
            label="Average hot-season LST"
            value={
              typeof avgTemperature === "number"
                ? `${formatDecimal(
                    avgTemperature
                  )}°C`
                : avgTemperature
            }
            subtitle="MODIS-derived land surface temperature"
            accent="#ef8a4c"
          />

          <StatCard
            icon="👥"
            label="Population analyzed"
            value={formatNumber(
              population
            )}
            subtitle="WorldPop-based population estimate"
            accent="#3487d8"
          />

          <StatCard
            icon="▦"
            label="Climate grid cells"
            value={formatNumber(cells)}
            subtitle="Spatial units analyzed across Pune"
            accent="#159c9a"
          />

          <StatCard
            icon="🌿"
            label="Average vegetation index"
            value={formatDecimal(
              avgNDVI
            )}
            subtitle="MODIS NDVI indicator"
            accent="#36a269"
          />
        </div>
      </section>


      {/* ===================================================
          HEAT RISK
          =================================================== */}

      <section
        style={{
          padding: "54px 22px 0",
        }}
      >
        <SectionHeading
          eyebrow="Heat risk intelligence"
          title="Where is Pune under pressure?"
          description="Risk categories help identify spatial areas that may require greater climate attention."
          action={
            <div
              style={{
                padding:
                  "8px 12px",
                borderRadius: "999px",
                background:
                  "#edf6f2",
                color: "#34785b",
                fontSize: "11px",
                fontWeight: "750",
                border:
                  "1px solid #d8e9e1",
              }}
            >
              {riskSummary}
            </div>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(205px,1fr))",
            gap: "16px",
          }}
        >
          <RiskCard
            label="Very High Risk"
            count={formatNumber(
              veryHighRisk
            )}
            icon="🔥"
            accent="#c84f45"
            percentage={riskPercent(
              veryHighRisk
            )}
            description="Highest-priority heat category"
          />

          <RiskCard
            label="High Risk"
            count={formatNumber(
              highRisk
            )}
            icon="⚠️"
            accent="#e17a43"
            percentage={riskPercent(
              highRisk
            )}
            description="Elevated heat exposure"
          />

          <RiskCard
            label="Moderate Risk"
            count={formatNumber(
              moderateRisk
            )}
            icon="◐"
            accent="#d2a43d"
            percentage={riskPercent(
              moderateRisk
            )}
            description="Moderate climate pressure"
          />

          <RiskCard
            label="Low Risk"
            count={formatNumber(
              lowRisk
            )}
            icon="🌿"
            accent="#45a879"
            percentage={riskPercent(
              lowRisk
            )}
            description="Lower modeled heat pressure"
          />
        </div>
      </section>


      {/* ===================================================
          MAP
          =================================================== */}

      <section
        style={{
          padding: "55px 22px 0",
        }}
      >
        <SectionHeading
          eyebrow="Spatial intelligence"
          title="Pune climate risk map"
          description="Explore how modeled heat risk varies across the analyzed urban grid."
          action={
            <div
              className="live-indicator"
              style={{
                color: "#438a69",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              Spatial model active
            </div>
          }
        />

        <div
          className="map-container"
          style={{
            padding: "8px",
            borderRadius: "25px",
            background:
              "linear-gradient(135deg,#ffffff,#edf6f2)",
          }}
        >
          <div
            style={{
              borderRadius: "19px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <ClimateMap />

            {/* map overlay label */}

            <div
              className="climate-glass"
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                zIndex: 500,
                padding:
                  "9px 12px",
                borderRadius: "11px",
                background:
                  "rgba(255,255,255,0.86)",
                border:
                  "1px solid rgba(255,255,255,0.8)",
                fontSize: "10px",
                color: "#385a4f",
                fontWeight: "750",
              }}
            >
              <span
                style={{
                  display:
                    "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius:
                    "50%",
                  background:
                    "#36a269",
                  marginRight: "6px",
                }}
              />
              Pune spatial intelligence
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          INSIGHTS
          =================================================== */}

      <section
        style={{
          padding: "55px 22px 0",
        }}
      >
        <SectionHeading
          eyebrow="ClimateTwin intelligence"
          title="From observation to action"
          description="ClimateTwin connects environmental signals with urban conditions to move beyond simply displaying climate data."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(270px,1fr))",
            gap: "17px",
          }}
        >
          <InsightCard
            icon="🧠"
            eyebrow="Understand"
            title="Turn climate data into intelligence"
            text="Satellite observations, vegetation, population and urban structure are brought together into one spatial view of Pune."
            accent="#3487d8"
          />

          <InsightCard
            icon="🎯"
            eyebrow="Prioritize"
            title="Find where attention matters"
            text="Heat-risk categories provide a spatial starting point for identifying areas that may require deeper investigation or action."
            accent="#ef8a4c"
          />

          <InsightCard
            icon="🌱"
            eyebrow="Act"
            title="Move from risk toward decisions"
            text="Simulation, intervention planning, optimization and future-impact analysis extend the system from observation toward climate action."
            accent="#36a269"
          />
        </div>
      </section>


      {/* ===================================================
          CLIMATE TWIN FLOW
          =================================================== */}

      <section
        style={{
          padding: "55px 22px 0",
        }}
      >
        <div
          className="climate-card"
          style={{
            padding: "28px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg,#123c35,#1c5a4b)",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <AnimatedOrb
            size={230}
            top="-130px"
            right="-50px"
            opacity={0.45}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform:
                  "uppercase",
                color: "#8fd2b1",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              The ClimateTwin loop
            </div>

            <h2
              style={{
                color: "#ffffff",
                fontSize: "25px",
                marginBottom: "24px",
              }}
            >
              From prediction to protection.
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                flexWrap: "wrap",
              }}
            >
              {[
                "Predict",
                "Explain",
                "Simulate",
                "Optimize",
                "Act",
                "Protect",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  <div
                    style={{
                      padding:
                        "10px 14px",
                      borderRadius: "999px",
                      background:
                        index === 5
                          ? "rgba(114,214,162,0.2)"
                          : "rgba(255,255,255,0.08)",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      fontSize: "11px",
                      fontWeight: "750",
                      color:
                        index === 5
                          ? "#9be2bd"
                          : "#e4f1ec",
                    }}
                  >
                    {item}
                  </div>

                  {index < 5 && (
                    <span
                      style={{
                        color: "#72a997",
                        fontSize: "14px",
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          SCIENTIFIC NOTE
          =================================================== */}

      <section
        style={{
          padding: "25px 22px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "13px",
            alignItems: "flex-start",
            padding: "18px 20px",
            borderRadius: "16px",
            background:
              "rgba(255,255,255,0.65)",
            border:
              "1px solid rgba(28,72,61,0.10)",
            color: "#687b75",
            fontSize: "11px",
            lineHeight: "1.7",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              minWidth: "28px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "#e3f1eb",
              color: "#35785a",
              fontSize: "13px",
            }}
          >
            i
          </div>

          <div>
            <strong
              style={{
                color: "#173b32",
              }}
            >
              Scientific note:
            </strong>{" "}
            ClimateTwin's temperature layer represents
            satellite-derived MODIS Land Surface
            Temperature (LST). It should not be interpreted
            as direct near-surface air temperature. Model
            outputs are intended for climate decision support
            and preliminary analysis.
          </div>
        </div>
      </section>


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (
        <div
          style={{
            margin: "22px",
            padding: "15px 18px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#fff3f0,#fff8f6)",
            border:
              "1px solid #f0c9c0",
            color: "#9e493b",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}