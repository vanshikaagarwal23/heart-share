import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { slideRight } from "../animation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("https://heart-share-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token || data.data?.token);
      localStorage.setItem("role", role);

      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...slideRight} className="flex h-screen bg-[#f5f0eb]">
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-[#ff6600] text-[42px]">Create Account</h1>
        <p className="mb-5 text-[#555]">
          <b>Join the kindness movement!</b>
        </p>

        

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="m-[10px] p-3 w-[250px] outline-none border border-black/10 rounded focus:ring-2 focus:ring-[#ff6600]/40"
        />

        <input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="m-[10px] p-3 w-[250px] outline-none border border-black/10 rounded focus:ring-2 focus:ring-[#ff6600]/40"
        />

        

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="m-[10px] p-3 w-[250px] outline-none border border-black/10 rounded focus:ring-2 focus:ring-[#ff6600]/40"
        />

        <div className="flex gap-6 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="donor"
              checked={role === "donor"}
              onChange={(e) => setRole(e.target.value)}
              className="accent-[#ff6600]"
            />
            <span className="text-[#444]">Donor</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="ngo"
              checked={role === "ngo"}
              onChange={(e) => setRole(e.target.value)}
              className="accent-[#ff6600]"
            />
            <span className="text-[#444]">NGO</span>
          </label>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="bg-[#ff6600] hover:bg-[#e65c00] transition text-white p-3 w-[250px] rounded-[8px]"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}

        <p className="mt-3">
          Already have an account? <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <img
          src="/login.avif"
          className="w-[70%]"
        />
      </div>

    </motion.div>
  );
}