import React, { useState } from "react";
import { askAssessment } from "../../../services/quiz/QuizService";

const Chatbot = (props) => {
    const assessmentId = props.assessmentId;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (inputText.trim()) {
            setMessages([...messages, { text: inputText, sender: "user" }]);
            setInputText("");

            try {
                const response = await askAssessment(assessmentId, { question: inputText });
                setMessages((prev) => [
                    ...prev,
                    { text: response.response, sender: "bot" },
                ]);
            } catch (error) {
                setMessages((prev) => [
                    ...prev,
                    { text: "Error fetching response from bot.", sender: "bot" },
                ]);
            }
        }
    };

    return (
        <>
            {/* Chatbot Toggle Button */}
            <button
                onClick={toggleChatbot}
                className="fixed bottom-8 right-8 p-4 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-all max-sm:bottom-4 max-sm:right-4 z-20"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            </button>

            {/* Chatbot Popup */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 max-sm:bottom-2 max-sm:right-2 flex flex-col items-end space-y-4 z-20">
                    <div className="border border-cyan-500/20 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 w-96 h-[500px] flex flex-col justify-between max-sm:w-[90vw] max-sm:h-[80vh]">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-lg text-indigo-400">Chatbot</h4>
                                <p className="text-sm text-slate-300/80">How can I help you today?</p>
                            </div>
                            <button
                                onClick={toggleChatbot}
                                className="p-2 text-slate-300 hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`rounded-lg p-3 max-w-[80%] ${
                                            msg.sender === "user"
                                                ? "bg-indigo-500 text-white"
                                                : "bg-gray-700 text-slate-300"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-cyan-500/20">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    className="flex-1 p-2 rounded-lg bg-gray-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    placeholder="Type a message..."
                                />
                                <button
                                    onClick={handleSend}
                                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;