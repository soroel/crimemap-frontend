import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Navbar from "./navbar";

export default function LandingPage() {
  const navigate = useNavigate(); // ✅ Define navigate function

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center">
      {/* Hero Section with Full-Width Image */}
      <header className="relative w-full h-[80vh] sm:h-[60vh]">
        {/* Full-Width Background Image */}
        <img 
          src="img2.jpg" 
          alt="Crime Awareness" 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
        />

        {/* Navbar Overlay with Background for Readability */}
        <div className="absolute top-0 left-0 w-full bg-black bg-opacity-40">
          <Navbar />
        </div>

        {/* Hero Text Centered on Image */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Stay Informed, Stay Safe
          </h1>
          <p className="text-gray-200 mt-4 text-lg max-w-2xl">
            Report crimes and view real-time crime data in your area.
          </p>
        </div>
      </header>

      {/* CTA Buttons */}
      <div className="mt-12 flex flex-col gap-3 w-full max-w-md">
        <button 
          className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white px-4 py-2 rounded-xl w-full"
          onClick={() => navigate("/map")} // ✅ Navigate to /map
        >
          View Crime Map
        </button>
        <button 
          className="bg-red-500 hover:bg-red-600 transition-all duration-300 text-white px-4 py-2 rounded-xl w-full" 
          onClick={() => navigate("/report")} // ✅ Navigate to /report
        >
          Report a Crime
        </button>
      </div>

      {/* Latest Crime Reports */}
      <section className="mt-8 w-full max-w-3xl px-6">
        <h2 className="text-xl font-semibold mb-3">Latest Crime Reports</h2>
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-red-400 font-bold">Robbery</p>
            <p className="text-sm text-gray-300">📍 Nairobi, Westlands - 2 hours ago</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-yellow-400 font-bold">Vandalism</p>
            <p className="text-sm text-gray-300">📍 Mombasa, CBD - 5 hours ago</p>
          </div>
        </div>
      </section>
    </div>
  );
}
