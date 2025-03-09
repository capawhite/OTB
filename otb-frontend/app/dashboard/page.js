"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");  // Redirect to login if no token
    } else {
      // Decode the token to get the user's email (assuming JWT payload format)
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); 
        setUserEmail(payload.sub); // 'sub' usually holds the email
      } catch (error) {
        console.error("Invalid token:", error);
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");  // Clear session
    router.push("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
      <h1>Welcome to the Dashboard</h1>
      {userEmail ? <p>Logged in as: <strong>{userEmail}</strong></p> : <p>Loading...</p>}
      <button 
        onClick={handleLogout} 
        style={{ marginTop: "20px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
}

