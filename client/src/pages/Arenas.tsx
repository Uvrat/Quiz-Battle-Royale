import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
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

export default function Arenas() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

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

  const filteredArenas = arenas
    .filter(arena => 
      arena.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      arena.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b._count.participations - a._count.participations;
      }
    });

  return (
    <Layout>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-4 font-poppins relative">
          <span className="relative z-10">
            Battle Arenas
            <span className="absolute -bottom-1 left-0 w-full h-2 bg-secondary opacity-30 transform -skew-x-12"></span>
          </span>
        </h1>
        <p className="text-gray-700 dark:text-dark-subText font-inter">Challenge your knowledge and compete against others in these live quiz arenas!</p>
      </div>

      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg dark:shadow-white-lg mb-8 animate-slide-up animated-card" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search arenas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary hover-shadow transition-all duration-300"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary hover-shadow transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          {isAuthenticated && (
            <Link
              to="/create-arena"
              className="flex-shrink-0 bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 rainbow-btn"
            >
              Create Arena
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute top-0 left-0 h-full w-full border-4 border-t-primary dark:border-t-dark-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(100%-8px)] border-4 border-t-transparent border-r-secondary dark:border-r-dark-secondary border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-dark-subText font-inter">Loading battle arenas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded animate-shake">
          <p className="font-bold">Error!</p>
          <p>{error}</p>
        </div>
      ) : filteredArenas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-black rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 animate-fade-in">
          <svg className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-inter mb-4">No arenas found matching your search.</p>
          {isAuthenticated && (
            <Link to="/create-arena" className="text-primary dark:text-dark-primary hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-block hover-scale">
              Create your own arena &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-list">
          {filteredArenas.map((arena, index) => (
            <div 
              key={arena.id} 
              className="relative bg-white dark:bg-black rounded-lg overflow-hidden transition-all duration-300 group hover-shadow animate-slide-up animated-card"
              style={{ animationDelay: `${0.05 * (index % 10)}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-dark-primary/10 dark:to-secondary/10 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
              <div className="relative p-6">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary dark:bg-dark-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                <h3 className="text-xl font-bold mb-2 text-primary dark:text-dark-primary font-poppins group-hover:translate-x-1 transition-transform">{arena.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 font-inter">
                  {arena.description || 'No description provided'}
                </p>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>By: {arena.creator.username}</span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {arena._count.participations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm py-1 px-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {arena._count.questions} questions
                  </div>
                  <Link
                    to={`/arena/${arena.id}`}
                    className="relative overflow-hidden bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 group-hover:shadow-lg dark:group-hover:shadow-white-md hover-scale rainbow-btn"
                  >
                    <span className="relative z-10 ">Join Battle</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary dark:from-dark-primary dark:via-blue-800 dark:to-dark-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100"></span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
} 