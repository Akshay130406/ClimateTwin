import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import ScenarioMap from "../components/ScenarioMap";

const API = "https://climatetwin.onrender.com";

const DEFAULT_SCENARIO = {
  temperature_increase: 2,
  vegetation_decrease: 10,
  rainfall_change: -10,
  urbanization_increase: 10,
  population_growth: 10,
  water_availability_change: -10,
};

const PARAMETER_CONFIG = [
  {
    key: "temperature_increase",
    label: "Temperature Increase",
    description: "Increase in average temperature",
    min: 0,
    max: 5,
    step: 0.5,
    unit: "°C",
    icon: "🌡️",
    accent: "#f06b45",
    soft: "#fff0e9",
  },
  {
    key: "vegetation_decrease",
    label: "Vegetation Decrease",
    description: "Reduction in vegetation coverage",
    min: 0,
    max: 50,
    step: 5,
    unit: "%",
    icon: "🌳",
    accent: "#3f9b6d",
    soft: "#eaf7ef",
  },
  {
    key: "rainfall_change",
    label: "Rainfall Change",
    description: "Change in rainfall availability",
    min: -50,
    max: 50,
    step: 5,
    unit: "%",
    icon: "🌧️",
    accent: "#4d8fd4",
    soft: "#eaf3ff",
  },
  {
    key: "urbanization_increase",
    label: "Urbanization Increase",
    description: "Growth in built-up urban areas",
    min: 0,
    max: 50,
    step: 5,
    unit: "%",
    icon: "🏙️",
    accent: "#8c6bc0",
    soft: "#f3edff",
  },
  {
    key: "population_growth",
    label: "Population Growth",
    description: "Projected population increase",
    min: 0,
    max: 50,
    step: 5,
    unit: "%",
    icon: "👥",
    accent: "#3978ba",
    soft: "#eaf2fb",
  },
  {
    key: "water_availability_change",
    label: "Water Availability",
    description: "Change in available water resources",
    min: -50,
    max: 20,
    step: 5,
    unit: "%",
    icon: "💧",
    accent: "#2e9bad",
    soft: "#e8f8fa",
  },
];

function ClimateSimulator() {
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setScenario((previous) => ({
      ...previous,
      [name]: Number(value),
    }));
  };

  const runSimulation = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scenario),
      });

      if (!response.ok) {
        throw new Error("Simulation request failed");
      }

      const data = await response.json();

      let cells = data.cells;

      if (typeof cells === "string") {
        cells = JSON.parse(cells);
      }

      setResults({
        ...data.summary,
        cells,
      });
    } catch (error) {
      console.error(error);
      alert("Simulation failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetScenario = () => {
    setScenario(DEFAULT_SCENARIO);
    setResults(null);
  };

  const chartData = results
    ? [
        {
          name: "Average LST",
          baseline: results.baseline_average_lst,
          scenario: results.scenario_average_lst,
        },
        {
          name: "High Risk",
          baseline: results.baseline_high_risk_cells,
          scenario: results.scenario_high_risk_cells,
        },
        {
          name: "Very High Risk",
          baseline: results.baseline_very_high_risk_cells,
          scenario: results.scenario_very_high_risk_cells,
        },
      ]
    : [];

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "—";

    return Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const getSliderPercent = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  const activeChanges = PARAMETER_CONFIG.filter(
    (parameter) =>
      scenario[parameter.key] !== DEFAULT_SCENARIO[parameter.key]
  ).length;

  return (
    <div className="simulator-page">
      <style>
        {`
          .simulator-page {
            min-height: 100vh;
            padding: 28px;
            color: #24332e;
            background:
              radial-gradient(
                circle at 8% 5%,
                rgba(96, 183, 142, 0.16),
                transparent 25%
              ),
              radial-gradient(
                circle at 92% 16%,
                rgba(75, 136, 205, 0.10),
                transparent 24%
              ),
              linear-gradient(
                180deg,
                #f1f7f4 0%,
                #f8faf9 48%,
                #eef5f1 100%
              );
          }

          .simulator-shell {
            max-width: 1320px;
            margin: 0 auto;
          }

          .simulator-hero {
            position: relative;
            overflow: hidden;
            min-height: 315px;
            padding: 42px;
            border-radius: 32px;
            background:
              radial-gradient(
                circle at 82% 24%,
                rgba(108, 211, 166, 0.28),
                transparent 24%
              ),
              radial-gradient(
                circle at 70% 95%,
                rgba(56, 122, 103, 0.35),
                transparent 28%
              ),
              linear-gradient(
                135deg,
                #0d2923 0%,
                #173b32 46%,
                #28604e 100%
              );
            box-shadow:
              0 28px 65px rgba(18, 61, 49, 0.22),
              inset 0 1px rgba(255,255,255,0.08);
            animation: simulatorHeroIn 0.7s ease-out;
          }

          .simulator-hero::before {
            content: "";
            position: absolute;
            width: 360px;
            height: 360px;
            right: -100px;
            top: -170px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.10);
            box-shadow:
              0 0 0 55px rgba(255,255,255,0.025),
              0 0 0 110px rgba(255,255,255,0.018);
            animation: simulatorOrbit 10s ease-in-out infinite;
          }

          .simulator-hero::after {
            content: "";
            position: absolute;
            width: 180px;
            height: 180px;
            right: 20%;
            bottom: -130px;
            border-radius: 50%;
            background: rgba(117, 211, 165, 0.10);
            filter: blur(4px);
          }

          .hero-grid-lines {
            position: absolute;
            inset: 0;
            opacity: 0.12;
            background-image:
              linear-gradient(
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.12) 1px,
                transparent 1px
              );
            background-size: 44px 44px;
            mask-image: linear-gradient(
              90deg,
              transparent,
              black 30%,
              black 100%
            );
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 820px;
          }

          .hero-status {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 8px 13px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.13);
            border-radius: 999px;
            background: rgba(255,255,255,0.075);
            color: #d9f0e6;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
          }

          .status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #7be0ac;
            box-shadow: 0 0 0 5px rgba(123,224,172,0.12);
            animation: statusPulse 2s infinite;
          }

          .hero-content h1 {
            margin: 0;
            color: white;
            font-size: clamp(36px, 5vw, 61px);
            line-height: 0.99;
            letter-spacing: -2.8px;
          }

          .hero-highlight {
            display: inline-block;
            margin-top: 7px;
            background: linear-gradient(
              90deg,
              #9ae0bd,
              #d5f4e5
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-description {
            max-width: 710px;
            margin: 20px 0 0;
            color: rgba(232,244,239,0.77);
            font-size: 16px;
            line-height: 1.7;
          }

          .hero-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 25px;
          }

          .hero-tag {
            padding: 8px 12px;
            border: 1px solid rgba(255,255,255,0.11);
            border-radius: 999px;
            background: rgba(255,255,255,0.065);
            color: #dceee7;
            font-size: 11px;
            font-weight: 650;
            backdrop-filter: blur(10px);
          }

          .simulator-workspace {
            display: grid;
            grid-template-columns:
              minmax(0, 1.08fr)
              minmax(340px, 0.92fr);
            gap: 22px;
            margin-top: 22px;
            align-items: start;
          }

          .simulator-card {
            border: 1px solid #dce8e2;
            border-radius: 24px;
            background: rgba(255,255,255,0.88);
            box-shadow:
              0 14px 38px rgba(23,59,50,0.075),
              inset 0 1px rgba(255,255,255,0.9);
            backdrop-filter: blur(14px);
          }

          .control-panel {
            padding: 25px;
          }

          .panel-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 21px;
          }

          .panel-eyebrow {
            margin-bottom: 6px;
            color: #4f9d78;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }

          .panel-heading h2 {
            margin: 0;
            color: #173b32;
            font-size: 23px;
            letter-spacing: -0.5px;
          }

          .panel-heading p {
            margin: 6px 0 0;
            color: #71807a;
            font-size: 12px;
          }

          .variable-badge {
            padding: 8px 11px;
            border: 1px solid #d8e8e0;
            border-radius: 10px;
            background: #edf6f1;
            color: #39715c;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          }

          .parameter-card {
            position: relative;
            padding: 17px;
            margin-bottom: 11px;
            overflow: hidden;
            border: 1px solid #e1ebe6;
            border-radius: 17px;
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,0.98),
                rgba(248,252,250,0.94)
              );
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease,
              border-color 0.25s ease;
          }

          .parameter-card::after {
            content: "";
            position: absolute;
            width: 90px;
            height: 90px;
            right: -52px;
            top: -52px;
            border-radius: 50%;
            background: rgba(79,157,120,0.055);
            pointer-events: none;
          }

          .parameter-card:hover {
            transform: translateY(-2px);
            border-color: #c4ddd2;
            box-shadow: 0 12px 25px rgba(23,59,50,0.075);
          }

          .parameter-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }

          .parameter-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .parameter-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            font-size: 20px;
            flex-shrink: 0;
            transition: transform 0.25s ease;
          }

          .parameter-card:hover .parameter-icon {
            transform: scale(1.08) rotate(-3deg);
          }

          .parameter-name {
            display: block;
            color: #29433b;
            font-size: 13px;
            font-weight: 800;
          }

          .parameter-description {
            display: block;
            margin-top: 4px;
            color: #81908a;
            font-size: 10px;
          }

          .parameter-value {
            min-width: 68px;
            padding: 8px 10px;
            border-radius: 10px;
            background: #173b32;
            color: white;
            font-size: 13px;
            font-weight: 850;
            text-align: center;
            box-shadow: 0 5px 13px rgba(23,59,50,0.16);
            transition: transform 0.2s ease;
          }

          .parameter-card:hover .parameter-value {
            transform: scale(1.04);
          }

          .range-wrapper {
            position: relative;
            margin-top: 17px;
          }

          .range-track {
            position: absolute;
            top: 9px;
            left: 0;
            right: 0;
            height: 5px;
            border-radius: 10px;
            background: #e0e9e5;
            pointer-events: none;
          }

          .range-progress {
            position: absolute;
            top: 9px;
            left: 0;
            height: 5px;
            border-radius: 10px;
            pointer-events: none;
            transition: width 0.12s ease;
          }

          .scenario-range {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 23px;
            margin: 0;
            padding: 0;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }

          .scenario-range::-webkit-slider-runnable-track {
            height: 5px;
            background: transparent;
          }

          .scenario-range::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            margin-top: -7px;
            border: 3px solid white;
            border-radius: 50%;
            background: #173b32;
            box-shadow:
              0 3px 8px rgba(0,0,0,0.23),
              0 0 0 1px rgba(23,59,50,0.12);
            transition: transform 0.18s ease;
          }

          .scenario-range:hover::-webkit-slider-thumb {
            transform: scale(1.18);
          }

          .scenario-range::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border: 3px solid white;
            border-radius: 50%;
            background: #173b32;
            box-shadow: 0 3px 8px rgba(0,0,0,0.23);
          }

          .range-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 2px;
            color: #9aa6a1;
            font-size: 9px;
            font-weight: 650;
          }

          .action-row {
            display: flex;
            gap: 10px;
            margin-top: 19px;
          }

          .primary-action,
          .secondary-action {
            min-height: 47px;
            border-radius: 13px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
          }

          .primary-action {
            position: relative;
            flex: 1;
            overflow: hidden;
            border: none;
            background:
              linear-gradient(
                135deg,
                #173b32,
                #2d6956
              );
            color: white;
            box-shadow:
              0 9px 20px rgba(23,59,50,0.22);
          }

          .primary-action::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            width: 60px;
            left: -90px;
            transform: skewX(-20deg);
            background: rgba(255,255,255,0.17);
            animation: buttonShine 4s infinite;
          }

          .primary-action:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
              0 14px 27px rgba(23,59,50,0.28);
          }

          .secondary-action {
            padding: 0 20px;
            border: 1px solid #d7e4de;
            background: #f2f6f4;
            color: #36564b;
          }

          .secondary-action:hover {
            background: #e8f0ec;
          }

          .primary-action:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .preview-panel {
            min-height: 100%;
            padding: 25px;
          }

          .preview-visual {
            position: relative;
            min-height: 420px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 35px;
            border-radius: 19px;
            background:
              radial-gradient(
                circle at 50% 38%,
                rgba(100,191,151,0.18),
                transparent 28%
              ),
              linear-gradient(
                145deg,
                #edf6f1,
                #f8fbf9
              );
            border: 1px solid #dce9e3;
          }

          .preview-grid {
            position: absolute;
            inset: 0;
            opacity: 0.5;
            background-image:
              linear-gradient(#dbe9e3 1px, transparent 1px),
              linear-gradient(90deg, #dbe9e3 1px, transparent 1px);
            background-size: 30px 30px;
            mask-image: radial-gradient(circle, black, transparent 72%);
          }

          .earth-orbit {
            position: relative;
            z-index: 1;
            width: 150px;
            height: 150px;
            display: grid;
            place-items: center;
            margin-bottom: 25px;
            border: 1px solid rgba(79,157,120,0.18);
            border-radius: 50%;
            box-shadow:
              0 0 0 18px rgba(79,157,120,0.035),
              0 0 0 38px rgba(79,157,120,0.025);
            animation: earthFloat 5s ease-in-out infinite;
          }

          .earth-orbit::before,
          .earth-orbit::after {
            content: "";
            position: absolute;
            border-radius: 50%;
            border: 1px dashed rgba(79,157,120,0.25);
          }

          .earth-orbit::before {
            inset: -19px;
          }

          .earth-orbit::after {
            inset: -38px;
            opacity: 0.55;
          }

          .earth {
            width: 104px;
            height: 104px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background:
              radial-gradient(
                circle at 34% 28%,
                #bdebd3 0 8%,
                transparent 9%
              ),
              radial-gradient(
                circle at 65% 62%,
                #4d9f79 0 18%,
                transparent 19%
              ),
              radial-gradient(
                circle at 35% 67%,
                #68b18d 0 14%,
                transparent 15%
              ),
              linear-gradient(
                145deg,
                #6db7d1,
                #3f8e6d
              );
            box-shadow:
              inset -16px -10px 22px rgba(0,0,0,0.15),
              0 14px 35px rgba(53,124,92,0.23);
            font-size: 37px;
          }

          .preview-content {
            position: relative;
            z-index: 2;
            text-align: center;
          }

          .preview-content h3 {
            margin: 0 0 8px;
            color: #173b32;
            font-size: 22px;
          }

          .preview-content p {
            max-width: 360px;
            margin: 0 auto;
            color: #71807a;
            font-size: 12px;
            line-height: 1.65;
          }

          .preview-mini-stats {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 20px;
          }

          .mini-stat {
            padding: 8px 10px;
            border: 1px solid #dbe8e2;
            border-radius: 10px;
            background: rgba(255,255,255,0.72);
            color: #527064;
            font-size: 10px;
            font-weight: 750;
          }

          .results-area {
            margin-top: 25px;
            animation: resultsReveal 0.65s ease-out;
          }

          .results-heading {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 15px;
          }

          .results-heading h2 {
            margin: 0;
            color: #173b32;
            font-size: 25px;
            letter-spacing: -0.5px;
          }

          .results-heading p {
            margin: 5px 0 0;
            color: #72817b;
            font-size: 12px;
          }

          .complete-badge {
            padding: 8px 11px;
            border: 1px solid #cce5d8;
            border-radius: 999px;
            background: #eaf7ef;
            color: #39755b;
            font-size: 10px;
            font-weight: 850;
          }

          .metric-grid {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .result-metric {
            position: relative;
            min-height: 155px;
            overflow: hidden;
            padding: 20px;
            border: 1px solid rgba(0,0,0,0.05);
            border-radius: 19px;
            box-shadow: 0 10px 26px rgba(23,59,50,0.075);
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }

          .result-metric:hover {
            transform: translateY(-5px);
            box-shadow: 0 17px 32px rgba(23,59,50,0.12);
          }

          .result-metric::after {
            content: "";
            position: absolute;
            width: 115px;
            height: 115px;
            right: -60px;
            bottom: -60px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
          }

          .metric-icon {
            font-size: 23px;
            margin-bottom: 12px;
          }

          .metric-label {
            display: block;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 1px;
            text-transform: uppercase;
            opacity: 0.67;
          }

          .metric-value {
            margin: 8px 0 6px;
            font-size: 29px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -1px;
          }

          .metric-subtext {
            font-size: 10px;
            font-weight: 650;
            opacity: 0.7;
          }

          .metric-orange {
            color: #a94818;
            background:
              radial-gradient(circle at 90% 10%, rgba(255,255,255,0.65), transparent 30%),
              linear-gradient(145deg, #fff8ee, #ffead7);
          }

          .metric-red {
            color: #a32e2e;
            background:
              radial-gradient(circle at 90% 10%, rgba(255,255,255,0.65), transparent 30%),
              linear-gradient(145deg, #fff5f5, #ffe2e2);
          }

          .metric-purple {
            color: #71399d;
            background:
              radial-gradient(circle at 90% 10%, rgba(255,255,255,0.65), transparent 30%),
              linear-gradient(145deg, #fbf7ff, #f0e4ff);
          }

          .metric-blue {
            color: #28609e;
            background:
              radial-gradient(circle at 90% 10%, rgba(255,255,255,0.65), transparent 30%),
              linear-gradient(145deg, #f1f8ff, #e2efff);
          }

          .visual-card {
            margin-top: 18px;
            padding: 24px;
            overflow: hidden;
            border: 1px solid #dce7e2;
            border-radius: 22px;
            background: rgba(255,255,255,0.92);
            box-shadow: 0 10px 28px rgba(23,59,50,0.06);
          }

          .visual-heading {
            margin-bottom: 18px;
          }

          .visual-heading h2 {
            margin: 0 0 5px;
            color: #173b32;
            font-size: 20px;
          }

          .visual-heading p {
            margin: 0;
            color: #75837e;
            font-size: 12px;
          }

          .chart-legend {
            display: flex;
            gap: 18px;
            margin-bottom: 5px;
            color: #687872;
            font-size: 11px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .legend-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
          }

          .map-card {
            padding-bottom: 12px;
          }

          .model-note {
            display: flex;
            align-items: flex-start;
            gap: 13px;
            margin-top: 18px;
            padding: 18px;
            border: 1px solid #d8e8e1;
            border-radius: 17px;
            background:
              linear-gradient(
                135deg,
                #eaf5ef,
                #f7faf8
              );
            color: #60716a;
            font-size: 11px;
            line-height: 1.7;
          }

          .model-note-icon {
            width: 32px;
            height: 32px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border-radius: 10px;
            background: white;
            box-shadow: 0 4px 10px rgba(23,59,50,0.06);
          }

          .footer-note {
            padding: 18px 0 5px;
            text-align: center;
            color: #87938e;
            font-size: 10px;
            letter-spacing: 0.2px;
          }

          @keyframes simulatorHeroIn {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes simulatorOrbit {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            50% {
              transform: translate(-25px, 20px) rotate(8deg);
            }
          }

          @keyframes statusPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(123,224,172,0.45);
            }
            70% {
              box-shadow: 0 0 0 9px rgba(123,224,172,0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(123,224,172,0);
            }
          }

          @keyframes earthFloat {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-8px) rotate(2deg);
            }
          }

          @keyframes resultsReveal {
            from {
              opacity: 0;
              transform: translateY(22px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes buttonShine {
            0% {
              left: -90px;
            }
            25%, 100% {
              left: 120%;
            }
          }

          @media (max-width: 1050px) {
            .simulator-workspace {
              grid-template-columns: 1fr;
            }

            .metric-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 680px) {
            .simulator-page {
              padding: 14px;
            }

            .simulator-hero {
              min-height: auto;
              padding: 27px 22px;
              border-radius: 24px;
            }

            .hero-content h1 {
              font-size: 39px;
              letter-spacing: -1.8px;
            }

            .control-panel,
            .preview-panel,
            .visual-card {
              padding: 18px;
            }

            .metric-grid {
              grid-template-columns: 1fr;
            }

            .action-row {
              flex-direction: column;
            }

            .secondary-action {
              min-height: 44px;
            }

            .results-heading {
              align-items: flex-start;
              flex-direction: column;
            }

            .preview-visual {
              min-height: 350px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .simulator-hero,
            .status-dot,
            .earth-orbit,
            .results-area,
            .simulator-hero::before,
            .primary-action::after {
              animation: none !important;
            }

            .parameter-card,
            .result-metric,
            .parameter-icon,
            .parameter-value {
              transition: none !important;
            }
          }
        `}
      </style>

      <div className="simulator-shell">
        <section className="simulator-hero">
          <div className="hero-grid-lines" />

          <div className="hero-content">
            <div className="hero-status">
              <span className="status-dot" />
              Climate scenario engine
            </div>

            <h1>
              Change the future.
              <br />
              <span className="hero-highlight">
                See what happens to Pune.
              </span>
            </h1>

            <p className="hero-description">
              Explore how temperature, vegetation, rainfall,
              urbanization, population and water conditions
              could reshape Pune's modeled heat-risk landscape.
            </p>

            <div className="hero-tags">
              <span className="hero-tag">
                🌡️ Climate scenarios
              </span>

              <span className="hero-tag">
                🛰️ Spatial intelligence
              </span>

              <span className="hero-tag">
                🧠 AI decision support
              </span>

              <span className="hero-tag">
                🗺️ Pune-wide analysis
              </span>
            </div>
          </div>
        </section>

        <div className="simulator-workspace">
          <section className="simulator-card control-panel">
            <div className="panel-heading">
              <div>
                <div className="panel-eyebrow">
                  Scenario laboratory
                </div>

                <h2>Build a future scenario</h2>

                <p>
                  Adjust the conditions ClimateTwin should
                  simulate.
                </p>
              </div>

              <span className="variable-badge">
                {activeChanges === 0
                  ? "Baseline"
                  : `${activeChanges} adjusted`}
              </span>
            </div>

            {PARAMETER_CONFIG.map((parameter) => {
              const value = scenario[parameter.key];

              return (
                <div
                  className="parameter-card"
                  key={parameter.key}
                >
                  <div className="parameter-top">
                    <div className="parameter-title">
                      <div
                        className="parameter-icon"
                        style={{
                          background: parameter.soft,
                        }}
                      >
                        {parameter.icon}
                      </div>

                      <div>
                        <span className="parameter-name">
                          {parameter.label}
                        </span>

                        <span className="parameter-description">
                          {parameter.description}
                        </span>
                      </div>
                    </div>

                    <div className="parameter-value">
                      {value}
                      {parameter.unit}
                    </div>
                  </div>

                  <div className="range-wrapper">
                    <div className="range-track" />

                    <div
                      className="range-progress"
                      style={{
                        width: `${getSliderPercent(
                          value,
                          parameter.min,
                          parameter.max
                        )}%`,
                        background: parameter.accent,
                      }}
                    />

                    <input
                      className="scenario-range"
                      type="range"
                      min={parameter.min}
                      max={parameter.max}
                      step={parameter.step}
                      value={value}
                      onChange={(event) =>
                        handleChange(
                          parameter.key,
                          event.target.value
                        )
                      }
                      aria-label={parameter.label}
                    />

                    <div className="range-labels">
                      <span>
                        {parameter.min}
                        {parameter.unit}
                      </span>

                      <span>
                        {parameter.max}
                        {parameter.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="action-row">
              <button
                className="primary-action"
                onClick={runSimulation}
                disabled={loading}
              >
                {loading
                  ? "Running climate simulation..."
                  : "Run Climate Simulation →"}
              </button>

              <button
                className="secondary-action"
                onClick={resetScenario}
              >
                Reset
              </button>
            </div>
          </section>

          <section className="simulator-card preview-panel">
            {!results ? (
              <div className="preview-visual">
                <div className="preview-grid" />

                <div className="earth-orbit">
                  <div className="earth">🌍</div>
                </div>

                <div className="preview-content">
                  <h3>Your future is configurable.</h3>

                  <p>
                    Change the scenario variables and let
                    ClimateTwin calculate how the modeled
                    heat-risk landscape responds.
                  </p>

                  <div className="preview-mini-stats">
                    <span className="mini-stat">
                      {scenario.temperature_increase}°C temperature
                    </span>

                    <span className="mini-stat">
                      {scenario.vegetation_decrease}% vegetation
                    </span>

                    <span className="mini-stat">
                      {scenario.urbanization_increase}% urbanization
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="panel-heading">
                  <div>
                    <div className="panel-eyebrow">
                      Scenario output
                    </div>

                    <h2>Scenario impact</h2>

                    <p>
                      Baseline conditions compared with
                      your selected future scenario.
                    </p>
                  </div>

                  <span className="complete-badge">
                    ✓ Simulation complete
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "24px",
                    borderRadius: "19px",
                    background:
                      "linear-gradient(135deg, #edf7f1, #f8fbf9)",
                    border: "1px solid #d7e8df",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "150px",
                      height: "150px",
                      right: "-60px",
                      top: "-60px",
                      borderRadius: "50%",
                      background: "rgba(79,157,120,0.08)",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        color: "#71807a",
                        fontSize: "10px",
                        fontWeight: 850,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Temperature scenario
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "10px",
                      }}
                    >
                      <strong
                        style={{
                          color: "#173b32",
                          fontSize: "42px",
                          letterSpacing: "-1.5px",
                        }}
                      >
                        +{scenario.temperature_increase}°C
                      </strong>

                      <span
                        style={{
                          color: "#71847c",
                          fontSize: "11px",
                        }}
                      >
                        modeled scenario adjustment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {results && (
          <div className="results-area">
            <div className="results-heading">
              <div>
                <h2>What changed?</h2>

                <p>
                  ClimateTwin's modeled response to your
                  selected scenario.
                </p>
              </div>

              <span className="complete-badge">
                Scenario analyzed
              </span>
            </div>

            <div className="metric-grid">
              <div className="result-metric metric-orange">
                <div className="metric-icon">🌡️</div>

                <span className="metric-label">
                  Average LST
                </span>

                <div className="metric-value">
                  {formatNumber(
                    results.scenario_average_lst
                  )}
                  °C
                </div>

                <div className="metric-subtext">
                  Change: +
                  {formatNumber(results.lst_change)}°C
                </div>
              </div>

              <div className="result-metric metric-red">
                <div className="metric-icon">🔥</div>

                <span className="metric-label">
                  High Risk Cells
                </span>

                <div className="metric-value">
                  {formatNumber(
                    results.scenario_high_risk_cells
                  )}
                </div>

                <div className="metric-subtext">
                  Change: +
                  {formatNumber(
                    results.change_in_high_risk_cells
                  )}
                </div>
              </div>

              <div className="result-metric metric-purple">
                <div className="metric-icon">🚨</div>

                <span className="metric-label">
                  Very High Risk
                </span>

                <div className="metric-value">
                  {formatNumber(
                    results.scenario_very_high_risk_cells
                  )}
                </div>

                <div className="metric-subtext">
                  Change: +
                  {formatNumber(
                    results.change_in_very_high_risk_cells
                  )}
                </div>
              </div>

              <div className="result-metric metric-blue">
                <div className="metric-icon">👥</div>

                <span className="metric-label">
                  Population Exposed
                </span>

                <div className="metric-value">
                  {formatNumber(
                    results.scenario_population_exposed
                  )}
                </div>

                <div className="metric-subtext">
                  Population in ≥40°C cells
                </div>
              </div>
            </div>

            <section className="visual-card">
              <div className="visual-heading">
                <h2>Baseline vs future scenario</h2>

                <p>
                  A direct comparison of the modeled
                  climate indicators.
                </p>
              </div>

              <div className="chart-legend">
                <span className="legend-item">
                  <span
                    className="legend-dot"
                    style={{
                      background: "#8aa49a",
                    }}
                  />
                  Baseline
                </span>

                <span className="legend-item">
                  <span
                    className="legend-dot"
                    style={{
                      background: "#2d6956",
                    }}
                  />
                  Scenario
                </span>
              </div>

              <ResponsiveContainer
                width="100%"
                height={350}
              >
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e4ebe8"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#65746e",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#65746e",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(79,157,120,0.05)",
                    }}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #dce7e2",
                      boxShadow:
                        "0 12px 28px rgba(23,59,50,0.13)",
                      fontSize: "12px",
                    }}
                  />

                  <Bar
                    dataKey="baseline"
                    name="Baseline"
                    fill="#8aa49a"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={52}
                  />

                  <Bar
                    dataKey="scenario"
                    name="Scenario"
                    fill="#2d6956"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={52}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="visual-card map-card">
              <div className="visual-heading">
                <h2>Scenario heat-risk map</h2>

                <p>
                  Spatial view of modeled heat-risk
                  conditions under the selected scenario.
                </p>
              </div>

              <ScenarioMap data={results.cells} />
            </section>

            <div className="model-note">
              <div className="model-note-icon">ℹ️</div>

              <div>
                <strong
                  style={{
                    color: "#31584b",
                  }}
                >
                  Modeling note
                </strong>
                <br />

                Results are scenario-based modeled estimates,
                not exact long-term climate forecasts.
                Temperature is applied as a scenario
                adjustment, while rainfall is currently
                recorded as a scenario parameter and is not
                directly used by the trained LST model.
              </div>
            </div>

            <div className="footer-note">
              ClimateTwin • Pune Urban Climate Decision Engine
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClimateSimulator;