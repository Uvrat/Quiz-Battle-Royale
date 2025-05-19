import { useState, type ReactNode } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Helper to close menu on navigation
  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-background text-textColor dark:text-dark-textColor font-poppins transition-colors duration-200 relative">
      <BackgroundPatterns />

      <header className="bg-primary dark:bg-dark-primary text-white shadow-md dark:shadow-white-md relative z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold" onClick={handleNavClick}>
            Quiz Battle Royale
          </Link>

          {/* Hamburger Button (shows on small screens) */}
          <button
            className="md:hidden block text-white focus:outline-none"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              // X icon
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Navigation Links */}
          <nav
            className={`
              ${isMenuOpen ? 'flex' : 'hidden'}
              md:flex flex-col md:flex-row items-start md:items-center gap-4
              absolute md:static top-full left-0 w-full md:w-auto bg-primary dark:bg-dark-primary md:bg-transparent z-20
              transition-all duration-200
              px-4 md:px-0 py-4 md:py-0
            `}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/arenas"
                  onClick={handleNavClick}
                  className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors w-full md:w-auto py-2 md:py-0"
                >
                  Arenas
                </Link>
                <Link
                  to="/my-arenas"
                  onClick={handleNavClick}
                  className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors w-full md:w-auto py-2 md:py-0"
                >
                  My Arenas
                </Link>
                <Link
                  to="/create-arena"
                  onClick={handleNavClick}
                  className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors w-full md:w-auto py-2 md:py-0"
                >
                  Create Arena
                </Link>
                <div className="flex justify-between items-center ml-0 md:ml-4 w-full md:w-auto py-2 md:py-0">
                  <span className="mr-2">Welcome, {user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-600 dark:bg-blue-900 px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors hover-scale rainbow-btn ml-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors w-full md:w-auto py-2 md:py-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors w-full md:w-auto py-2 md:py-0"
                >
                  Register
                </Link>
              </>
            )}
            {/* Theme toggle always visible */}
            <div className="w-full items-end ml-0 md:ml-2 mt-2 md:mt-0">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 relative z-10">
        {children}
      </main>

      <footer className="bg-blue-800 dark:bg-blue-900 text-white py-4 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Quiz Battle Royale. Test your knowledge and beat the competition!</p>
        </div>
      </footer>
    </div>
  );
}
