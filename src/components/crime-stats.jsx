import React, { useEffect, useState } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject as ChartInject,
  ColumnSeries,
  Category,
  Tooltip as ChartTooltip,
  DataLabel,
  Legend as ChartLegend,
} from "@syncfusion/ej2-react-charts";
import {
  HeatMapComponent,
  Inject as HeatMapInject,
  Legend as HeatMapLegend,
  Tooltip as HeatMapTooltip,
} from "@syncfusion/ej2-react-heatmap";
import Navbar from "./navbar";

const CrimeStatsDashboard = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState([]);

  const xLabels = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  const yLabels = ["Homicide", "Theft", "Assault", "Vandalism"];

  useEffect(() => {
    // Fetch chart data
    fetch("http://127.0.0.1:5000/api/crime-stats")
      .then((res) => res.json())
      .then((data) => setCrimeData(data))
      .catch((err) => console.error("Chart Error:", err));

    // Fetch heatmap data
    fetch("http://127.0.0.1:5000/api/heatmap-data")
  .then((res) => res.json())
  .then((data) => {
    const matrix = yLabels.map((crime) =>
      xLabels.map((county) => {
        const match = data.find(
          (item) =>
            item.county?.toLowerCase().trim() === county.toLowerCase().trim() &&
            item.crime_type?.toLowerCase().trim() === crime.toLowerCase().trim()
        );
        return match?.count || 0;
      })
    );
    setHeatmapMatrix(matrix);
  })
  .catch((err) => console.error("Heatmap Error:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <Navbar />

      <h2 className="text-2xl font-bold mb-6">Crime Statistics & Analytics</h2>

      {/* Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Crime Trends</h3>
        <ChartComponent
          primaryXAxis={{ valueType: "Category", title: "Crime Type", labelStyle: { color: "#fff" }, titleStyle: { color: "#fff" } }}
          primaryYAxis={{ title: "Number of Cases", labelStyle: { color: "#fff" }, titleStyle: { color: "#fff" } }}
          tooltip={{ enable: true }}
          legendSettings={{ visible: true, textStyle: { color: "#fff" } }}
          background="#1f2937"
        >
          <ChartInject services={[ColumnSeries, Category, ChartTooltip, DataLabel, ChartLegend]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={crimeData}
              xName="category"
              yName="count"
              type="Column"
              name="Crimes"
              marker={{ dataLabel: { visible: true } }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </div>

      {/* Heatmap */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Crime Density Heatmap</h3>
        {heatmapMatrix.length > 0 ? (
          <HeatMapComponent
            xAxis={{ labels: xLabels }}
            yAxis={{ labels: yLabels }}
            dataSource={heatmapMatrix}
            paletteSettings={{ palette: [{ color: "#22c55e" }, { color: "#facc15" }, { color: "#ef4444" }] }}
            legendSettings={{ visible: true }}
          >
            <HeatMapInject services={[HeatMapLegend, HeatMapTooltip]} />
          </HeatMapComponent>
        ) : (
          <p className="text-sm text-gray-400">Loading heatmap...</p>
        )}
      </div>
    </div>
  );
};

export default CrimeStatsDashboard;
