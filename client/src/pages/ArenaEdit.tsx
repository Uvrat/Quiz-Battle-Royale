import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import QuestionForm from '../components/QuestionForm';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../utils/vars';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  options: string; // JSON string
  parsedOptions?: Option[];
  correctOption: number;
  timeLimit: number;
  points: number;
  order: number;
}

interface Arena {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  isActive: boolean;
}

export default function ArenaEdit() {
  const { id } = useParams<{ id: string }>();
  const [arena, setArena] = useState<Arena | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [arenaTitle, setArenaTitle] = useState('');
  const [arenaDescription, setArenaDescription] = useState('');
  const [editingArena, setEditingArena] = useState(false);
  const [savingArena, setSavingArena] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArenaAndQuestions = async () => {
      try {
        // Fetch arena details
        const arenaResponse = await axios.get(`${API_URL}/arenas/${id}`, {
          headers: {
            'x-auth-token': token
          }
        });
        setArena(arenaResponse.data);
        setArenaTitle(arenaResponse.data.title);
        setArenaDescription(arenaResponse.data.description || '');

        // Fetch questions
        const questionsResponse = await axios.get(`${API_URL}/questions/arena/${id}`, {
          headers: {
            'x-auth-token': token
          }
        });

        // Parse options for each question
        const questionsWithParsedOptions = questionsResponse.data.map((q: Question) => ({
          ...q,
          parsedOptions: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));

        setQuestions(questionsWithParsedOptions);
      } catch (err) {
        console.error('Error fetching arena data:', err);
        setError('Failed to load arena data');
      } finally {
        setLoading(false);
      }
    };

    fetchArenaAndQuestions();
  }, [id, token]);

  const handleUpdateArena = async () => {
    if (!arena) return;
    
    try {
      setSavingArena(true);
      const updatedArena = {
        title: arenaTitle,
        description: arenaDescription,
        isActive: arena.isActive
      };
      
      const response = await axios.put(
        `${API_URL}/arenas/${id}`,
        updatedArena,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      setArena(response.data);
      setEditingArena(false);
      setSavingArena(false);
    } catch (err) {
      console.error('Error updating arena:', err);
      setError('Failed to update arena details');
      setSavingArena(false);
    }
  };

  const handleAddQuestion = async (questionData: {
    questionText: string;
    options: Option[];
    correctOption: number;
    timeLimit: number;
    points: number;
  }) => {
    try {
      const newQuestion = {
        arenaId: id,
        questionText: questionData.questionText,
        options: questionData.options.map(o => o.text),
        correctOption: questionData.correctOption,
        timeLimit: questionData.timeLimit,
        points: questionData.points,
        order: questions.length
      };

      const response = await axios.post(
        `${API_URL}/questions`,
        newQuestion,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      // Add the new question to the list
      const addedQuestion = {
        ...response.data,
        parsedOptions: questionData.options
      };

      setQuestions([...questions, addedQuestion]);
      setShowQuestionForm(false);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (questionData: {
    questionText: string;
    options: Option[];
    correctOption: number;
    timeLimit: number;
    points: number;
  }) => {
    if (!editingQuestion) return;

    try {
      const updatedQuestion = {
        questionText: questionData.questionText,
        options: questionData.options.map(o => o.text),
        correctOption: questionData.correctOption,
        timeLimit: questionData.timeLimit,
        points: questionData.points,
        order: editingQuestion.order
      };

      const response = await axios.put(
        `${API_URL}/questions/${editingQuestion.id}`,
        updatedQuestion,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      // Update the question in the list
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...response.data, parsedOptions: questionData.options } 
          : q
      );

      setQuestions(updatedQuestions);
      setEditingQuestion(null);
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/questions/${questionId}`, {
        headers: {
          'x-auth-token': token
        }
      });

      // Remove the question from the list
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    }
  };

  const handleEditQuestion = (question: Question) => {
    const options = question.parsedOptions || Array.from({ length: 4 }, (_, i) => ({
      text: `Option ${i + 1}`,
      isCorrect: i === question.correctOption
    }));

    setEditingQuestion({
      ...question,
      parsedOptions: options
    });
  };

  const handleReorderQuestions = async (questionIds: string[]) => {
    try {
      await axios.post(
        `${API_URL}/questions/reorder`,
        {
          arenaId: id,
          questionOrder: questionIds
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      // Update question orders locally
      const updatedQuestions = [...questions];
      questionIds.forEach((questionId, index) => {
        const question = updatedQuestions.find(q => q.id === questionId);
        if (question) {
          question.order = index;
        }
      });

      // Sort questions by new order
      updatedQuestions.sort((a, b) => a.order - b.order);
      setQuestions(updatedQuestions);
    } catch (err) {
      console.error('Error reordering questions:', err);
      setError('Failed to reorder questions');
    }
  };

  // Move question up in order
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    
    const newQuestions = [...questions];
    const temp = newQuestions[index - 1];
    newQuestions[index - 1] = newQuestions[index];
    newQuestions[index] = temp;
    
    setQuestions(newQuestions);
    handleReorderQuestions(newQuestions.map(q => q.id));
  };

  // Move question down in order
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    
    const newQuestions = [...questions];
    const temp = newQuestions[index + 1];
    newQuestions[index + 1] = newQuestions[index];
    newQuestions[index] = temp;
    
    setQuestions(newQuestions);
    handleReorderQuestions(newQuestions.map(q => q.id));
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-dark-textColor">Edit Arena</h1>
          <div>
            <button
              onClick={() => navigate(`/arena/${id}`)}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2 transition-colors rainbow-btn"
            >
              Back to Arena
            </button>
          </div>
        </div>

        {/* Arena details section */}
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md mb-6 hover-shadow animated-card feature-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-dark-textColor">Arena Details</h2>
            {!editingArena && (
              <button
                onClick={() => setEditingArena(true)}
                className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded text-sm hover-scale rainbow-btn"
              >
                Edit Details
              </button>
            )}
          </div>

          {editingArena ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="arenaTitle">
                  Title
                </label>
                <input
                  type="text"
                  id="arenaTitle"
                  value={arenaTitle}
                  onChange={(e) => setArenaTitle(e.target.value)}
                  className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                  placeholder="Arena title"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="arenaDescription">
                  Description
                </label>
                <textarea
                  id="arenaDescription"
                  value={arenaDescription}
                  onChange={(e) => setArenaDescription(e.target.value)}
                  className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                  rows={3}
                  placeholder="Describe your arena"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setEditingArena(false)}
                  className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2 transition-colors hover-scale rainbow-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateArena}
                  disabled={savingArena}
                  className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded transition-colors hover-scale rainbow-btn flex items-center"
                >
                  {savingArena ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Details'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold dark:text-dark-textColor">{arena.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{arena.description || 'No description provided.'}</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Status: <span className={`font-medium ${arena.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {arena.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Questions section */}
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md mb-6 hover-shadow animated-card feature-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-dark-textColor">Questions ({questions.length})</h2>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionForm(true);
              }}
              className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded text-sm hover-scale rainbow-btn"
            >
              Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded">
              <p className="text-gray-500 dark:text-gray-400">No questions added yet. Add your first question to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold px-2 py-1 rounded-full mr-2">
                          Q{index + 1}
                        </span>
                        <h3 className="font-bold dark:text-dark-textColor">{question.questionText}</h3>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-4">Options: {question.options.length}</span>
                        <span className="mr-4">Time: {question.timeLimit}s</span>
                        <span>Points: {question.points}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex flex-col mr-4">
                        <button
                          onClick={() => moveQuestionUp(index)}
                          disabled={index === 0}
                          className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveQuestionDown(index)}
                          disabled={index === questions.length - 1}
                          className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${index === questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          ▼
                        </button>
                      </div>
                      <div className="flex">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question form */}
        {(showQuestionForm || editingQuestion) && (
          <QuestionForm
            questionId={editingQuestion?.id}
            initialData={editingQuestion ? {
              questionText: editingQuestion.questionText,
              options: editingQuestion.parsedOptions || [],
              timeLimit: editingQuestion.timeLimit,
              points: editingQuestion.points
            } : undefined}
            onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
            onCancel={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
} 