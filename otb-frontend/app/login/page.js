import { useState } from "react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await fetch("http://127.0.0.1:8080/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setMessage("Login failed: " + data.detail);
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    alert("Google login feature coming soon!");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff" }}>
      <h2 style={{ color: "#333" }}>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <br />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required 
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <br />
        <button 
          type="submit" 
          style={{ width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}
        >
          Login
        </button>
      </form>
      <hr style={{ margin: "20px 0" }} />
      <button 
        onClick={handleGoogleLogin} 
        style={{ width: "100%", padding: "10px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <FcGoogle size={20} style={{ marginRight: "10px" }} /> Login with Google
      </button>
      {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

