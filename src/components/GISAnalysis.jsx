import React, { useEffect, useState } from "react";
import {
  MapsComponent,
  LayersDirective,
  LayerDirective,
  MarkersDirective,
  MarkerDirective,
  Inject,
  Marker,
  Zoom,
  MapsTooltip,
} from "@syncfusion/ej2-react-maps";
import * as turf from "@turf/turf";

export default function GISAnalysis() {
  const [worldMap, setWorldMap] = useState(null);
  const [crimeData, setCrimeData] = useState([]);
  const [bufferRadius, setBufferRadius] = useState(1); // in kilometers
  const [bufferedCrimes, setBufferedCrimes] = useState([]);
  const [clickedPoint, setClickedPoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const mapRes = await fetch("/custom.geo.json");
      const crimeRes = await fetch("http://127.0.0.1:5000/api/heatmap-data");

      const mapData = await mapRes.json();
      const crimes = await crimeRes.json();

      setWorldMap(mapData);
      setCrimeData(crimes);
    };

    fetchData();
  }, []);

  const handleMapClick = (args) => {
    const { latitude, longitude } = args;
    const point = turf.point([longitude, latitude]);

    // Create buffer polygon
    const buffered = turf.buffer(point, bufferRadius, { units: "kilometers" });

    // Filter crimes inside buffer
    const filtered = crimeData.filter((crime) => {
      const crimePoint = turf.point([crime.longitude, crime.latitude]);
      return turf.booleanPointInPolygon(crimePoint, buffered);
    });

    setClickedPoint({ latitude, longitude });
    setBufferedCrimes(filtered);
  };

  return (
    <div className="text-white">
      <div className="mb-4">
        <label>Buffer Radius (km): </label>
        <input
          type="number"
          value={bufferRadius}
          onChange={(e) => setBufferRadius(Number(e.target.value))}
          className="text-black px-2 py-1 rounded"
          min={0.1}
          step={0.1}
        />
        <span className="ml-2">Click on map to analyze</span>
      </div>

      <MapsComponent
        zoomSettings={{ enable: true }}
        click={handleMapClick}
        background="#121212"
      >
        <Inject services={[Zoom, Marker, MapsTooltip]} />
        <LayersDirective>
          <LayerDirective shapeData={worldMap}>
            <MarkersDirective>
              {/* All crimes in one marker group */}
              <MarkerDirective
                visible={true}
                height={15}
                width={15}
                shape="Circle"
                fill="#f87171"
                dataSource={bufferedCrimes.map((crime) => ({
                  latitude: crime.latitude,
                  longitude: crime.longitude,
                  name: crime.crime_type,
                }))}
                tooltipSettings={{
                  visible: true,
                  valuePath: "name",
                }}
              />

              {/* Clicked point as a marker */}
              {clickedPoint && (
                <MarkerDirective
                  visible={true}
                  height={20}
                  width={20}
                  shape="Diamond"
                  fill="#3b82f6"
                  dataSource={[
                    {
                      latitude: clickedPoint.latitude,
                      longitude: clickedPoint.longitude,
                      name: "Buffer Center",
                    },
                  ]}
                />
              )}
            </MarkersDirective>
          </LayerDirective>
        </LayersDirective>
      </MapsComponent>

      {/* Info Summary */}
      <div className="mt-4">
        <h3 className="text-lg font-bold">Crimes within {bufferRadius}km:</h3>
        <ul className="list-disc list-inside text-sm">
          {bufferedCrimes.map((crime, i) => (
            <li key={i}>
              {crime.crime_type} in {crime.county}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
