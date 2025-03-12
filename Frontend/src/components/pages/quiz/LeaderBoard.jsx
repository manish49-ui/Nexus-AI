"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Crown, Award, Star, Users } from "lucide-react"
import { getLeaderboard } from "../../../services/users/user"

const LeaderBoard = () => {
    const [leaderboardData, setLeaderboardData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLeaderboard = async () => {
        try {
            const response = await getLeaderboard()
            setLeaderboardData(response.leaderboard)
            setIsLoading(false)
        } catch (error) {
            setError("Failed to fetch leaderboard data")
            setIsLoading(false)
        }
        }

        fetchLeaderboard()
    }, [])

    // Helper function to safely display tokens
    const displayTokens = (tokens) => {
        return typeof tokens === 'number' ? tokens : 0;
    };

    if (isLoading) {
        return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading leaderboard...</p>
            </div>
        </div>
        )
    }

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

    // Get top 3 users for special display
    const topThree = leaderboardData.slice(0, 3)
    const otherUsers = leaderboardData.slice(3)

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
            {/* Header with animated background */}
            <div className="relative mb-16 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 animate-pulse"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl"></div>

            <div className="relative py-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white flex items-center justify-center">
                <Trophy className="h-10 w-10 mr-3 text-yellow-500 animate-bounce" />
                Leaderboard
                </h1>
                <p className="text-slate-300 max-w-md mx-auto mb-6">
                Top performers ranked by tokens earned. Compete with others and climb the ranks!
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600 mx-auto"></div>
            </div>
            </div>

            {/* Top 3 Podium - Special Display */}
            {topThree.length > 0 && (
            <div className="mb-12 flex flex-col md:flex-row justify-center items-end gap-4 px-4">
                {/* 2nd Place */}
                {topThree.length > 1 && (
                <div className="order-2 md:order-1 flex-1">
                    <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-xl p-6 text-center border border-slate-600 transform hover:translate-y-1 transition-transform">
                    <div className="relative">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                        <Medal className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center border-2 border-slate-600">
                        <span className="text-slate-300 font-bold">2</span>
                        </div>
                    </div>
                    <div className="mt-3 h-24 md:h-20"></div>
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                        <span className="text-white font-bold text-xl">{topThree[1]?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-200">{topThree[1]?.name}</h3>
                    <div className="mt-2 text-cyan-400 font-bold flex items-center justify-center">
                        <Award className="h-4 w-4 mr-1" />
                        {displayTokens(topThree[1]?.tokens)} tokens
                    </div>
                    </div>
                    <div className="h-16 bg-slate-700/50 w-full rounded-b-xl"></div>
                </div>
                )}

                {/* 1st Place */}
                <div className="order-1 md:order-2 flex-1 md:flex-1.5 z-10 transform hover:-translate-y-2 transition-transform">
                <div className="bg-gradient-to-b from-yellow-500/20 to-amber-700/20 rounded-t-xl p-6 text-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                    <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center border-4 border-yellow-600 shadow-lg">
                        <Crown className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center border-2 border-yellow-400 animate-pulse">
                        <span className="text-white font-bold">1</span>
                    </div>
                    </div>
                    <div className="mt-3 h-32 md:h-28"></div>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center border-4 border-yellow-500 shadow-lg">
                    <span className="text-white font-bold text-2xl">{topThree[0]?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-yellow-400">{topThree[0]?.name}</h3>
                    <div className="mt-2 text-yellow-400 font-bold flex items-center justify-center">
                    <Star className="h-5 w-5 mr-1" />
                    {displayTokens(topThree[0]?.tokens)} tokens
                    </div>
                </div>
                <div className="h-24 bg-yellow-600/20 w-full rounded-b-xl"></div>
                </div>

                {/* 3rd Place */}
                {topThree.length > 2 && (
                <div className="order-3 flex-1">
                    <div className="bg-gradient-to-b from-amber-700/20 to-amber-900/20 rounded-t-xl p-6 text-center border border-amber-700/30 transform hover:translate-y-1 transition-transform">
                    <div className="relative">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 flex items-center justify-center border-4 border-amber-900 shadow-lg">
                        <Medal className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-amber-800 rounded-full w-8 h-8 flex items-center justify-center border-2 border-amber-700">
                        <span className="text-amber-200 font-bold">3</span>
                        </div>
                    </div>
                    <div className="mt-3 h-16 md:h-12"></div>
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center border-4 border-amber-800 shadow-lg">
                        <span className="text-white font-bold text-xl">{topThree[2]?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-amber-400">{topThree[2]?.name}</h3>
                    <div className="mt-2 text-amber-400 font-bold flex items-center justify-center">
                        <Award className="h-4 w-4 mr-1" />
                        {displayTokens(topThree[2]?.tokens)} tokens
                    </div>
                    </div>
                    <div className="h-12 bg-amber-800/20 w-full rounded-b-xl"></div>
                </div>
                )}
            </div>
            )}

            {/* Other Rankings Table */}
            {otherUsers.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-slate-800">
                <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center">
                <Users className="h-5 w-5 mr-2 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-200">Other Rankings</h2>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-slate-800/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Tokens</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                    {otherUsers.map((user, index) => (
                        <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400">
                            <div className="flex items-center">
                            <span className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">
                                {index + 4}
                            </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center mr-3 border border-slate-600">
                                <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-slate-300">{user.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className="bg-cyan-500/10 text-cyan-400 font-medium px-3 py-1 rounded-full">
                            {displayTokens(user.tokens)} tokens
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}

            {/* Empty State */}
            {leaderboardData.length === 0 && (
            <div className="bg-slate-900 rounded-xl p-10 text-center border border-slate-800">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Rankings Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                Be the first to earn tokens and claim your spot on the leaderboard!
                </p>
            </div>
            )}
        </div>
        </div>
    )
}

export default LeaderBoard

