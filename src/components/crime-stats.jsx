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
import Navbar from "./navbar";

const CrimeStatsDashboard = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/crime-stats");
        const chartJson = await response.json();
        setCrimeData(chartJson);
      } catch (err) {
        console.error("Data Fetch Error:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Crime Statistics & Analytics</h2>

        {/* Error */}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {/* Bar Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Crime Trends</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading chart...</p>
          ) : (
            <ChartComponent
              primaryXAxis={{
                valueType: "Category",
                title: "Crime Type",
                labelStyle: { color: "#fff" },
                titleStyle: { color: "#fff" },
              }}
              primaryYAxis={{
                title: "Number of Cases",
                labelStyle: { color: "#fff" },
                titleStyle: { color: "#fff" },
              }}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CrimeStatsDashboard;
