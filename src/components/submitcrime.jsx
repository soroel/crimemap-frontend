import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Navbar from "./navbar";

export default function CrimeReportForm() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState("");
  const [file, setFile] = useState(null); // ✅ File state

  // ✅ Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude}, ${longitude}`;
          setUserLocation(locationString);
          setValue("location", locationString); // ✅ Register in form
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation("Unable to fetch location");
        }
      );
    } else {
      setUserLocation("Geolocation not supported");
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication error: Please log in first.");
      setLoading(false);
      return;
    }

    // ✅ FormData for file upload
    const formData = new FormData();
    formData.append("category", data.crimeType);
    formData.append("date", new Date().toISOString().split("T")[0]);
    formData.append("latitude", userLocation.split(",")[0]);
    formData.append("longitude", userLocation.split(",")[1]);
    formData.append("description", data.description);
    formData.append("anonymous", data.anonymous ? "true" : "false");
    if (file) {
      formData.append("evidence", file);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/submitcrime", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Add token
        },
        body: formData, // ✅ FormData supports files
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit crime report.");
      }

      setSuccess(true);
      reset();
      setFile(null); // ✅ Clear file
    } catch (err) {
      setError(err.message);
      console.error("Error submitting crime report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 p-6 flex flex-col items-center">
      <Navbar />
      <div className="max-w-lg w-full p-6 bg-gray-800 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4">Report a Crime</h2>

        {/* ✅ Feedback Messages */}
        {success && <p className="text-green-400">✔ Crime report submitted successfully!</p>}
        {error && <p className="text-red-400">❌ {error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label>Crime Type</label>
          <select {...register("crimeType", { required: true })} className="w-full p-2 bg-gray-700 rounded">
            <option value="">Select Crime Type</option>
            <option value="Theft">Theft</option>
            <option value="Assault">Assault</option>
            <option value="Vandalism">Vandalism</option>
            <option value="Fraud">Fraud</option>
          </select>
          {errors.crimeType && <p className="text-red-400 text-sm">Crime type is required.</p>}

          <label>Location</label>
          <input {...register("location", { required: true })} className="w-full p-2 bg-gray-700 rounded" value={userLocation} readOnly />
          {errors.location && <p className="text-red-400 text-sm">Location is required.</p>}

          <label>Description</label>
          <textarea {...register("description", { required: true })} className="w-full p-2 bg-gray-700 rounded" placeholder="Provide details..." />
          {errors.description && <p className="text-red-400 text-sm">Description is required.</p>}

          {/* ✅ File Upload */}
          <label>Upload Evidence (Optional)</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full p-2 bg-gray-700 rounded" />

          {/* ✅ Anonymous Checkbox */}
          <div className="flex items-center">
            <input type="checkbox" {...register("anonymous")} className="mr-2" />
            <label>Submit Anonymously</label>
          </div>

          <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold">
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
