import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { loginWithGoogle, user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass login-card"
      >
        <h1>Antigravity Tasks</h1>
        <p>Sync your productivity across the cloud</p>
        
        <button onClick={loginWithGoogle} className="add-btn google-login">
          <LogIn size={20} />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
