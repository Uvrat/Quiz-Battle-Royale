import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../utils/vars';

interface Arena {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  _count: {
    questions: number;
    participations: number;
  };
  createdAt: string;
}

export default function MyArenas() {
  const [myArenas, setMyArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [enteringAsHost, setEnteringAsHost] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyArenas = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/arenas/user/created`, {
          headers: { 'x-auth-token': token }
        });
        setMyArenas(response.data);
      } catch (err) {
        console.error('Error fetching arenas:', err);
        setError('Failed to load your arenas');
      } finally {
        setLoading(false);
      }
    };

    fetchMyArenas();
  }, [token, navigate]);

  const handleDeleteArena = async (arenaId: string) => {
    if (!token) return;
    
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/arenas/${arenaId}`, {
        headers: { 'x-auth-token': token }
      });
      setMyArenas(myArenas.filter(arena => arena.id !== arenaId));
    } catch (err) {
      console.error('Error deleting arena:', err);
      setError('Failed to delete arena');
    } finally {
      setDeleteConfirm(null);
      setActionLoading(false);
    }
  };

  const handleStartArena = async (arenaId: string) => {
    if (!token) return;
    
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/arenas/${arenaId}/start`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state to reflect the change
      setMyArenas(myArenas.map(arena => 
        arena.id === arenaId ? { ...arena, isActive: true } : arena
      ));
      
      // Navigate to the arena page to monitor it
      navigate(`/arena/${arenaId}`);
    } catch (err) {
      console.error('Error starting arena:', err);
      setError('Failed to start arena');
      setActionLoading(false);
    }
  };

  const handleEnterAsHost = (arenaId: string) => {
    setEnteringAsHost(arenaId);
    navigate(`/arena/${arenaId}/play?isCreator=true&mode=host`);
  };

  return (
    <Layout>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-4 font-poppins relative">
          <span className="relative z-10">
            My Battle Arenas
            <span className="absolute -bottom-1 left-0 w-full h-2 bg-secondary opacity-30 transform -skew-x-12"></span>
          </span>
        </h1>
        <p className="text-gray-700 dark:text-dark-subText font-inter">Manage your quiz arenas and track participant performance</p>
      </div>

      <div className="mb-8 flex justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-4">
          <Link 
            to="/create-arena"
            className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg dark:hover:shadow-white-md flex items-center gap-2 rainbow-btn"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Arena
          </Link>
          <Link 
            to="/arenas"
            className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 font-medium py-2 px-6 rounded-lg transition-all duration-300 hover-shadow flex items-center gap-2 rainbow-btn"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Arenas
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute top-0 left-0 h-full w-full border-4 border-t-primary dark:border-t-dark-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(100%-8px)] border-4 border-t-transparent border-r-secondary dark:border-r-dark-secondary border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-dark-subText font-inter">Loading your arenas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded animate-fade-in">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
        </div>
      ) : myArenas.length === 0 ? (
        <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg dark:shadow-white-lg text-center animate-fade-in animated-card feature-card">
          <div className="bg-blue-100 dark:bg-blue-900 inline-block p-4 rounded-full mb-4">
            <svg className="h-12 w-12 text-primary dark:text-dark-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 font-poppins">You haven't created any arenas yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 font-inter">Create your first quiz arena and challenge friends to battle!</p>
          <Link
            to="/create-arena"
            className="inline-block bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-scale animate-pulse-scale rainbow-btn"
          >
            Create Your First Arena
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 stagger-list">
          {myArenas.map((arena, index) => (
            <div 
              key={arena.id} 
              className="relative bg-white dark:bg-black rounded-lg overflow-hidden shadow-md dark:shadow-white-md transition-all duration-300 animate-slide-up animated-card feature-card"
              style={{ animationDelay: `${0.05 * (index % 10)}s` }}
            >
              {deleteConfirm === arena.id && (
                <div className="absolute inset-0 bg-gray-900/80 z-20 flex items-center justify-center animate-fade-in">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4 animate-slide-up dark:shadow-white-sm">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">Delete Arena?</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Are you sure you want to delete "{arena.title}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        disabled={actionLoading}
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors rainbow-btn"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDeleteArena(arena.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 rainbow-btn"
                      >
                        {actionLoading ? (
                          <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg> Deleting...</>
                        ) : (
                          'Delete Arena'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-primary dark:text-dark-primary font-poppins group-hover:translate-x-1 transition-transform">{arena.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      arena.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {arena.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4 font-inter">
                    {arena.description || 'No description provided'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-primary dark:text-dark-primary">{arena._count.questions}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-secondary dark:text-dark-secondary">{arena._count.participations}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(arena.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-6 flex flex-col justify-center gap-3 md:w-56">
                  <Link
                    to={`/arena/${arena.id}/edit`}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors hover-shadow dark:hover:shadow-white-sm rainbow-btn"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Arena
                  </Link>
                  
                  <Link
                    to={`/arena/${arena.id}/questions`}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors hover-shadow dark:hover:shadow-white-sm rainbow-btn"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Manage Questions
                  </Link>
                  
                  <button
                    onClick={() => handleEnterAsHost(arena.id)}
                    disabled={enteringAsHost === arena.id}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-colors hover-shadow dark:hover:shadow-white-sm rainbow-btn"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {enteringAsHost === arena.id ? 'Entering...' : 'Enter as Host'}
                  </button>
                  
                  <button
                    onClick={() => arena.isActive ? null : handleStartArena(arena.id)}
                    disabled={arena.isActive || actionLoading}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors hover-shadow dark:hover:shadow-white-sm rainbow-btn ${
                      arena.isActive
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white cursor-pointer'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {arena.isActive ? 'Already Active' : 'Start Quiz'}
                  </button>
                  
                  <button
                    onClick={() => setDeleteConfirm(arena.id)}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-black hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium py-2 px-4 rounded-lg transition-colors hover-shadow dark:hover:shadow-white-sm rainbow-btn"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Arena
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
} 