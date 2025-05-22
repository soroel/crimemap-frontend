import DataTable from "./DataTable";
import { useEffect, useState } from "react";

export default function CrimeReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/user/reports?page=${page}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch reports", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();

      // If your API returns a structure like { reports: [], total_pages: x }
      if (Array.isArray(data)) {
        console.log("Fetched reports:", data.reports || data);

        setReports(data);
        setTotalPages(1); // fallback if total_pages not available
      } else {
        setReports(data.reports || []);
        setTotalPages(data.total_pages || 1);
      }

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search]);

  return (
    <DataTable
      data={reports}
      columns={[
        { key: "title", label: "Title" },
        { key: "location", label: "Location" },
        { key: "severity", label: "Severity" },
        { key: "reporter", label: "Reporter" },
        { key: "date_reported", label: "Date Reported" },
      ]}
      isLoading={loading}
      onSearch={(q) => setSearch(q)}
      totalPages={totalPages}
      onPageChange={(p) => setPage(p)}
      page={page}
    />
  );
}
