import { useState } from "react";
import OptimizationMap from "../components/OptimizationMap";

export default function Optimization() {
  const [budget, setBudget] = useState(5000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const interventionLabels = {
    tree_plantation: "Tree Plantation",
    cool_roof: "Cool Roofs",
    green_roof: "Green Roofs",
    urban_parks: "Urban Parks",
    reflective_roads: "Reflective Roads",
    green_corridors: "Green Corridors",
  };

  const interventionIcons = {
    tree_plantation: "🌳",
    cool_roof: "🏠",
    green_roof: "🌿",
    urban_parks: "🌲",
    reflective_roads: "🛣️",
    green_corridors: "🌱",
  };

  const interventionDescriptions = {
    tree_plantation: "Expand urban tree coverage",
    cool_roof: "Reduce roof heat absorption",
    green_roof: "Add vegetation to rooftops",
    urban_parks: "Increase cooling green spaces",
    reflective_roads: "Reduce road heat absorption",
    green_corridors: "Connect fragmented green areas",
  };

  const interventionColors = {
    tree_plantation: "#3f8f68",
    cool_roof: "#4f83cc",
    green_roof: "#4d9b72",
    urban_parks: "#2f8a5d",
    reflective_roads: "#7d8792",
    green_corridors: "#5a9f75",
  };

  const runOptimization = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/optimize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            budget: Number(budget),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Optimization API failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Optimization error:", error);
      alert("Unable to run optimization.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const activePlan = result?.recommended_plan
    ? Object.entries(result.recommended_plan).filter(
        ([, level]) => Number(level) > 0
      )
    : [];

  const budgetProgress =
    ((Number(budget) - 1000) / 19000) * 100;

  const budgetUtilization = result
    ? Math.min(
        100,
        (Number(result.total_cost || 0) /
          Math.max(Number(result.budget || budget), 1)) *
          100
      )
    : 0;

  const priorityCells = result?.priority_cells || [];

  return (
    <div className="optimizer-page">
      <style>{`
        .optimizer-page {
          min-height: calc(100vh - 70px);
          padding: 30px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 8% 5%,
              rgba(54, 162, 105, 0.10),
              transparent 25%
            ),
            radial-gradient(
              circle at 92% 22%,
              rgba(52, 135, 216, 0.08),
              transparent 25%
            ),
            linear-gradient(
              180deg,
              #edf7f3 0%,
              #f7fbf9 48%,
              #edf5f1 100%
            );
          color: #20352f;
        }

        .optimizer-page::before {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          top: -260px;
          right: -180px;
          border-radius: 50%;
          background: rgba(114, 214, 162, 0.08);
          filter: blur(10px);
          pointer-events: none;
          animation: optimizerAmbient 10s ease-in-out infinite;
        }

        .optimizer-page::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          bottom: -240px;
          left: -180px;
          border-radius: 50%;
          background: rgba(21, 156, 154, 0.05);
          filter: blur(12px);
          pointer-events: none;
          animation: optimizerAmbient 13s ease-in-out infinite reverse;
        }

        .optimizer-container {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .optimizer-hero {
          position: relative;
          overflow: hidden;
          min-height: 245px;
          padding: 34px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 82% 28%,
              rgba(114,214,162,0.22),
              transparent 25%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(52,135,216,0.18),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #102f29 0%,
              #17463b 45%,
              #286b57 100%
            );
          color: white;
          box-shadow:
            0 26px 65px rgba(16, 58, 49, 0.20);
          animation: optimizerHeroIn 0.65s ease-out;
        }

        .optimizer-hero::before {
          content: "";
          position: absolute;
          width: 310px;
          height: 310px;
          right: -105px;
          top: -185px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 50%;
          box-shadow:
            0 0 0 35px rgba(255,255,255,0.025),
            0 0 0 70px rgba(255,255,255,0.018);
          animation: optimizerOrb 9s ease-in-out infinite;
        }

        .optimizer-hero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: 150px;
          bottom: -110px;
          border-radius: 50%;
          background: rgba(114,214,162,0.08);
          filter: blur(3px);
        }

        .optimizer-hero-content {
          position: relative;
          z-index: 2;
          max-width: 780px;
        }

        .optimizer-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          margin-bottom: 17px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.88);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .optimizer-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #7ce1ab;
          box-shadow: 0 0 0 5px rgba(124,225,171,0.10);
          animation: optimizerPulse 2s infinite;
        }

        .optimizer-hero h1 {
          margin: 0 0 12px;
          color: white;
          font-size: clamp(32px, 4.2vw, 49px);
          line-height: 1.04;
          letter-spacing: -1.8px;
        }

        .optimizer-hero h1 span {
          color: #8be2b3;
        }

        .optimizer-hero p {
          max-width: 760px;
          margin: 0;
          color: rgba(255,255,255,0.76);
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-orbit {
          position: absolute;
          right: 48px;
          bottom: 34px;
          width: 118px;
          height: 118px;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 50%;
          opacity: 0.7;
        }

        .hero-orbit::before {
          content: "₹";
          position: absolute;
          inset: 27px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.09);
          color: #a4e8c4;
          font-size: 25px;
          font-weight: 850;
          box-shadow: 0 0 35px rgba(124,225,171,0.15);
        }

        .hero-orbit::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          top: 9px;
          left: 52px;
          border-radius: 50%;
          background: #7ce1ab;
          box-shadow: 0 0 16px rgba(124,225,171,0.8);
          animation: orbitDot 5s linear infinite;
        }

        .budget-card {
          margin-top: 22px;
          padding: 27px;
          border: 1px solid rgba(28,72,61,0.11);
          border-radius: 23px;
          background: rgba(255,255,255,0.90);
          box-shadow: 0 16px 42px rgba(19,60,53,0.08);
          backdrop-filter: blur(14px);
          animation: optimizerSectionIn 0.7s ease-out;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .card-header h2 {
          margin: 0 0 5px;
          color: #173b32;
          font-size: 20px;
          letter-spacing: -0.35px;
        }

        .card-header p {
          margin: 0;
          color: #71807a;
          font-size: 12px;
          line-height: 1.55;
        }

        .budget-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 11px;
          border: 1px solid #d7e8df;
          border-radius: 10px;
          background: #edf7f2;
          color: #2f6c57;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .budget-badge::before {
          content: "●";
          color: #3fa66f;
          font-size: 8px;
        }

        .budget-input-row {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 12px;
          align-items: center;
        }

        .rupee-box {
          height: 50px;
          display: grid;
          place-items: center;
          border: 1px solid #d9e9e1;
          border-radius: 13px;
          background:
            linear-gradient(145deg, #edf8f2, #e4f1ec);
          color: #173b32;
          font-size: 23px;
          font-weight: 850;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .budget-input {
          width: 100%;
          height: 50px;
          box-sizing: border-box;
          padding: 0 16px;
          border: 1px solid #d5e2dd;
          border-radius: 13px;
          outline: none;
          background: #fbfdfc;
          color: #24332e;
          font-size: 18px;
          font-weight: 800;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .budget-input:focus {
          border-color: #62a984;
          background: white;
          box-shadow:
            0 0 0 4px rgba(54,162,105,0.10),
            0 7px 18px rgba(19,60,53,0.06);
        }

        .budget-range-wrap {
          position: relative;
          margin-top: 22px;
        }

        .budget-range-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 8px;
          height: 5px;
          border-radius: 10px;
          background: #dfe9e5;
          pointer-events: none;
        }

        .budget-range-progress {
          position: absolute;
          left: 0;
          top: 8px;
          height: 5px;
          border-radius: 10px;
          background:
            linear-gradient(
              90deg,
              #276b53,
              #42a96e,
              #70c997
            );
          pointer-events: none;
          transition: width 0.15s ease;
        }

        .budget-range {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 21px;
          padding: 0;
          margin: 0;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .budget-range::-webkit-slider-thumb {
          appearance: none;
          width: 19px;
          height: 19px;
          margin-top: -6px;
          border: 3px solid white;
          border-radius: 50%;
          background: #173b32;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.20),
            0 0 0 5px rgba(54,162,105,0.08);
          transition: transform 0.2s ease;
        }

        .budget-range::-webkit-slider-thumb:hover {
          transform: scale(1.12);
        }

        .budget-range::-moz-range-thumb {
          width: 19px;
          height: 19px;
          border: 3px solid white;
          border-radius: 50%;
          background: #173b32;
          box-shadow: 0 2px 8px rgba(0,0,0,0.20);
        }

        .budget-range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 3px;
          color: #8b9791;
          font-size: 10px;
          font-weight: 600;
        }

        .budget-selected {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 14px;
          padding: 11px 14px;
          border: 1px solid #e0ebe6;
          border-radius: 11px;
          background: #f6faf8;
          color: #64766e;
          font-size: 11px;
        }

        .budget-selected strong {
          color: #173b32;
          font-size: 12px;
        }

        .optimize-button {
          position: relative;
          overflow: hidden;
          width: 100%;
          margin-top: 18px;
          padding: 15px 18px;
          border: none;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #123c35,
              #216653 55%,
              #2f8a67
            );
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 10px 24px rgba(18,60,53,0.20);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .optimize-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -80%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.20),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.65s ease;
        }

        .optimize-button:hover::before {
          left: 135%;
        }

        .optimize-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 15px 31px rgba(18,60,53,0.27);
        }

        .optimize-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .optimize-button:disabled {
          opacity: 0.68;
          cursor: not-allowed;
        }

        .loading-bar {
          width: 100%;
          height: 3px;
          margin-top: 11px;
          overflow: hidden;
          border-radius: 10px;
          background: #dce9e3;
        }

        .loading-bar span {
          display: block;
          width: 35%;
          height: 100%;
          border-radius: inherit;
          background: #45a875;
          animation: optimizerLoading 1.1s ease-in-out infinite;
        }

        .results-section {
          margin-top: 23px;
          animation: optimizerResultsIn 0.6s ease-out;
        }

        .result-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin: 0 0 15px;
        }

        .result-heading h2 {
          margin: 0;
          color: #173b32;
          font-size: 22px;
          letter-spacing: -0.5px;
        }

        .result-heading p {
          margin: 4px 0 0;
          color: #72817a;
          font-size: 11px;
        }

        .result-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid #cce6d8;
          border-radius: 999px;
          background: #eef9f3;
          color: #28714f;
          font-size: 10px;
          font-weight: 800;
        }

        .result-status::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #38a86b;
          box-shadow: 0 0 0 4px rgba(56,168,107,0.10);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 18px;
        }

        .metric {
          position: relative;
          overflow: hidden;
          min-height: 145px;
          padding: 20px;
          border-radius: 19px;
          color: white;
          box-shadow: 0 12px 28px rgba(23,59,50,0.10);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .metric:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 34px rgba(23,59,50,0.16);
        }

        .metric::before {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: -65px;
          top: -85px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50%;
        }

        .metric::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: -48px;
          bottom: -62px;
          border-radius: 50%;
          background: rgba(255,255,255,0.10);
        }

        .metric-label {
          position: relative;
          z-index: 2;
          font-size: 10px;
          font-weight: 750;
          opacity: 0.76;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .metric-value {
          position: relative;
          z-index: 2;
          margin-top: 11px;
          font-size: clamp(25px, 2.6vw, 32px);
          line-height: 1;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .metric-sub {
          position: relative;
          z-index: 2;
          margin-top: 10px;
          font-size: 10px;
          line-height: 1.45;
          opacity: 0.73;
        }

        .metric-icon {
          position: absolute;
          right: 17px;
          bottom: 15px;
          z-index: 2;
          font-size: 22px;
          opacity: 0.76;
        }

        .metric-green {
          background: linear-gradient(135deg, #123c35, #2d7059);
        }

        .metric-blue {
          background: linear-gradient(135deg, #317bd6, #245db1);
        }

        .metric-cooling {
          background: linear-gradient(135deg, #2d9d61, #17764a);
        }

        .metric-purple {
          background: linear-gradient(135deg, #8050ca, #6030a5);
        }

        .section-card {
          padding: 25px;
          margin-bottom: 18px;
          border: 1px solid rgba(28,72,61,0.11);
          border-radius: 21px;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 12px 32px rgba(23,59,50,0.065);
          backdrop-filter: blur(10px);
        }

        .section-card:hover {
          box-shadow: 0 15px 37px rgba(23,59,50,0.085);
        }

        .section-title {
          margin: 0 0 5px;
          color: #173b32;
          font-size: 20px;
          letter-spacing: -0.3px;
        }

        .section-description {
          max-width: 850px;
          margin: 0 0 19px;
          color: #71807a;
          font-size: 12px;
          line-height: 1.6;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 9px;
          color: #3c8066;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }

        .section-label::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ba878;
        }

        .plan-list {
          display: grid;
          gap: 10px;
        }

        .plan-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px 16px;
          overflow: hidden;
          border: 1px solid #d9e9df;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #f2faf6,
              #fcfefd
            );
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .plan-item::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: -65px;
          top: -70px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          pointer-events: none;
        }

        .plan-item:hover {
          transform: translateX(4px);
          background: white;
          box-shadow: 0 9px 22px rgba(23,59,50,0.08);
        }

        .plan-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .plan-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid #e0ebe5;
          border-radius: 12px;
          background: white;
          font-size: 21px;
          box-shadow: 0 5px 14px rgba(23,59,50,0.05);
        }

        .plan-name {
          display: block;
          color: #30413b;
          font-size: 13px;
          font-weight: 800;
        }

        .plan-description {
          display: block;
          margin-top: 4px;
          color: #87948e;
          font-size: 10px;
        }

        .plan-value {
          position: relative;
          z-index: 2;
          min-width: 62px;
          padding: 8px 10px;
          border-radius: 9px;
          background: #e5f4ea;
          color: #15803d;
          text-align: center;
          font-size: 13px;
          font-weight: 850;
        }

        .no-plan {
          padding: 22px;
          border: 1px dashed #cedbd5;
          border-radius: 14px;
          background: #f8faf9;
          color: #71807a;
          text-align: center;
          font-size: 12px;
        }

        .map-container {
          position: relative;
          overflow: hidden;
          min-height: 420px;
          border: 1px solid #dce9e3;
          border-radius: 17px;
          background: #f4f9f6;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .map-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 32px rgba(23,59,50,0.10);
        }

        .map-overlay {
          position: absolute;
          z-index: 500;
          left: 14px;
          top: 14px;
          padding: 9px 11px;
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 10px;
          background: rgba(255,255,255,0.90);
          color: #35564b;
          font-size: 10px;
          font-weight: 750;
          box-shadow: 0 5px 15px rgba(23,59,50,0.10);
          backdrop-filter: blur(10px);
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid #e0e9e5;
          border-radius: 15px;
        }

        .priority-table {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
        }

        .priority-table th {
          padding: 13px;
          background: #f3f8f5;
          color: #52645d;
          border-bottom: 1px solid #dce7e2;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.03em;
          text-align: left;
          white-space: nowrap;
        }

        .priority-table td {
          padding: 14px 13px;
          color: #64736d;
          border-bottom: 1px solid #edf2ef;
          font-size: 12px;
        }

        .priority-table tbody tr {
          transition: background 0.2s ease;
        }

        .priority-table tbody tr:hover {
          background: #f8fbf9;
        }

        .priority-table tbody tr:last-child td {
          border-bottom: none;
        }

        .rank-cell {
          color: #87948e !important;
          font-weight: 800;
        }

        .cell-id {
          color: #173b32 !important;
          font-weight: 800;
        }

        .priority-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 55px;
          padding: 6px 9px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 850;
        }

        .priority-high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .priority-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .priority-bar-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 115px;
        }

        .priority-bar {
          width: 70px;
          height: 5px;
          overflow: hidden;
          border-radius: 99px;
          background: #e4ebe7;
        }

        .priority-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #e5a63b, #dc5c55);
        }

        .priority-score-text {
          font-size: 10px;
          font-weight: 800;
          color: #52645d;
        }

        .decision-insight,
        .modeling-note {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 14px;
          padding: 18px;
          border-radius: 16px;
          font-size: 12px;
          line-height: 1.7;
        }

        .decision-insight {
          border: 1px solid #cfe5da;
          border-left: 4px solid #173b32;
          background:
            linear-gradient(
              135deg,
              #eefaf4,
              #f9fdfb
            );
          color: #66756e;
        }

        .modeling-note {
          margin-bottom: 0;
          border: 1px solid #f3dfad;
          background:
            linear-gradient(
              135deg,
              #fffbeb,
              #fffdf5
            );
          color: #69746e;
        }

        .insight-icon,
        .modeling-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid rgba(23,59,50,0.06);
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 10px rgba(23,59,50,0.05);
        }

        .decision-insight strong {
          color: #173b32;
        }

        .modeling-note strong {
          color: #8a6410;
        }

        .budget-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .budget-summary-card {
          padding: 13px;
          border: 1px solid #e0ebe6;
          border-radius: 13px;
          background: #f8fbf9;
        }

        .budget-summary-card span {
          display: block;
          color: #829089;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .budget-summary-card strong {
          display: block;
          margin-top: 5px;
          color: #24483d;
          font-size: 15px;
        }

        .utilization-track {
          height: 5px;
          margin-top: 9px;
          overflow: hidden;
          border-radius: 99px;
          background: #dfe9e5;
        }

        .utilization-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #3f9c6b, #72c997);
        }

        @keyframes optimizerHeroIn {
          from {
            opacity: 0;
            transform: translateY(17px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes optimizerSectionIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes optimizerResultsIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes optimizerOrb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-25px, 25px) scale(1.08);
          }
        }

        @keyframes optimizerAmbient {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -15px, 0) scale(1.06);
          }
        }

        @keyframes optimizerPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124,225,171,0.45);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(124,225,171,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124,225,171,0);
          }
        }

        @keyframes orbitDot {
          from {
            transform: rotate(0deg) translateX(49px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(49px) rotate(-360deg);
          }
        }

        @keyframes optimizerLoading {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(380%);
          }
        }

        @media (max-width: 1050px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-orbit {
            right: 35px;
          }
        }

        @media (max-width: 720px) {
          .optimizer-page {
            padding: 18px;
          }

          .optimizer-hero {
            min-height: 220px;
            padding: 24px;
          }

          .hero-orbit {
            display: none;
          }

          .budget-card,
          .section-card {
            padding: 20px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .card-header,
          .result-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .budget-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .optimizer-page {
            padding: 12px;
          }

          .optimizer-hero {
            border-radius: 21px;
            padding: 21px;
          }

          .optimizer-hero h1 {
            font-size: 31px;
          }

          .optimizer-hero p {
            font-size: 13px;
          }

          .budget-input-row {
            grid-template-columns: 45px 1fr;
          }

          .rupee-box,
          .budget-input {
            height: 46px;
          }

          .section-card,
          .budget-card {
            border-radius: 17px;
          }

          .plan-item {
            align-items: flex-start;
          }

          .plan-value {
            min-width: 50px;
          }

          .map-container {
            min-height: 330px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .optimizer-page::before,
          .optimizer-page::after,
          .optimizer-hero,
          .optimizer-hero::before,
          .optimizer-live-dot,
          .hero-orbit::after {
            animation: none !important;
          }

          .metric,
          .plan-item,
          .map-container,
          .optimize-button {
            transition: none !important;
          }
        }
      `}</style>

      <div className="optimizer-container">
        <section className="optimizer-hero">
          <div className="optimizer-hero-content">
            <div className="optimizer-eyebrow">
              <span className="optimizer-live-dot" />
              Climate Resource Optimization
            </div>

            <h1>
              Climate Action <span>Optimizer</span>
            </h1>

            <p>
              Allocate a city climate budget across high-priority
              locations and identify where intervention resources
              can be targeted first.
            </p>
          </div>

          <div className="hero-orbit" />
        </section>

        <section className="budget-card">
          <div className="card-header">
            <div>
              <div className="section-label">Resource planning</div>

              <h2>Set City Budget</h2>

              <p>
                Choose the budget available for climate
                intervention planning.
              </p>
            </div>

            <span className="budget-badge">
              ₹1K – ₹20K
            </span>
          </div>

          <div className="budget-input-row">
            <div className="rupee-box">₹</div>

            <input
              className="budget-input"
              type="number"
              min="1000"
              max="20000"
              step="500"
              value={budget}
              onChange={(e) => {
                const value = Math.min(
                  20000,
                  Math.max(1000, Number(e.target.value) || 1000)
                );

                setBudget(value);
              }}
              aria-label="City climate budget"
            />
          </div>

          <div className="budget-range-wrap">
            <div className="budget-range-track" />

            <div
              className="budget-range-progress"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, budgetProgress)
                ).toFixed(2)}%`,
              }}
            />

            <input
              className="budget-range"
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={budget}
              onChange={(e) =>
                setBudget(Number(e.target.value))
              }
              aria-label="City climate budget slider"
            />

            <div className="budget-range-labels">
              <span>₹1,000</span>
              <span>₹10,000</span>
              <span>₹20,000</span>
            </div>
          </div>

          <div className="budget-selected">
            <span>Selected city budget</span>

            <strong>
              ₹{formatCurrency(budget)}
            </strong>
          </div>

          <div className="budget-summary">
            <div className="budget-summary-card">
              <span>Planning range</span>
              <strong>₹1K – ₹20K</strong>
            </div>

            <div className="budget-summary-card">
              <span>Budget position</span>
              <strong>
                {Math.round(
                  Math.max(0, Math.min(100, budgetProgress))
                )}
                %
              </strong>

              <div className="utilization-track">
                <span
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, budgetProgress)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            className="optimize-button"
            onClick={runOptimization}
            disabled={loading}
          >
            {loading
              ? "Optimizing Climate Actions..."
              : "Optimize Climate Actions →"}
          </button>

          {loading && (
            <div className="loading-bar">
              <span />
            </div>
          )}
        </section>

        {result && (
          <div className="results-section">
            <div className="result-heading">
              <div>
                <div className="section-label">
                  Optimization complete
                </div>

                <h2>Climate Action Plan</h2>

                <p>
                  Resource allocation generated from the selected
                  city budget and priority-risk analysis.
                </p>
              </div>

              <div className="result-status">
                Plan generated
              </div>
            </div>

            <section className="metrics-grid">
              <div className="metric metric-green">
                <div className="metric-label">
                  Available Budget
                </div>

                <div className="metric-value">
                  ₹{formatCurrency(result.budget)}
                </div>

                <div className="metric-sub">
                  Planning budget
                </div>

                <div className="metric-icon">₹</div>
              </div>

              <div className="metric metric-blue">
                <div className="metric-label">
                  Optimized Cost
                </div>

                <div className="metric-value">
                  ₹{formatCurrency(result.total_cost)}
                </div>

                <div className="metric-sub">
                  Allocated intervention cost
                </div>

                <div className="metric-icon">◈</div>
              </div>

              <div className="metric metric-cooling">
                <div className="metric-label">
                  Estimated Cooling
                </div>

                <div className="metric-value">
                  {result.estimated_cooling_benefit}°C
                </div>

                <div className="metric-sub">
                  Modeled cooling benefit
                </div>

                <div className="metric-icon">❄</div>
              </div>

              <div className="metric metric-purple">
                <div className="metric-label">
                  Average Priority
                </div>

                <div className="metric-value">
                  {result.average_priority_score}/100
                </div>

                <div className="metric-sub">
                  Priority score of selected zone
                </div>

                <div className="metric-icon">◎</div>
              </div>
            </section>

            <section className="section-card">
              <div className="section-label">
                Recommended allocation
              </div>

              <h2 className="section-title">
                Recommended Climate Action Plan
              </h2>

              <p className="section-description">
                The optimizer identifies an intervention
                allocation for the highest-priority climate risk
                zone within the selected budget.
              </p>

              <div className="plan-list">
                {activePlan.length > 0 ? (
                  activePlan.map(([name, level]) => (
                    <div
                      key={name}
                      className="plan-item"
                      style={{
                        borderLeft: `4px solid ${
                          interventionColors[name] || "#4f9d78"
                        }`,
                      }}
                    >
                      <div className="plan-left">
                        <div className="plan-icon">
                          {interventionIcons[name]}
                        </div>

                        <div>
                          <span className="plan-name">
                            {interventionLabels[name]}
                          </span>

                          <span className="plan-description">
                            {interventionDescriptions[name]}
                          </span>
                        </div>
                      </div>

                      <div className="plan-value">
                        {level}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-plan">
                    No intervention allocation was returned
                    for this budget.
                  </div>
                )}
              </div>
            </section>

            <section className="section-card">
              <div className="section-label">
                Spatial intelligence
              </div>

              <h2 className="section-title">
                Optimized Priority Locations
              </h2>

              <p className="section-description">
                ClimateTwin highlights the highest-priority
                locations where climate action can be targeted
                first.
              </p>

              <div className="map-container">
                <div className="map-overlay">
                  {priorityCells.length} priority cells identified
                </div>

                <OptimizationMap
                  data={priorityCells}
                />
              </div>
            </section>

            <section className="section-card">
              <div className="section-label">
                Location intelligence
              </div>

              <h2 className="section-title">
                Top Priority Locations
              </h2>

              <p className="section-description">
                Highest-ranked cells within the identified
                priority zone.
              </p>

              <div className="table-wrapper">
                <table className="priority-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Cell</th>
                      <th>Priority Score</th>
                      <th>Hot-season LST</th>
                      <th>Population Density</th>
                    </tr>
                  </thead>

                  <tbody>
                    {priorityCells.map((cell, index) => {
                      const priority =
                        Number(cell.priority_score);

                      const priorityWidth = Math.max(
                        0,
                        Math.min(100, priority)
                      );

                      return (
                        <tr key={cell.cell_id}>
                          <td className="rank-cell">
                            #{index + 1}
                          </td>

                          <td className="cell-id">
                            {cell.cell_id}
                          </td>

                          <td>
                            <div className="priority-bar-wrap">
                              <span
                                className={`priority-pill ${
                                  priority >= 63
                                    ? "priority-high"
                                    : "priority-medium"
                                }`}
                              >
                                {cell.priority_score}
                              </span>

                              <div className="priority-bar">
                                <span
                                  style={{
                                    width: `${priorityWidth}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>
                            {cell.hotseason_lst}°C
                          </td>

                          <td>
                            {formatNumber(
                              cell.population_density
                            )}{" "}
                            people/km²
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="decision-insight">
              <div className="insight-icon">
                💡
              </div>

              <div>
                <strong>Decision insight</strong>
                <br />

                ClimateTwin combines heat, population,
                vegetation, building-density, and water
                indicators to identify where climate action
                should be prioritized before allocating the
                available budget.
              </div>
            </div>

            <div className="modeling-note">
              <div className="modeling-icon">
                ℹ️
              </div>

              <div>
                <strong>Modeling note</strong>
                <br />

                Intervention costs and cooling weights are
                prototype planning assumptions. They are not
                real-world intervention prices or guaranteed
                cooling outcomes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}