// Dynamic Prompt Builder based on user preferences and feedback

import { basePromptSections } from './promptConfig';

// Default user preferences
export const defaultPreferences = {
    responseLength: 'balanced', // 'concise' | 'balanced' | 'detailed'
    technicalLevel: 'balanced', // 'simple' | 'balanced' | 'technical'
    resourceDensity: 'medium', // 'low' | 'medium' | 'high'
    structureEmphasis: 'steps', // 'steps' | 'narrative' | 'bullets'
    verificationLevel: 'standard', // 'standard' | 'high'
    relevanceFocus: 'direct', // 'direct' | 'comprehensive'
};

/**
 * Get user preferences from localStorage or return defaults
 */
export const getUserPreferences = () => {
    try {
        const stored = localStorage.getItem('userPromptPreferences');
        if (stored) {
            return { ...defaultPreferences, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
    return { ...defaultPreferences };
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferences = (preferences) => {
    try {
        localStorage.setItem(
            'userPromptPreferences',
            JSON.stringify(preferences)
        );
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};

/**
 * Get parameter mapping for feedback options
 * Maps feedback selections to their target preference parameters
 */
const getParameterMapping = () => {
    return {
        responseLength: {
            concise: ['too_long', 'quick_point'],
            balanced: ['perfect_length'],
            detailed: ['too_short'],
        },
        technicalLevel: {
            simple: ['too_technical'],
            balanced: ['technical_accuracy'],
            technical: ['not_technical'],
        },
        resourceDensity: {
            low: [],
            medium: [],
            high: ['missing_resources', 'great_resources'],
        },
        structureEmphasis: {
            steps: ['clear_steps'],
            narrative: [],
            bullets: ['poor_formatting'],
        },
        verificationLevel: {
            standard: [],
            high: ['incorrect_info'],
        },
        relevanceFocus: {
            direct: ['didnt_address'],
            comprehensive: [],
        },
    };
};

/**
 * Calculate aggregate preferences based on recent feedback history
 * Uses weighted scoring with recency bias
 */
const calculateAggregatePreferences = (recentHistory, maxHistory = 10) => {
    if (!recentHistory || recentHistory.length === 0) {
        return defaultPreferences;
    }

    const parameterMapping = getParameterMapping();
    const newPreferences = { ...defaultPreferences };

    // Process each preference parameter
    Object.keys(defaultPreferences).forEach((parameter) => {
        const scores = {};
        const options = Object.keys(parameterMapping[parameter]);

        // Initialize scores for each option
        options.forEach((option) => {
            scores[option] = 0;
        });

        // Calculate weighted scores from recent feedback
        recentHistory.slice(0, maxHistory).forEach((feedback, index) => {
            // Exponential decay weight: most recent = 1.0, oldest = 0.1
            const weight = Math.pow(0.85, index);

            feedback.selections.forEach((selectionId) => {
                // Find which option this selection maps to
                options.forEach((option) => {
                    const mappedSelections =
                        parameterMapping[parameter][option];
                    if (mappedSelections.includes(selectionId)) {
                        // Positive feedback has higher weight
                        const typeWeight =
                            feedback.type === 'positive' ? 1.5 : 1.0;
                        scores[option] += weight * typeWeight;
                    }
                });
            });
        });

        // Find the option with highest score
        let maxScore = 0;
        let bestOption = defaultPreferences[parameter];

        Object.entries(scores).forEach(([option, score]) => {
            if (score > maxScore) {
                maxScore = score;
                bestOption = option;
            }
        });

        // Only change from default if we have enough confidence (score > 0.5)
        if (maxScore > 0.5) {
            newPreferences[parameter] = bestOption;
        }
    });

    return newPreferences;
};

/**
 * Apply feedback adjustments to user preferences using aggregate approach
 */
export const applyFeedbackAdjustments = (
    currentPreferences,
    feedbackSelections
) => {
    // Get recent feedback history
    const history = JSON.parse(localStorage.getItem('feedbackHistory')) || [];

    // Create a temporary feedback entry for the current feedback
    const currentFeedback = {
        timestamp: new Date().toISOString(),
        type: feedbackSelections.type || 'neutral',
        selections: feedbackSelections,
    };

    // Combine current feedback with history for calculation
    const combinedHistory = [currentFeedback, ...history];

    // Calculate new preferences based on aggregate feedback
    const newPreferences = calculateAggregatePreferences(combinedHistory, 10);

    return newPreferences;
};

/**
 * Build dynamic system prompt based on user preferences
 */
export const buildSystemPrompt = (userPreferences = null) => {
    const prefs = userPreferences || getUserPreferences();

    let prompt = basePromptSections.role;

    // Add format instructions based on response length preference
    if (basePromptSections.formatInstructions[prefs.responseLength]) {
        prompt +=
            '\n\n' +
            basePromptSections.formatInstructions[prefs.responseLength];
    }

    // Add technical level instructions
    if (basePromptSections.technicalLevel[prefs.technicalLevel]) {
        prompt +=
            '\n\n' + basePromptSections.technicalLevel[prefs.technicalLevel];
    }

    // Add resource emphasis
    if (basePromptSections.resourceEmphasis[prefs.resourceDensity]) {
        prompt +=
            '\n\n' + basePromptSections.resourceEmphasis[prefs.resourceDensity];
    }

    // Add structure emphasis
    if (basePromptSections.structureEmphasis[prefs.structureEmphasis]) {
        prompt +=
            '\n\n' +
            basePromptSections.structureEmphasis[prefs.structureEmphasis];
    }

    // Add verification level
    if (basePromptSections.verificationLevel[prefs.verificationLevel]) {
        prompt +=
            '\n\n' +
            basePromptSections.verificationLevel[prefs.verificationLevel];
    }

    // Add relevance focus
    if (basePromptSections.relevanceFocus[prefs.relevanceFocus]) {
        prompt +=
            '\n\n' + basePromptSections.relevanceFocus[prefs.relevanceFocus];
    }

    // Add formatting guidelines and context awareness
    prompt += `\n\nFORMAT GUIDELINES:
- Format YouTube links as complete URLs (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
- Use bullet points for better readability
- For general car diagnostic queries (not DTCs), provide a similar structured response

CONTEXT AWARENESS - IMPORTANT:
- If the user sends a casual greeting (Hi, Hello, Hey, etc.) or general chat, respond naturally and briefly like a friendly assistant
- Examples of casual responses:
  * "Hi! I'm here to help with any car service questions or diagnostic codes you might have. What can I assist you with today?"
  * "Hello! Need help with a DTC code or car problem?"
- Only use the detailed technical format for actual car service questions, DTC codes, or error codes
- If unsure what the user needs, ask them conversationally what they'd like help with`;

    return prompt;
};

/**
 * Process feedback and update user preferences using aggregate weighted approach
 */
export const processFeedback = (feedbackType, selections) => {
    // Save feedback to history first
    saveFeedbackHistory(feedbackType, selections, null);

    // Get recent feedback history
    const history = JSON.parse(localStorage.getItem('feedbackHistory')) || [];

    // Calculate new preferences based on aggregate feedback
    const newPreferences = calculateAggregatePreferences(history, 10);

    // Save updated preferences
    saveUserPreferences(newPreferences);

    console.log('📊 Aggregate Feedback Processing:');
    console.log('- Recent feedbacks analyzed:', Math.min(history.length, 10));
    console.log('- Updated preferences:', newPreferences);

    return newPreferences;
};

/**
 * Save feedback history for analytics
 */
const saveFeedbackHistory = (feedbackType, selections, newPreferences) => {
    try {
        const history =
            JSON.parse(localStorage.getItem('feedbackHistory')) || [];

        const feedbackEntry = {
            timestamp: new Date().toISOString(),
            type: feedbackType,
            selections,
            preferencesAfter: newPreferences,
        };

        // Keep only last 50 feedback entries
        history.unshift(feedbackEntry);
        if (history.length > 50) {
            history.pop();
        }

        localStorage.setItem('feedbackHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving feedback history:', error);
    }
};

/**
 * Get feedback statistics
 */
export const getFeedbackStats = () => {
    try {
        const history =
            JSON.parse(localStorage.getItem('feedbackHistory')) || [];

        const stats = {
            totalFeedbacks: history.length,
            positive: history.filter((f) => f.type === 'positive').length,
            negative: history.filter((f) => f.type === 'negative').length,
            recentFeedbacks: history.slice(0, 10),
        };

        return stats;
    } catch (error) {
        console.error('Error getting feedback stats:', error);
        return {
            totalFeedbacks: 0,
            positive: 0,
            negative: 0,
            recentFeedbacks: [],
        };
    }
};

/**
 * Reset user preferences to defaults
 */
export const resetPreferences = () => {
    saveUserPreferences(defaultPreferences);
    return defaultPreferences;
};
