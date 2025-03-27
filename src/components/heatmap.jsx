import React, { useEffect, useState } from "react";
import {
  MapsComponent,
  LayersDirective,
  LayerDirective,
  MarkersDirective,
  MarkerDirective,
  Zoom,
  Marker,
  MapsTooltip,
  Inject,
} from "@syncfusion/ej2-react-maps";

import Navbar from "./navbar";

export default function CrimeMap() {
  const [worldMap, setWorldMap] = useState(null);
  const [crimeData, setCrimeData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch World Map
    fetch("/custom.geo.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch map data");
        return response.json();
      })
      .then((data) => {
        console.log("✅ World Map Data Loaded:", data);
        setWorldMap(data);
      })
      .catch((err) => {
        console.error("❌ Error Loading Map:", err);
        setError("Failed to load map data.");
      });

    // Fetch Crime Data
    fetch("http://127.0.0.1:5000/api/heatmap-data")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch crime data");
        return response.json();
      })
      .then((data) => {
        console.log("✅ Crime Data Loaded:", data);

        // Group crimes by location (county)
        const groupedCrimes = data.reduce((acc, crime) => {
          const key = `${crime.latitude},${crime.longitude}`;

          if (!acc[key]) {
            acc[key] = {
              county: crime.county,
              latitude: crime.latitude,
              longitude: crime.longitude,
              crimes: [],
            };
          }

          // Ensure valid crime data
          if (crime.crime_type && crime.count !== undefined) {
            acc[key].crimes.push(`${crime.crime_type}: ${crime.count}`);
          }

          return acc;
        }, {});

        setCrimeData(Object.values(groupedCrimes));
      })
      .catch((err) => {
        console.error("❌ Error Loading Crime Data:", err);
        setError("Failed to load crime data. Check server logs.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">Error loading map: {error}</p>;
  }

  if (loading || !worldMap) {
    return <p className="text-white text-center">Loading map...</p>;
  }

  return (
    <div className="h-screen w-full bg-gray-900 p-4">
      <Navbar />
      
      <MapsComponent zoomSettings={{ enable: true }} background="black">
        <Inject services={[Zoom, Marker, MapsTooltip]} />

        <LayersDirective>
          <LayerDirective shapeData={worldMap} shapeSettings={{ fill: "#444" }}>
            <MarkersDirective>
              {crimeData.map((crime, index) => (
                <MarkerDirective
                  key={index}
                  visible={true}
                  height={20}
                  width={20}
                  dataSource={[{
                    latitude: crime.latitude,
                    longitude: crime.longitude,
                    county: crime.county,
                    crimeDetails: crime.crimes.length > 0 
                      ? crime.crimes.join("<br>") 
                      : "No data available",
                  }]}
                  tooltipSettings={{
                    visible: true,
                    format: `<strong>County:</strong> ${crime.county} <br> 
                             <strong>Crimes:</strong> <br> ${crime.crimes.length > 0 
                               ? crime.crimes.join("<br>") 
                               : "No data available"}`,
                  }}
                />
              ))}
            </MarkersDirective>
          </LayerDirective>
        </LayersDirective>
      </MapsComponent>
    </div>
  );
}
