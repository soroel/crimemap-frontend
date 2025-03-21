import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ Import Link for navigation
import {
    ChartComponent,
    SeriesCollectionDirective,
    SeriesDirective,
    Inject as ChartInject,
    ColumnSeries,
    Category,
    Tooltip as ChartTooltip,
    DataLabel,
    Legend as ChartLegend
} from "@syncfusion/ej2-react-charts";
import {
    HeatMapComponent,
    Inject as HeatMapInject,
    Legend as HeatMapLegend,
    Tooltip as HeatMapTooltip
} from "@syncfusion/ej2-react-heatmap";
import Navbar from "./navbar";

const CrimeStatsDashboard = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Fetch Crime Statistics Data
    fetch("http://127.0.0.1:5000/api/crime-stats")
      .then(response => response.json())
      .then(data => setCrimeData(data))
      .catch(error => console.error("Error fetching crime stats:", error));

    // Fetch Heatmap Data
    fetch("http://127.0.0.1:5000/api/heatmap-data")
      .then(response => response.json())
      .then(data => {
        // Ensure data is structured as a 2D array
        const formattedData = data.map(row => Object.values(row));
        setHeatmapData(formattedData);
      })
      .catch(error => console.error("Error fetching heatmap data:", error));
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      
      <Navbar />

      <h2 className="text-2xl font-bold mb-4">Crime Statistics & Analytics</h2>

      {/* ✅ Crime Trends Graph */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Crime Trends</h3>
        <ChartComponent 
          primaryXAxis={{ valueType: "Category", title: "Crime Type" }}
          primaryYAxis={{ title: "Number of Cases" }}
          tooltip={{ enable: true }}
          legendSettings={{ visible: true }}>
          <ChartInject services={[ColumnSeries, Category, ChartTooltip, DataLabel, ChartLegend]} />
          <SeriesCollectionDirective>
            <SeriesDirective 
              dataSource={crimeData} 
              xName="category" 
              yName="count" 
              type="Column" 
              name="Crimes" />
          </SeriesCollectionDirective>
        </ChartComponent>
      </div>

      {/* ✅ Crime Heatmap */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Crime Density Heatmap</h3>
        {heatmapData.length > 0 ? (
          <HeatMapComponent 
            xAxis={{ labels: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] }}
            yAxis={{ labels: ["Homicide", "Theft", "Assault", "Vandalism"] }}
            dataSource={heatmapData}>
            <HeatMapInject services={[HeatMapLegend, HeatMapTooltip]} />
          </HeatMapComponent>
        ) : (
          <p>Loading heatmap...</p>
        )}
      </div>
      
    </div>
  );
};

export default CrimeStatsDashboard;
