import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateArena from './pages/CreateArena';
import ArenaDetails from './pages/ArenaDetails';
import ArenaEdit from './pages/ArenaEdit';
import ArenaPlay from './pages/ArenaPlay';
import Arenas from './pages/Arenas';
import MyArenas from './pages/MyArenas';
import './App.css';
import React from 'react';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/arenas" element={<Arenas />} />
        <Route path="/arena/:id" element={<ArenaDetails />} />
        
        {/* Protected routes */}
        <Route 
          path="/create-arena" 
          element={
            <ProtectedRoute>
              <CreateArena />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-arenas" 
          element={
            <ProtectedRoute>
              <MyArenas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/arena/:id/edit" 
          element={
            <ProtectedRoute>
              <ArenaEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/arena/:id/play" 
          element={
            <ProtectedRoute>
              <ArenaPlay />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent/>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
