import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

function MapUpdater({ data }) {
  const map = useMap();

  useEffect(() => {
    if (data) {
      map.invalidateSize();
    }
  }, [data, map]);

  return null;
}

function getPriorityColor(score) {
  if (score >= 65) return "#991b1b";
  if (score >= 63) return "#dc2626";
  if (score >= 60) return "#f97316";
  if (score >= 55) return "#facc15";
  return "#22c55e";
}

function styleFeature(feature) {
  const score = feature.properties?.priority_score || 0;

  return {
    fillColor: getPriorityColor(score),
    weight: 1,
    color: "#ffffff",
    fillOpacity: 0.8,
  };
}

function onEachFeature(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <div style="min-width:240px;">
      <strong>Priority Cell ${p.cell_id}</strong>
      <hr/>

      <b>Priority Score:</b>
      ${Number(p.priority_score).toFixed(2)} / 100
      <br/>

      <b>Hot-season LST:</b>
      ${Number(p.hotseason_lst).toFixed(2)} °C
      <br/>

      <b>Population Density:</b>
      ${Number(p.population_density).toLocaleString("en-IN")}
      people/km²

      <br/><br/>

      <b>Recommended Action:</b>
      Tree Plantation
    </div>
  `);
}

export default function OptimizationMap({ data }) {
  if (!data) {
    return (
      <div
        style={{
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          borderRadius: "12px",
          color: "#6b7280",
        }}
      >
        Loading optimization map...
      </div>
    );
  }

  return <OptimizationMapLoader priorityCells={data} />;
}

function OptimizationMapLoader({ priorityCells }) {
  const [gridData, setGridData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://climatetwin.onrender.com/map/cells")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load map data");
        }

        return response.json();
      })
      .then((result) => {
        const geojson =
          typeof result === "string"
            ? JSON.parse(result)
            : result;

        const priorityMap = new Map(
          priorityCells.map((cell) => [
            String(cell.cell_id),
            cell,
          ])
        );

        const features = geojson.features
          .filter((feature) =>
            priorityMap.has(
              String(feature.properties.cell_id)
            )
          )
          .map((feature) => {
            const priority = priorityMap.get(
              String(feature.properties.cell_id)
            );

            return {
              ...feature,
              properties: {
                ...feature.properties,
                priority_score: priority.priority_score,
                hotseason_lst: priority.hotseason_lst,
                population_density:
                  priority.population_density,
              },
            };
          });

        setGridData({
          type: "FeatureCollection",
          features,
        });
      })
      .catch((error) => {
        console.error("Optimization map error:", error);
        setError(true);
      });
  }, [priorityCells]);

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fef2f2",
          borderRadius: "10px",
          color: "#991b1b",
        }}
      >
        Unable to load optimization map.
      </div>
    );
  }

  if (!gridData) {
    return (
      <div
        style={{
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          borderRadius: "12px",
          color: "#6b7280",
        }}
      >
        Loading priority locations...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={11}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <MapUpdater data={gridData} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={JSON.stringify(gridData)}
          data={gridData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <div
        style={{
          position: "relative",
          marginTop: "-145px",
          marginLeft: "15px",
          width: "210px",
          background: "white",
          padding: "12px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <strong
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#173b32",
          }}
        >
          Priority Score
        </strong>

        <div
          style={{
            fontSize: "12px",
            lineHeight: "22px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: "#991b1b",
                marginRight: "7px",
                borderRadius: "3px",
              }}
            />
            65+ Very High
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: "#dc2626",
                marginRight: "7px",
                borderRadius: "3px",
              }}
            />
            63–64.9 High
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: "#f97316",
                marginRight: "7px",
                borderRadius: "3px",
              }}
            />
            60–62.9 Moderate
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: "#facc15",
                marginRight: "7px",
                borderRadius: "3px",
              }}
            />
            55–59.9
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: "#22c55e",
                marginRight: "7px",
                borderRadius: "3px",
              }}
            />
            Below 55
          </div>
        </div>
      </div>
    </div>
  );
}