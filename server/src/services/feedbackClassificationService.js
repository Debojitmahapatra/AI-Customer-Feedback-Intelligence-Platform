import { requestClassification } from "./claudeService.js";
import { classificationSchema } from "../utils/classificationValidation.js";

const getValidatedClassification = async (feedbackContent) => {
    let lastError;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const rawClassification = await requestClassification(feedbackContent);
            const parsedClassification = JSON.parse(rawClassification);

            return classificationSchema.parse(parsedClassification);
        } catch (error) {
            lastError = error;
        }
    }

    const controlledError = new Error("AI classification failed.");

    controlledError.statusCode = 502;
    controlledError.cause = lastError;

    throw controlledError;
};

export const classifyFeedback = async (feedback) => {
    try {
       
        const classification = await getValidatedClassification(feedback.content);

        feedback.sentiment = classification.sentiment;
        feedback.sentimentScore = classification.sentimentScore;
        feedback.themes = classification.themes;
        feedback.featureArea = classification.featureArea;
        feedback.aiClassificationStatus = "COMPLETED";
        feedback.aiClassifiedAt = new Date();

        await feedback.save();

        return {
            feedback,
            classificationSucceeded: true,
        };
    } catch {
        feedback.aiClassificationStatus = "FAILED";
        feedback.aiClassifiedAt = null;

        await feedback.save();

        return {
            feedback,
            classificationSucceeded: false,
        };
    }
};