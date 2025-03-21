//Base
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  LandingPage from "./components/home";
import  CrimeMap from "./components/heatmap";
import CrimeReportForm from "./components/submitcrime";
import CrimeStatsDashboard from "./components/crime-stats";
import UserDashboard from "./components/dashboard";
import Login from "./components/login";
import Navbar from "./components/navbar";
import Register from "./components/Register";

function App() {
  return (
    <>
    
      <Routes>
        <Route path="/" element={< LandingPage/>} />
        <Route path="/map" element={< CrimeMap/>} />
        <Route path="/report" element={< CrimeReportForm/>} />
        <Route path="/stats" element={< CrimeStatsDashboard/>} />
        <Route path="/dashboard" element={< UserDashboard/>} />
        <Route path="/login" element={< Login/>} />
        <Route path="/navbar" element={< Navbar/>} />
        <Route path="/register" element={< Register/>} />
    
        
      </Routes>
      </>
    
  );
}

export default App;