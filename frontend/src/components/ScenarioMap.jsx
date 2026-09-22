import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
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

function getRiskColor(lst) {
  if (lst >= 42) return "#7f1d1d";
  if (lst >= 40) return "#dc2626";
  if (lst >= 38) return "#f59e0b";
  if (lst >= 36) return "#facc15";
  return "#22c55e";
}

function styleFeature(feature) {
  const lst = feature.properties.scenario_lst;

  return {
    fillColor: getRiskColor(lst),
    weight: 0.5,
    color: "#ffffff",
    fillOpacity: 0.7,
  };
}

function onEachFeature(feature, layer) {
  const properties = feature.properties;

  layer.bindPopup(`
    <div>
      <strong>Cell ${properties.cell_id}</strong><br/>
      Scenario LST: ${properties.scenario_lst.toFixed(2)} °C<br/>
      Risk Level: ${properties.risk_level}<br/>
      Baseline LST: ${properties.hotseason_lst.toFixed(2)} °C<br/>
      Population: ${Math.round(properties.population)}
    </div>
  `);
}

export default function ScenarioMap({ data }) {
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
        Run a climate scenario to view the affected areas.
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
        style={{ height: "100%", width: "100%" }}
      >
        <MapUpdater data={data} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={JSON.stringify(data)}
          data={data}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}