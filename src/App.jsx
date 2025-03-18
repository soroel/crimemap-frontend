//Base
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  LandingPage from "./components/home";
import  CrimeMap from "./components/heatmap";
import CrimeReportForm from "./components/submitcrime";
import CrimeStatsDashboard from "./components/crime-stats";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={< LandingPage/>} />
        <Route path="/map" element={< CrimeMap/>} />
        <Route path="/report" element={< CrimeReportForm/>} />
        <Route path="/stats" element={< CrimeStatsDashboard/>} />

        
      </Routes>
    
  );
}

export default App;