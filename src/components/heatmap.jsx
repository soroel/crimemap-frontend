import React, { useEffect, useState, useCallback } from "react";
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
import { Map, BarChart2, Filter, Download, RefreshCw } from "lucide-react";
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';

Modal.setAppElement("#root");

export default function CrimeMap() {
  const [worldMap, setWorldMap] = useState(null);
  const [crimeData, setCrimeData] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('markers'); // 'markers' or 'heatmap'
  const [mapLoaded, setMapLoaded] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapRadius, setHeatmapRadius] = useState(30);

  // Kenya's center coordinates
  const center = {
    lat: 0.0236,
    lng: 37.9062
  };

  const mapOptions = {
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { saturation: -30 }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#2f343b' }, { weight: 1 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e9e9e9' }]
      }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  const heatmapOptions = {
    radius: heatmapRadius,
    opacity: 0.7,
    maxIntensity: 50,
    dissipating: true,
    gradient: [
      'rgba(0, 255, 0, 0)',   // transparent green
      'rgba(85, 255, 0, 0.4)', // light green
      'rgba(170, 255, 0, 0.6)', // yellow-green
      'rgba(255, 255, 0, 0.7)', // yellow
      'rgba(255, 170, 0, 0.8)', // orange
      'rgba(255, 85, 0, 0.9)',  // red-orange
      'rgba(255, 0, 0, 1)'     // red
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch map data
        const mapResponse = await fetch("/custom.geo.json");
        if (!mapResponse.ok) throw new Error("Failed to load map data");
        const mapData = await mapResponse.json();
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

  // Transform data for heatmap after map is loaded
  useEffect(() => {
    if (mapLoaded && window.google && crimeData.length > 0) {
      try {
        console.log('Transforming data for heatmap...');
        const heatmapPoints = crimeData.map(location => ({
          location: new window.google.maps.LatLng(location.latitude, location.longitude),
          weight: Math.min(location.totalCount, 100) // Cap the weight to prevent extreme values
        }));
        setHeatmapData(heatmapPoints);
      } catch (err) {
        console.error('Error transforming data:', err);
        setError('Failed to process crime data for heatmap');
      }
    }
  }, [mapLoaded, crimeData]);

  const handleMapLoad = useCallback(() => {
    console.log('Map loaded successfully');
    setMapLoaded(true);
  }, []);

  const handleMapError = useCallback((error) => {
    console.error('Error loading Google Maps:', error);
    setError('Failed to load Google Maps');
  }, []);

  const colorScale = (count) => {
    if (count > 1000) return {
      fill: "#991b1b",
      base: "#991b1b"
    };
    if (count > 500) return {
      fill: "#dc2626",
      base: "#dc2626"
    };
    if (count > 100) return {
      fill: "#f97316",
      base: "#f97316"
    };
    return {
      fill: "#65a30d",
      base: "#65a30d"
    };
  };

  const filteredData = filterType === "All"
    ? crimeData
    : crimeData
        .map((location) => {
          const matchingCrime = location.crimes.find(
            (c) =>
              c.crime_type.toLowerCase().trim() === filterType.toLowerCase().trim()
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

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/heatmap-data");
      if (!response.ok) throw new Error("Failed to refresh data");
      const data = await response.json();
      const grouped = data.reduce((acc, item) => {
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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ["County", "Crime Type", "Count", "Latitude", "Longitude"].join(","),
      ...crimeData.flatMap(location => 
        location.crimes.map(crime => 
          [
            location.county,
            crime.crime_type,
            crime.count,
            location.latitude,
            location.longitude
          ].join(",")
        )
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "crime_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tooltipTemplate = (args) => {
    if (!args || !args.data) return '';
    
    const location = filteredData.find(
      loc => loc.county === args.data.county
    );
    
    if (!location) return '';

    const crimeList = location.crimes
      .map(crime => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
          <span style="color: #D1D5DB;">${crime.crime_type}</span>
          <span style="margin-left: 16px; font-weight: 600;">${crime.count}</span>
          </div>
      `)
      .join('');

    return `
      <div style="
        background: #262626;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #404040;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        min-width: 200px;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #404040;
        ">
          <span style="font-weight: 600; color: white;">${location.county}</span>
          <span style="
            background: #3B82F6;
            color: white;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 12px;
          ">
            Total: ${location.totalCount}
          </span>
          </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${crimeList}
        </div>
          </div>
    `;
  };

  const renderMap = () => {
    if (activeView === 'markers') {
      return (
          <MapsComponent
            zoomSettings={{
              enable: true,
              mouseWheelZoom: true,
              pinchZooming: true,
              toolbars: ["Zoom", "ZoomIn", "ZoomOut", "Pan", "Reset"],
            }}
            background="#1a1a1a"
            border={{ color: "#404040", width: 1 }}
            titleSettings={{
              text: "Kenya Crime Heatmap",
              textStyle: {
                size: "24px",
                fontWeight: "500",
                fontFamily: "Poppins, sans-serif",
                color: "#fff"
              }
            }}
            loaded={() => console.log("Map loaded successfully")}
            markerClick={(args) => {
              const markerData = args.data;
              const found = filteredData.find(
                (loc) =>
                  loc.latitude === markerData.latitude &&
                  loc.longitude === markerData.longitude
              );
              if (found) {
                setSelectedCrime(found);
              }
            }}
          >
            <Inject services={[Zoom, Marker, MapsTooltip]} />
            <LayersDirective>
              <LayerDirective
                shapeData={worldMap}
                shapeSettings={{
                fill: "#2d4a3e",
                  border: { color: "#40513B", width: 0.5 },
                }}
              >
                {filteredData && filteredData.length > 0 && (
                  <MarkersDirective>
                  {filteredData.map((loc, i) => {
                    const colors = colorScale(loc.totalCount);
                    return (
                      <MarkerDirective
                        key={i}
                        visible={true}
                        height={20}
                        width={20}
                        shape="Circle"
                        fill={colors.fill}
                        border={{ color: "transparent", width: 0 }}
                        animationDuration={800}
                        opacity={0.9}
                        dataSource={[{
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                          county: loc.county,
                          totalCount: loc.totalCount
                        }]}
                        tooltipSettings={{
                          visible: true,
                          valuePath: "county",
                          format: "${county}<br/>Total Crimes: ${totalCount}"
                        }}
                      />
                    );
                  })}
                  </MarkersDirective>
                )}
              </LayerDirective>
            </LayersDirective>
          </MapsComponent>
      );
    } else {
      return (
        <div className="relative h-[calc(100vh-8rem)] w-full bg-[#1a1a1a]">
          <div className="absolute top-4 right-4 z-10 bg-[#262626] p-4 rounded-lg shadow-lg border border-[#404040]">
            <h3 className="text-sm font-semibold mb-2 text-white">Crime Density</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                <span className="text-xs text-gray-300">Low (0-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                <span className="text-xs text-gray-300">Medium (11-50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                <span className="text-xs text-gray-300">High (&gt;50)</span>
              </div>
            </div>
          </div>
          <LoadScript 
            googleMapsApiKey="AIzaSyDnUhIrcmxYrLKj86l9LZ_HSa2HS-H8dBM"
            onLoad={() => console.log('Google Maps Script loaded')}
            onError={handleMapError}
            libraries={['visualization']}
          >
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={center}
              zoom={7}
              options={mapOptions}
              onLoad={handleMapLoad}
            >
              {mapLoaded && heatmapData.length > 0 && (
                <HeatmapLayer
                  data={heatmapData}
                  options={heatmapOptions}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* GIS Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold flex items-center">
                <Map className="w-6 h-6 mr-2" />
                GIS Analysis
              </h1>
              <div className="border-l border-gray-700 h-6 mx-2" />
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveView('markers')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeView === 'markers'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Markers
                </button>
                <button
                  onClick={() => setActiveView('heatmap')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeView === 'heatmap'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Heatmap
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={handleExportData}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - show for both views now */}
          <aside className="w-72 shrink-0">
            <div className="bg-[#262626] p-6 rounded-lg shadow-lg border border-[#404040]">
              {activeView === 'markers' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Crime Filter</h2>
                    <Filter className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    className="w-full bg-[#333333] p-3 rounded-lg mb-6 border border-[#404040] focus:border-[#666666] transition-colors"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Crime Types</option>
                    <option value="Assault">Assault</option>
                    <option value="Theft">Theft</option>
                    <option value="Homicide">Homicide</option>
                    <option value="Vandalism">Vandalism</option>
                  </select>

                  <h3 className="text-lg font-medium mb-3">Severity Scale</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 p-2 bg-[#333333] rounded">
                      <span className="w-4 h-4 bg-green-600 rounded-full" />
                      <span>Low Risk (≤ 100)</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#333333] rounded">
                      <span className="w-4 h-4 bg-orange-500 rounded-full" />
                      <span>Medium Risk (101-500)</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#333333] rounded">
                      <span className="w-4 h-4 bg-red-600 rounded-full" />
                      <span>High Risk (501-1000)</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#333333] rounded">
                      <span className="w-4 h-4 bg-red-800 rounded-full" />
                      <span>Severe Risk (&gt; 1000)</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Heatmap Settings</h2>
                    <Filter className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Buffer Radius</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={heatmapRadius}
                        onChange={(e) => setHeatmapRadius(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10px</span>
                        <span>{heatmapRadius}px</span>
                        <span>100px</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Density Scale</h3>
                      <div className="h-4 w-full rounded-lg" style={{
                        background: 'linear-gradient(to right, rgba(0,255,0,1), rgba(255,255,0,1), rgba(255,0,0,1))'
                      }} />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className={`${activeView === 'markers' ? 'flex-1' : 'w-full'}`}>
            {isLoading ? (
              <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <p className="text-gray-400">Loading map data...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <p className="text-red-400">Error: {error}</p>
              </div>
            ) : (
              renderMap()
            )}
          </div>
        </div>
      </div>

      {/* Modal - only for markers view */}
      {activeView === 'markers' && selectedCrime && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelectedCrime(null)}
          className="bg-[#262626] p-8 rounded-lg shadow-lg max-w-xl mx-auto mt-20 text-white border border-[#404040]"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start z-50"
        >
          <h3 className="text-2xl font-bold mb-6">
            {selectedCrime.county} Crime Analysis
          </h3>

          <div className="bg-[#333333] p-4 rounded-lg mb-6">
            <p className="text-lg mb-2">Total Reported Crimes: <span className="font-semibold">{selectedCrime.totalCount}</span></p>
            <p className="text-sm text-gray-400">Click on the bars for detailed information</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={selectedCrime.crimes}>
              <XAxis
                dataKey="crime_type"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#262626",
                  border: "1px solid #404040",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <button
            onClick={() => setSelectedCrime(null)}
            className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

