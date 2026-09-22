import { useState } from "react";

const API_URL = "https://climatetwin.onrender.com";

const exampleQuestions = [
  "Which areas should be prioritized for heat mitigation?",
  "Why are some cells higher priority than others?",
  "What interventions should urban planners consider?",
  "What does the ClimateTwin priority score mean?",
];

const capabilities = [
  {
    number: "01",
    title: "Heat intelligence",
    text: "Understand spatial heat-risk patterns across Pune.",
    accent: "#ef8d4d",
  },
  {
    number: "02",
    title: "Priority zones",
    text: "Identify areas where climate action deserves attention.",
    accent: "#e2a43f",
  },
  {
    number: "03",
    title: "Interventions",
    text: "Explore practical mitigation strategies and trade-offs.",
    accent: "#3da878",
  },
  {
    number: "04",
    title: "Model intelligence",
    text: "Interpret ClimateTwin outputs, assumptions and limitations.",
    accent: "#3d8fd1",
  },
];

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    if (!question.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(`${API_URL}/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get AI response.");
      }

      setAnswer(data.answer);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setError("Unable to connect to the ClimateTwin AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "28px 28px 60px",
        background:
          "radial-gradient(circle at 85% 8%, rgba(54,162,105,0.10), transparent 26%), radial-gradient(circle at 8% 70%, rgba(21,156,154,0.07), transparent 25%), var(--bg)",
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
            minHeight: "245px",
            overflow: "hidden",
            padding: "34px 38px",
            marginBottom: "20px",
            borderRadius: "28px",
            color: "#fff",
            background:
              "linear-gradient(135deg, #0c3029 0%, #123f35 48%, #176052 100%)",
            boxShadow: "0 25px 65px rgba(18,60,53,0.18)",
          }}
        >
          {/* atmospheric layers */}

          <div
            style={{
              position: "absolute",
              width: "360px",
              height: "360px",
              right: "-100px",
              top: "-170px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(114,214,162,0.20), rgba(114,214,162,0) 68%)",
              animation: "orbFloat 9s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "240px",
              height: "240px",
              right: "210px",
              bottom: "-175px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(101,200,232,0.12), rgba(101,200,232,0) 70%)",
              animation: "orbFloat 12s ease-in-out infinite reverse",
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
              height: "100%",
            }}
          >
            <div style={{ maxWidth: "760px" }}>
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
                  letterSpacing: "1.4px",
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

                Climate Intelligence Layer
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
                Ask the city.
                <br />
                Understand the climate.
              </h1>

              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: "690px",
                  color: "#c7ddd5",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                ClimateTwin AI interprets Pune's heat-risk analysis,
                priority zones, interventions and model outputs to turn
                complex climate data into decision-ready insight.
              </p>
            </div>

            <div
              className="climate-glass"
              style={{
                minWidth: "190px",
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
                Intelligence status
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#72d6a2",
                    boxShadow: "0 0 14px rgba(114,214,162,0.75)",
                  }}
                />

                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                  }}
                >
                  Ready
                </span>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#9ebbb0",
                  fontSize: "10px",
                }}
              >
                ClimateTwin decision layer
              </div>
            </div>
          </div>
        </section>

        {/* MAIN WORKSPACE */}

        <section
          className="section-reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 300px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* ASK PANEL */}

          <div
            className="climate-card"
            style={{
              padding: "28px",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,251,249,0.96))",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                marginBottom: "23px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "var(--accent-dark)",
                    fontSize: "9px",
                    fontWeight: "850",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: "7px",
                  }}
                >
                  Decision support
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "var(--text)",
                    fontSize: "24px",
                    letterSpacing: "-0.6px",
                    fontWeight: "850",
                  }}
                >
                  Ask ClimateTwin
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                  }}
                >
                  Ask anything about the climate analysis.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 11px",
                  borderRadius: "10px",
                  background: "var(--primary-soft)",
                  color: "var(--primary-light)",
                  fontSize: "9px",
                  fontWeight: "850",
                  letterSpacing: "0.4px",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
                AI ONLINE
              </div>
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "var(--text)",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              What do you want to understand?
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about heat risk, priority zones, interventions, future impact..."
                rows={6}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "18px 18px 52px",
                  resize: "vertical",
                  minHeight: "160px",
                  borderRadius: "16px",
                  border: "1px solid var(--border-strong)",
                  outline: "none",
                  background:
                    "linear-gradient(180deg, #ffffff, #f8fbfa)",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  transition:
                    "border-color .2s ease, box-shadow .2s ease",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  bottom: "14px",
                  color: "#93a29c",
                  fontSize: "10px",
                  pointerEvents: "none",
                }}
              >
                Enter to ask · Shift + Enter for a new line
              </div>

              <div
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "11px",
                }}
              >
                <button
                  className="climate-button"
                  onClick={askAI}
                  disabled={loading || !question.trim()}
                  style={{
                    minWidth: "112px",
                    padding: "10px 17px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      loading || !question.trim()
                        ? "#b9c5c0"
                        : "linear-gradient(135deg, #123c35, #216653)",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor:
                      loading || !question.trim()
                        ? "not-allowed"
                        : "pointer",
                    boxShadow:
                      loading || !question.trim()
                        ? "none"
                        : "0 8px 20px rgba(18,60,53,0.2)",
                  }}
                >
                  {loading ? "Analyzing..." : "Ask AI →"}
                </button>
              </div>
            </div>

            {/* EXAMPLES */}

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "11px",
                }}
              >
                <span
                  style={{
                    color: "var(--text)",
                    fontSize: "11px",
                    fontWeight: "850",
                  }}
                >
                  Start with an insight
                </span>

                <span
                  style={{
                    color: "#9aa8a2",
                    fontSize: "10px",
                  }}
                >
                  Suggested questions
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {exampleQuestions.map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setQuestion(example);
                      setError("");
                    }}
                    style={{
                      padding: "9px 12px",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "999px",
                      background: "#f7faf8",
                      color: "var(--primary-light)",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontWeight: "700",
                      textAlign: "left",
                      transition:
                        "transform .2s ease, background .2s ease, border-color .2s ease",
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <div
                className="section-reveal"
                style={{
                  marginTop: "22px",
                  padding: "16px 17px",
                  borderRadius: "14px",
                  border: "1px solid #d6e7df",
                  background:
                    "linear-gradient(90deg, #edf6f1, #f5faf8, #edf6f1)",
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
                  <div
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
                        fontWeight: "800",
                      }}
                    >
                      ClimateTwin is thinking
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        color: "var(--text-muted)",
                        fontSize: "10px",
                      }}
                    >
                      Interpreting available climate data and model outputs...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div
                className="section-reveal"
                style={{
                  marginTop: "22px",
                  padding: "16px 17px",
                  borderRadius: "14px",
                  border: "1px solid rgba(220,92,85,0.2)",
                  background: "#fff5f4",
                  color: "#9c3e39",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    marginBottom: "5px",
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
                  AI service unavailable
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.6,
                  }}
                >
                  {error}
                </div>
              </div>
            )}

            {/* ANSWER */}

            {answer && !loading && (
              <div
                className="section-reveal"
                style={{
                  marginTop: "24px",
                  overflow: "hidden",
                  borderRadius: "18px",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  boxShadow: "0 12px 32px rgba(18,60,53,0.07)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    padding: "17px 19px",
                    background:
                      "linear-gradient(135deg, #123c35, #216653)",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "180px",
                      height: "180px",
                      right: "-70px",
                      top: "-90px",
                      borderRadius: "50%",
                      background:
                        "rgba(114,214,162,0.10)",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "11px",
                        background: "rgba(255,255,255,0.11)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "11px",
                        fontWeight: "900",
                        letterSpacing: "-0.4px",
                      }}
                    >
                      CT
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "850",
                        }}
                      >
                        ClimateTwin AI
                      </div>

                      <div
                        style={{
                          marginTop: "2px",
                          color: "#b9dfce",
                          fontSize: "9px",
                        }}
                      >
                        Decision-support response
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      padding: "6px 9px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#b9dfce",
                      fontSize: "8px",
                      fontWeight: "850",
                      letterSpacing: "1px",
                    }}
                  >
                    ANALYSIS
                  </div>
                </div>

                <div
                  style={{
                    padding: "23px",
                    color: "var(--text)",
                    fontSize: "14px",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {answer}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT INTELLIGENCE PANEL */}

          <aside
            className="section-reveal"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "22px",
                background:
                  "linear-gradient(145deg, #153f36, #1e5b4d)",
                color: "#fff",
                boxShadow: "0 16px 35px rgba(18,60,53,0.14)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "130px",
                  height: "130px",
                  right: "-50px",
                  top: "-45px",
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
                  Intelligence scope
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
                  One layer.
                  <br />
                  Many decisions.
                </div>

                <p
                  style={{
                    margin: "11px 0 0",
                    color: "#bdd6cc",
                    fontSize: "10px",
                    lineHeight: 1.65,
                  }}
                >
                  Use the assistant to interpret what ClimateTwin
                  has already computed.
                </p>

                <div
                  style={{
                    marginTop: "17px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {["Risk", "People", "Heat", "Actions"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "7px",
                        background: "rgba(255,255,255,0.08)",
                        color: "#d4e8df",
                        fontSize: "9px",
                        fontWeight: "750",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="climate-card"
              style={{
                padding: "18px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  color: "var(--text)",
                  fontSize: "11px",
                  fontWeight: "850",
                  marginBottom: "13px",
                }}
              >
                Ask about
              </div>

              {[
                ["Heat", "Spatial heat-risk patterns"],
                ["Priority", "High-impact areas"],
                ["Action", "Climate interventions"],
                ["Model", "Scores and assumptions"],
              ].map(([title, text], index) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom:
                      index === 3
                        ? "none"
                        : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      marginTop: "5px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: [
                        "#ef8d4d",
                        "#e2a43f",
                        "#3da878",
                        "#3d8fd1",
                      ][index],
                    }}
                  />

                  <div>
                    <div
                      style={{
                        color: "var(--text)",
                        fontSize: "10px",
                        fontWeight: "800",
                      }}
                    >
                      {title}
                    </div>

                    <div
                      style={{
                        marginTop: "2px",
                        color: "var(--text-muted)",
                        fontSize: "9px",
                        lineHeight: 1.45,
                      }}
                    >
                      {text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* CAPABILITY STRIP */}

        <section
          className="section-reveal"
          style={{
            marginTop: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              gap: "10px",
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
                Intelligence modules
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "var(--text)",
                  fontSize: "15px",
                  fontWeight: "850",
                }}
              >
                What ClimateTwin AI can explain
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {capabilities.map((item) => (
              <div
                key={item.number}
                className="climate-card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "17px",
                  minHeight: "105px",
                  borderRadius: "17px",
                  background: "rgba(255,255,255,0.88)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "13px",
                    color: item.accent,
                    fontSize: "9px",
                    fontWeight: "900",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.number}
                </div>

                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    marginBottom: "11px",
                    borderRadius: "50%",
                    background: item.accent,
                    boxShadow: `0 0 0 5px ${item.accent}14`,
                  }}
                />

                <div
                  style={{
                    color: "var(--text)",
                    fontSize: "12px",
                    fontWeight: "850",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    maxWidth: "220px",
                    color: "var(--text-muted)",
                    fontSize: "10px",
                    lineHeight: 1.55,
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODELING NOTE */}

        <section
          className="section-reveal"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginTop: "18px",
            padding: "16px 18px",
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(247,250,249,0.9))",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: "27px",
              height: "27px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              background: "#fff4e8",
              color: "#c47d35",
              fontSize: "12px",
              fontWeight: "900",
            }}
          >
            !
          </div>

          <div>
            <div
              style={{
                color: "var(--text)",
                fontSize: "11px",
                fontWeight: "850",
                marginBottom: "3px",
              }}
            >
              Modeling note
            </div>

            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "10px",
                lineHeight: 1.65,
              }}
            >
              ClimateTwin uses satellite-derived MODIS Land Surface
              Temperature (LST). AI responses interpret the project's
              computed outputs and should not be treated as guaranteed
              forecasts or proof of causal relationships.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AIAssistant;