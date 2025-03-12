"use client"

import { useState, useEffect } from "react"
import { Search, Clock, BookOpen, BarChart, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { getAllAssessments } from "../../../services/quiz/QuizService"

const ExploreQuiz = () => {
    const [quizzes, setQuizzes] = useState([])
    const [filteredQuizzes, setFilteredQuizzes] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAllQuizzes, setShowAllQuizzes] = useState(true)

    // Fetch all quizzes on component mount
    useEffect(() => {
        const fetchQuizzes = async () => {
            setIsLoading(true)
            try {
                const response = await getAllAssessments()
                if (response?.data) {
                    setQuizzes(response.data)
                    setFilteredQuizzes(response.data)
                }
                setIsLoading(false)
            } catch (err) {
                console.error("Error fetching quizzes:", err)
                setError("Failed to load quizzes. Please try again later.")
                setIsLoading(false)
            }
        }

        fetchQuizzes()
    }, [])

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredQuizzes(quizzes)
            setShowAllQuizzes(true)
            return
        }

        const searchResults = quizzes.filter(quiz => 
            quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )

        setFilteredQuizzes(searchResults)
        setShowAllQuizzes(false)
    }, [searchQuery, quizzes])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleShowAllQuizzes = () => {
        setSearchQuery("")
        setFilteredQuizzes(quizzes)
        setShowAllQuizzes(true)
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg">Loading quizzes...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center p-6 bg-slate-900 rounded-xl border border-red-500/30 max-w-md">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Explore Assessments</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Discover and take quizzes created by our community. Search for specific topics or browse all available assessments.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-6 pl-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    </div>
                </div>

                {/* Quiz Cards */}
                {!showAllQuizzes && filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-slate-900 rounded-xl p-8 max-w-2xl mx-auto border border-slate-800">
                            <h3 className="text-xl font-semibold text-slate-200 mb-4">No Assessments Found</h3>
                            <p className="text-slate-400 mb-6">
                                We couldn't find any assessments matching your search. Try a different search term or browse all assessments.
                            </p>
                            <button
                                onClick={handleShowAllQuizzes}
                                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg"
                            >
                                Show All Assessments
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <QuizCard key={quiz._id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// QuizCard component remains the same
const QuizCard = ({ quiz }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        })
    }

    // Truncate description to a reasonable length
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text
        return text.substr(0, maxLength) + "..."
    }

    return (
        <Link
        to={`/attemptquiz/${quiz._id}`}
        className="block bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
        >
        <div className="p-6">
            {/* Quiz Type Badge */}
            <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full">{quiz.type}</span>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full capitalize">
                {quiz.difficulty}
            </span>
            </div>

            {/* Title and Description */}
            <h3 className="text-xl font-semibold text-slate-100 mb-2">{quiz.title}</h3>
            <p className="text-slate-400 mb-4 text-sm h-12">{truncateText(quiz.description, 80)}</p>

            {/* Quiz Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-slate-500 text-sm">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center text-slate-500 text-sm">
                <BarChart className="h-4 w-4 mr-1" />
                <span>{quiz.attemptedBy?.length || 0} Attempts</span>
            </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
            {quiz.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md">
                {tag}
                </span>
            ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <div className="text-slate-500 text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(quiz.createdAt)}</span>
            </div>
            <button className="text-cyan-400 text-sm font-medium flex items-center">
                Take Quiz <ArrowRight className="h-4 w-4 ml-1" />
            </button>
            </div>
        </div>
        </Link>
    )
}

export default ExploreQuiz

