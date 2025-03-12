import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../../../services/users/user';
import { fetchQuizData } from '../../../services/quiz/QuizService';
import { Clock, ArrowRight, Check, X, Trophy, Award, Calendar } from 'lucide-react';


// getuserProfile 
// {
//     "status": 200,
//     "data": {
//         "_id": "67c3b2c58ff3d5299c399e34",
//         "name": "pankaj",
//         "email": "admin@gmail.com",
//         "role": "USER",
//         "interests": [],
//         "assessmentCreated": [
//             "67c3c0089a6aed07cfb5e9e0"
//         ],
//         "assessmentAttempted": [
//             "67c3bdafa982c29eb8ac0163",
//             "67c3be3eee09822628f2e004",
//             "67c3c0089a6aed07cfb5e9e0"
//         ],
//         "createdAt": "2025-03-02T01:22:13.194Z",
//         "updatedAt": "2025-03-02T02:25:17.400Z",
//         "__v": 3,
//         "tokens": 16
//     },
//     "message": "User details fetched successfully",
//     "success": true
// }

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [attemptedAssessments, setAttemptedAssessments] = useState([]);
    const [createdAssessments, setCreatedAssessments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAlluser, setShowAlluser] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [totalScore, setTotalScore] = useState(0);
    const [averagePercentage, setAveragePercentage] = useState(0);


    // Fetch user's attempted assessments
    useEffect(() => {
        const fetchAttemptedAssessments = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await getUserProfile();

                if (response.success) {
                    setUserData(response.data);
                    
                    // Fetch assessment details for attempted assessments
                    const attemptedIds = response.data.assessmentAttempted || [];
                    if (attemptedIds.length > 0) {
                        const quizResults = [];
                        let totalScoreSum = 0;
                        let totalPercentageSum = 0;
                        
                        for (const id of attemptedIds) {
                            try {
                                const resultData = await fetchQuizData(id);
                                if (resultData.success && resultData.result) {
                                    quizResults.push({
                                        id,
                                        ...resultData.result
                                    });
                                    totalScoreSum += resultData.result.score || 0;
                                    totalPercentageSum += resultData.result.percentage || 0;
                                }
                            } catch (error) {
                                console.error(`Error fetching quiz ${id}:`, error);
                            }
                        }
                        
                        setAttemptedAssessments(quizResults);
                        setTotalScore(totalScoreSum);
                        setAveragePercentage(quizResults.length > 0 ? totalPercentageSum / quizResults.length : 0);
                    }
                    
                    // Fetch assessment details for created assessments
                    const createdIds = response.data.assessmentCreated || [];
                    if (createdIds.length > 0) {
                        const createdResults = [];
                        for (const id of createdIds) {
                            try {
                                const resultData = await fetchQuizData(id);
                                if (resultData.success && resultData.result) {
                                    createdResults.push({
                                        id,
                                        ...resultData.result
                                    });
                                }
                            } catch (error) {
                                console.error(`Error fetching created quiz ${id}:`, error);
                            }
                        }
                        setCreatedAssessments(createdResults);
                    }
                } else {
                    console.error('Failed to fetch assessment results');
                }
            } catch (error) {
                console.error('Error fetching assessment results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttemptedAssessments();
    }, []);

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === '') {
            setShowAlluser(true);
        } else {
            setShowAlluser(false);
        }
    };

    const handleShowAlluser = () => {
        setSearchTerm('');
        setShowAlluser(true);
    };
    
    // Filter assessments based on search term
    const filteredAttempted = searchTerm.trim() === '' 
        ? attemptedAssessments 
        : attemptedAssessments.filter(quiz => 
            quiz.questions?.some(q => 
                q.question?.toLowerCase().includes(searchTerm.toLowerCase())
            ));

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 flex flex-col items-center p-8 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-full w-32 h-32 flex items-center justify-center shadow-lg mb-4">
                <img
                    src="https://wallpaperaccess.com/full/3643771.jpg"
                    alt="Profile Logo"
                    className="rounded-full w-28 h-28 border-4 border-cyan-500/50"
                />
            </div>
            <h2 className="text-cyan-400 text-2xl font-semibold mb-2">{userData?.name || 'User'}</h2>
            <p className="text-indigo-400 text-lg mb-6">Tokens Earned: {userData?.tokens || 0}</p>
            
            {/* Dashboard Overview */}
            <div className="w-full max-w-4xl mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 backdrop-blur-sm">
                        <h3 className="text-cyan-400 text-lg font-medium mb-2">Assessments</h3>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-slate-400">Attempted</p>
                                <p className="text-2xl text-white font-bold">{attemptedAssessments.length}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Created</p>
                                <p className="text-2xl text-white font-bold">{createdAssessments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 backdrop-blur-sm">
                        <h3 className="text-cyan-400 text-lg font-medium mb-2">Performance</h3>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-slate-400">Avg. Score</p>
                                <p className="text-2xl text-white font-bold">{Math.round(averagePercentage)}%</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Total Points</p>
                                <p className="text-2xl text-white font-bold">{totalScore}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 backdrop-blur-sm">
                        <h3 className="text-cyan-400 text-lg font-medium mb-2">User Info</h3>
                        <p className="text-slate-400">{userData?.email || 'Email'}</p>
                        <p className="text-slate-400">Role: <span className="text-white">{userData?.role || 'User'}</span></p>
                    </div>
                </div>
            </div>

            {/* Previously Attempted Assessments */}
            <div className="w-full max-w-4xl rounded-lg shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-cyan-400">Previously Attempted Assessments</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 
                         focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <>
                        {!showAlluser && filteredAttempted.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-slate-900 rounded-xl p-8 max-w-2xl mx-auto border border-slate-800">
                                    <h3 className="text-xl font-semibold text-slate-200 mb-4">No Assessments Found</h3>
                                    <p className="text-slate-400 mb-6">
                                        We couldn't find any assessments matching your search. Try a different search term or browse all assessments.
                                    </p>
                                    <button
                                        onClick={handleShowAlluser}
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg"
                                    >
                                        Show All Assessments
                                    </button>
                                </div>
                            </div>
                        ) : attemptedAssessments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAttempted.map((quiz) => (
                                    <QuizResultCard key={quiz.id} quiz={quiz} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-400">You haven't attempted any assessments yet.</p>
                                <button
                                    onClick={() => window.location.href = '/exploreQuiz'}
                                    className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg"
                                >
                                    Explore Assessments
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Created Assessments Section */}
            {createdAssessments.length > 0 && (
                <div className="w-full max-w-4xl rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-green-400">Your Created Assessments</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {createdAssessments.map((quiz) => (
                            <QuizResultCard key={quiz.id} quiz={quiz} isCreated={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Explore More Section */}
            <Link
                to="/exploreQuiz"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform transition-all hover:scale-105"
            >
                Explore More
            </Link>
        </div>
    );
};

// Quiz Result Card Component
const QuizResultCard = ({ quiz, isCreated = false }) => {
    const formatTime = (seconds) => {
        if (!seconds) return '0m 0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };
    
    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };
    
    const getGradientColor = (percentage) => {
        if (percentage >= 80) return 'from-green-500 to-green-700';
        if (percentage >= 60) return 'from-yellow-500 to-amber-700';
        return 'from-red-500 to-red-700';
    };
    
    return (
        <div className={`bg-slate-900 border ${isCreated ? 'border-green-500/30' : 'border-cyan-500/30'} rounded-xl overflow-hidden shadow-lg`}>
            <div className="p-6">
                {/* Header with Score */}
                <div className="flex justify-between items-center mb-4">
                    <span className={`font-bold text-2xl ${getScoreColor(quiz.percentage)}`}>
                        {quiz.percentage}%
                    </span>
                    <div className="px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-300">
                        {quiz.questions?.length || 0} Questions
                    </div>
                </div>
                
                {/* Score Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                    <div 
                        className={`bg-gradient-to-r ${getGradientColor(quiz.percentage)} h-2 rounded-full`}
                        style={{ width: `${quiz.percentage}%` }}
                    ></div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1 text-indigo-400" />
                        <span className="text-slate-300 text-sm">
                            Score: <span className="font-medium">{quiz.score}/{quiz.maxScore}</span>
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1 text-indigo-400" />
                        <span className="text-slate-300 text-sm">
                            Tokens: <span className="font-medium">{quiz.token}</span>
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-indigo-400" />
                        <span className="text-slate-300 text-sm">
                            Time: <span className="font-medium">{formatTime(quiz.timeTaken)}</span>
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-indigo-400" />
                        <span className="text-slate-300 text-sm">Questions: {quiz.questions?.length || 0}</span>
                    </div>
                </div>
                
                {/* Question Preview */}
                {quiz.questions && quiz.questions.length > 0 && (
                    <div className="bg-slate-800/60 p-3 rounded-lg mb-4">
                        <p className="text-sm text-slate-300 line-clamp-2 mb-1">{quiz.questions[0].question}</p>
                        <div className="flex items-center text-xs">
                            {quiz.questions[0].isCorrect ? (
                                <><Check className="h-3 w-3 text-green-400 mr-1" /> <span className="text-green-400">Correct</span></>
                            ) : (
                                <><X className="h-3 w-3 text-red-400 mr-1" /> <span className="text-red-400">Incorrect</span></>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Action Button */}
                <div className='flex flex-col gap-4'>
                <Link
                    to={`/attemptquiz/${quiz.id}`}
                    className={`w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r ${isCreated ? 'from-green-500 to-emerald-700' : 'from-cyan-500 to-blue-700'} text-white font-medium flex items-center justify-center`}
                >
                    Reattempt Quiz
                    <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                <Link
                    to={`/quizResults/${quiz.id}`}
                    className={`w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r ${isCreated ? 'from-green-500 to-emerald-700' : 'from-cyan-500 to-blue-700'} text-white font-medium flex items-center justify-center`}
                >
                    View Result
                    <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;