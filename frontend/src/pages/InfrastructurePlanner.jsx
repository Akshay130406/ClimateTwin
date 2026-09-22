import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const PROJECTS = {
  Highway: {
    icon: "↗",
    short: "Highway",
    description:
      "Screen potential highway corridors using climate exposure, population, environment and connectivity.",
    accent: "#3d8fd1",
  },
  Flyover: {
    icon: "⇧",
    short: "Flyover",
    description:
      "Screen potential flyover locations using heat, population, built-up area and connectivity.",
    accent: "#9b75d6",
  },
  Bridge: {
    icon: "⌁",
    short: "Bridge",
    description:
      "Screen potential bridge locations using water sensitivity, climate exposure and connectivity.",
    accent: "#159c9a",
  },
};

function InfrastructurePlanner() {
  const [projectType, setProjectType] = useState("Highway");
  const [recommendation, setRecommendation] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const project = PROJECTS[projectType];

  const analyzeInfrastructure = async () => {
    setLoading(true);
    setError("");
    setRecommendation(null);
    setCandidates([]);

    try {
      const recommendationResponse = await fetch(
        `${API_URL}/infrastructure/recommend?project_type=${projectType}`
      );

      if (!recommendationResponse.ok) {
        throw new Error("Failed to get recommendation.");
      }

      const recommendationData =
        await recommendationResponse.json();

      const candidatesResponse = await fetch(
        `${API_URL}/infrastructure/candidates?project_type=${projectType}&limit=10`
      );

      if (!candidatesResponse.ok) {
        throw new Error("Failed to get candidate locations.");
      }

      const candidatesData = await candidatesResponse.json();

      setRecommendation(recommendationData);
      setCandidates(candidatesData);
    } catch (err) {
      console.error("Infrastructure Planner Error:", err);

      setError(
        "Unable to connect to the ClimateTwin Infrastructure Planner."
      );
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "#16834b";
    if (score >= 60) return "#bd8517";
    return "#d6534d";
  };

  const scoreBackground = (score) => {
    if (score >= 80) return "#edf9f2";
    if (score >= 60) return "#fff8e9";
    return "#fff1f0";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Strong screening score";
    if (score >= 60) return "Moderate screening score";
    return "Higher impact screening";
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "28px 28px 60px",
        background:
          "radial-gradient(circle at 88% 5%, rgba(54,162,105,0.09), transparent 25%), radial-gradient(circle at 5% 60%, rgba(21,156,154,0.06), transparent 24%), var(--bg)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        {/* HERO */}

        <section
          className="page-enter climate-hero"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "255px",
            padding: "34px 38px",
            marginBottom: "18px",
            borderRadius: "28px",
            color: "#fff",
            background:
              "linear-gradient(135deg, #0d3029 0%, #123f35 48%, #1a6253 100%)",
            boxShadow: "0 25px 65px rgba(18,60,53,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "380px",
              height: "380px",
              right: "-110px",
              top: "-180px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(114,214,162,0.20), rgba(114,214,162,0) 68%)",
              animation: "orbFloat 10s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "250px",
              height: "250px",
              right: "230px",
              bottom: "-180px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(101,200,232,0.11), rgba(101,200,232,0) 70%)",
              animation: "orbFloat 13s ease-in-out infinite reverse",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.025) 50%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "30px",
              flexWrap: "wrap",
              minHeight: "185px",
            }}
          >
            <div style={{ maxWidth: "780px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 11px",
                  marginBottom: "16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(180,235,210,0.18)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#a9dfc5",
                  fontSize: "10px",
                  fontWeight: "850",
                  letterSpacing: "1.35px",
                  textTransform: "uppercase",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="live-indicator"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#72d6a2",
                  }}
                />

                Climate Decision Engine
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(32px, 4vw, 48px)",
                  lineHeight: 1.02,
                  letterSpacing: "-1.8px",
                  fontWeight: "900",
                  background:
                    "linear-gradient(100deg, #ffffff 20%, #b9ead1 75%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Build infrastructure.
                <br />
                Think climate-first.
              </h1>

              <p
                style={{
                  margin: "15px 0 0",
                  maxWidth: "720px",
                  color: "#c7ddd5",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                ClimateTwin screens potential infrastructure locations
                using spatial climate, environmental, population and
                connectivity indicators.
              </p>
            </div>

            <div
              className="climate-glass"
              style={{
                minWidth: "195px",
                padding: "15px 17px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                style={{
                  color: "#8db9aa",
                  fontSize: "9px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Planning mode
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: project.accent,
                    boxShadow: `0 0 14px ${project.accent}99`,
                  }}
                />

                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "850",
                  }}
                >
                  {projectType}
                </span>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#9ebbb0",
                  fontSize: "10px",
                }}
              >
                Spatial screening active
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT SELECTOR */}

        <section
          className="section-reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 310px",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <div
            className="climate-card"
            style={{
              padding: "22px",
              borderRadius: "22px",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,251,249,0.96))",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                color: "var(--accent-dark)",
                fontSize: "9px",
                fontWeight: "850",
                letterSpacing: "1.1px",
                textTransform: "uppercase",
                marginBottom: "7px",
              }}
            >
              Infrastructure decision
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "var(--text)",
                    fontSize: "22px",
                    fontWeight: "850",
                    letterSpacing: "-0.5px",
                  }}
                >
                  What are you planning?
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    maxWidth: "670px",
                  }}
                >
                  {project.description}
                </p>
              </div>

              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "9px",
                  background: "var(--primary-soft)",
                  color: "var(--primary-light)",
                  fontSize: "9px",
                  fontWeight: "850",
                  letterSpacing: "0.7px",
                  whiteSpace: "nowrap",
                }}
              >
                SPATIAL SCREENING
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(130px, 1fr))",
                gap: "9px",
                marginTop: "20px",
              }}
            >
              {Object.entries(PROJECTS).map(([type, item]) => {
                const active = projectType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setProjectType(type);
                      setRecommendation(null);
                      setCandidates([]);
                      setError("");
                    }}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      padding: "14px",
                      borderRadius: "15px",
                      border: active
                        ? `1px solid ${item.accent}55`
                        : "1px solid var(--border)",
                      background: active
                        ? `linear-gradient(145deg, ${item.accent}12, #ffffff)`
                        : "#f8fbfa",
                      color: "var(--text)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition:
                        "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
                      boxShadow: active
                        ? `0 10px 25px ${item.accent}14`
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "31px",
                          height: "31px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                          background: active
                            ? `${item.accent}18`
                            : "#edf3f0",
                          color: item.accent,
                          fontSize: "16px",
                          fontWeight: "900",
                        }}
                      >
                        {item.icon}
                      </div>

                      {active && (
                        <span
                          style={{
                            padding: "4px 7px",
                            borderRadius: "999px",
                            background: `${item.accent}16`,
                            color: item.accent,
                            fontSize: "8px",
                            fontWeight: "850",
                          }}
                        >
                          SELECTED
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "11px",
                        fontSize: "12px",
                        fontWeight: "850",
                      }}
                    >
                      {type}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "var(--text-muted)",
                        fontSize: "9px",
                        lineHeight: 1.45,
                      }}
                    >
                      Climate-aware location screening
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "22px",
              color: "#fff",
              background:
                "linear-gradient(145deg, #153f36, #1e5b4d)",
              boxShadow: "0 18px 38px rgba(18,60,53,0.14)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "160px",
                height: "160px",
                right: "-70px",
                top: "-65px",
                borderRadius: "50%",
                background:
                  "rgba(114,214,162,0.10)",
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
                  color: "#8fc7af",
                  fontSize: "9px",
                  fontWeight: "850",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Screening logic
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "21px",
                  lineHeight: 1.15,
                  fontWeight: "850",
                  letterSpacing: "-0.5px",
                }}
              >
                Climate
                <br />
                × City
                <br />
                × Connectivity
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "7px",
                  marginTop: "17px",
                }}
              >
                {[
                  "Heat",
                  "Population",
                  "Vegetation",
                  "Water",
                  "Built-up",
                  "Roads",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "7px 8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.07)",
                      color: "#d4e8df",
                      fontSize: "9px",
                      fontWeight: "700",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACTION */}

        <section
          className="section-reveal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
            padding: "17px 20px",
            marginBottom: "18px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.82)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--text)",
                fontSize: "12px",
                fontWeight: "850",
              }}
            >
              Ready to screen {projectType.toLowerCase()} locations?
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "var(--text-muted)",
                fontSize: "10px",
              }}
            >
              ClimateTwin will compare the available spatial candidates.
            </div>
          </div>

          <button
            className="climate-button"
            onClick={analyzeInfrastructure}
            disabled={loading}
            style={{
              minWidth: "190px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "11px",
              background: loading
                ? "#aebbb6"
                : "linear-gradient(135deg, #123c35, #216653)",
              color: "#fff",
              fontWeight: "800",
              fontSize: "12px",
              cursor: loading ? "wait" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 9px 22px rgba(18,60,53,0.20)",
            }}
          >
            {loading ? "Screening locations..." : "Find Best Location →"}
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <section
            className="section-reveal"
            style={{
              marginBottom: "18px",
              padding: "16px 18px",
              borderRadius: "15px",
              border: "1px solid rgba(220,92,85,0.2)",
              background: "#fff5f4",
              color: "#963e39",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: "850",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--danger)",
                }}
              />
              Infrastructure Planner unavailable
            </div>

            <div
              style={{
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          </section>
        )}

        {/* LOADING */}

        {loading && (
          <section
            className="section-reveal"
            style={{
              marginBottom: "18px",
              padding: "18px",
              borderRadius: "15px",
              border: "1px solid #d6e7df",
              background:
                "linear-gradient(90deg, #edf6f1, #f6faf8, #edf6f1)",
              backgroundSize: "200% 100%",
              animation: "shimmerMove 2s linear infinite",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <span
                className="live-indicator"
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />

              <div>
                <div
                  style={{
                    color: "var(--text)",
                    fontSize: "12px",
                    fontWeight: "850",
                  }}
                >
                  ClimateTwin is screening the city
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    color: "var(--text-muted)",
                    fontSize: "10px",
                  }}
                >
                  Comparing climate, environmental and connectivity
                  indicators across candidate cells...
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RECOMMENDATION */}

        {recommendation && (
          <section
            className="section-reveal"
            style={{
              marginBottom: "18px",
              overflow: "hidden",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              background: "#fff",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                height: "5px",
                background:
                  "linear-gradient(90deg, #123c35, #36a269, #159c9a)",
              }}
            />

            <div style={{ padding: "27px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "6px 9px",
                      borderRadius: "999px",
                      background: "var(--primary-soft)",
                      color: "var(--accent-dark)",
                      fontSize: "8px",
                      fontWeight: "850",
                      letterSpacing: "0.8px",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                      }}
                    />
                    RECOMMENDED SCREENED LOCATION
                  </div>

                  <h2
                    style={{
                      margin: "12px 0 0",
                      color: "var(--text)",
                      fontSize: "34px",
                      lineHeight: 1,
                      fontWeight: "900",
                      letterSpacing: "-1px",
                    }}
                  >
                    Cell {recommendation.recommended_cell}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                    }}
                  >
                    Best screened location for a{" "}
                    <strong style={{ color: "var(--text)" }}>
                      {recommendation.project_type}
                    </strong>
                  </p>
                </div>

                <div
                  style={{
                    minWidth: "170px",
                    padding: "16px 20px",
                    borderRadius: "17px",
                    textAlign: "center",
                    background: scoreBackground(
                      recommendation.suitability_score
                    ),
                    border: `1px solid ${scoreColor(
                      recommendation.suitability_score
                    )}28`,
                  }}
                >
                  <div
                    style={{
                      color: scoreColor(
                        recommendation.suitability_score
                      ),
                      fontSize: "38px",
                      lineHeight: 1,
                      fontWeight: "900",
                      letterSpacing: "-1px",
                    }}
                  >
                    {recommendation.suitability_score}
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      color: "var(--text-muted)",
                      fontSize: "10px",
                      fontWeight: "750",
                    }}
                  >
                    Suitability / 100
                  </div>

                  <div
                    style={{
                      marginTop: "7px",
                      color: scoreColor(
                        recommendation.suitability_score
                      ),
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    {getScoreLabel(
                      recommendation.suitability_score
                    )}
                  </div>
                </div>
              </div>

              {/* SCORE BAR */}

              <div
                style={{
                  marginTop: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "7px",
                    color: "var(--text-muted)",
                    fontSize: "9px",
                    fontWeight: "750",
                  }}
                >
                  <span>Climate-aware suitability</span>
                  <span>
                    {recommendation.suitability_score}/100
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    overflow: "hidden",
                    borderRadius: "999px",
                    background: "#e8efec",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          recommendation.suitability_score
                        )
                      )}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(90deg, #216653, #36a269)",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>

              {/* METRICS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <Metric
                  label="Impact Score"
                  value={recommendation.impact_score}
                  accent="#ef8d4d"
                />

                <Metric
                  label="Land Surface Temperature"
                  value={`${recommendation.lst} °C`}
                  accent="#e06b52"
                />

                <Metric
                  label="Population Density"
                  value={recommendation.population_density}
                  accent="#d99b35"
                />

                <Metric
                  label="NDVI"
                  value={recommendation.ndvi}
                  accent="#36a269"
                />

                <Metric
                  label="Building Density"
                  value={recommendation.building_density}
                  accent="#9b75d6"
                />

                <Metric
                  label="Water Coverage"
                  value={recommendation.water_coverage}
                  accent="#159c9a"
                />

                <Metric
                  label="Road Density"
                  value={recommendation.road_density}
                  accent="#3d8fd1"
                />

                <Metric
                  label="Connectivity"
                  value={recommendation.connectivity_score}
                  accent="#216653"
                />
              </div>
            </div>
          </section>
        )}

        {/* CANDIDATE RANKING */}

        {candidates.length > 0 && (
          <section
            className="section-reveal"
            style={{
              marginBottom: "18px",
              padding: "25px",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.96)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "var(--accent-dark)",
                    fontSize: "9px",
                    fontWeight: "850",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Spatial ranking
                </div>

                <h2
                  style={{
                    margin: "5px 0 0",
                    color: "var(--text)",
                    fontSize: "22px",
                    fontWeight: "850",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Candidate locations
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                  }}
                >
                  Top {candidates.length} locations ranked by
                  climate-aware construction suitability.
                </p>
              </div>

              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "9px",
                  background: "#f2f7f5",
                  color: "var(--text-muted)",
                  fontSize: "9px",
                  fontWeight: "750",
                }}
              >
                {candidates.length} CANDIDATES
              </div>
            </div>

            <div
              style={{
                overflowX: "auto",
                border: "1px solid var(--border)",
                borderRadius: "15px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "850px",
                  borderCollapse: "collapse",
                  fontSize: "11px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(90deg, #edf5f1, #f4f8f6)",
                    }}
                  >
                    <th style={thStyle}>Rank</th>
                    <th style={thStyle}>Cell</th>
                    <th style={thStyle}>Suitability</th>
                    <th style={thStyle}>Impact</th>
                    <th style={thStyle}>LST</th>
                    <th style={thStyle}>Population</th>
                    <th style={thStyle}>NDVI</th>
                    <th style={thStyle}>Road Density</th>
                  </tr>
                </thead>

                <tbody>
                  {candidates.map((candidate, index) => {
                    const suitability =
                      Number(candidate.construction_suitability) || 0;

                    return (
                      <tr
                        key={candidate.cell_id}
                        style={{
                          background:
                            index === 0
                              ? "#f5fbf8"
                              : "#fff",
                        }}
                      >
                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "27px",
                              height: "27px",
                              borderRadius: "50%",
                              background:
                                index === 0
                                  ? "#dcefe6"
                                  : "#f1f4f2",
                              color:
                                index === 0
                                  ? "#216653"
                                  : "#687871",
                              fontWeight: "850",
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: "var(--text)",
                            fontWeight: "850",
                          }}
                        >
                          {candidate.cell_id}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: scoreColor(suitability),
                            fontWeight: "900",
                          }}
                        >
                          {suitability.toFixed(2)}
                        </td>

                        <td style={tdStyle}>
                          {Number(
                            candidate.construction_impact
                          ).toFixed(2)}
                        </td>

                        <td style={tdStyle}>
                          {Number(
                            candidate.hotseason_lst
                          ).toFixed(2)}{" "}
                          °C
                        </td>

                        <td style={tdStyle}>
                          {Number(
                            candidate.population_density
                          ).toFixed(2)}
                        </td>

                        <td style={tdStyle}>
                          {Number(candidate.ndvi).toFixed(3)}
                        </td>

                        <td style={tdStyle}>
                          {Number(
                            candidate.road_density
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !recommendation &&
          !error && (
            <section
              className="section-reveal"
              style={{
                padding: "35px 25px",
                marginBottom: "18px",
                textAlign: "center",
                borderRadius: "22px",
                border: "1px dashed var(--border-strong)",
                background: "rgba(255,255,255,0.60)",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "17px",
                  background: "var(--primary-soft)",
                  color: "var(--primary-light)",
                  fontSize: "24px",
                  fontWeight: "900",
                }}
              >
                {project.icon}
              </div>

              <div
                style={{
                  color: "var(--text)",
                  fontSize: "15px",
                  fontWeight: "850",
                }}
              >
                Ready to explore {projectType.toLowerCase()} locations
              </div>

              <div
                style={{
                  maxWidth: "500px",
                  margin: "6px auto 0",
                  color: "var(--text-muted)",
                  fontSize: "10px",
                  lineHeight: 1.6,
                }}
              >
                Select a project type and run the climate-aware
                spatial screening to compare candidate cells.
              </div>
            </section>
          )}

        {/* MODEL NOTE */}

        {recommendation && (
          <section
            className="section-reveal"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 18px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #fffaf3, #fffdf8)",
              border: "1px solid #f0dfbf",
              color: "#765821",
              fontSize: "10px",
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9px",
                background: "#fff1d9",
                color: "#bd7c22",
                fontSize: "12px",
                fontWeight: "900",
              }}
            >
              !
            </div>

            <div>
              <div
                style={{
                  marginBottom: "3px",
                  color: "#6e501c",
                  fontSize: "11px",
                  fontWeight: "850",
                }}
              >
                Decision-support note
              </div>

              This is a preliminary climate-aware screening model.
              It does not replace engineering studies, environmental
              impact assessments, land ownership checks, traffic
              analysis, hydrology, corridor-level analysis, or legal
              approvals. For bridges, water coverage is a screening
              proxy and does not prove that a cell is suitable for an
              actual river crossing.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div
      className="climate-card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "15px",
        minHeight: "76px",
        borderRadius: "14px",
        background: "#f7faf8",
        border: "1px solid #e2ebe7",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: accent,
        }}
      />

      <div
        style={{
          paddingLeft: "3px",
          color: "#71807a",
          fontSize: "9px",
          fontWeight: "750",
          marginBottom: "7px",
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          paddingLeft: "3px",
          color: "#173b32",
          fontSize: "17px",
          fontWeight: "850",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 10px",
  textAlign: "left",
  borderBottom: "1px solid #dbe5e0",
  whiteSpace: "nowrap",
  color: "#173b32",
  fontWeight: "850",
};

const tdStyle = {
  padding: "11px 10px",
  borderBottom: "1px solid #edf1ef",
  whiteSpace: "nowrap",
  color: "#53645d",
};

export default InfrastructurePlanner;