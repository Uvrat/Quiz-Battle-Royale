import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import BackgroundPatterns from './BackgroundPatterns';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-background text-textColor dark:text-dark-textColor font-poppins transition-colors duration-200 relative">
      <BackgroundPatterns />
      
      <header className="bg-primary dark:bg-dark-primary text-white shadow-md dark:shadow-white-md relative z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Quiz Battle Royale</Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/arenas" className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors">Arenas</Link>
                <Link to="/my-arenas" className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors">My Arenas</Link>
                <Link to="/create-arena" className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors">Create Arena</Link>
                <div className="flex items-center ml-4">
                  <span className="mr-2">Welcome, {user?.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-blue-600 dark:bg-blue-900 px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors hover-scale rainbow-btn"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors">Register</Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 relative z-10">
        {children}
      </main>
      
      <footer className="bg-blue-800 dark:bg-blue-900 text-white py-4 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 Quiz Battle Royale. Test your knowledge and beat the competition!</p>
        </div>
      </footer>
    </div>
  );
} 