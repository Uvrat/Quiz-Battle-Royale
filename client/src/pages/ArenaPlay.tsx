import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import QuestionForm from '../components/QuestionForm';

interface Option {
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
  timeLimit: number;
  order: number;
}

interface Participant {
  participationId?: string;
  userId: string;
  username: string;
  score: number;
  timeTaken: number;
  isCreator?: boolean;
}

interface Arena {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  creatorId?: string;
}

export default function ArenaPlay() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isCreator = searchParams.get('isCreator') === 'true';
  const mode = searchParams.get('mode') || 'play'; // 'host', 'active', or 'play' (default)
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [arena, setArena] = useState<Arena | null>(null);
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    points: number;
    totalScore: number;
  } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionAdded, setQuestionAdded] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to socket on mount
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Check if user is creator and redirect to host mode if necessary
    const checkCreator = async () => {
      if (!isCreator && id && user) {
        try {
          const response = await fetch(`http://localhost:5000/api/arenas/${id}`, {
            headers: {
              'x-auth-token': token
            }
          });
          const arenaData = await response.json();
          
          if (arenaData.creatorId === user.id) {
            // Redirect to host mode if user is creator but not in creator mode
            navigate(`/arena/${id}/play?isCreator=true&mode=host`);
            return true;
          }
        } catch (err) {
          console.error('Error checking creator status:', err);
        }
      }
      return false;
    };

    let redirecting = false;
    checkCreator().then(result => {
      redirecting = result;
      if (!redirecting) {
        const newSocket = io('http://localhost:5000', {
          auth: { token }
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          // Join arena
          newSocket.emit('join_arena', { 
            userId: user.id, 
            arenaId: id,
            isCreator,
            mode
          });
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError('Failed to connect to game server');
        });

        // Handle arena joined event
        newSocket.on('arena_joined', (data) => {
          setArena(data.arena);
          if (!data.isCreator) {
            setParticipationId(data.participationId);
          }
          setLoading(false);
        });

        // Handle user joined event
        newSocket.on('user_joined', (data) => {
          setParticipants(data.participants);
        });

        // Handle user left event
        newSocket.on('user_left', (data) => {
          setParticipants(data.participants);
        });

        // Handle question event
        newSocket.on('question', (data) => {
          setCurrentQuestion(data.question);
          setQuestionNumber(data.questionNumber);
          setTotalQuestions(data.totalQuestions);
          setTimeLeft(data.question.timeLimit);
          setSelectedOption(null);
          setAnswerSubmitted(false);
          setAnswerResult(null);
          setStartTime(Date.now());

          // Start timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        });

        // Handle answer submitted event
        newSocket.on('answer_submitted', (data) => {
          setAnswerResult(data);
          setAnswerSubmitted(true);
        });

        // Handle leaderboard update event
        newSocket.on('leaderboard_update', (data) => {
          setParticipants(data.participants);
        });

        // Handle quiz ended event
        newSocket.on('quiz_ended', (data) => {
          setQuizEnded(true);
          setCurrentQuestion(null);
          setParticipants(data.participants);
          
          // Complete participation if not creator
          if (participationId && !isCreator) {
            newSocket.emit('complete_participation', { participationId });
          }
        });

        // Handle question added event
        newSocket.on('question_added', (data) => {
          setAddingQuestion(false);
          if (data.success) {
            setQuestionAdded(true);
            // Hide message after a few seconds
            setTimeout(() => setQuestionAdded(false), 3000);
            setShowAddQuestion(false);
          }
        });

        // Handle error events
        newSocket.on('arena_error', (data) => {
          setError(data.message);
          setAddingQuestion(false);
        });

        newSocket.on('answer_error', (data) => {
          setError(data.message);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          newSocket.disconnect();
        };
      }
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, user, token, navigate, isCreator, participationId, mode]);

  // Auto-submit answer when time runs out
  useEffect(() => {
    if (timeLeft === 0 && currentQuestion && !answerSubmitted && participationId && !isCreator) {
      handleSubmitAnswer();
    }
  }, [timeLeft, currentQuestion, answerSubmitted, participationId, isCreator]);

  const handleOptionSelect = (index: number) => {
    if (!answerSubmitted && !isCreator) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (!socket || !currentQuestion || !participationId || isCreator) return;
    
    const timeTaken = Date.now() - startTime;
    
    socket.emit('submit_answer', {
      participationId,
      questionId: currentQuestion.id,
      selectedOption: selectedOption !== null ? selectedOption : -1, // -1 for no answer
      timeTaken
    });
    
    setAnswerSubmitted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleAddQuestion = (questionData: {
    questionText: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    correctOption: number;
    timeLimit: number;
    points: number;
  }) => {
    if (!socket || !user || !id || !isCreator) return;
    
    setAddingQuestion(true);
    socket.emit('add_live_question', {
      arenaId: id,
      userId: user.id,
      questionData
    });
  };

  const handleStartQuiz = () => {
    if (!socket || !arena || !isCreator) return;
    
    setStartingQuiz(true);
    socket.emit('start_quiz', {
      arenaId: arena.id
    });
  };

  // Render leaderboard component
  const renderLeaderboard = () => {
    return (
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card mt-4">
        <h3 className="text-xl font-semibold mb-4 dark:text-dark-textColor">Final Leaderboard</h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover-shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold dark:text-dark-textColor">Rank</th>
                <th className="py-3 px-4 text-left font-semibold dark:text-dark-textColor">Player</th>
                <th className="py-3 px-4 text-right font-semibold dark:text-dark-textColor">Score</th>
                <th className="py-3 px-4 text-right font-semibold dark:text-dark-textColor">Time</th>
              </tr>
            </thead>
            <tbody className="stagger-list">
              {participants
                .filter(p => !p.isCreator)
                .sort((a, b) => {
                  if (a.score !== b.score) return b.score - a.score;
                  return a.timeTaken - b.timeTaken;
                })
                .map((participant, index) => (
                  <tr key={participant.participationId || participant.userId} 
                      className={`border-t border-gray-200 dark:border-gray-700 animate-slide-in-right ${
                        participant.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      } hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 clickable`}>
                    <td className="py-3 px-4 font-medium dark:text-gray-300">
                      {index === 0 && <span className="text-yellow-500">🏆</span>}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && <span className="text-amber-600">🥉</span>}
                      {index > 2 && index + 1}
                    </td>
                    <td className="py-3 px-4 dark:text-gray-300">
                      {participant.username}
                      {participant.userId === user?.id && ' (You)'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium dark:text-gray-300">{participant.score}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {Math.round(participant.timeTaken / 1000)}s
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(`/arena/${id}`)}
            className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition-colors hover-scale rainbow-btn"
          >
            Back to Arena
          </button>
        </div>
      </div>
    );
  };

  // Render creator stats
  const renderCreatorStats = () => {
    return (
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card mt-4">
        <h3 className="text-xl font-semibold mb-4 dark:text-dark-textColor">Quiz Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {participants.filter(p => !p.isCreator).length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {participants.length > 0 
                ? Math.round(participants.filter(p => !p.isCreator).reduce((sum, p) => sum + p.score, 0) / 
                  participants.filter(p => !p.isCreator).length) 
                : 0}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Highest Score</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {participants.length > 0 
                ? Math.max(...participants.filter(p => !p.isCreator).map(p => p.score)) 
                : 0}
            </p>
          </div>
        </div>
        
        {renderLeaderboard()}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading arena data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      </Layout>
    );
  }

  if (!arena) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-700 dark:text-gray-300">Arena not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {arena && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animated-card feature-card mb-4">
            <div className="bg-primary dark:bg-dark-primary text-white p-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{arena.title}</h1>
                {isCreator && mode === 'host' && (
                  <div className="flex items-center">
                    <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-medium mr-2">Host Mode</span>
                    <button 
                      onClick={() => navigate(`/arena/${id}`)}
                      className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                    >
                      Exit Host Mode
                    </button>
                  </div>
                )}
                {isCreator && mode === 'active' && (
                  <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-medium">Quiz Active</span>
                )}
                {quizEnded && (
                  <span className="bg-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Quiz Ended</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Host Mode UI */}
          {isCreator && mode === 'host' && !quizEnded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Participants Panel */}
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animated-card feature-card mb-4">
                  <div className="bg-blue-600 dark:bg-blue-700 text-white p-3">
                    <h2 className="text-xl font-bold">Participants</h2>
                  </div>
                  <div className="p-4">
                    {participants.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400 text-center py-4">No participants yet</p>
                    ) : (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {participants.map((participant) => (
                          <li key={participant.userId} className="py-2 flex justify-between items-center">
                            <span className="dark:text-gray-300">
                              {participant.username}
                              {participant.isCreator && (
                                <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">Host</span>
                              )}
                            </span>
                            {participant.score > 0 && (
                              <span className="text-green-600 dark:text-green-400 font-medium">{participant.score} pts</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Controls Panel */}
                <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animated-card feature-card">
                  <div className="bg-green-600 dark:bg-green-700 text-white p-3">
                    <h2 className="text-xl font-bold">Quiz Controls</h2>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={() => navigate(`/arena/${id}/edit`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn mb-3"
                    >
                      Edit Questions
                    </button>
                    
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn mb-3"
                    >
                      Add Question
                    </button>
                    
                    <button
                      onClick={handleStartQuiz}
                      disabled={startingQuiz || totalQuestions === 0}
                      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition-colors duration-200 hover-scale rainbow-btn"
                    >
                      {startingQuiz ? 'Starting Quiz...' : 'Start Quiz Now'}
                    </button>
                    
                    {totalQuestions === 0 && (
                      <p className="text-orange-600 dark:text-orange-400 text-sm mt-2">You need to add questions before starting the quiz.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right panel - either Add Question form or view questions */}
              <div className="md:col-span-2">
                {showAddQuestion ? (
                  <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animated-card feature-card">
                    <div className="bg-purple-600 dark:bg-purple-700 text-white p-3 flex justify-between items-center">
                      <h2 className="text-xl font-bold">Add New Question</h2>
                      <button 
                        onClick={() => setShowAddQuestion(false)}
                        className="text-white hover:text-gray-200"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="p-4">
                      <QuestionForm
                        onSubmit={handleAddQuestion}
                        loading={addingQuestion}
                        successMessage={questionAdded ? "Question added successfully!" : ""}
                        onCancel={() => setShowAddQuestion(false)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-black rounded-lg shadow-md dark:shadow-white-md overflow-hidden hover-shadow animated-card feature-card">
                    <div className="bg-blue-600 dark:bg-blue-700 text-white p-3">
                      <h2 className="text-xl font-bold">Arena Details</h2>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{arena.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{arena.questionCount || totalQuestions || 0}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{participants.length}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Share the arena URL with others to invite them to join your quiz!
                      </p>
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded flex justify-between items-center">
                        <code className="text-sm dark:text-gray-300 overflow-hidden text-ellipsis">
                          {window.location.origin}/arena/{id}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/arena/${id}`);
                            // Show copy notification logic would go here
                          }}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Quiz ended UI for creator */}
          {isCreator && quizEnded && renderCreatorStats()}
          
          {/* Active quiz or participant UI */}
          {(!isCreator && mode !== 'host') && (
            <>
              {quizEnded ? (
                <div className="max-w-4xl mx-auto mt-4 animate-fade-in">
                  <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card">
                    <h2 className="text-2xl font-bold mb-4 text-center dark:text-dark-textColor">
                      Quiz Completed!
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      Thank you for participating in the quiz.
                    </p>
                    
                    {renderLeaderboard()}
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="max-w-4xl mx-auto mt-4 animate-fade-in">
                  <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card">
                    <div className="flex justify-between items-center mb-4 animate-slide-up">
                      <div>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold px-2 py-1 rounded-full">
                          Question {questionNumber} of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${timeLeft < 5 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}>
                          Time: {timeLeft}s
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-6 animate-slide-up dark:text-dark-textColor" style={{ animationDelay: '0.1s' }}>{currentQuestion.questionText}</h2>
                    
                    <div className="space-y-3 mb-6 stagger-list animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(index)}
                          disabled={answerSubmitted}
                          className={`w-full text-left p-4 rounded-lg border animate-slide-in-right clickable ${
                            answerSubmitted
                              ? index === selectedOption
                                ? answerResult?.isCorrect
                                  ? 'bg-green-100 dark:bg-green-900/50 border-green-500 dark:border-green-700'
                                  : 'bg-red-100 dark:bg-red-900/50 border-red-500 dark:border-red-700'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              : selectedOption === index
                              ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 dark:border-blue-700 hover-shadow dark:text-gray-200'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover-shadow dark:text-gray-300'
                          } transition-all duration-200`}
                        >
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full mr-3 flex items-center justify-center ${
                              selectedOption === index ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {answerSubmitted ? (
                      <div className={`p-4 rounded-lg mb-6 animate-fade-in ${
                        answerResult?.isCorrect ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      }`}>
                        <div className="font-bold">
                          {answerResult?.isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Answer!'}
                        </div>
                        <div>
                          Points: {answerResult?.points} | Total Score: {answerResult?.totalScore}
                        </div>
                        <div className="text-sm mt-1">
                          Waiting for next question...
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null}
                        className={`w-full py-3 px-4 rounded-lg font-bold animate-slide-up rainbow-btn ${
                          selectedOption === null
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-dark-primary dark:hover:bg-blue-900 text-white hover-scale'
                        } transition-all duration-200`}
                        style={{ animationDelay: '0.4s' }}
                      >
                        Submit Answer
                      </button>
                    )}
                    
                    <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                      <h3 className="text-lg font-semibold mb-2 dark:text-dark-textColor">Leaderboard</h3>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover-shadow">
                        <table className="min-w-full">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="py-2 px-4 text-left dark:text-dark-textColor">Rank</th>
                              <th className="py-2 px-4 text-left dark:text-dark-textColor">Player</th>
                              <th className="py-2 px-4 text-right dark:text-dark-textColor">Score</th>
                            </tr>
                          </thead>
                          <tbody className="stagger-list">
                            {participants
                              .filter(p => !p.isCreator)
                              .sort((a, b) => {
                                if (a.score !== b.score) return b.score - a.score;
                                return a.timeTaken - b.timeTaken;
                              })
                              .map((participant, index) => (
                                <tr key={participant.participationId || participant.userId} className={`border-t border-gray-200 dark:border-gray-700 animate-slide-in-right ${
                                  participant.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                } hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 clickable`}>
                                  <td className="py-2 px-4 dark:text-gray-300">{index + 1}</td>
                                  <td className="py-2 px-4 dark:text-gray-300">
                                    {participant.username}
                                    {participant.userId === user?.id && ' (You)'}
                                  </td>
                                  <td className="py-2 px-4 text-right dark:text-gray-300">{participant.score}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto mt-4 animate-fade-in">
                  <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card">
                    <h1 className="text-2xl font-bold mb-6 animate-slide-up dark:text-dark-textColor">Waiting for Quiz to Start</h1>
                    
                    {arena && (
                      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-xl font-semibold mb-2 dark:text-dark-textColor">{arena.title}</h2>
                        <p className="text-gray-600 dark:text-gray-300">{arena.description}</p>
                        <p className="mt-2 dark:text-dark-textColor">Questions: {arena.questionCount}</p>
                      </div>
                    )}
                    
                    <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      <h3 className="text-lg font-semibold mb-2 dark:text-dark-textColor">Participants ({participants.length})</h3>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {participants.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400">No participants yet</p>
                        ) : (
                          <ul className="space-y-1 stagger-list">
                            {participants.map(participant => (
                              <li key={participant.participationId || participant.userId} className="animate-slide-in-right clickable hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-md transition-colors duration-200 dark:text-gray-300">
                                {participant.username} 
                                {participant.userId === user?.id && ' (You)'}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center text-gray-600 dark:text-gray-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                      <p>Please wait for the quiz creator to start the quiz...</p>
                      <div className="mt-4 animate-pulse-scale">
                        <div className="bg-blue-100 dark:bg-blue-900 inline-block p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}