// Service for handling feedback storage in Firebase Firestore
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Store feedback globally in Firebase Firestore
 * @param {Object} feedbackData - The feedback data to store
 * @param {string} feedbackData.userQuery - The original user question/query
 * @param {string} feedbackData.aiResponse - The AI's response
 * @param {string} feedbackData.feedbackType - Type of feedback ('positive' or 'negative')
 * @param {Array} feedbackData.selections - Array of feedback selections
 * @param {Object} feedbackData.preferences - User preferences from feedback
 * @returns {Promise<string>} - The document ID of the stored feedback
 */
export const storeFeedback = async (feedbackData) => {
    try {
        const feedbackCollection = collection(db, 'feedbacks');

        const feedbackDoc = {
            userQuery: feedbackData.userQuery,
            aiResponse: feedbackData.aiResponse,
            feedbackType: feedbackData.type,
            selections: feedbackData.selections || [],
            preferences: feedbackData.preferences || {},
            timestamp: new Date().toISOString(),
            chatId: feedbackData.chatId || null,
            messageIndex: feedbackData.messageIndex || null,
            // Optional: Add session ID or user ID if you have authentication
            sessionId: getSessionId(),
        };

        const docRef = await addDoc(feedbackCollection, feedbackDoc);
        console.log('Feedback stored successfully with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error storing feedback:', error);
        throw error;
    }
};

/**
 * Retrieve all feedbacks (useful for analytics)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of feedback documents
 */
export const getAllFeedbacks = async (maxResults = 100) => {
    try {
        const feedbackCollection = collection(db, 'feedbacks');
        const q = query(
            feedbackCollection,
            orderBy('timestamp', 'desc'),
            limit(maxResults)
        );

        const querySnapshot = await getDocs(q);
        const feedbacks = [];

        querySnapshot.forEach((doc) => {
            feedbacks.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return feedbacks;
    } catch (error) {
        console.error('Error retrieving feedbacks:', error);
        throw error;
    }
};

/**
 * Get or create a session ID for tracking user sessions
 * @returns {string} - Session ID
 */
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('bcs_session_id');

    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        sessionStorage.setItem('bcs_session_id', sessionId);
    }

    return sessionId;
};

/**
 * Get feedback statistics (useful for analytics dashboard)
 * @returns {Promise<Object>} - Feedback statistics
 */
export const getFeedbackStats = async () => {
    try {
        const feedbacks = await getAllFeedbacks();

        const stats = {
            total: feedbacks.length,
            positive: feedbacks.filter((f) => f.feedbackType === 'positive')
                .length,
            negative: feedbacks.filter((f) => f.feedbackType === 'negative')
                .length,
            recentFeedbacks: feedbacks.slice(0, 10),
        };

        return stats;
    } catch (error) {
        console.error('Error calculating feedback stats:', error);
        throw error;
    }
};
