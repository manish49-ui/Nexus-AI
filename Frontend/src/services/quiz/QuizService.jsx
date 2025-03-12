import userAuthenticatedAxiosInstance from "../users/userAuthenticatedAxiosInstance";

const userAxiosInstance1 = userAuthenticatedAxiosInstance(
    "/api/v1/assessmentGenerate"
);
const userAxiosInstance2 = userAuthenticatedAxiosInstance(
    "/api/v1/assessmentResult"
);
const userAxiosInstance3 = userAuthenticatedAxiosInstance("/api/v1/chatbot");
const userAxiosInstance4 = userAuthenticatedAxiosInstance(
    "/api/v1/exploreAssessment"
);

const generateQuizFromYoutube = async (
    videoUrl,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    try {
        const response = await userAxiosInstance1.post("/youtube", {
            videoUrl,
            numberOfQuestions,
            difficulty,
            type,
        });
        return response.data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

const generateQuizFromMedia = async (
    file,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    const formData = new FormData();
    formData.append("media", file);
    formData.append("numberOfQuestions", numberOfQuestions);
    formData.append("difficulty", difficulty);
    formData.append("type", type);

    try {
        const response = await userAxiosInstance1.post("/media", formData);
        return response.data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

const generateQuizFromDocument = async (
    file,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("numberOfQuestions", numberOfQuestions);
    formData.append("difficulty", difficulty);
    formData.append("type", type);

    try {
        const response = await userAxiosInstance1.post("/document", formData);
        return response.data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

const submitQuiz = async (assessmentId, submissionBody) => {
    try {
        const response = await userAxiosInstance2.post(
            `/submit/${assessmentId}`,
            submissionBody
        );
        return response.data;
    } catch (error) {
        console.error("Error submitting quiz:", error);
        throw error;
    }
};

const fetchQuizData = async (assessmentId) => {
    //result of quiz
    try {
        const response = await userAxiosInstance2.get(
            `/getResult/${assessmentId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        throw error;
    }
};

const askAssessment = async (assessmentId, question) => {
    try {
        const reference = await fetchQuizData(assessmentId);
        console.log(reference.result);
        const response = await userAxiosInstance3.post(
            `/ask-assessment/${assessmentId}`,
            {
                reference,
                question,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error asking assessment:", error);
        throw error;
    }
};

const getAllAssessments = async () => {
    try {
        const response = await userAxiosInstance4.get("/all");
        return response.data;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw error;
    }
};

const searchAssessments = async (query, difficulty, type) => {
    try {
        let url = `/search?query=${query || ""}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (type) url += `&type=${type}`;

        const response = await userAxiosInstance4.get(url);
        return response.data;
    } catch (error) {
        console.error("Error searching assessments:", error);
        throw error;
    }
};

export {
    generateQuizFromYoutube,
    generateQuizFromMedia,
    generateQuizFromDocument,
    submitQuiz,
    fetchQuizData,
    askAssessment,
    getAllAssessments,
    searchAssessments,
};
