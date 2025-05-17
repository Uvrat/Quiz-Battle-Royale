import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import HomepageBackground from '../components/HomepageBackground';
import { API_URL } from '../utils/vars';

interface Arena {
  id: string;
  title: string;
  description: string;
  creator: {
    username: string;
  };
  _count: {
    questions: number;
    participations: number;
  };
  createdAt: string;
}

export default function Home() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const response = await axios.get(`${API_URL}/arenas`);
        setArenas(response.data);
      } catch (err) {
        console.error('Error fetching arenas:', err);
        setError('Failed to load arenas');
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, []);

  return (
    <Layout>
      <HomepageBackground />
      
      <div className="text-center mb-12 animate-fade-in relative">
        <h1 className="text-4xl font-bold mb-4 font-poppins">Welcome to Quiz Battle Royale</h1>
        <p className="text-xl text-gray-700 dark:text-dark-subText max-w-2xl mx-auto font-inter">
          Test your knowledge, challenge others, and climb the leaderboards in this real-time quiz competition platform.
        </p>
        
        {isAuthenticated ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/create-arena"
              className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-lg text-lg inline-block hover-scale rainbow-btn"
            >
              Create Your Arena
            </Link>
            <Link
              to="/my-arenas"
              className="bg-secondary hover:bg-amber-600 dark:bg-dark-secondary dark:hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg text-lg inline-block hover-scale rainbow-btn"
            >
              My Arenas
            </Link>
            <Link
              to="/arenas"
              className="bg-white dark:bg-black border-2 border-primary dark:border-dark-primary hover:bg-gray-50 dark:hover:bg-gray-900 text-primary dark:text-dark-primary font-bold py-3 px-6 rounded-lg text-lg inline-block hover-scale rainbow-btn"
            >
              Explore All Arenas
            </Link>
          </div>
        ) : (
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register"
              className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-lg text-lg inline-block mr-4 hover-scale rainbow-btn"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-secondary hover:bg-amber-600 dark:bg-dark-secondary dark:hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg text-lg inline-block hover-scale rainbow-btn"
            >
              Login
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-poppins">Active Arenas</h2>
          <Link 
            to="/arenas" 
            className="text-primary dark:text-dark-primary hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 hover-scale"
          >
            View all arenas
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-dark-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-dark-subText">Loading arenas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded animate-fade-in">
            {error}
          </div>
        ) : arenas.length === 0 ? (
          <div className="text-center py-8 bg-gray-100 dark:bg-black rounded-lg animate-fade-in">
            <p className="text-gray-600 dark:text-gray-300">No active arenas available at the moment.</p>
            {isAuthenticated && (
              <Link to="/create-arena" className="text-primary dark:text-dark-primary hover:text-blue-700 dark:hover:text-blue-300 font-semibold block mt-2">
                Create the first arena
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-list">
            {arenas.slice(0, 3).map((arena) => (
              <div key={arena.id} className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animate-slide-up transition-all duration-300 animated-card feature-card">
                <h3 className="text-xl font-bold mb-2 text-primary dark:text-dark-primary font-poppins">{arena.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 font-inter">
                  {arena.description || 'No description provided'}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <p>Created by: {arena.creator.username}</p>
                  <p>Questions: {arena._count.questions}</p>
                  <p>Participants: {arena._count.participations}</p>
                </div>
                <Link
                  to={`/arena/${arena.id}`}
                  className="block w-full text-center bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn"
                >
                  Join Arena
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl font-bold mb-4 font-poppins">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 stagger-list">
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow dark:shadow-white-md hover-shadow animate-slide-up animated-card feature-card">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 h-16 w-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-4 animate-pulse-scale">1</div>
            <h3 className="text-xl font-bold mb-2 font-poppins">Create an Arena</h3>
            <p className="text-gray-600 dark:text-gray-300 font-inter">Create a quiz with your own questions and set time limits for each answer.</p>
          </div>
          
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow dark:shadow-white-md hover-shadow animate-slide-up animated-card feature-card">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 h-16 w-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-4 animate-pulse-scale">2</div>
            <h3 className="text-xl font-bold mb-2 font-poppins">Invite Players</h3>
            <p className="text-gray-600 dark:text-gray-300 font-inter">Share the arena link with friends or let anyone join your public quiz.</p>
          </div>
          
          <div className="bg-white dark:bg-black p-6 rounded-lg shadow dark:shadow-white-md hover-shadow animate-slide-up animated-card feature-card">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 h-16 w-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-4 animate-pulse-scale">3</div>
            <h3 className="text-xl font-bold mb-2 font-poppins">Compete in Real-time</h3>
            <p className="text-gray-600 dark:text-gray-300 font-inter">Answer quickly for more points! See the leaderboard update in real-time.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 