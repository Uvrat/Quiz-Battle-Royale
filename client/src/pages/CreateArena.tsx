import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function CreateArena() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/arenas',
        { title, description },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      // Navigate to the arena management page
      navigate(`/arena/${response.data.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create arena');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-dark-textColor">Create a New Quiz Arena</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
                id="title"
                type="text"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
                id="description"
                placeholder="Enter quiz description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                className="bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover-scale rainbow-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Arena'}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover-scale rainbow-btn"
                type="button"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg animated-card">
          <h2 className="text-lg font-semibold mb-2 dark:text-dark-textColor">What's Next?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            After creating your arena, you'll be able to add questions, set time limits, and customize your quiz settings.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Once your arena is ready, you can share it with others who can join and participate in real-time!
          </p>
        </div>
      </div>
    </Layout>
  );
} 