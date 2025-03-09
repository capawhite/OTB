"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch("http://127.0.0.1:8000/tournaments/");
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments");
        }
        const data = await response.json();
        setTournaments(data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
      <h1>🎯 Tournament Admin Dashboard</h1>
      <button 
        onClick={() => router.push("/admin/create")} 
        style={{ marginBottom: "20px", padding: "10px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        ➕ Create New Tournament
      </button>

      {loading ? <p>Loading tournaments...</p> : (
        <table style={{ width: "80%", margin: "auto", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Name</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => (
              <tr key={tournament.id} style={{ backgroundColor: "#f2f2f2" }}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{tournament.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{tournament.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  <button 
                    onClick={() => router.push(`/admin/settings/${tournament.id}`)} 
                    style={{ padding: "5px", marginRight: "5px", backgroundColor: "orange", color: "white", border: "none", cursor: "pointer" }}
                  >
                    ⚙ Manage
                  </button>
                  <button 
                    onClick={() => handleDelete(tournament.id)} 
                    style={{ padding: "5px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

async function handleDelete(id) {
  if (!window.confirm("Are you sure you want to delete this tournament?")) return;
  try {
    const response = await fetch(`http://127.0.0.1:8000/tournaments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete tournament");
    }
    alert("Tournament deleted successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
}

