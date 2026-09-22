import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect } from "react";
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

function getCoolingColor(reduction) {
  if (reduction >= 3) return "#166534";
  if (reduction >= 2) return "#22c55e";
  if (reduction >= 1) return "#facc15";
  if (reduction >= 0.5) return "#fb923c";
  return "#ef4444";
}

function styleFeature(feature) {
  const reduction = feature.properties.lst_reduction || 0;

  return {
    fillColor: getCoolingColor(reduction),
    weight: 0.5,
    color: "#ffffff",
    fillOpacity: 0.75,
  };
}

function onEachFeature(feature, layer) {
  const p = feature.properties;

  layer.bindPopup(`
    <div style="min-width:230px;">
      <strong>Cell ${p.cell_id}</strong>
      <hr/>

      <b>Baseline LST:</b>
      ${Number(p.baseline_lst).toFixed(2)} °C
      <br/>

      <b>After Intervention:</b>
      ${Number(p.intervention_lst).toFixed(2)} °C
      <br/>

      <b>Cooling:</b>
      ${Number(p.lst_reduction).toFixed(2)} °C
      <br/><br/>

      <b>Risk Before:</b>
      ${p.baseline_risk}
      <br/>

      <b>Risk After:</b>
      ${p.intervention_risk}
      <br/><br/>

      <b>Population Density:</b>
      ${Math.round(p.population_density)}
      people/km²
    </div>
  `);
}

export default function InterventionMap({ data }) {
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
        Loading intervention map...
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
        <MapUpdater data={data} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
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