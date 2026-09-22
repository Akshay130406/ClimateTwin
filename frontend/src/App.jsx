import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import ClimateSimulator from "./pages/ClimateSimulator";
import Vulnerability from "./pages/Vulnerability";
import Intervention from "./pages/Intervention";
import Optimization from "./pages/Optimization";
import FutureImpact from "./pages/FutureImpact";
import AIAssistant from "./pages/AIAssistant";
import InfrastructurePlanner from "./pages/InfrastructurePlanner";

function App() {
  const [page, setPage] = useState("dashboard");

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      shortLabel: "Overview",
      icon: "⌂",
    },
    {
      id: "simulator",
      label: "Climate Simulator",
      shortLabel: "Simulate",
      icon: "◉",
    },
    {
      id: "vulnerability",
      label: "Vulnerability",
      shortLabel: "Exposure",
      icon: "◌",
    },
    {
      id: "intervention",
      label: "Intervention Simulator",
      shortLabel: "Interventions",
      icon: "✦",
    },
    {
      id: "optimization",
      label: "Optimizer",
      shortLabel: "Optimize",
      icon: "↗",
    },
    {
      id: "future-impact",
      label: "Future Impact",
      shortLabel: "Future",
      icon: "◈",
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      shortLabel: "Copilot",
      icon: "✧",
    },
    {
      id: "infrastructure",
      label: "Infrastructure Planner",
      shortLabel: "Infrastructure",
      icon: "⌁",
    },
  ];

  const activePage =
    navigation.find((item) => item.id === page) || navigation[0];

  const renderPage = () => {
    if (page === "dashboard") return <Dashboard />;
    if (page === "simulator") return <ClimateSimulator />;
    if (page === "vulnerability") return <Vulnerability />;
    if (page === "intervention") return <Intervention />;
    if (page === "optimization") return <Optimization />;
    if (page === "future-impact") return <FutureImpact />;
    if (page === "ai-assistant") return <AIAssistant />;
    if (page === "infrastructure") return <InfrastructurePlanner />;

    return <Dashboard />;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef6f3",
        color: "#20352f",
      }}
    >
      <style>{`
        .ct-app-shell {
          min-height: 100vh;
          display: flex;
        }

        .ct-sidebar {
          width: 272px;
          min-width: 272px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at 15% 8%, rgba(54,162,105,.16), transparent 25%),
            radial-gradient(circle at 90% 70%, rgba(21,156,154,.10), transparent 28%),
            linear-gradient(180deg, #102f2a 0%, #123c35 48%, #0d302a 100%);
          color: #fff;
          border-right: 1px solid rgba(255,255,255,.08);
          box-shadow: 12px 0 40px rgba(12,48,42,.10);
          z-index: 50;
          overflow: hidden;
        }

        .ct-sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 22px 16px 18px;
          box-sizing: border-box;
        }

        .ct-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 24px;
        }

        .ct-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(145deg, rgba(114,214,162,.30), rgba(21,156,154,.16));
          border: 1px solid rgba(255,255,255,.14);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.10),
            0 8px 24px rgba(0,0,0,.16);
          font-size: 21px;
          color: #9af0c2;
        }

        .ct-brand-name {
          font-size: 19px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .ct-brand-subtitle {
          margin-top: 4px;
          color: rgba(255,255,255,.50);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .ct-nav-label {
          padding: 0 10px;
          margin: 8px 0 9px;
          color: rgba(255,255,255,.36);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .ct-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .ct-nav-button {
          width: 100%;
          min-height: 49px;
          border: 1px solid transparent;
          border-radius: 13px;
          background: transparent;
          color: rgba(255,255,255,.66);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 11px;
          cursor: pointer;
          text-align: left;
          transition:
            background .2s ease,
            color .2s ease,
            border-color .2s ease,
            transform .2s ease,
            box-shadow .2s ease;
        }

        .ct-nav-button:hover {
          color: #fff;
          background: rgba(255,255,255,.055);
          border-color: rgba(255,255,255,.07);
          transform: translateX(2px);
        }

        .ct-nav-button.active {
          color: #fff;
          background:
            linear-gradient(
              135deg,
              rgba(114,214,162,.20),
              rgba(21,156,154,.11)
            );
          border-color: rgba(114,214,162,.18);
          box-shadow:
            inset 3px 0 0 #72d6a2,
            0 8px 22px rgba(0,0,0,.10);
        }

        .ct-nav-icon {
          width: 31px;
          height: 31px;
          min-width: 31px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.055);
          color: rgba(255,255,255,.58);
          font-size: 15px;
          transition: all .2s ease;
        }

        .ct-nav-button.active .ct-nav-icon {
          background: rgba(114,214,162,.16);
          color: #8de8b8;
        }

        .ct-nav-copy {
          min-width: 0;
          flex: 1;
        }

        .ct-nav-title {
          display: block;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ct-nav-caption {
          display: block;
          margin-top: 3px;
          color: rgba(255,255,255,.34);
          font-size: 10px;
          font-weight: 600;
        }

        .ct-nav-button.active .ct-nav-caption {
          color: rgba(141,232,184,.65);
        }

        .ct-active-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #72d6a2;
          box-shadow: 0 0 10px rgba(114,214,162,.85);
        }

        .ct-sidebar-spacer {
          flex: 1;
        }

        .ct-system-card {
          margin: 10px 4px 12px;
          padding: 14px;
          border-radius: 15px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.075);
        }

        .ct-system-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .ct-system-title {
          color: rgba(255,255,255,.58);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ct-live {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #8de8b8;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .ct-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #72d6a2;
          box-shadow: 0 0 0 4px rgba(114,214,162,.10);
          animation: ctPulse 2s infinite;
        }

        .ct-system-value {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255,255,255,.82);
          font-weight: 700;
        }

        .ct-system-bar {
          height: 4px;
          margin-top: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
        }

        .ct-system-bar span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #72d6a2, #159c9a);
        }

        .ct-sidebar-footer {
          padding: 0 8px;
          color: rgba(255,255,255,.27);
          font-size: 9px;
          line-height: 1.5;
        }

        .ct-main {
          min-width: 0;
          flex: 1;
          min-height: 100vh;
        }

        .ct-topbar {
          height: 70px;
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          background: rgba(238,246,243,.84);
          border-bottom: 1px solid rgba(28,72,61,.08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .ct-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .ct-breadcrumb-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid rgba(28,72,61,.08);
          color: #216653;
          box-shadow: 0 4px 14px rgba(19,60,53,.05);
        }

        .ct-breadcrumb-section {
          color: #8a9a94;
          font-size: 11px;
          font-weight: 700;
        }

        .ct-breadcrumb-separator {
          color: #b3c0bb;
          font-size: 13px;
        }

        .ct-breadcrumb-current {
          color: #20352f;
          font-size: 13px;
          font-weight: 800;
        }

        .ct-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ct-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(28,72,61,.08);
          color: #557068;
          font-size: 10px;
          font-weight: 800;
        }

        .ct-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #36a269;
          box-shadow: 0 0 0 4px rgba(54,162,105,.10);
        }

        .ct-location-pill {
          padding: 8px 11px;
          border-radius: 999px;
          background: #123c35;
          color: #dff3ea;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .2px;
        }

        .ct-mobile-header {
          display: none;
        }

        .ct-mobile-menu {
          display: none;
        }

        @keyframes ctPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: .45;
            transform: scale(.82);
          }
        }

        @media (max-width: 1050px) {
          .ct-sidebar {
            width: 226px;
            min-width: 226px;
          }

          .ct-nav-title {
            font-size: 12px;
          }

          .ct-nav-caption {
            display: none;
          }

          .ct-topbar {
            padding: 0 20px;
          }
        }

        @media (max-width: 760px) {
          .ct-app-shell {
            display: block;
          }

          .ct-sidebar {
            display: none;
          }

          .ct-main {
            min-height: 100vh;
          }

          .ct-topbar {
            height: 64px;
            padding: 0 14px;
          }

          .ct-breadcrumb-section,
          .ct-breadcrumb-separator {
            display: none;
          }

          .ct-breadcrumb-current {
            font-size: 12px;
          }

          .ct-topbar-right {
            gap: 6px;
          }

          .ct-status-pill {
            display: none;
          }

          .ct-location-pill {
            font-size: 9px;
            padding: 7px 9px;
          }

          .ct-mobile-header {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .ct-mobile-menu {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border: 1px solid rgba(28,72,61,.09);
            border-radius: 10px;
            background: #fff;
            color: #173b32;
            cursor: pointer;
          }

          .ct-mobile-nav {
            position: fixed;
            inset: 64px 0 auto 0;
            z-index: 100;
            padding: 10px;
            background: rgba(238,246,243,.97);
            border-bottom: 1px solid rgba(28,72,61,.10);
            box-shadow: 0 18px 35px rgba(19,60,53,.12);
            backdrop-filter: blur(18px);
          }

          .ct-mobile-nav-inner {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 7px;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
          }

          .ct-mobile-nav-button {
            min-height: 54px;
            display: flex;
            align-items: center;
            gap: 9px;
            border: 1px solid rgba(28,72,61,.08);
            border-radius: 12px;
            background: #fff;
            color: #536a62;
            padding: 8px 10px;
            cursor: pointer;
            text-align: left;
          }

          .ct-mobile-nav-button.active {
            color: #173b32;
            background: #dff3ea;
            border-color: rgba(54,162,105,.22);
          }

          .ct-mobile-nav-icon {
            width: 28px;
            height: 28px;
            min-width: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #eef6f3;
            font-size: 13px;
          }

          .ct-mobile-nav-button.active .ct-mobile-nav-icon {
            background: #fff;
          }

          .ct-mobile-nav-label {
            font-size: 11px;
            font-weight: 800;
          }
        }
      `}</style>

      <div className="ct-app-shell">
        <aside className="ct-sidebar">
          <div className="ct-sidebar-inner">
            <div className="ct-brand">
              <div className="ct-brand-mark">✦</div>

              <div>
                <div className="ct-brand-name">ClimateTwin</div>
                <div className="ct-brand-subtitle">
                  Urban Climate Intelligence
                </div>
              </div>
            </div>

            <div className="ct-nav-label">Command Center</div>

            <nav className="ct-nav">
              {navigation.map((item) => {
                const active = page === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`ct-nav-button ${active ? "active" : ""}`}
                  >
                    <span className="ct-nav-icon">{item.icon}</span>

                    <span className="ct-nav-copy">
                      <span className="ct-nav-title">{item.label}</span>
                      <span className="ct-nav-caption">
                        {item.shortLabel}
                      </span>
                    </span>

                    {active && <span className="ct-active-dot" />}
                  </button>
                );
              })}
            </nav>

            <div className="ct-sidebar-spacer" />

            <div className="ct-system-card">
              <div className="ct-system-top">
                <span className="ct-system-title">System status</span>

                <span className="ct-live">
                  <span className="ct-live-dot" />
                  Live
                </span>
              </div>

              <div className="ct-system-value">
                ClimateTwin intelligence online
              </div>

              <div className="ct-system-bar">
                <span />
              </div>
            </div>

            <div className="ct-sidebar-footer">
              AI-powered urban climate decision support
              <br />
              Pune · ClimateTwin v0.1
            </div>
          </div>
        </aside>

        <main className="ct-main">
          <header className="ct-topbar">
            <div className="ct-mobile-header">
              <button
                className="ct-mobile-menu"
                onClick={() => {
                  const menu = document.getElementById("ct-mobile-nav");

                  if (menu) {
                    menu.style.display =
                      menu.style.display === "none" ? "block" : "none";
                  }
                }}
                aria-label="Open navigation"
              >
                ☰
              </button>

              <div className="ct-breadcrumb-icon">
                {activePage.icon}
              </div>
            </div>

            <div className="ct-breadcrumb">
              <span className="ct-breadcrumb-section">ClimateTwin</span>
              <span className="ct-breadcrumb-separator">/</span>
              <span className="ct-breadcrumb-current">
                {activePage.label}
              </span>
            </div>

            <div className="ct-topbar-right">
              <div className="ct-status-pill">
                <span className="ct-status-dot" />
                Intelligence Engine Online
              </div>

              <div className="ct-location-pill">PUNE · 2024 DATA</div>
            </div>
          </header>

          <div
            id="ct-mobile-nav"
            className="ct-mobile-nav"
            style={{ display: "none" }}
          >
            <div className="ct-mobile-nav-inner">
              {navigation.map((item) => {
                const active = page === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={(event) => {
                      setPage(item.id);

                      const parent = event.currentTarget.closest(
                        "#ct-mobile-nav"
                      );

                      if (parent) {
                        parent.style.display = "none";
                      }
                    }}
                    className={`ct-mobile-nav-button ${
                      active ? "active" : ""
                    }`}
                  >
                    <span className="ct-mobile-nav-icon">{item.icon}</span>
                    <span className="ct-mobile-nav-label">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="page-enter">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default App;