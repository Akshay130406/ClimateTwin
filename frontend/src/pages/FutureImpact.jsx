import { useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   FUTURE IMPACT — CLIMATETWIN PREMIUM COMMAND CENTER
========================================================= */

const RISK = {
  "Very High": {
    color: "#ef4444",
    bg: "rgba(239,68,68,.12)",
    border: "rgba(239,68,68,.25)",
    glow: "rgba(239,68,68,.22)",
  },
  High: {
    color: "#f97316",
    bg: "rgba(249,115,22,.12)",
    border: "rgba(249,115,22,.25)",
    glow: "rgba(249,115,22,.20)",
  },
  Moderate: {
    color: "#eab308",
    bg: "rgba(234,179,8,.12)",
    border: "rgba(234,179,8,.25)",
    glow: "rgba(234,179,8,.18)",
  },
  Low: {
    color: "#22c55e",
    bg: "rgba(34,197,94,.12)",
    border: "rgba(34,197,94,.25)",
    glow: "rgba(34,197,94,.18)",
  },
  "Very Low": {
    color: "#14b8a6",
    bg: "rgba(20,184,166,.12)",
    border: "rgba(20,184,166,.25)",
    glow: "rgba(20,184,166,.18)",
  },
};

const DEFAULT_SCENARIO = {
  years_ahead: 20,
  temperature_increase: 2,
  population_growth: 8,
  urbanization_increase: 5,
  vegetation_change: 5,
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Icon({ children, size = 34, color = "#36a269", bg }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(10, size * 0.3),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color,
        background: bg || `${color}14`,
        fontSize: size * 0.42,
        fontWeight: 900,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, color = "#36a269" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color,
        fontSize: 10,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "1.3px",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 0 5px ${color}14`,
        }}
      />
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  accent,
  trend,
  dark = false,
}) {
  return (
    <div
      className="climate-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 150,
        padding: 21,
        borderRadius: 20,
        border: dark
          ? "1px solid rgba(255,255,255,.10)"
          : "1px solid rgba(28,72,61,.10)",
        background: dark
          ? "rgba(255,255,255,.055)"
          : "rgba(255,255,255,.88)",
        boxShadow: dark
          ? "none"
          : "0 12px 32px rgba(19,60,53,.055)",
        backdropFilter: "blur(16px)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = dark
          ? "0 14px 35px rgba(0,0,0,.12)"
          : "0 18px 40px rgba(19,60,53,.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = dark
          ? "none"
          : "0 12px 32px rgba(19,60,53,.055)";
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          right: -55,
          top: -55,
          borderRadius: "50%",
          background: `${accent}12`,
          filter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              color: dark ? "rgba(255,255,255,.56)" : "#71827c",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".9px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {label}
          </div>

          <div
            style={{
              color: dark ? "#fff" : "#173b32",
              fontSize: 29,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            {value}
          </div>

          {description && (
            <div
              style={{
                marginTop: 10,
                color: dark ? "rgba(255,255,255,.55)" : "#7b8b85",
                fontSize: 11,
                lineHeight: 1.45,
              }}
            >
              {description}
            </div>
          )}
        </div>

        <Icon
          color={accent}
          bg={dark ? `${accent}20` : `${accent}13`}
          size={38}
        >
          {icon}
        </Icon>
      </div>

      {trend && (
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 17,
            color: accent,
            fontSize: 10,
            fontWeight: 850,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  title,
  description,
  value,
  min,
  max,
  step,
  suffix,
  icon,
  accent,
  onChange,
}) {
  const percentage =
    ((Number(value) - min) / (max - min)) * 100;

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 18,
        background: "rgba(247,251,249,.82)",
        border: "1px solid rgba(28,72,61,.09)",
        transition: "all .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${accent}45`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor =
          "rgba(28,72,61,.09)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon size={32} color={accent}>
            {icon}
          </Icon>

          <div>
            <div
              style={{
                color: "#30443d",
                fontSize: 12,
                fontWeight: 850,
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#8a9993",
                fontSize: 9,
              }}
            >
              {description}
            </div>
          </div>
        </div>

        <div
          style={{
            color: "#173b32",
            fontSize: 18,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {value}
          {suffix}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: accent,
            cursor: "pointer",
          }}
        />

        <div
          style={{
            height: 3,
            marginTop: 2,
            borderRadius: 99,
            background: "#e2ebe7",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(
                0,
                Math.min(100, percentage)
              )}%`,
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${accent}, #159c9a)`,
              transition: "width .2s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            color: "#9aa8a3",
            fontSize: 9,
          }}
        >
          <span>
            {min}
            {suffix}
          </span>
          <span>
            {max}
            {suffix}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChangePill({ value, suffix = "" }) {
  const numeric = Number(value) || 0;
  const positive = numeric > 0;
  const negative = numeric < 0;

  const color = positive
    ? "#dc5c55"
    : negative
      ? "#159c9a"
      : "#71827c";

  const bg = positive
    ? "#fff0ee"
    : negative
      ? "#e9f8f5"
      : "#eef3f1";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 8px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 900,
      }}
    >
      {positive ? "↑" : negative ? "↓" : "—"}{" "}
      {Math.abs(numeric).toFixed(2)}
      {suffix}
    </span>
  );
}

/* =========================================================
   FUTURE MAP
========================================================= */

function FutureMap({ cells }) {
  const [hovered, setHovered] = useState(null);

  const polygons = useMemo(() => {
    if (!Array.isArray(cells)) return [];

    return cells
      .map((cell) => {
        if (
          !cell.geometry ||
          !cell.geometry.coordinates
        ) {
          return null;
        }

        let coordinates = [];

        if (cell.geometry.type === "Polygon") {
          coordinates = cell.geometry.coordinates?.[0] || [];
        }

        if (cell.geometry.type === "MultiPolygon") {
          coordinates =
            cell.geometry.coordinates?.[0]?.[0] || [];
        }

        if (coordinates.length < 3) return null;

        return {
          cell,
          coordinates,
        };
      })
      .filter(Boolean);
  }, [cells]);

  if (!polygons.length) {
    return (
      <div
        style={{
          height: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
          background:
            "linear-gradient(135deg,#edf5f2,#f4f7f8)",
          border: "1px solid rgba(28,72,61,.10)",
          color: "#71827c",
          fontSize: 13,
        }}
      >
        No future spatial data available.
      </div>
    );
  }

  const allCoordinates = polygons.flatMap(
    (item) => item.coordinates
  );

  const lngs = allCoordinates.map((p) => p[0]);
  const lats = allCoordinates.map((p) => p[1]);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const width = 1000;
  const height = 520;
  const padding = 28;

  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;

  const getPoints = (coordinates) =>
    coordinates
      .map(([lng, lat]) => {
        const x =
          padding +
          ((lng - minLng) / lngRange) *
            (width - padding * 2);

        const y =
          height -
          padding -
          ((lat - minLat) / latRange) *
            (height - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");

  const getRisk = (level) =>
    RISK[level] || RISK["Low"];

  return (
    <div
      style={{
        position: "relative",
        height: 520,
        overflow: "hidden",
        borderRadius: 22,
        background:
          "radial-gradient(circle at 72% 18%,rgba(54,162,105,.18),transparent 25%), radial-gradient(circle at 20% 80%,rgba(21,156,154,.10),transparent 25%), linear-gradient(135deg,#e8f2ef,#eef4f7)",
        border: "1px solid rgba(28,72,61,.10)",
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        {polygons.map(({ cell, coordinates }, index) => {
          const risk = getRisk(cell.future_risk_level);
          const isHovered =
            hovered?.cell_id === cell.cell_id;

          return (
            <polygon
              key={`${cell.cell_id}-${index}`}
              points={getPoints(coordinates)}
              fill={risk.color}
              fillOpacity={isHovered ? 0.92 : 0.66}
              stroke={
                isHovered
                  ? "#173b32"
                  : "rgba(255,255,255,.9)"
              }
              strokeWidth={isHovered ? 1.8 : 0.55}
              style={{
                cursor: "crosshair",
                transition:
                  "fill-opacity .15s ease",
              }}
              onMouseEnter={() => setHovered(cell)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {/* MAP GRID */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(23,59,50,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(23,59,50,.12) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* MAP TITLE */}
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          padding: "11px 13px",
          borderRadius: 13,
          background: "rgba(255,255,255,.88)",
          border: "1px solid rgba(255,255,255,.8)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 10px 28px rgba(19,60,53,.10)",
        }}
      >
        <div
          style={{
            color: "#173b32",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          PUNE • FUTURE RISK FIELD
        </div>
        <div
          style={{
            color: "#788983",
            fontSize: 9,
            marginTop: 3,
          }}
        >
          Simulated spatial climate exposure
        </div>
      </div>

      {/* LEGEND */}
      <div
        style={{
          position: "absolute",
          left: 18,
          bottom: 18,
          padding: 13,
          borderRadius: 14,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 10px 28px rgba(19,60,53,.10)",
          border: "1px solid rgba(255,255,255,.85)",
        }}
      >
        <div
          style={{
            color: "#173b32",
            fontSize: 10,
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          FUTURE RISK
        </div>

        {Object.entries(RISK).map(
          ([label, config]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginTop: 5,
                color: "#63736d",
                fontSize: 9,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: config.color,
                }}
              />
              {label}
            </div>
          )
        )}
      </div>

      {/* HOVER CARD */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            right: 18,
            top: 18,
            width: 205,
            padding: 15,
            borderRadius: 16,
            background: "rgba(16,47,42,.94)",
            color: "#fff",
            boxShadow: "0 16px 40px rgba(0,0,0,.18)",
            backdropFilter: "blur(18px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              color: "#9edcc0",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: ".9px",
              textTransform: "uppercase",
            }}
          >
            Spatial Cell
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            #{hovered.cell_id}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 13,
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: 8,
                }}
              >
                FUTURE LST
              </div>
              <strong style={{ fontSize: 14 }}>
                {Number(hovered.future_lst).toFixed(2)}°C
              </strong>
            </div>

            <div>
              <div
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: 8,
                }}
              >
                PRIORITY
              </div>
              <strong style={{ fontSize: 14 }}>
                {Number(
                  hovered.future_priority_score
                ).toFixed(1)}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "6px 8px",
              borderRadius: 8,
              background:
                getRisk(hovered.future_risk_level).bg,
              color:
                getRisk(hovered.future_risk_level).color,
              fontSize: 9,
              fontWeight: 900,
              display: "inline-block",
            }}
          >
            {hovered.future_risk_level}
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          padding: "7px 10px",
          borderRadius: 999,
          background: "rgba(16,47,42,.88)",
          color: "#cce9dd",
          fontSize: 9,
          fontWeight: 800,
          backdropFilter: "blur(12px)",
        }}
      >
        {polygons.length.toLocaleString()} spatial cells
      </div>
    </div>
  );
}

/* =========================================================
   COMPARISON PANEL
========================================================= */

function ComparisonPanel({ summary, scenario }) {
  const rows = [
    {
      label: "Average LST",
      baseline: `${summary.baseline_average_lst}°C`,
      future: `${summary.future_average_lst}°C`,
      change: summary.future_average_lst -
        summary.baseline_average_lst,
      suffix: "°C",
      accent: "#f28c4b",
    },
    {
      label: "High-risk cells",
      baseline: summary.baseline_high_risk_cells,
      future: summary.future_high_risk_cells,
      change: summary.change_in_high_risk_cells,
      suffix: "",
      accent: "#dc5c55",
    },
    {
      label: "Very high-risk cells",
      baseline:
        summary.baseline_very_high_risk_cells,
      future:
        summary.future_very_high_risk_cells,
      change:
        summary.change_in_very_high_risk_cells,
      suffix: "",
      accent: "#991b1b",
    },
    {
      label: "Population",
      baseline: Number(
        summary.baseline_population
      ).toLocaleString(),
      future: Number(
        summary.future_population
      ).toLocaleString(),
      change: summary.population_change_percent,
      suffix: "%",
      accent: "#36a269",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0,1fr) minmax(0,1.08fr)",
        gap: 18,
      }}
    >
      {/* BASELINE */}
      <div
        style={{
          padding: 25,
          borderRadius: 22,
          background: "#fff",
          border: "1px solid rgba(28,72,61,.10)",
          boxShadow:
            "0 12px 32px rgba(19,60,53,.055)",
        }}
      >
        <SectionLabel color="#71827c">
          Current baseline
        </SectionLabel>

        <h2
          style={{
            margin: "11px 0 4px",
            color: "#173b32",
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: "-.5px",
          }}
        >
          Pune today
        </h2>

        <p
          style={{
            margin: 0,
            color: "#87958f",
            fontSize: 11,
          }}
        >
          Reference state used by the scenario engine.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 23,
          }}
        >
          {[
            [
              "Average LST",
              `${summary.baseline_average_lst}°C`,
            ],
            [
              "Population",
              Number(
                summary.baseline_population
              ).toLocaleString(),
            ],
            [
              "High risk",
              summary.baseline_high_risk_cells,
            ],
            [
              "Very high",
              summary.baseline_very_high_risk_cells,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 14,
                borderRadius: 14,
                background: "#f5f9f7",
                border: "1px solid #e7eeeb",
              }}
            >
              <div
                style={{
                  color: "#81908a",
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "#173b32",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FUTURE */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: 25,
          borderRadius: 22,
          color: "#fff",
          background:
            "linear-gradient(135deg,#0c2824,#123c35 50%,#19715e)",
          boxShadow:
            "0 18px 45px rgba(19,60,53,.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            right: -120,
            top: -150,
            background: "rgba(114,214,162,.12)",
            filter: "blur(2px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <SectionLabel color="#72d6a2">
            Scenario projection
          </SectionLabel>

          <h2
            style={{
              margin: "11px 0 4px",
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: "-.5px",
            }}
          >
            Pune +{scenario.years_ahead} years
          </h2>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,.58)",
              fontSize: 11,
            }}
          >
            Simulated conditions under your assumptions.
          </p>

          <div style={{ marginTop: 20 }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr auto auto",
                  alignItems: "center",
                  gap: 15,
                  padding: "12px 0",
                  borderBottom:
                    "1px solid rgba(255,255,255,.08)",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,.62)",
                    fontSize: 10,
                  }}
                >
                  {row.label}
                </span>

                <span
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  {row.future}
                </span>

                <ChangePill
                  value={row.change}
                  suffix={row.suffix}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function FutureImpact() {
  const [scenario, setScenario] =
    useState(DEFAULT_SCENARIO);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateScenario = (key, value) => {
    setScenario((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetScenario = () => {
    setScenario(DEFAULT_SCENARIO);
    setResult(null);
    setError("");
  };

  const runScenario = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/future-impact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scenario),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status}`
        );
      }

      const apiResult = await response.json();

      if (typeof apiResult.cells === "string") {
        try {
          apiResult.cells = JSON.parse(
            apiResult.cells
          );
        } catch {
          apiResult.cells = null;
        }
      }

      let parsedCells = [];

      if (
        apiResult.cells?.type ===
          "FeatureCollection" &&
        Array.isArray(apiResult.cells.features)
      ) {
        parsedCells = apiResult.cells.features
          .map((feature) => ({
            ...feature.properties,
            geometry: feature.geometry,
          }))
          .filter(
            (cell) =>
              cell.cell_id !== undefined &&
              cell.geometry
          );
      } else if (Array.isArray(apiResult.cells)) {
        parsedCells = apiResult.cells;
      }

      apiResult.cells = parsedCells;
      setResult(apiResult);
    } catch (err) {
      console.error("Future Impact Error:", err);

      setError(
        "Unable to run the Future Impact Engine. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const summary = result?.summary;

  const cells = Array.isArray(result?.cells)
    ? result.cells
    : [];

  const topPriorityCells = useMemo(
    () =>
      [...cells]
        .sort(
          (a, b) =>
            Number(b.future_priority_score) -
            Number(a.future_priority_score)
        )
        .slice(0, 10),
    [cells]
  );

  const temperatureChange =
    summary?.temperature_change ?? 0;

  const populationChange =
    summary?.population_change_percent ?? 0;

  const highRiskChange =
    summary?.change_in_high_risk_cells ?? 0;

  const veryHighRiskChange =
    summary?.change_in_very_high_risk_cells ?? 0;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "28px 28px 70px",
        background:
          "linear-gradient(180deg,#edf6f2 0%,#f7faf9 42%,#eef6f3 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="page-enter"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 290,
            padding: "38px 40px",
            borderRadius: 30,
            color: "#fff",
            background:
              "linear-gradient(125deg,#071f1b 0%,#0e3029 38%,#145445 72%,#18816b 100%)",
            boxShadow:
              "0 25px 65px rgba(12,53,44,.20)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              right: -150,
              top: -220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(114,214,162,.22),rgba(114,214,162,0) 68%)",
              animation:
                "gentleFloat 7s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              left: "48%",
              bottom: -190,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(21,156,154,.16),transparent 70%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.16,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)",
              backgroundSize: "55px 55px",
              maskImage:
                "linear-gradient(to bottom right,black,transparent 75%)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: 1000,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: "#8ce1b4",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "1.6px",
                textTransform: "uppercase",
              }}
            >
              <span
                className="live-indicator"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#6fe0a2",
                }}
              />
              ClimateTwin • Decision Intelligence
            </div>

            <h1
              style={{
                margin: "15px 0 0",
                maxWidth: 850,
                fontSize: "clamp(36px,5vw,58px)",
                lineHeight: 0.98,
                fontWeight: 950,
                letterSpacing: "-2.6px",
              }}
            >
              See the city
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#fff,#8fe6b7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                before it happens.
              </span>
            </h1>

            <p
              style={{
                maxWidth: 720,
                margin: "17px 0 0",
                color: "rgba(255,255,255,.68)",
                fontSize: 14,
                lineHeight: 1.75,
              }}
            >
              Explore how temperature, population,
              urbanization and vegetation assumptions
              could reshape Pune's future climate-risk
              landscape.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 21,
              }}
            >
              {[
                "Scenario simulation",
                "Spatial intelligence",
                "Future planning",
                "Decision support",
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "7px 11px",
                    borderRadius: 999,
                    color: "#ccebdd",
                    background:
                      "rgba(255,255,255,.065)",
                    border:
                      "1px solid rgba(255,255,255,.11)",
                    fontSize: 9,
                    fontWeight: 800,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 32,
              bottom: 28,
              width: 205,
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,.065)",
              border:
                "1px solid rgba(255,255,255,.10)",
              backdropFilter: "blur(18px)",
              zIndex: 2,
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,.48)",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "1px",
              }}
            >
              ENGINE STATUS
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#72d6a2",
                  boxShadow:
                    "0 0 0 5px rgba(114,214,162,.10)",
                }}
              />
              <span
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 850,
                }}
              >
                Scenario engine ready
              </span>
            </div>

            <div
              style={{
                marginTop: 12,
                color: "rgba(255,255,255,.48)",
                fontSize: 9,
                lineHeight: 1.5,
              }}
            >
              Interactive spatial simulation
              powered by the ClimateTwin prototype
              risk framework.
            </div>
          </div>
        </section>

        {/* =====================================================
            SCENARIO BUILDER
        ===================================================== */}

        <section
          className="section-reveal"
          style={{
            padding: 25,
            borderRadius: 24,
            background: "rgba(255,255,255,.82)",
            border:
              "1px solid rgba(28,72,61,.10)",
            boxShadow:
              "0 14px 38px rgba(19,60,53,.065)",
            backdropFilter: "blur(18px)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <SectionLabel>
                Future Scenario Laboratory
              </SectionLabel>

              <h2
                style={{
                  margin: "9px 0 5px",
                  color: "#173b32",
                  fontSize: 25,
                  fontWeight: 950,
                  letterSpacing: "-.7px",
                }}
              >
                Design the future you want to test.
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#7b8b85",
                  fontSize: 12,
                }}
              >
                Change assumptions. Run the engine.
                Observe how the spatial risk landscape
                responds.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={resetScenario}
                disabled={loading}
                style={{
                  border: "1px solid #dce7e2",
                  borderRadius: 11,
                  padding: "11px 15px",
                  background: "#fff",
                  color: "#536760",
                  fontSize: 11,
                  fontWeight: 850,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Reset
              </button>

              <button
                onClick={runScenario}
                disabled={loading}
                className="climate-button"
                style={{
                  border: "none",
                  borderRadius: 11,
                  padding: "12px 18px",
                  background: loading
                    ? "#83958e"
                    : "linear-gradient(135deg,#123c35,#19806a)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 10px 25px rgba(18,60,53,.18)",
                }}
              >
                {loading
                  ? "Running simulation..."
                  : "Run Future Simulation  →"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
            }}
          >
            <ScenarioCard
              title="Years Ahead"
              description="Projection horizon"
              value={scenario.years_ahead}
              min={5}
              max={30}
              step={5}
              suffix=" yr"
              icon="◷"
              accent="#3487d8"
              onChange={(value) =>
                updateScenario("years_ahead", value)
              }
            />

            <ScenarioCard
              title="Temperature Increase"
              description="Scenario warming"
              value={scenario.temperature_increase}
              min={0}
              max={5}
              step={0.5}
              suffix="°C"
              icon="☀"
              accent="#f28c4b"
              onChange={(value) =>
                updateScenario(
                  "temperature_increase",
                  value
                )
              }
            />

            <ScenarioCard
              title="Population Growth"
              description="Population assumption"
              value={scenario.population_growth}
              min={0}
              max={15}
              step={1}
              suffix="%"
              icon="●"
              accent="#36a269"
              onChange={(value) =>
                updateScenario(
                  "population_growth",
                  value
                )
              }
            />

            <ScenarioCard
              title="Urbanization Increase"
              description="Built environment"
              value={scenario.urbanization_increase}
              min={0}
              max={15}
              step={1}
              suffix="%"
              icon="⌂"
              accent="#159c9a"
              onChange={(value) =>
                updateScenario(
                  "urbanization_increase",
                  value
                )
              }
            />

            <ScenarioCard
              title="Vegetation Change"
              description="Vegetation reduction"
              value={scenario.vegetation_change}
              min={0}
              max={15}
              step={1}
              suffix="%"
              icon="♧"
              accent="#7b8f4e"
              onChange={(value) =>
                updateScenario(
                  "vegetation_change",
                  value
                )
              }
            />
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 17px",
              marginBottom: 20,
              borderRadius: 14,
              background: "#fff4f2",
              border: "1px solid #ffd0ca",
              color: "#a63830",
              fontSize: 12,
              fontWeight: 750,
            }}
          >
            <Icon size={31} color="#dc5c55">
              !
            </Icon>
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            className="shimmer"
            style={{
              marginBottom: 22,
              padding: 20,
              borderRadius: 18,
              background: "#fff",
              border:
                "1px solid rgba(28,72,61,.09)",
              color: "#62746d",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            ClimateTwin is processing the selected
            future scenario and rebuilding the spatial
            risk field...
          </div>
        )}

        {/* =====================================================
            RESULTS
        ===================================================== */}

        {summary && (
          <>
            {/* KPI STRIP */}
            <section
              className="section-reveal"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(195px,1fr))",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <MetricCard
                label="Baseline LST"
                value={`${summary.baseline_average_lst}°C`}
                description="Current hot-season reference"
                icon="◌"
                accent="#3487d8"
              />

              <MetricCard
                label="Future LST"
                value={`${summary.future_average_lst}°C`}
                description={`Scenario +${temperatureChange}°C`}
                icon="↑"
                accent="#f28c4b"
                trend={`+${temperatureChange}°C`}
              />

              <MetricCard
                label="Future Population"
                value={Number(
                  summary.future_population
                ).toLocaleString()}
                description="Simulated population"
                icon="●"
                accent="#36a269"
                trend={`+${populationChange}%`}
              />

              <MetricCard
                label="High-Risk Cells"
                value={
                  summary.future_high_risk_cells
                }
                description="Future spatial risk"
                icon="!"
                accent="#dc5c55"
                trend={`${highRiskChange >= 0 ? "+" : ""}${highRiskChange}`}
              />

              <MetricCard
                label="Very High Risk"
                value={
                  summary.future_very_high_risk_cells
                }
                description="Highest risk category"
                icon="▲"
                accent="#991b1b"
                trend={`${veryHighRiskChange >= 0 ? "+" : ""}${veryHighRiskChange}`}
              />

              <MetricCard
                label="Priority Score"
                value={`${summary.average_future_priority_score}/100`}
                description="Average future priority"
                icon="◆"
                accent="#7b8f4e"
              />
            </section>

            {/* BASELINE VS FUTURE */}
            <section
              className="section-reveal"
              style={{ marginBottom: 22 }}
            >
              <ComparisonPanel
                summary={summary}
                scenario={scenario}
              />
            </section>

            {/* MAP */}
            <section
              className="section-reveal"
              style={{
                padding: 22,
                borderRadius: 24,
                background: "rgba(255,255,255,.88)",
                border:
                  "1px solid rgba(28,72,61,.10)",
                boxShadow:
                  "0 14px 38px rgba(19,60,53,.06)",
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: 15,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <SectionLabel color="#159c9a">
                    Spatial Intelligence
                  </SectionLabel>

                  <h2
                    style={{
                      margin: "9px 0 4px",
                      color: "#173b32",
                      fontSize: 24,
                      fontWeight: 950,
                      letterSpacing: "-.6px",
                    }}
                  >
                    Future Risk Field
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#7c8b85",
                      fontSize: 11,
                    }}
                  >
                    Hover a spatial cell to inspect its
                    simulated future state.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 11px",
                    borderRadius: 999,
                    background: "#eaf6f2",
                    color: "#397663",
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  <span
                    className="live-indicator"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#36a269",
                    }}
                  />
                  {cells.length.toLocaleString()} cells
                </div>
              </div>

              <FutureMap cells={cells} />
            </section>

            {/* PRIORITY TABLE */}
            <section
              className="section-reveal"
              style={{
                padding: 22,
                borderRadius: 24,
                background: "rgba(255,255,255,.9)",
                border:
                  "1px solid rgba(28,72,61,.10)",
                boxShadow:
                  "0 14px 38px rgba(19,60,53,.055)",
                marginBottom: 22,
              }}
            >
              <div style={{ marginBottom: 17 }}>
                <SectionLabel color="#7b8f4e">
                  Decision Support
                </SectionLabel>

                <h2
                  style={{
                    margin: "9px 0 4px",
                    color: "#173b32",
                    fontSize: 24,
                    fontWeight: 950,
                    letterSpacing: "-.6px",
                  }}
                >
                  Highest-Priority Future Zones
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#7c8b85",
                    fontSize: 11,
                  }}
                >
                  Spatial cells ranked by the prototype
                  future priority framework.
                </p>
              </div>

              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 16,
                  border: "1px solid #e4ece8",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 760,
                    borderCollapse: "collapse",
                    fontSize: 11,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(90deg,#eef6f2,#f4f8f6)",
                      }}
                    >
                      {[
                        "#",
                        "Spatial Cell",
                        "Future LST",
                        "Risk",
                        "Priority",
                        "Population Density",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "13px 14px",
                            textAlign: "left",
                            color: "#52645d",
                            fontSize: 9,
                            fontWeight: 900,
                            letterSpacing: ".5px",
                            textTransform: "uppercase",
                            borderBottom:
                              "1px solid #dfe9e5",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {topPriorityCells.length ? (
                      topPriorityCells.map(
                        (cell, index) => {
                          const risk =
                            RISK[
                              cell.future_risk_level
                            ] || RISK.Low;

                          return (
                            <tr
                              key={cell.cell_id}
                              style={{
                                borderBottom:
                                  "1px solid #edf2ef",
                              }}
                            >
                              <td
                                style={{
                                  padding: "14px",
                                  color: "#79908a",
                                  fontWeight: 900,
                                }}
                              >
                                {String(
                                  index + 1
                                ).padStart(2, "0")}
                              </td>

                              <td
                                style={{
                                  padding: "14px",
                                  color: "#173b32",
                                  fontWeight: 900,
                                }}
                              >
                                Cell {cell.cell_id}
                              </td>

                              <td
                                style={{
                                  padding: "14px",
                                  color: "#52645d",
                                  fontWeight: 700,
                                }}
                              >
                                {Number(
                                  cell.future_lst
                                ).toFixed(2)}
                                °C
                              </td>

                              <td
                                style={{
                                  padding: "14px",
                                }}
                              >
                                <span
                                  style={{
                                    display:
                                      "inline-flex",
                                    padding:
                                      "5px 9px",
                                    borderRadius: 999,
                                    background:
                                      risk.bg,
                                    border: `1px solid ${risk.border}`,
                                    color:
                                      risk.color,
                                    fontSize: 9,
                                    fontWeight: 900,
                                  }}
                                >
                                  {
                                    cell.future_risk_level
                                  }
                                </span>
                              </td>

                              <td
                                style={{
                                  padding: "14px",
                                  color: "#173b32",
                                  fontWeight: 950,
                                  fontSize: 13,
                                }}
                              >
                                {Number(
                                  cell.future_priority_score
                                ).toFixed(2)}
                              </td>

                              <td
                                style={{
                                  padding: "14px",
                                  color: "#667771",
                                }}
                              >
                                {Number(
                                  cell.future_population_density
                                ).toFixed(0)}
                              </td>
                            </tr>
                          );
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: 35,
                            textAlign: "center",
                            color: "#7d8d87",
                          }}
                        >
                          No priority-zone data
                          available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* DECISION INSIGHT */}
            <section
              className="section-reveal"
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "30px 32px",
                borderRadius: 25,
                background:
                  "linear-gradient(125deg,#081f1b,#123c35 52%,#19705d)",
                color: "#fff",
                boxShadow:
                  "0 18px 45px rgba(19,60,53,.16)",
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  right: -130,
                  top: -160,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(114,214,162,.15),transparent 68%)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <SectionLabel color="#72d6a2">
                  ClimateTwin Decision Insight
                </SectionLabel>

                <h2
                  style={{
                    margin: "12px 0 9px",
                    fontSize: 28,
                    fontWeight: 950,
                    letterSpacing: "-.7px",
                  }}
                >
                  The future is not one number.
                  <br />
                  It is a map of consequences.
                </h2>

                <p
                  style={{
                    maxWidth: 900,
                    margin: 0,
                    color: "rgba(255,255,255,.64)",
                    fontSize: 12,
                    lineHeight: 1.8,
                  }}
                >
                  Under this scenario, Pune's average
                  hot-season land surface temperature
                  changes by{" "}
                  <strong style={{ color: "#fff" }}>
                    {temperatureChange}°C
                  </strong>{" "}
                  while high-risk cells change by{" "}
                  <strong style={{ color: "#fff" }}>
                    {highRiskChange >= 0 ? "+" : ""}
                    {highRiskChange}
                  </strong>
                  . ClimateTwin identifies spatial
                  priority zones where heat, population
                  pressure, vegetation stress,
                  urbanization and water conditions
                  combine within the prototype decision
                  framework.
                </p>
              </div>
            </section>

            {/* MODELING NOTE */}
            <section
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 13,
                padding: 18,
                borderRadius: 17,
                background: "rgba(255,255,255,.82)",
                border:
                  "1px solid rgba(28,72,61,.09)",
                marginBottom: 25,
              }}
            >
              <Icon size={32} color="#d7973e">
                i
              </Icon>

              <div>
                <div
                  style={{
                    color: "#33453f",
                    fontSize: 12,
                    fontWeight: 900,
                    marginBottom: 4,
                  }}
                >
                  Modeling Note
                </div>

                <div
                  style={{
                    color: "#73827c",
                    fontSize: 10,
                    lineHeight: 1.7,
                  }}
                >
                  This is a scenario simulation, not a
                  validated climate forecast. Future
                  temperature, population, urbanization
                  and vegetation changes are user-defined
                  assumptions. The engine uses the
                  ClimateTwin prototype risk framework to
                  explore possible future conditions.
                </div>
              </div>
            </section>
          </>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!result && !loading && !error && (
          <section
            className="section-reveal"
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "75px 30px",
              textAlign: "center",
              borderRadius: 25,
              background:
                "linear-gradient(135deg,rgba(255,255,255,.94),rgba(237,247,243,.88))",
              border:
                "1px solid rgba(28,72,61,.09)",
              boxShadow:
                "0 14px 40px rgba(19,60,53,.055)",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                left: "12%",
                top: -170,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(54,162,105,.12),transparent 68%)",
              }}
            />

            <div
              className="float"
              style={{
                width: 82,
                height: 82,
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 25,
                background:
                  "linear-gradient(135deg,#dff3ea,#dff5f2)",
                border:
                  "1px solid rgba(54,162,105,.12)",
                boxShadow:
                  "0 15px 35px rgba(54,162,105,.13)",
                fontSize: 40,
              }}
            >
              ◉
            </div>

            <SectionLabel>
              Simulation Ready
            </SectionLabel>

            <h2
              style={{
                margin: "12px 0 8px",
                color: "#173b32",
                fontSize: 27,
                fontWeight: 950,
                letterSpacing: "-.7px",
              }}
            >
              Build Pune's possible future.
            </h2>

            <p
              style={{
                maxWidth: 540,
                margin: "0 auto",
                color: "#778781",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Configure the scenario above, then run
              ClimateTwin to transform your assumptions
              into a spatial future-risk picture.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}