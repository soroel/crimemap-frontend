import React from "react";
import CrimeMap from "./heatmap";
import Navbar from "./navbar";

export default function MapTabs() {
  return (
    <div className="bg-[#121212] min-h-screen text-white">
      <Navbar />
      <div className="px-4 pt-20">
        <div className="border-t border-gray-700 pt-4 relative min-h-[80vh]">
          <CrimeMap />
        </div>
      </div>
    </div>
  );
}
