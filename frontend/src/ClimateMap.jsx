import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function getRiskColor(lst) {
  if (lst >= 42) return "#7f1d1d";
  if (lst >= 40) return "#dc2626";
  if (lst >= 38) return "#f97316";
  if (lst >= 36) return "#facc15";
  return "#22c55e";
}

function getRiskLevel(lst) {
  if (lst >= 42) return "Very High";
  if (lst >= 40) return "High";
  if (lst >= 38) return "Moderate";
  if (lst >= 36) return "Low";
  return "Very Low";
}

export default function ClimateMap() {
  const [mapData, setMapData] = useState(null);
  const [heatRisk, setHeatRisk] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [mapMode, setMapMode] = useState("predicted");

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/map/cells").then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load map data");
        }
        return response.json();
      }),

      fetch("http://127.0.0.1:8000/heat-risk").then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load heat risk data");
        }
        return response.json();
      }),
    ])
      .then(([mapResponse, riskResponse]) => {
        const parsedMap = JSON.parse(mapResponse);

        setMapData(parsedMap);
        setHeatRisk(riskResponse);
      })
      .catch((error) => {
        console.error("Failed to load climate map:", error);
      });
  }, []);

  const cellStyle = (feature) => {
    const cellId = feature.properties.cell_id;

    const riskData = heatRisk.find(
      (cell) => cell.cell_id === cellId
    );

    const predictedLST = riskData
      ? riskData.predicted_lst
      : feature.properties.hotseason_lst;

    const displayedLST =
      mapMode === "predicted"
        ? predictedLST
        : feature.properties.hotseason_lst;

    return {
      fillColor: getRiskColor(displayedLST),
      fillOpacity: 0.7,
      color: "#ffffff",
      weight: 0.5,
    };
  };

  const onEachCell = (feature, layer) => {
    const properties = feature.properties;

    const riskData = heatRisk.find(
      (cell) => cell.cell_id === properties.cell_id
    );

    const predictedLST = riskData
      ? riskData.predicted_lst
      : properties.hotseason_lst;

    const displayedLST =
      mapMode === "predicted"
        ? predictedLST
        : properties.hotseason_lst;

    const displayedRiskLevel =
      getRiskLevel(displayedLST);

    layer.bindTooltip(
      `
      <strong>Cell ${properties.cell_id}</strong><br/>
      Observed LST: ${properties.hotseason_lst.toFixed(2)} °C<br/>
      Predicted LST: ${predictedLST.toFixed(2)} °C<br/>
      Displayed Risk: ${displayedRiskLevel}
      `,
      {
        sticky: true,
      }
    );

    layer.on({
      click: () => {
        setSelectedCell({
          ...properties,
          predicted_lst: predictedLST,
          displayed_lst: displayedLST,
          risk_level: displayedRiskLevel,
        });
      },

      mouseover: (event) => {
        event.target.setStyle({
          weight: 2,
          color: "#111827",
          fillOpacity: 0.85,
        });
      },

      mouseout: (event) => {
        event.target.setStyle({
          weight: 0.5,
          color: "#ffffff",
          fillOpacity: 0.7,
        });
      },
    });
  };

  if (!mapData) {
    return <div>Loading ClimateTwin map...</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >

      {/* Map Mode Control */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "white",
          padding: "12px",
          borderRadius: "12px",
          zIndex: 1000,
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Map Layer
        </div>

        <div
          style={{
            display: "flex",
            gap: "6px",
          }}
        >
          <button
            onClick={() => {
              setMapMode("observed");
              setSelectedCell(null);
            }}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "7px",
              cursor: "pointer",
              background:
                mapMode === "observed"
                  ? "#111827"
                  : "#f3f4f6",
              color:
                mapMode === "observed"
                  ? "white"
                  : "#374151",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Observed LST
          </button>

          <button
            onClick={() => {
              setMapMode("predicted");
              setSelectedCell(null);
            }}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "7px",
              cursor: "pointer",
              background:
                mapMode === "predicted"
                  ? "#111827"
                  : "#f3f4f6",
              color:
                mapMode === "predicted"
                  ? "white"
                  : "#374151",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Predicted LST
          </button>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={11}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={`${heatRisk.length}-${mapMode}`}
          data={mapData}
          style={cellStyle}
          onEachFeature={onEachCell}
          interactive={true}
        />
      </MapContainer>

      {/* Map Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "white",
          padding: "14px 16px",
          borderRadius: "12px",
          zIndex: 1000,
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          fontSize: "13px",
          minWidth: "175px",
        }}
      >
        <strong
          style={{
            display: "block",
            marginBottom: "10px",
            color: "#111827",
            fontSize: "14px",
          }}
        >
          Heat Risk
        </strong>

        <LegendItem
          color="#7f1d1d"
          label="Very High ≥ 42 °C"
        />

        <LegendItem
          color="#dc2626"
          label="High 40–41.99 °C"
        />

        <LegendItem
          color="#f97316"
          label="Moderate 38–39.99 °C"
        />

        <LegendItem
          color="#facc15"
          label="Low 36–37.99 °C"
        />

        <LegendItem
          color="#22c55e"
          label="Very Low < 36 °C"
        />
      </div>

      {/* Cell Information Panel */}
      {selectedCell && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            zIndex: 1000,
            width: "280px",
            maxHeight: "520px",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >

          {/* Panel Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Climate Cell
            </h3>

            <button
              onClick={() => setSelectedCell(null)}
              style={{
                border: "none",
                background: "#f3f4f6",
                borderRadius: "6px",
                padding: "5px 9px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕
            </button>
          </div>

          <InfoRow
            label="Cell ID"
            value={selectedCell.cell_id}
          />

          <InfoRow
            label="Observed LST"
            value={`${selectedCell.hotseason_lst.toFixed(2)} °C`}
          />

          <InfoRow
            label="Predicted LST"
            value={`${selectedCell.predicted_lst.toFixed(2)} °C`}
          />

          {/* Displayed Layer */}
          <InfoRow
            label="Displayed LST"
            value={`${selectedCell.displayed_lst.toFixed(2)} °C`}
          />

          {/* Risk Badge */}
          <div
            style={{
              margin: "15px 0",
              padding: "12px",
              borderRadius: "10px",
              background: getRiskColor(
                selectedCell.displayed_lst
              ),
              color:
                selectedCell.displayed_lst >= 36 &&
                selectedCell.displayed_lst < 38
                  ? "#111827"
                  : "white",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {selectedCell.risk_level} Heat Risk
          </div>

          <InfoRow
            label="NDVI"
            value={selectedCell.ndvi.toFixed(3)}
          />

          <InfoRow
            label="Population Density"
            value={`${Math.round(
              selectedCell.population_density
            )} / km²`}
          />

          <InfoRow
            label="Building Density"
            value={selectedCell.building_density.toFixed(3)}
          />

          <InfoRow
            label="Road Density"
            value={selectedCell.road_density.toFixed(2)}
          />

          <InfoRow
            label="Water Coverage"
            value={selectedCell.water_coverage.toFixed(3)}
          />

          {/* Model Information */}
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >
            Risk classification is based on the ClimateTwin
            Random Forest heat-risk model.
          </div>
        </div>
      )}
    </div>
  );
}


/* Information Row */
function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        padding: "7px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span
        style={{
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#111827",
          fontSize: "13px",
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}


/* Map Legend Item */
function LegendItem({ color, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "6px",
      }}
    >
      <div
        style={{
          width: "14px",
          height: "14px",
          background: color,
          borderRadius: "3px",
          flexShrink: 0,
        }}
      />

      <span
        style={{
          color: "#374151",
          fontSize: "12px",
        }}
      >
        {label}
      </span>
    </div>
  );
}