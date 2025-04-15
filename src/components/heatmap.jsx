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
import Modal from "react-modal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "./navbar";

Modal.setAppElement("#root");

export default function CrimeMap() {
  const [worldMap, setWorldMap] = useState(null);
  const [crimeData, setCrimeData] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch map data
        const mapResponse = await fetch("/custom.geo.json");
        if (!mapResponse.ok) throw new Error("Failed to load map data");
        const mapData = await mapResponse.json();
        if (!mapData || typeof mapData !== 'object') {
          throw new Error("Invalid map data format");
        }
        setWorldMap(mapData);

        // Fetch crime data
        const crimeResponse = await fetch("http://127.0.0.1:5000/api/heatmap-data");
        if (!crimeResponse.ok) throw new Error("Failed to load crime data");
        const crimeData = await crimeResponse.json();

        const grouped = crimeData.reduce((acc, item) => {
          const key = `${item.latitude},${item.longitude}`;
          if (!acc[key]) {
            acc[key] = {
              county: item.county,
              latitude: item.latitude,
              longitude: item.longitude,
              crimes: [],
              totalCount: 0,
            };
          }
          acc[key].crimes.push(item);
          acc[key].totalCount += item.count;
          return acc;
        }, {});
        
        setCrimeData(Object.values(grouped));
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const colorScale = (count) => {
    if (count > 1000) return "#dc2626";
    if (count > 500) return "#f97316";
    if (count > 100) return "#facc15";
    return "#22c55e";
  };

  const filteredData =
  filterType === "All"
    ? crimeData
    : crimeData
        .map((location) => {
          const matchingCrime = location.crimes.find(
            (c) =>
              c.crime_type.toLowerCase().trim() ===
              filterType.toLowerCase().trim()
          );
          if (matchingCrime) {
            return {
              ...location,
              crimes: [matchingCrime],
              totalCount: matchingCrime.count,
            };
          }
          return null;
        })
        .filter(Boolean);


  return (
    <div className="relative h-screen bg-[#121212] text-white overflow-hidden">
      <Navbar />

      {/* Sidebar */}
      <aside className="absolute top-20 left-4 bg-[#1f1f1f] p-4 rounded-lg w-64 shadow-lg z-10">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <select
          className="w-full bg-[#2c2c2c] p-2 rounded mb-4"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Crime Types</option>
          <option value="Assault">Assault</option>
          <option value="Robbery">Robbery</option>
          <option value="Theft">Theft</option>
          <option value="Homicide">Homicide</option>
        </select>

        <h3 className="text-md font-medium mb-2">Severity Legend</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full" /> Low
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded-full" /> Medium
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-500 rounded-full" /> High
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-600 rounded-full" /> Severe
          </div>
        </div>
      </aside>

      {/* Map Container */}
      <div className="ml-72 mt-4 pr-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">Loading map data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-400">Error: {error}</p>
          </div>
        ) : worldMap ? (
          <MapsComponent
            zoomSettings={{ enable: true }}
            background="#121212"
            titleSettings={{ text: "Crime Heatmap", textStyle: { color: "#fff" } }}
            loaded={() => console.log("Map loaded successfully")}
          >
            <Inject services={[Zoom, Marker, MapsTooltip]} />
            <LayersDirective>
              <LayerDirective
                shapeData={worldMap}
                shapeSettings={{
                  fill: "#2a2a2a",
                  border: { width: 0.3, color: "#555" },
                }}
              >
                {filteredData && filteredData.length > 0 && (
                  <MarkersDirective>
                    {filteredData.map((loc, i) => (
                      <MarkerDirective
                        key={i}
                        visible={true}
                        height={20}
                        width={20}
                        shape="Circle"
                        fill={colorScale(loc.totalCount)}
                        animationDuration={0}
                        dataSource={[{
                          latitude: loc.latitude,
                          longitude: loc.longitude,
                          name: loc.county,
                        }]}
                        tooltipSettings={{
                          visible: true,
                          valuePath: "name",
                          format: `<strong>${loc.county}</strong><br/>Total crimes: ${loc.totalCount}`,
                        }}
                        click={() => setSelectedCrime(loc)}
                      />
                    ))}
                  </MarkersDirective>
                )}
              </LayerDirective>
            </LayersDirective>
          </MapsComponent>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">No map data available</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCrime && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelectedCrime(null)}
          className="bg-[#1f1f1f] p-6 rounded-lg shadow-lg max-w-xl mx-auto mt-20 text-white"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50"
        >
          <h3 className="text-lg font-bold mb-4">
            {selectedCrime.county} Crime Report (Total: {selectedCrime.totalCount})
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedCrime.crimes}>
              <XAxis dataKey="crime_type" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          <button
            onClick={() => setSelectedCrime(null)}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}