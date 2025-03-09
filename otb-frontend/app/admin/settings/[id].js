"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TournamentSettings() {
  const router = useRouter();
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tournaments/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tournament");
        }
        const data = await response.json();
        setTournament(data);
      } catch (error) {
        console.error("Error fetching tournament:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTournament();
  }, [id]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
      <h1>⚙ Manage Tournament</h1>
      {loading ? <p>Loading...</p> : (
        <div>
          <h2>{tournament.name}</h2>
          <p><strong>Start Date:</strong> {new Date(tournament.start_date).toLocaleString()}</p>
          <p><strong>Duration:</strong> {tournament.duration} minutes</p>
          <p><strong>Players:</strong> {tournament.min_players} - {tournament.max_players}</p>
          <p><strong>Scoring:</strong> Win: {tournament.win_points}, Draw: {tournament.draw_points}, Loss: {tournament.loss_points}</p>
          <button 
            onClick={() => handleDelete(id)} 
            style={{ padding: "10px", marginTop: "20px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
          >
            🗑 Delete Tournament
          </button>
        </div>
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
    window.location.href = "/admin";
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
}

