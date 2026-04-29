import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CurriculumQuiz() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    try {
      const response = await api.get('/curriculum/structure');
      const curriculum = response.data;

      // Flatten courses from all semesters
      const allCourses = [];
      Object.keys(curriculum.courses).forEach(semester => {
        curriculum.courses[semester].forEach(course => {
          allCourses.push({
            ...course,
            semester
          });
        });
      });
      setCourses(allCourses);
    } catch (error) {
      console.error('Failed to load curriculum:', error);
    }
  };

  const startGame = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      const response = await api.post('/curriculum/ai/game/start', {
        courseCode: selectedCourse,
        questionCount: 10,
        timeLimit: 30
      });

      setGame(response.data.game);
      setGameStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !game) return;

    try {
      const response = await api.post('/curriculum/ai/game/answer', {
        gameId: game.id,
        questionId: game.questions[currentQuestion].id,
        answer: selectedAnswer,
        timeSpent: 30 // Mock time spent
      });

      if (response.data.correct) {
        setScore(prev => prev + response.data.points);
      }

      // Move to next question or end game
      if (currentQuestion < game.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
      } else {
        // End game
        endGame();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const endGame = async () => {
    try {
      const response = await api.post('/curriculum/ai/game/end', {
        gameId: game.id
      });

      setResults(response.data);
      setGameStarted(false);
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  const resetGame = () => {
    setGame(null);
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setScore(0);
    setResults(null);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {results.percentage}%
            </div>
            <p className="text-lg text-gray-600 mb-6">
              You scored {results.correctAnswers} out of {results.totalQuestions} questions
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Final Score: {results.finalScore} points</p>
            </div>
            <button
              onClick={resetGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameStarted && game) {
    const question = game.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {game.questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                Score: {score}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {question.question}
              </h2>

              <div className="space-y-3">
                {Object.entries(question.options).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={key}
                      checked={selectedAnswer === key}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{key}. {value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(prev => prev - 1);
                    setSelectedAnswer('');
                  }
                }}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === game.questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            NMCN Curriculum Quiz
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Answer 10 AI-generated questions based on the selected course</li>
              <li>• Each correct answer earns 10 points</li>
              <li>• Questions are aligned with NMCN curriculum standards</li>
              <li>• Test your knowledge and track your progress</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            disabled={!selectedCourse || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              'Start Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}