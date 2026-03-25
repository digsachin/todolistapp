import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Todos from './pages/Todos';
import Notes from './pages/Notes';
import { useAuth } from './hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { user } = useAuth();

  return (
    <div className={user ? "main-layout" : ""}>
      {user && <Sidebar />}
      
      <main className={user ? "content-area" : ""}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="todos"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Todos />
                  </motion.div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Notes />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
