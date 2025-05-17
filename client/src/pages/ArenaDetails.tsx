import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import ArenaBackground from '../components/ArenaBackground';
import { API_URL, SOCKET_URL } from '../utils/vars';

interface Arena {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    username: string;
  };
  questions: Array<{
    id: string;
    questionText: string;
    options: string;
    timeLimit: number;
    points: number;
    order: number;
  }>;
  participations: Array<{
    id: string;
    user: {
      username: string;
    };
    totalScore: number;
    totalTimeTaken: number;
  }>;
  createdAt: string;
}

export default function ArenaDetails() {
  const { id } = useParams<{ id: string }>();
  const [arena, setArena] = useState<Arena | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [participants, setParticipants] = useState<Array<{ userId: string; username: string; }>>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [enteringAsHost, setEnteringAsHost] = useState(false);

  useEffect(() => {
    const fetchArena = async () => {
      try {
        const response = await axios.get(`${API_URL}/arenas/${id}`);
        setArena(response.data);
      } catch (err) {
        console.error('Error fetching arena:', err);
        setError('Failed to load arena details');
      } finally {
        setLoading(false);
      }
    };

    fetchArena();
    
    // Connect to Socket.io if authenticated
    if (isAuthenticated && token && user) {
      const newSocket = io(SOCKET_URL, {
        auth: { token }
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        
        // Join arena as spectator or creator
        newSocket.emit('join_arena', { userId: user.id, arenaId: id });
      });
      
      newSocket.on('user_joined', (data) => {
        setParticipants(data.participants);
      });
      
      newSocket.on('user_left', (data) => {
        setParticipants(data.participants);
      });
      
      newSocket.on('arena_error', (data) => {
        setError(data.message);
        setStartingQuiz(false);
      });
      
      socketRef.current = newSocket;
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [id, isAuthenticated, token, user]);

  const handleJoinArena = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Prevent creators from joining their own arenas as participants
    if (isCreator) {
      handleEnterAsHost();
      return;
    }

    setJoining(true);
    navigate(`/arena/${id}/play`);
  };

  const handleEnterAsHost = () => {
    if (!isAuthenticated || !isCreator) {
      return;
    }

    setEnteringAsHost(true);
    navigate(`/arena/${id}/play?isCreator=true&mode=host`);
  };

  const handleEditArena = () => {
    navigate(`/arena/${id}/edit`);
  };
  
  const handleStartQuiz = () => {
    if (!socketRef.current || !user || !id) return;
    
    setStartingQuiz(true);
    // Emit socket event to start the quiz
    socketRef.current.emit('start_quiz', { arenaId: id, userId: user.id });
    // Navigate to play view for the creator
    navigate(`/arena/${id}/play?isCreator=true&mode=active`);
  };
  
  const handleDeleteArena = async () => {
    if (!token || !id) return;
    
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/arenas/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      // Redirect to home page after successful deletion
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete arena');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isCreator = user && arena?.creator.id === user.id;

  return (
    <Layout>
      <ArenaBackground />
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-dark-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-subText">Loading arena details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded animate-fade-in">
          {error}
        </div>
      ) : arena ? (
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white dark:bg-dark-cardBg rounded-lg p-8 max-w-md animate-slide-up shadow-xl dark:shadow-white-lg animated-card feature-card">
                <h2 className="text-2xl font-bold mb-4 dark:text-dark-textColor">Confirm Deletion</h2>
                <p className="mb-6 dark:text-dark-subText">Are you sure you want to delete the arena "{arena.title}"? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">                    
                  <button                       
                    onClick={() => setShowDeleteConfirm(false)}                      
                    disabled={deleting}                      
                    className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn"                    
                  >                      
                    Cancel                    
                  </button>                    
                  <button                       
                    onClick={handleDeleteArena}                      
                    disabled={deleting}                      
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn"                    
                  >                      
                    {deleting ? 'Deleting...' : 'Delete'}                    
                  </button>                  
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animate-slide-up animated-card feature-card">
            <div className="bg-primary dark:bg-dark-primary text-white p-6">
              <h1 className="text-3xl font-bold">{arena.title}</h1>
              <p className="mt-2">Created by: {arena.creator.username}</p>
            </div>
            
            <div className="p-6 dark:bg-black">
              <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold mb-2 dark:text-dark-textColor">Description</h2>
                <p className="text-gray-700 dark:text-gray-300">{arena.description || 'No description provided'}</p>
              </div>
              
              <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-bold mb-2 dark:text-dark-textColor">Quiz Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg hover-shadow hover-scale clickable animated-card">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Questions</p>
                    <p className="text-2xl font-bold dark:text-dark-primary">{arena.questions.length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg hover-shadow hover-scale clickable animated-card">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Participants</p>
                    <p className="text-2xl font-bold dark:text-dark-primary">{participants.length || arena.participations.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Current Participants Section (only shown when socket is connected) */}
              {isAuthenticated && participants.length > 0 && (
                <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <h2 className="text-xl font-bold mb-4 dark:text-dark-textColor">Current Participants</h2>
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg hover-shadow animated-card">
                    <ul className="divide-y divide-blue-100 dark:divide-blue-800 stagger-list">
                      {participants.map((participant) => (
                        <li key={participant.userId} className="py-2 animate-slide-in-right clickable dark:text-gray-300">
                          {participant.username}
                          {participant.userId === user?.id && ' (You)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {arena.participations.length > 0 && (
                <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-xl font-bold mb-4 dark:text-dark-textColor">Leaderboard</h2>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover-shadow animated-card">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="py-2 px-4 text-left dark:text-dark-textColor">Rank</th>
                          <th className="py-2 px-4 text-left dark:text-dark-textColor">Player</th>
                          <th className="py-2 px-4 text-right dark:text-dark-textColor">Score</th>
                          <th className="py-2 px-4 text-right dark:text-dark-textColor">Time</th>
                        </tr>
                      </thead>
                      <tbody className="stagger-list">
                        {arena.participations.map((participation, index) => (
                          <tr key={participation.id} className="border-t border-gray-200 dark:border-gray-700 animate-slide-in-right hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 clickable">
                            <td className="py-2 px-4 dark:text-gray-300">{index + 1}</td>
                            <td className="py-2 px-4 dark:text-gray-300">{participation.user.username}</td>
                            <td className="py-2 px-4 text-right dark:text-gray-300">{participation.totalScore}</td>
                            <td className="py-2 px-4 text-right dark:text-gray-300">
                              {(participation.totalTimeTaken / 1000).toFixed(1)}s
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between animate-slide-up" style={{ animationDelay: '0.5s' }}>
                {isCreator ? (
                  <div className="space-x-3">
                    <button
                      onClick={handleEditArena}                      
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                    >
                      Edit Arena
                    </button>
                    <button
                      onClick={handleEnterAsHost}
                      disabled={enteringAsHost}
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                    >
                      {enteringAsHost ? 'Entering...' : 'Enter as Host'}
                    </button>
                    {arena.questions.length > 0 && (
                      <button
                        onClick={handleStartQuiz}
                        disabled={startingQuiz}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                      >
                        {startingQuiz ? 'Starting Quiz...' : 'Start Quiz'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                    >
                      Delete Arena
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinArena}
                    disabled={joining}
                    className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                  >
                    {joining ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </span>
                    ) : 'Join Quiz'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/arenas')}
                  className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors duration-200 hover-scale rainbow-btn"
                >
                  Back to Arenas
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-xl text-gray-700 dark:text-gray-300">Arena not found</p>
        </div>
      )}
    </Layout>
  );
} 