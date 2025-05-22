import DataTable from "./DataTable";
import { useEffect, useState } from "react";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users?page=${page}&search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        console.error("401 Unauthorized: Invalid or expired token.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error(`Error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("API response:", data);

      // ✅ FIX: extract users and total_pages
      setUsers(Array.isArray(data) ? data : []);
      setTotalPages(1);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  return (
    <DataTable
      data={users}
      columns={[
        { accessor: "username", header: "Name" },
        { accessor: "role", header: "Role" },
      ]}
      isLoading={loading}
      onSearch={(q) => setSearch(q)}
      totalPages={totalPages}
      onPageChange={(p) => setPage(p)}
    />
  );
}
