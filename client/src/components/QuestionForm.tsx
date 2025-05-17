import { useState, useEffect } from 'react';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface QuestionFormProps {
  questionId?: string;
  initialData?: {
    questionText: string;
    options: Option[];
    timeLimit: number;
    points: number;
  };
  onSubmit: (questionData: {
    questionText: string;
    options: Option[];
    correctOption: number;
    timeLimit: number;
    points: number;
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
  successMessage?: string;
}

export default function QuestionForm({
  questionId,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  successMessage = ''
}: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.questionText);
      setOptions(initialData.options);
      setTimeLimit(initialData.timeLimit);
      setPoints(initialData.points);
    }
  }, [initialData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      // Make sure we still have a correct option
      let newOptions = options.filter((_, i) => i !== index);
      const hasCorrectOption = newOptions.some(option => option.isCorrect);
      
      if (!hasCorrectOption) {
        newOptions[0].isCorrect = true;
      }
      
      setOptions(newOptions);
    } else {
      setError('A question must have at least 2 options');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!questionText.trim()) {
      return setError('Question text is required');
    }

    if (options.some(option => !option.text.trim())) {
      return setError('All options must have text');
    }

    const correctOptionIndex = options.findIndex(option => option.isCorrect);
    if (correctOptionIndex === -1) {
      return setError('You must select a correct option');
    }

    if (timeLimit < 5) {
      return setError('Time limit must be at least 5 seconds');
    }

    if (points < 1) {
      return setError('Points must be at least 1');
    }

    onSubmit({
      questionText,
      options,
      correctOption: correctOptionIndex,
      timeLimit,
      points
    });
  };

  return (
    <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md dark:shadow-white-md hover-shadow animated-card">
      <h2 className="text-2xl font-bold mb-4 dark:text-dark-textColor">{questionId ? 'Edit Question' : 'Add New Question'}</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="questionText">
            Question
          </label>
          <textarea
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
            id="questionText"
            rows={2}
            placeholder="Enter your question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Answer Options
          </label>
          
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="radio"
                name="correctOption"
                checked={option.isCorrect}
                onChange={() => handleCorrectOptionChange(index)}
                className="mr-2 accent-primary dark:accent-dark-primary"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-grow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
          
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-300 text-sm"
            >
              + Add Another Option
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="timeLimit">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              id="timeLimit"
              min={5}
              max={120}
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="points">
              Points
            </label>
            <input
              type="number"
              id="points"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-textColor dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2 hover-scale rainbow-btn"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading 
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : 'bg-primary hover:bg-blue-600 dark:bg-dark-primary dark:hover:bg-blue-900 hover-scale'
            } text-white font-bold py-2 px-4 rounded rainbow-btn flex items-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              questionId ? 'Update Question' : 'Add Question'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 