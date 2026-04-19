import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { slideLeft } from "../animation";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("https://heart-share-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Store token
      localStorage.setItem("token", data.token || data.data?.token);

      // ✅ Navigate after login
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...slideLeft} className="flex h-screen bg-[#f5f0eb]">
      
      <div className="flex-1 flex justify-center items-center">
        <img
          src="/login.avif"
          className="w-[70%]"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-[#ff6600] text-[42px]">Welcome Back!</h1>
        <p className="mb-5 text-[#555]">
          <b>Share food. Spread kindness.</b>
        </p>

        <input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="m-2.5 p-3 w-62.5 outline-none border border-black/10 rounded"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="m-2.5 p-3 w-62.5 outline-none border border-black/10 rounded"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-[#ff6600] text-white p-3 w-[250px] rounded-[8px]"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}

        <p className="mt-3">
          New here? <Link to="/signup" className="text-blue-500 hover:underline">Create account</Link>
        </p>
      </div>

    </motion.div>
  );
}