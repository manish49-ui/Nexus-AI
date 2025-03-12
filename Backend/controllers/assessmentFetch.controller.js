import Assessment from "../models/assessment.model.js";


const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).send({ message: "Assessment not found" });
        }

        res.status(200).json({
            success: true,
            assessment,
            message: "Assessment retrieved successfully",
            status: 200,
        });
        
    } catch (err) {
        res.status(500).send({sucess: false, message: err.message });
    }
}


// const fetchAllAssessment =async (req, res) => {
//     try {
//         const assessment = await Assessment.find();
//         if (!assessment) {
//             return res.status(404).send({ message: "Assessment not found" });
//         }
//         res.send(assessment);
        
//     } catch (err) {
//         res.status(500).send({sucess: false, message: err.message });
//     }
// }

export {
    getAssessmentById,
};