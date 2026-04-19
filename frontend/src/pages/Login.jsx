import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { slideLeft } from "../animation";

export default function Login() {
  const navigate = useNavigate();

  return (
    <motion.div {...slideLeft} style={styles.container}>
      
      {}
      <div style={styles.left}>
        <img
          src="https://user8320.na.imgto.link/public/20260417/login.avif"
          style={styles.image}
        />
      </div>

      {}
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back!</h1>
        <p style={styles.subtitle}><b>Share food. Spread kindness.</b></p>

        <input placeholder="Email address" style={styles.input} />
        <input placeholder="Password" type="password" style={styles.input} />

        <button style={styles.button} onClick={() => navigate("/dashboard")}>
          Login
        </button>

        <p>
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </motion.div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", background: "#f5f0eb" },
  left: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center" },
  image: { width: "70%" },
  card: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#ff6600", fontSize: "42px" },
  subtitle: { marginBottom: "20px", color: "#555" },
  input: { margin: "10px", padding: "12px", width: "250px" },
  button: {
    background: "#ff6600",
    color: "#fff",
    padding: "12px",
    width: "250px",
    border: "none",
    borderRadius: "8px",
  },
};