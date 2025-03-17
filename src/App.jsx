//Base
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  LandingPage from "./components/home";
import  CrimeMap from "./components/heatmap";
import CrimeReportForm from "./components/submitcrime";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={< LandingPage/>} />
        <Route path="/map" element={< CrimeMap/>} />
        <Route path="/report" element={< CrimeReportForm/>} />

        
      </Routes>
    
  );
}

export default App;