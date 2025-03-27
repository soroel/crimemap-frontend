import { useEffect, useState } from "react";

const LatestCrimeReports = () => {
    const [latestCrimes, setLatestCrimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestCrimes = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://127.0.0.1:5000/api/latestcrimes");
                const data = await response.json();
                if (response.ok) {
                    setLatestCrimes(data.crimes);
                } else {
                    console.error("Failed to fetch crimes:", data.error);
                }
            } catch (error) {
                console.error("Error fetching crimes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestCrimes();
        const interval = setInterval(fetchLatestCrimes, 60000); // Refresh every 60 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="mt-8 w-full max-w-3xl px-6">
            <h2 className="text-xl font-semibold mb-3">Latest Crime Reports</h2>
            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-400 animate-pulse">Loading latest crimes...</p>
                ) : latestCrimes.length > 0 ? (
                    latestCrimes.map((crime, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg">
                            <p className={`font-bold ${crime.category === "Robbery" ? "text-red-400" : "text-yellow-400"}`}>
                                {crime.category}
                            </p>
                            <p className="text-sm text-gray-300">
                                📍 {crime.location} - {crime.timestamp} {/* No conversion here */}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">No recent crime reports.</p>
                )}
            </div>
        </section>
    );
};

export default LatestCrimeReports;
