import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Navbar from "./navbar";

export default function CrimeReportForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setUserLocation(locationString);
          setValue("location", locationString);
        },
        (error) => {
          console.error("Error getting location:", error);
          const fallback = "Unable to fetch location";
          setUserLocation(fallback);
          setValue("location", fallback);
        }
      );
    } else {
      const fallback = "Geolocation not supported";
      setUserLocation(fallback);
      setValue("location", fallback);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication error: No token found. Please log in.");
      setLoading(false);
      return;
    }

    const [lat, lng] = userLocation.split(",").map(val => val?.trim() || "");

    const requestBody = {
      category: data.crimeType,
      date: new Date().toISOString().split("T")[0],
      latitude: lat || "",
      longitude: lng || "",
      description: data.description,
      anonymous: !!data.anonymous,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/submitcrime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Failed to submit crime report.");

      setSuccess(true);
      setTimeout(() => {
        reset();
        setSuccess(false);
      }, 2000);
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

        {success && <p className="text-green-400">✔ Crime report submitted successfully!</p>}
        {error && <p className="text-red-400">❌ {error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Crime Type</label>
            <select
              {...register("crimeType", { required: true })}
              className="w-full p-2 bg-gray-700 rounded mt-1"
              defaultValue=""
            >
              <option value="" disabled>Select Crime Type</option>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Robbery">Robbery</option>
              <option value="Homicide">Homicide</option>
              <option value="Vandalism">Vandalism</option>
              <option value="Fraud">Fraud</option>
              <option value="Bribery">Bribery</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Drug Offense">Drug Offense</option>
              <option value="Human Trafficking">Human Trafficking</option>
              <option value="Domestic Violence">Domestic Violence</option>
              <option value="Sexual Assault">Sexual Assault</option>
              <option value="Arson">Arson</option>
              <option value="Terrorism">Terrorism</option>
              <option value="Extortion">Extortion</option>
              <option value="Other">Other</option>
            </select>
            {errors.crimeType && <p className="text-red-400 text-sm">Crime type is required.</p>}
          </div>

          <div>
            <label>Location</label>
            <input
              {...register("location", { required: true })}
              className="w-full p-2 bg-gray-700 rounded mt-1"
              value={userLocation}
              readOnly
            />
            {errors.location && <p className="text-red-400 text-sm">Location is required.</p>}
          </div>

          <div>
            <label>Description</label>
            <textarea
              {...register("description", { required: true })}
              className="w-full p-2 bg-gray-700 rounded mt-1"
              placeholder="Provide details..."
            />
            {errors.description && <p className="text-red-400 text-sm">Description is required.</p>}
          </div>

          <div className="flex items-center">
            <input type="checkbox" {...register("anonymous")} className="mr-2" />
            <label>Submit Anonymously</label>
          </div>

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
