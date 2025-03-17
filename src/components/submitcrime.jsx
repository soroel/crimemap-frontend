import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function CrimeReportForm() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("");

  // Automatically detect user location
  useEffect(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude}, ${longitude}`;
          setUserLocation(locationString);
          setValue("location", locationString); // Prefill form location
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation("Unable to fetch location");
          setLocationLoading(false);
        }
      );
    } else {
      setUserLocation("Geolocation not supported");
      setLocationLoading(false);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    // Ensure these fields are included
    const payload = {
      category: data.crimeType, // Renamed from crimeType
      date: new Date().toISOString().split("T")[0], // Current date
      latitude: userLocation.split(",")[0], // Extract from location string
      longitude: userLocation.split(",")[1], // Extract from location string
      description: data.description,
      anonymous: data.anonymous,
    };
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/submitcrime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const responseData = await response.json();
      console.log("API Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit crime report.");
      }
  
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err.message);
      console.error("Error submitting crime report:", err);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="h-screen w-full bg-gray-900 p-6 flex flex-col items-center">
  {/* Navbar */}
  <nav className="w-full max-w-3xl mx-auto flex justify-between items-center py-3 border-b border-gray-700 mb-6 sticky top-0 bg-gray-900 z-50">
    <h1 className="text-xl font-bold text-white">CrimeWatch</h1>
    <div className="space-x-4">
      <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
      <Link to="/map" className="text-gray-300 hover:text-white">Map</Link>
      <Link to="/report" className="text-gray-300 hover:text-white">Report</Link>
    </div>
  </nav>

  {/* Form Container */}
  <div className="max-w-lg w-full p-6 bg-gray-800 rounded-lg shadow-lg text-white overflow-auto max-h-[80vh]">
    <h2 className="text-2xl font-bold mb-4">Report a Crime</h2>

    {/* Feedback Messages - Fixed at the top */}
{(success || error) && (
  <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-3/4 max-w-md z-50 text-center">
    {success && <p className="text-green-400">✔ Crime report submitted successfully!</p>}
    {error && <p className="text-red-400">❌ {error}</p>}
  </div>
)}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Crime Type */}
      <div>
        <label className="block text-sm font-medium">Crime Type</label>
        <select {...register("crimeType", { required: true })} className="w-full p-2 bg-gray-700 rounded">
          <option value="">Select Crime Type</option>
          <option value="Theft">Theft</option>
          <option value="Assault">Assault</option>
          <option value="Vandalism">Vandalism</option>
          <option value="Fraud">Fraud</option>
        </select>
        {errors.crimeType && <p className="text-red-400 text-sm">Crime type is required.</p>}
      </div>

      {/* Location - Auto-detect */}
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input 
          {...register("location", { required: true })} 
          className="w-full p-2 bg-gray-700 rounded" 
          value={userLocation}
          readOnly
        />
        {locationLoading && <p className="text-yellow-400 text-sm">Detecting location...</p>}
        {errors.location && <p className="text-red-400 text-sm">Location is required.</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea 
          {...register("description", { required: true })} 
          className="w-full p-2 bg-gray-700 rounded" 
          placeholder="Provide any additional details..." 
        />
        {errors.description && <p className="text-red-400 text-sm">Description is required.</p>}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium">Upload Evidence (Optional)</label>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="w-full p-2 bg-gray-700 rounded" 
        />
      </div>

      {/* Anonymous Submission */}
      <div className="flex items-center">
        <input 
          type="checkbox" 
          {...register("anonymous")} 
          className="mr-2" 
        />
        <label>Submit Anonymously</label>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  </div>
</div>

  );
}
