import React, { useState } from "react";
import CrimeMap from "./heatmap";
import GISAnalysis from "./GISAnalysis";
import Navbar from "./navbar";

export default function MapTabs() {
  const [activeTab, setActiveTab] = useState("heatmap");

  return (
    <div className="bg-[#121212] min-h-screen text-white">
      <Navbar />

      <div className="px-4 pt-20">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "heatmap"
                ? "bg-blue-600 text-white"
                : "bg-[#1f1f1f] hover:bg-[#2a2a2a]"
            }`}
          >
            Crime Heatmap
          </button>
          <button
            onClick={() => setActiveTab("gis")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "gis"
                ? "bg-blue-600 text-white"
                : "bg-[#1f1f1f] hover:bg-[#2a2a2a]"
            }`}
          >
            GIS Analysis
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4 relative min-h-[80vh]">
          {/* Always mounted - just hidden when inactive */}
          <div className={activeTab === "heatmap" ? "block" : "hidden"}>
            <CrimeMap />
          </div>
          <div className={activeTab === "gis" ? "block" : "hidden"}>
            <GISAnalysis />
          </div>
        </div>
      </div>
    </div>
  );
}
