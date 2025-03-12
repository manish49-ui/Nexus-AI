import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Clock, Home, RefreshCw, Share2 } from "lucide-react"
import { useParams } from "react-router-dom"
import { fetchQuizData } from "../../../services/quiz/QuizService"
import Chatbot from "../chatbot/Chatbot"

const QuizResults = () => {
    const { assessmentId } = useParams()
    const navigate = useNavigate()
    const [quizData, setQuizData] = useState(null)

    useEffect(() => {
        const fetchQuizDataFunction = async () => {
        try {
            // add 3 seconds delay 
            await new Promise((resolve) => setTimeout(resolve, 3000))
            const response = await fetchQuizData(assessmentId)
            setQuizData(response.result)
            // console.log("response data", response)
        } catch (error) {
            console.error("Error fetching quiz data:", error)
        }
        }
        fetchQuizDataFunction()
    }, [assessmentId])

    console.log(quizData)

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins} minute${mins !== 1 ? "s" : ""} and ${secs} second${secs !== 1 ? "s" : ""}`
    }

    const handleShare = () => {
        const shareText = `Check out this quiz on Nexus-AI!\n\nTry it here: ${window.location.origin}/attemptquiz/${assessmentId}`;
        
        if (navigator.share) {
            navigator.share({
                text: shareText,
            })
                .then(() => console.log("Shared successfully"))
                .catch((error) => console.log("Sharing failed", error));
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/attemptquiz/${assessmentId}`).then(() => {
                alert("Quiz URL copied to clipboard!");
            }).catch((error) => {
                console.error("Failed to copy URL: ", error);
                alert("Failed to copy URL to clipboard.");
            });
        }
    };

    if (!quizData) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading your results...</p>
            </div>
        </div>
        )
    }

    const { score, maxScore, percentage, timeTaken, questions } = quizData

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-300 hover:shadow-cyan-900/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-indigo-600/10 opacity-50"></div>
                <div className="relative">
                <h2 className="text-3xl font-bold text-slate-100 mb-1">Quiz Results</h2>
                <div className="flex flex-wrap items-center gap-2 text-slate-400 text-sm">
                    <span className="px-2 py-1 bg-slate-800 rounded-full">Score: {score} / {maxScore}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-slate-800 rounded-full">Percentage: {percentage}%</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-slate-800 rounded-full">Time Taken: {formatTime(timeTaken)}</span>
                </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* Score Summary */}
                <div className="mb-10 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                    <h3 className="text-slate-300 text-lg mb-1">Your Score</h3>
                    <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                        {score} / {maxScore}
                    </div>
                    <p className="text-slate-400 mt-2">
                        You answered <span className="text-cyan-400 font-medium">{percentage}%</span> correctly
                    </p>
                    </div>

                    <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                        className="text-slate-700"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        />
                        <circle
                        className="text-cyan-500"
                        strokeWidth="10"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (percentage / 100) * 251.2}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                        {percentage}%
                    </div>
                    </div>

                    <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end text-slate-400 mb-2">
                        <Clock className="h-5 w-5 mr-2 text-cyan-500" />
                        <span>Time taken</span>
                    </div>
                    <div className="text-xl font-medium text-slate-200">{formatTime(timeTaken)}</div>
                    </div>
                </div>
                </div>

                {/* Questions */}
                <div className="space-y-8">
                <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">Question Review</h3>

                {questions.map((question, index) => (
                    <div
                    key={question.questionId}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50"
                    >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-slate-700 rounded-full h-8 w-8 flex items-center justify-center text-slate-300 shrink-0">
                        {index + 1}
                        </div>
                        <div className="w-full">
                        <h3 className="text-lg font-medium text-slate-100 mb-4">{question.question}</h3>
                        <div className="grid gap-3">
                            {question.options.map((option, optionIndex) => {
                            const isUserAnswer = question.userAnswer === option
                            const isCorrectAnswer = question.correctAnswer === option
                            let optionClass = "p-4 rounded-lg transition-all duration-200 "

                            if (isUserAnswer && isCorrectAnswer) {
                                optionClass += "bg-green-500/10 border border-green-500 shadow-sm shadow-green-500/20"
                            } else if (isUserAnswer) {
                                optionClass += "bg-red-500/10 border border-red-500 shadow-sm shadow-red-500/20"
                            } else if (isCorrectAnswer) {
                                optionClass += "bg-green-500/10 border border-green-500 shadow-sm shadow-green-500/20"
                            } else {
                                optionClass += "bg-slate-700/50 border border-slate-600 hover:bg-slate-700"
                            }

                            return (
                                <div key={optionIndex} className={optionClass}>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-500 mr-3 shrink-0">
                                    <span className="text-sm">{String.fromCharCode(65 + optionIndex)}</span>
                                    </div>
                                    <span className="text-slate-200">{option}</span>
                                    {isUserAnswer && (
                                    <span className="ml-auto">
                                        {isCorrectAnswer ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                        ) : (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                        )}
                                    </span>
                                    )}
                                    {!isUserAnswer && isCorrectAnswer && (
                                    <span className="ml-auto">
                                        <CheckCircle className="h-6 w-6 text-green-500 opacity-70" />
                                    </span>
                                    )}
                                </div>
                                </div>
                            )
                            })}
                        </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                        <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Explanation:
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                    </div>
                ))}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 flex items-center"
                    onClick={() => navigate("/")}
                >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                </button>
                <button
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 flex items-center"
                    onClick={handleShare}
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Quiz
                </button>
                <button
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 flex items-center"
                    onClick={() => navigate(`/attemptquiz/${assessmentId}`)}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </button>
                </div>
            </div>
            </div>
        </div>
        <Chatbot assessmentId={assessmentId} />
        </div>
    )
}

export default QuizResults

