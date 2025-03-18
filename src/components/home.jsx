import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-3xl flex justify-between items-center py-3 border-b border-gray-700">
        <h1 className="text-xl font-bold">CrimeWatch</h1>
        <div className="space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/map" className="text-gray-300 hover:text-white">Map</Link>
          <Link to="/report" className="text-gray-300 hover:text-white">Report</Link>
          <Link to="/stats" className="text-gray-300 hover:text-white">Stats</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="w-full max-w-3xl text-center mt-6">
        <img 
          src="https://source.unsplash.com/featured/?police,city" 
          alt="Crime Awareness" 
          className="rounded-lg w-full h-40 object-cover opacity-80"
        />
        <h1 className="text-3xl font-bold mt-4">Stay Informed, Stay Safe</h1>
        <p className="text-gray-400">Report crimes and view real-time crime data in your area.</p>
      </header>

      {/* CTA Buttons */}
      <div className="mt-6 flex flex-col gap-3 w-full max-w-md">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl w-full">
          View Crime Map
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl w-full">
          Report a Crime
        </button>
      </div>

      {/* Latest Crime Reports */}
      <section className="mt-8 w-full max-w-3xl">
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
