import { useMemo, useState } from "react";
import InterventionMap from "../components/InterventionMap";

const API = "https://climatetwin.onrender.com";

const DEFAULT_INTERVENTIONS = {
  tree_plantation: 50,
  cool_roof: 40,
  green_roof: 30,
  urban_parks: 20,
  reflective_roads: 30,
  green_corridors: 20,
};

const INTERVENTIONS = {
  tree_plantation: {
    label: "Tree Plantation",
    icon: "🌳",
    description: "Increase urban tree coverage",
    color: "#36a269",
    soft: "#e3f5eb",
  },
  cool_roof: {
    label: "Cool Roofs",
    icon: "🏠",
    description: "Reduce heat absorption from roofs",
    color: "#3487d8",
    soft: "#e5f0fc",
  },
  green_roof: {
    label: "Green Roofs",
    icon: "🌿",
    description: "Add vegetation to building rooftops",
    color: "#4d9b72",
    soft: "#e5f4eb",
  },
  urban_parks: {
    label: "Urban Parks",
    icon: "🌲",
    description: "Expand cooling green spaces",
    color: "#238552",
    soft: "#e1f4e9",
  },
  reflective_roads: {
    label: "Reflective Roads",
    icon: "🛣️",
    description: "Increase road surface reflectivity",
    color: "#71808c",
    soft: "#e9eef1",
  },
  green_corridors: {
    label: "Green Corridors",
    icon: "🌱",
    description: "Connect green spaces across the city",
    color: "#5a9f75",
    soft: "#e5f3eb",
  },
};

function MetricCard({ icon, label, value, description, tone }) {
  return (
    <div className={`intervention-metric intervention-metric-${tone}`}>
      <div className="intervention-metric-glow" />
      <div className="intervention-metric-top">
        <span className="intervention-metric-icon">{icon}</span>
        <span className="intervention-metric-label">{label}</span>
      </div>

      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

function InterventionControl({ name, value, onChange }) {
  const item = INTERVENTIONS[name];

  return (
    <div className="intervention-control">
      <div className="intervention-control-top">
        <div className="intervention-name">
          <div
            className="intervention-icon"
            style={{
              background: item.soft,
              color: item.color,
            }}
          >
            {item.icon}
          </div>

          <div>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </div>
        </div>

        <div
          className="intervention-value"
          style={{
            color: item.color,
            background: item.soft,
          }}
        >
          {value}%
        </div>
      </div>

      <div className="intervention-range-wrap">
        <div className="intervention-range-track" />

        <div
          className="intervention-range-progress"
          style={{
            width: `${value}%`,
            background: item.color,
          }}
        />

        <input
          className="intervention-range"
          type="range"
          min="0"
          max="100"
          step="10"
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-label={item.label}
        />

        <div className="intervention-range-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({
  type,
  title,
  icon,
  average,
  highRisk,
  veryHighRisk,
}) {
  const isAfter = type === "after";

  return (
    <div
      className={`intervention-comparison-card ${
        isAfter
          ? "intervention-comparison-after"
          : "intervention-comparison-before"
      }`}
    >
      <div className="intervention-comparison-header">
        <div className="intervention-comparison-icon">
          {icon}
        </div>

        <div>
          <strong>{title}</strong>
          <span>
            {isAfter
              ? "Modeled future condition"
              : "Current modeled condition"}
          </span>
        </div>
      </div>

      <div className="intervention-comparison-row">
        <span>Average LST</span>
        <strong>{average}°C</strong>
      </div>

      <div className="intervention-comparison-row">
        <span>High-risk cells</span>
        <strong>{highRisk}</strong>
      </div>

      <div className="intervention-comparison-row">
        <span>Very-high-risk cells</span>
        <strong>{veryHighRisk}</strong>
      </div>
    </div>
  );
}

export default function Intervention() {
  const [interventions, setInterventions] = useState(
    DEFAULT_INTERVENTIONS
  );

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateValue = (name, value) => {
    setInterventions((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  const runSimulation = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/intervention`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interventions),
      });

      if (!response.ok) {
        throw new Error("Intervention API failed");
      }

      const data = await response.json();

      const cells =
        typeof data.cells === "string"
          ? JSON.parse(data.cells)
          : data.cells;

      setResults({
        ...data,
        cells,
      });
    } catch (error) {
      console.error("Intervention error:", error);
      alert("Unable to run intervention simulation.");
    } finally {
      setLoading(false);
    }
  };

  const summary = results?.summary;

  const totalIntensity = useMemo(() => {
    const values = Object.values(interventions);

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) /
        values.length
    );
  }, [interventions]);

  const activeInterventions = Object.values(interventions).filter(
    (value) => value > 0
  ).length;

  const coolingReduction = summary
    ? Number(summary.average_lst_reduction || 0)
    : 0;

  return (
    <div className="intervention-page">
      <style>{`
        .intervention-page {
          min-height: calc(100vh - 70px);
          padding: 28px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 5% 5%,
              rgba(54, 162, 105, 0.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 95% 18%,
              rgba(21, 156, 154, 0.10),
              transparent 25%
            ),
            linear-gradient(
              180deg,
              #eef6f3 0%,
              #f8fbfa 48%,
              #edf6f2 100%
            );
          color: var(--text);
        }

        .intervention-page::before {
          content: "";
          position: fixed;
          width: 460px;
          height: 460px;
          right: -220px;
          bottom: -210px;
          border-radius: 50%;
          background: rgba(54, 162, 105, 0.07);
          filter: blur(12px);
          pointer-events: none;
          animation: interventionAmbient 11s ease-in-out infinite;
        }

        .intervention-container {
          position: relative;
          z-index: 1;
          max-width: 1380px;
          margin: 0 auto;
        }

        .intervention-hero {
          position: relative;
          min-height: 270px;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 38px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          color: white;
          background:
            radial-gradient(
              circle at 82% 25%,
              rgba(114, 214, 162, 0.22),
              transparent 23%
            ),
            radial-gradient(
              circle at 105% 100%,
              rgba(21, 156, 154, 0.22),
              transparent 38%
            ),
            linear-gradient(
              135deg,
              #102f2a 0%,
              #17453b 48%,
              #216653 100%
            );
          box-shadow:
            0 24px 70px rgba(19, 60, 53, 0.18);
          animation: interventionHeroIn 0.65s ease-out both;
        }

        .intervention-hero::before {
          content: "";
          position: absolute;
          width: 370px;
          height: 370px;
          right: -95px;
          top: -175px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 50%;
          box-shadow:
            0 0 0 35px rgba(255,255,255,0.025),
            0 0 0 75px rgba(255,255,255,0.018);
          animation: interventionOrb 9s ease-in-out infinite;
        }

        .intervention-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image:
            linear-gradient(
              rgba(255,255,255,0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.035) 1px,
              transparent 1px
            );
          background-size: 34px 34px;
          mask-image: linear-gradient(
            90deg,
            transparent,
            black 55%,
            transparent
          );
          pointer-events: none;
        }

        .intervention-hero-content {
          position: relative;
          z-index: 2;
          max-width: 810px;
        }

        .intervention-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          margin-bottom: 17px;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          color: rgba(255,255,255,0.84);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .intervention-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #72d6a2;
          box-shadow:
            0 0 0 5px rgba(114,214,162,0.11),
            0 0 16px rgba(114,214,162,0.45);
          animation: interventionPulse 2s infinite;
        }

        .intervention-hero h1 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 54px);
          line-height: 1.02;
          letter-spacing: -2px;
        }

        .intervention-hero h1 span {
          background:
            linear-gradient(
              90deg,
              #ffffff,
              #8ce3b5,
              #77d8db
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .intervention-hero p {
          max-width: 780px;
          margin: 17px 0 0;
          color: rgba(255,255,255,0.72);
          font-size: 14px;
          line-height: 1.75;
        }

        .intervention-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        .intervention-hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 10px;
          background: rgba(255,255,255,0.065);
          color: rgba(255,255,255,0.70);
          font-size: 10px;
        }

        .intervention-hero-orbit {
          position: absolute;
          z-index: 1;
          right: 72px;
          top: 50%;
          width: 150px;
          height: 150px;
          transform: translateY(-50%);
          border: 1px solid rgba(114,214,162,0.22);
          border-radius: 50%;
          animation: interventionOrbit 7s ease-in-out infinite;
        }

        .intervention-hero-orbit::before,
        .intervention-hero-orbit::after {
          content: "";
          position: absolute;
          inset: 18px;
          border: 1px dashed rgba(114,214,162,0.20);
          border-radius: 50%;
        }

        .intervention-hero-orbit::after {
          inset: 49px;
          border-style: solid;
          background: rgba(114,214,162,0.08);
          box-shadow:
            0 0 30px rgba(114,214,162,0.16);
        }

        .intervention-layout {
          display: grid;
          grid-template-columns:
            minmax(420px, 0.95fr)
            minmax(0, 1.05fr);
          gap: 20px;
          margin-top: 20px;
          align-items: stretch;
        }

        .intervention-card {
          border: 1px solid var(--border);
          border-radius: 23px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.97),
              rgba(247,252,249,0.92)
            );
          box-shadow: var(--shadow);
          backdrop-filter: blur(16px);
          animation: interventionSurfaceIn 0.65s ease-out both;
        }

        .control-card {
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 18px;
        }

        .card-header-title {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .card-header-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid rgba(54,162,105,0.13);
          border-radius: 13px;
          background: #e8f5ee;
          font-size: 20px;
        }

        .card-header h2 {
          margin: 0 0 5px;
          color: var(--primary);
          font-size: 19px;
          letter-spacing: -0.3px;
        }

        .card-header p {
          margin: 0;
          color: var(--text-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .intervention-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid rgba(54,162,105,0.13);
          border-radius: 10px;
          background: #edf7f1;
          color: #326151;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .intervention-badge::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #36a269;
          box-shadow: 0 0 8px rgba(54,162,105,0.4);
        }

        .intervention-control {
          position: relative;
          overflow: hidden;
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #dfe9e4;
          border-radius: 16px;
          background: rgba(251,253,252,0.92);
          transition:
            transform 0.28s ease,
            box-shadow 0.28s ease,
            border-color 0.28s ease;
        }

        .intervention-control::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(
            180deg,
            #36a269,
            #159c9a
          );
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .intervention-control:hover {
          transform: translateY(-3px);
          border-color: rgba(54,162,105,0.23);
          box-shadow:
            0 12px 25px rgba(23,59,50,0.08);
        }

        .intervention-control:hover::before {
          opacity: 1;
        }

        .intervention-control-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .intervention-name {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .intervention-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          font-size: 19px;
        }

        .intervention-name strong {
          display: block;
          color: #2e413b;
          font-size: 13px;
        }

        .intervention-name span {
          display: block;
          margin-top: 3px;
          color: #89958f;
          font-size: 10px;
        }

        .intervention-value {
          min-width: 52px;
          padding: 7px 9px;
          text-align: center;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 850;
        }

        .intervention-range-wrap {
          position: relative;
          margin-top: 13px;
        }

        .intervention-range-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 8px;
          height: 5px;
          border-radius: 99px;
          background: #dfe9e5;
          pointer-events: none;
        }

        .intervention-range-progress {
          position: absolute;
          left: 0;
          top: 8px;
          height: 5px;
          border-radius: 99px;
          pointer-events: none;
          transition: width 0.16s ease;
          box-shadow: 0 0 10px rgba(54,162,105,0.16);
        }

        .intervention-range {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 21px;
          margin: 0;
          padding: 0;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .intervention-range:focus {
          outline: none;
        }

        .intervention-range::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          margin-top: -6px;
          border: 3px solid white;
          border-radius: 50%;
          background: #173b32;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.22),
            0 0 0 4px rgba(54,162,105,0.07);
          transition: transform 0.2s ease;
        }

        .intervention-range:hover::-webkit-slider-thumb {
          transform: scale(1.15);
        }

        .intervention-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: 3px solid white;
          border-radius: 50%;
          background: #173b32;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.22);
        }

        .intervention-range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 1px;
          color: #9aa59f;
          font-size: 9px;
        }

        .intervention-control-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
          padding: 11px 13px;
          border: 1px solid #e1ebe6;
          border-radius: 12px;
          background: #f6faf8;
        }

        .intervention-control-summary span {
          color: #73827c;
          font-size: 10px;
        }

        .intervention-control-summary strong {
          color: #2e6956;
          font-size: 12px;
        }

        .run-intervention-button {
          position: relative;
          overflow: hidden;
          width: 100%;
          margin-top: 11px;
          padding: 15px 18px;
          border: none;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #123c35,
              #216653,
              #159c9a
            );
          background-size: 180% 180%;
          color: white;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow:
            0 10px 24px rgba(19,60,53,0.20);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background-position 0.35s ease;
        }

        .run-intervention-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: -80%;
          width: 45%;
          height: 100%;
          transform: skewX(-20deg);
          background: rgba(255,255,255,0.16);
          transition: left 0.55s ease;
        }

        .run-intervention-button:hover:not(:disabled) {
          transform: translateY(-3px);
          background-position: 100% 50%;
          box-shadow:
            0 15px 32px rgba(19,60,53,0.27);
        }

        .run-intervention-button:hover:not(:disabled)::after {
          left: 140%;
        }

        .run-intervention-button:disabled {
          opacity: 0.68;
          cursor: not-allowed;
        }

        .preview-card {
          padding: 24px;
        }

        .preview-inner {
          position: relative;
          min-height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
          border: 1px solid #e1ebe6;
          border-radius: 18px;
          background:
            radial-gradient(
              circle at 50% 18%,
              rgba(54,162,105,0.12),
              transparent 33%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(21,156,154,0.07),
              transparent 30%
            ),
            #f7fbf9;
        }

        .preview-inner::before {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border: 1px dashed rgba(54,162,105,0.12);
          border-radius: 50%;
          animation: interventionPreviewOrbit 14s linear infinite;
        }

        .preview-inner::after {
          content: "";
          position: absolute;
          width: 190px;
          height: 190px;
          border: 1px solid rgba(21,156,154,0.10);
          border-radius: 50%;
          animation: interventionPreviewOrbitReverse 10s linear infinite;
        }

        .preview-icon {
          position: relative;
          z-index: 2;
          width: 86px;
          height: 86px;
          display: grid;
          place-items: center;
          margin-bottom: 19px;
          border: 1px solid rgba(54,162,105,0.16);
          border-radius: 26px;
          background:
            linear-gradient(
              135deg,
              #e1f3e9,
              #f3fbf7
            );
          box-shadow:
            0 15px 30px rgba(54,162,105,0.12);
          font-size: 39px;
          animation: interventionFloat 4s ease-in-out infinite;
        }

        .preview-inner h3,
        .preview-inner p,
        .preview-data {
          position: relative;
          z-index: 2;
        }

        .preview-inner h3 {
          margin: 0 0 9px;
          color: #173b32;
          font-size: 22px;
          letter-spacing: -0.5px;
        }

        .preview-inner p {
          max-width: 420px;
          margin: 0;
          color: #74827c;
          font-size: 12px;
          line-height: 1.75;
        }

        .preview-data {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          width: min(100%, 410px);
          margin-top: 23px;
        }

        .preview-data-item {
          padding: 10px;
          border: 1px solid #dfeae4;
          border-radius: 11px;
          background: rgba(255,255,255,0.75);
        }

        .preview-data-item strong {
          display: block;
          color: #2f6956;
          font-size: 15px;
        }

        .preview-data-item span {
          display: block;
          margin-top: 3px;
          color: #89958f;
          font-size: 9px;
        }

        .selected-count {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          padding: 8px 12px;
          border: 1px solid #dce7e2;
          border-radius: 999px;
          background: rgba(255,255,255,0.82);
          color: #557069;
          font-size: 10px;
          font-weight: 700;
        }

        .selected-count span {
          width: 16px;
          height: 16px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e2f5e9;
          color: #2f8c5c;
          font-size: 9px;
        }

        .results-section {
          margin-top: 20px;
          animation: interventionResultsIn 0.55s ease-out both;
        }

        .section-card {
          padding: 24px;
          margin-bottom: 18px;
          border: 1px solid var(--border);
          border-radius: 23px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.97),
              rgba(247,252,249,0.92)
            );
          box-shadow: var(--shadow);
          backdrop-filter: blur(16px);
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 18px;
        }

        .section-title-wrap {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .section-title-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 13px;
          background: #e9f6ef;
          font-size: 19px;
        }

        .section-title {
          margin: 0 0 5px;
          color: #173b32;
          font-size: 19px;
          letter-spacing: -0.3px;
        }

        .section-description {
          margin: 0;
          color: #71807a;
          font-size: 12px;
          line-height: 1.6;
        }

        .section-badge {
          padding: 8px 10px;
          border-radius: 9px;
          background: #f0f6f3;
          color: #5d746b;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .impact-map {
          position: relative;
          overflow: hidden;
          border: 1px solid #dfe9e4;
          border-radius: 17px;
          background: #f3f8f5;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .impact-map:hover {
          transform: translateY(-2px);
          box-shadow:
            0 18px 40px rgba(19,60,53,0.12);
        }

        .map-live-label {
          position: absolute;
          z-index: 500;
          top: 14px;
          left: 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 10px;
          background: rgba(20,50,44,0.82);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 9px;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .map-live-label span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #72d6a2;
          box-shadow: 0 0 8px #72d6a2;
        }

        .map-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 13px;
        }

        .map-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid #e0e8e4;
          border-radius: 9px;
          background: #f7faf8;
          color: #687872;
          font-size: 10px;
          font-weight: 650;
        }

        .legend-square {
          width: 9px;
          height: 9px;
          border-radius: 3px;
        }

        .intervention-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin-bottom: 18px;
        }

        .intervention-metric {
          position: relative;
          min-height: 142px;
          overflow: hidden;
          padding: 18px;
          border-radius: 18px;
          color: white;
          box-shadow:
            0 10px 25px rgba(19,60,53,0.11);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .intervention-metric:hover {
          transform: translateY(-5px);
          box-shadow:
            0 18px 35px rgba(19,60,53,0.16);
        }

        .intervention-metric-glow {
          position: absolute;
          width: 140px;
          height: 140px;
          right: -60px;
          bottom: -80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.11);
        }

        .intervention-metric-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .intervention-metric-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255,255,255,0.13);
          font-size: 13px;
        }

        .intervention-metric-label {
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.78;
        }

        .intervention-metric strong {
          position: relative;
          z-index: 1;
          display: block;
          margin-top: 17px;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -0.8px;
        }

        .intervention-metric small {
          position: relative;
          z-index: 1;
          display: block;
          margin-top: 7px;
          font-size: 10px;
          line-height: 1.4;
          opacity: 0.74;
        }

        .intervention-metric-orange {
          background:
            linear-gradient(135deg, #ed7b32, #d95d19);
        }

        .intervention-metric-green {
          background:
            linear-gradient(135deg, #2f9b62, #187447);
        }

        .intervention-metric-blue {
          background:
            linear-gradient(135deg, #159bd1, #0876a9);
        }

        .intervention-metric-purple {
          background:
            linear-gradient(135deg, #8251cf, #6330a8);
        }

        .intervention-comparison-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .intervention-comparison-card {
          padding: 20px;
          border-radius: 17px;
        }

        .intervention-comparison-before {
          border: 1px solid #fed7aa;
          background:
            linear-gradient(
              145deg,
              #fff8ef,
              #fff3e5
            );
        }

        .intervention-comparison-after {
          border: 1px solid #bbf7d0;
          background:
            linear-gradient(
              145deg,
              #f2fdf5,
              #eaf9ef
            );
        }

        .intervention-comparison-header {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 14px;
        }

        .intervention-comparison-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(255,255,255,0.75);
          font-size: 17px;
        }

        .intervention-comparison-header strong {
          display: block;
          font-size: 14px;
        }

        .intervention-comparison-before
          .intervention-comparison-header strong {
          color: #c2410c;
        }

        .intervention-comparison-after
          .intervention-comparison-header strong {
          color: #15803d;
        }

        .intervention-comparison-header span {
          display: block;
          margin-top: 3px;
          color: #87958f;
          font-size: 9px;
        }

        .intervention-comparison-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.055);
          color: #63716c;
          font-size: 11px;
        }

        .intervention-comparison-row:last-child {
          border-bottom: none;
        }

        .intervention-comparison-row strong {
          color: #2f403a;
          font-size: 13px;
        }

        .cooling-highlight {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 15px;
          padding: 15px 17px;
          border: 1px solid rgba(54,162,105,0.16);
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #edf8f1,
              #f7fcf9
            );
        }

        .cooling-highlight-label {
          color: #5f756c;
          font-size: 11px;
        }

        .cooling-highlight-label strong {
          display: block;
          margin-top: 3px;
          color: #276a4e;
          font-size: 14px;
        }

        .cooling-highlight-value {
          padding: 9px 12px;
          border-radius: 10px;
          background: #dff3e7;
          color: #20804d;
          font-size: 15px;
          font-weight: 850;
        }

        .modeling-note {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 17px 18px;
          border: 1px solid #f3dfad;
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              #fffbeb,
              #fffdf5
            );
          color: #69746e;
          font-size: 12px;
          line-height: 1.65;
        }

        .modeling-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: white;
          box-shadow: 0 5px 12px rgba(0,0,0,0.05);
        }

        .modeling-note strong {
          color: #8a6410;
        }

        .intervention-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .intervention-loading span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: interventionLoadingDot 1s infinite ease-in-out;
        }

        .intervention-loading span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .intervention-loading span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes interventionHeroIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes interventionSurfaceIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes interventionResultsIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes interventionAmbient {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.12);
          }
        }

        @keyframes interventionOrb {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }

          50% {
            transform: translate(-20px, 20px) rotate(10deg);
          }
        }

        @keyframes interventionOrbit {
          0%, 100% {
            transform: translateY(-50%) rotate(0deg);
          }

          50% {
            transform: translateY(calc(-50% - 10px)) rotate(6deg);
          }
        }

        @keyframes interventionPreviewOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes interventionPreviewOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes interventionFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes interventionPulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(114,214,162,0.45);
          }

          70% {
            box-shadow:
              0 0 0 9px rgba(114,214,162,0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(114,214,162,0);
          }
        }

        @keyframes interventionLoadingDot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @media (max-width: 1100px) {
          .intervention-layout {
            grid-template-columns: 1fr;
          }

          .intervention-metrics {
            grid-template-columns: repeat(2, 1fr);
          }

          .intervention-hero-orbit {
            right: 35px;
            opacity: 0.65;
          }
        }

        @media (max-width: 760px) {
          .intervention-page {
            padding: 18px;
          }

          .intervention-hero {
            min-height: auto;
            padding: 28px 22px;
          }

          .intervention-hero-orbit {
            display: none;
          }

          .intervention-card,
          .section-card {
            padding: 18px;
            border-radius: 19px;
          }

          .card-header,
          .section-heading {
            flex-direction: column;
          }

          .preview-inner {
            min-height: 420px;
          }

          .intervention-comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .intervention-page {
            padding: 13px;
          }

          .intervention-hero {
            padding: 23px 18px;
            border-radius: 21px;
          }

          .intervention-hero h1 {
            font-size: 32px;
            letter-spacing: -1.2px;
          }

          .intervention-hero p {
            font-size: 13px;
          }

          .intervention-metrics {
            grid-template-columns: 1fr;
          }

          .preview-data {
            grid-template-columns: 1fr;
          }

          .intervention-control {
            padding: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intervention-page::before,
          .intervention-hero,
          .intervention-hero::before,
          .intervention-hero-orbit,
          .intervention-card,
          .results-section,
          .preview-icon,
          .preview-inner::before,
          .preview-inner::after,
          .intervention-live-dot {
            animation: none !important;
          }

          .intervention-control,
          .intervention-metric,
          .impact-map,
          .run-intervention-button {
            transition: none !important;
          }
        }
      `}</style>

      <div className="intervention-container">
        <section className="intervention-hero">
          <div className="intervention-hero-content">
            <div className="intervention-eyebrow">
              <span className="intervention-live-dot" />
              Climate Action Simulator
            </div>

            <h1>
              Intervention <span>Simulator</span>
            </h1>

            <p>
              Explore how different urban climate interventions
              could reduce modeled heat exposure across Pune.
              Adjust intervention intensity and compare the
              resulting spatial impact.
            </p>

            <div className="intervention-hero-meta">
              <div className="intervention-hero-chip">
                🌱 6 intervention levers
              </div>

              <div className="intervention-hero-chip">
                🗺️ Spatial impact analysis
              </div>

              <div className="intervention-hero-chip">
                ⚡ Scenario-based modeling
              </div>
            </div>
          </div>

          <div className="intervention-hero-orbit" />
        </section>

        <div className="intervention-layout">
          <section className="intervention-card control-card">
            <div className="card-header">
              <div className="card-header-title">
                <div className="card-header-icon">🎛️</div>

                <div>
                  <h2>Select Interventions</h2>

                  <p>
                    Set the intensity of each proposed climate
                    intervention.
                  </p>
                </div>
              </div>

              <span className="intervention-badge">
                0–100%
              </span>
            </div>

            {Object.entries(interventions).map(
              ([name, value]) => (
                <InterventionControl
                  key={name}
                  name={name}
                  value={value}
                  onChange={updateValue}
                />
              )
            )}

            <div className="intervention-control-summary">
              <span>Average intervention intensity</span>
              <strong>{totalIntensity}%</strong>
            </div>

            <button
              className="run-intervention-button"
              onClick={runSimulation}
              disabled={loading}
            >
              {loading ? (
                <span className="intervention-loading">
                  <span />
                  <span />
                  <span />
                  Running Simulation
                </span>
              ) : (
                "Run Intervention Simulation →"
              )}
            </button>
          </section>

          <section className="intervention-card preview-card">
            <div className="preview-inner">
              <div className="preview-icon">🌱</div>

              <h3>Design a Cooler Pune</h3>

              <p>
                Combine trees, green roofs, parks, reflective
                roads and other interventions to explore their
                modeled cooling impact across the city.
              </p>

              <div className="preview-data">
                <div className="preview-data-item">
                  <strong>{activeInterventions}</strong>
                  <span>Active levers</span>
                </div>

                <div className="preview-data-item">
                  <strong>{totalIntensity}%</strong>
                  <span>Avg intensity</span>
                </div>

                <div className="preview-data-item">
                  <strong>100%</strong>
                  <span>Scenario scale</span>
                </div>
              </div>

              <div className="selected-count">
                <span>✓</span>
                6 intervention variables configured
              </div>
            </div>
          </section>
        </div>

        {summary && (
          <div className="results-section">
            <section className="section-card">
              <div className="section-heading">
                <div className="section-title-wrap">
                  <div className="section-title-icon">🗺️</div>

                  <div>
                    <h2 className="section-title">
                      Intervention Cooling Impact
                    </h2>

                    <p className="section-description">
                      Spatial distribution of the simulated
                      reduction in land surface temperature.
                    </p>
                  </div>
                </div>

                <span className="section-badge">
                  Scenario result
                </span>
              </div>

              <div className="impact-map">
                <div className="map-live-label">
                  <span />
                  SIMULATED IMPACT LAYER
                </div>

                <InterventionMap data={results.cells} />
              </div>

              <div className="map-legend">
                <div className="map-legend-item">
                  <span
                    className="legend-square"
                    style={{ background: "#ef4444" }}
                  />
                  &lt; 0.5°C
                </div>

                <div className="map-legend-item">
                  <span
                    className="legend-square"
                    style={{ background: "#f97316" }}
                  />
                  0.5–1°C
                </div>

                <div className="map-legend-item">
                  <span
                    className="legend-square"
                    style={{ background: "#eab308" }}
                  />
                  1–2°C
                </div>

                <div className="map-legend-item">
                  <span
                    className="legend-square"
                    style={{ background: "#65a30d" }}
                  />
                  2–3°C
                </div>

                <div className="map-legend-item">
                  <span
                    className="legend-square"
                    style={{ background: "#16a34a" }}
                  />
                  ≥ 3°C
                </div>
              </div>
            </section>

            <section className="intervention-metrics">
              <MetricCard
                icon="🔥"
                label="Baseline Average LST"
                value={`${summary.baseline_average_lst}°C`}
                description="Current modeled condition"
                tone="orange"
              />

              <MetricCard
                icon="🌱"
                label="After Intervention"
                value={`${summary.intervention_average_lst}°C`}
                description="Modeled average after action"
                tone="green"
              />

              <MetricCard
                icon="❄️"
                label="Average Cooling"
                value={`${summary.average_lst_reduction}°C`}
                description="Modeled LST reduction"
                tone="blue"
              />

              <MetricCard
                icon="⚠️"
                label="High-Risk Cells"
                value={`${summary.baseline_high_risk_cells} → ${summary.intervention_high_risk_cells}`}
                description="Baseline → intervention"
                tone="purple"
              />
            </section>

            <section className="section-card">
              <div className="section-heading">
                <div className="section-title-wrap">
                  <div className="section-title-icon">📊</div>

                  <div>
                    <h2 className="section-title">
                      Intervention Impact
                    </h2>

                    <p className="section-description">
                      Compare the modeled heat-risk indicators
                      before and after applying the selected
                      interventions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="intervention-comparison-grid">
                <ComparisonCard
                  type="before"
                  title="Before Intervention"
                  icon="🔥"
                  average={summary.baseline_average_lst}
                  highRisk={summary.baseline_high_risk_cells}
                  veryHighRisk={
                    summary.baseline_very_high_risk_cells
                  }
                />

                <ComparisonCard
                  type="after"
                  title="After Intervention"
                  icon="🌱"
                  average={summary.intervention_average_lst}
                  highRisk={
                    summary.intervention_high_risk_cells
                  }
                  veryHighRisk={
                    summary.intervention_very_high_risk_cells
                  }
                />
              </div>

              <div className="cooling-highlight">
                <div className="cooling-highlight-label">
                  <span>Modeled climate benefit</span>
                  <strong>
                    Average land surface temperature reduction
                  </strong>
                </div>

                <div className="cooling-highlight-value">
                  {coolingReduction}°C cooler
                </div>
              </div>
            </section>

            <div className="modeling-note">
              <div className="modeling-icon">ℹ️</div>

              <div>
                <strong>Modeling note</strong>
                <br />
                Intervention effects are scenario-based
                prototype estimates using assumed cooling
                impacts. They are intended for comparative
                decision support, not as measured or guaranteed
                cooling outcomes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}