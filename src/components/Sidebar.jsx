import { NavLink } from "react-router-dom";
import { CheckSquare, StickyNote, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar glass"
    >
      <div className="sidebar-header">
        <div className="user-profile">
          <img src={user?.photoURL} alt={user?.displayName} className="avatar" />
          <div className="user-info">
            <span className="user-name">{user?.displayName}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Todos</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <StickyNote size={20} />
          <span>Notes</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
