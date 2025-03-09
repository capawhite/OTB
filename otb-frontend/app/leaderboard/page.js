"use client";

import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const tournamentId = 1; // Change this to the correct tournament ID

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tournaments/${tournamentId}/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
      <h1>🏆 Tournament Leaderboard</h1>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: "80%", margin: "auto", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>#</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Player</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white" }}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{index + 1}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{player.username}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

