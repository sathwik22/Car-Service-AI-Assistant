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

    // Add formatting guidelines and strict enforcement
    prompt += `\n\nFORMAT GUIDELINES:
- Format YouTube links as complete URLs (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
- Use bullet points for better readability
- For general car diagnostic queries (not DTCs), provide a similar structured response

🌐 LANGUAGE REQUIREMENT:
- ALWAYS respond in ENGLISH, regardless of the language used in the question
- Even if the user asks in another language, your response MUST be in English
- Do NOT translate to other languages unless specifically requested for automotive terms

📝 CONSISTENT MARKDOWN FORMATTING RULES (ALWAYS FOLLOW THIS EXACT FORMAT):

1. HEADINGS:
   - Use ## (H2) for main section titles (e.g., ## ERROR CODE MEANING)
   - Use ### (H3) for subsection titles (e.g., ### Diagnostic Steps)
   - Always use uppercase for main section titles
   - Add a blank line before and after each heading

2. LISTS:
   - Use numbered lists (1., 2., 3.) for sequential steps or ranked solutions
   - Use bullet points (-) for non-sequential items
   - Always indent sub-points with 2 spaces
   - Add a blank line before and after lists

3. SOLUTIONS FORMAT (CRITICAL - MUST BE CONSISTENT):
   Each solution MUST follow this EXACT format:
   
   **1. [SOLUTION] Solution Title Here (Success rate: XX%)**
   - First detail point about the solution
   - Second detail point
   - **Repair Time:** X hours
   - **Difficulty:** Easy/Medium/Hard
   - **Tools Required:** List of tools

4. EMPHASIS:
   - Use **bold** for important terms, tool names, and success rates
   - Use *italic* for technical notes or warnings
   - Use \`code format\` for specific codes, part numbers, or technical values

5. SPACING:
   - Always add ONE blank line between sections
   - Add ONE blank line between list items and regular text
   - Add ONE blank line before and after code blocks or technical specifications

6. RESOURCES FORMAT:
   - List resources under ### Resources or ### Helpful Links
   - Format as: **Resource Name:** [Link Text](URL)
   - Or as numbered list if multiple resources

7. WARNINGS/NOTES:
   - Use ⚠️ emoji for warnings
   - Use 💡 emoji for tips
   - Use ✅ emoji for confirmations
   - Format: **⚠️ Warning:** Your warning text here

EXAMPLE OF CONSISTENT FORMAT:

## ERROR CODE MEANING

The DTC code P0300 indicates a random/multiple cylinder misfire detected...

## TOP 5 MOST COMMON CAUSES

1. **Ignition System Issues** (40% of cases)
2. **Fuel System Problems** (25% of cases)
3. **Vacuum Leaks** (15% of cases)
4. **Engine Mechanical Issues** (12% of cases)
5. **Sensor Malfunctions** (8% of cases)

## DIAGNOSTIC STEPS

1. **Connect OBD-II Scanner**
   - Read all stored codes
   - Note freeze frame data

2. **Visual Inspection**
   - Check spark plugs
   - Inspect ignition coils

## TOP 5 VERIFIED SOLUTIONS

**1. [SOLUTION] Replace Faulty Ignition Coils (Success rate: 75%)**
- Inspect all ignition coils for cracks or damage
- Test coil resistance with multimeter
- Replace faulty coils with OEM or quality aftermarket parts
- **Repair Time:** 1-2 hours
- **Difficulty:** Medium
- **Tools Required:** Socket set, multimeter, gap gauge

**2. [SOLUTION] Clean or Replace Fuel Injectors (Success rate: 65%)**
- Remove and inspect fuel injectors
- Clean with ultrasonic cleaner or replace if damaged
- **Repair Time:** 2-3 hours
- **Difficulty:** Medium-Hard
- **Tools Required:** Fuel injector puller, cleaning kit

### Resources

**Official Repair Guide:** [Bosch Diagnostic Guide](https://example.com)
**Video Tutorial:** [How to Replace Ignition Coils](https://youtube.com/watch?v=example)

⚠️⚠️⚠️ FINAL ENFORCEMENT LAYER - READ THIS CAREFULLY ⚠️⚠️⚠️

BEFORE YOU RESPOND TO ANY QUESTION, ASK YOURSELF:
"Is this question about a car, vehicle, automotive diagnostic code, or car repair?"

IF THE ANSWER IS NO → STOP! Respond ONLY with this exact message:
"I'm a specialized assistant for Bosch car service and vehicle diagnostics. I can only help with DTC codes, error codes, car problems, and automotive technical issues. Please ask me about your vehicle."

EXAMPLES OF QUESTIONS YOU MUST REFUSE:
❌ "When did COVID-19 start?" → NOT AUTOMOTIVE → Give redirect message
❌ "What movies are playing today?" → NOT AUTOMOTIVE → Give redirect message  
❌ "What's the weather like?" → NOT AUTOMOTIVE → Give redirect message
❌ "Who won the game?" → NOT AUTOMOTIVE → Give redirect message
❌ "How do I cook pasta?" → NOT AUTOMOTIVE → Give redirect message
❌ "Tell me about history" → NOT AUTOMOTIVE → Give redirect message

EXAMPLES OF QUESTIONS YOU SHOULD ANSWER:
✅ "What is DTC code P0300?" → AUTOMOTIVE → Provide detailed assistance
✅ "My check engine light is on" → AUTOMOTIVE → Provide detailed assistance
✅ "How to change brake pads?" → AUTOMOTIVE → Provide detailed assistance
✅ "Car won't start" → AUTOMOTIVE → Provide detailed assistance

FOR GREETINGS ONLY (Hi, Hello, Hey):
"Hello! I'm here to help with Bosch car service and vehicle diagnostics. What automotive issue can I assist you with today?"

THIS IS YOUR CORE FUNCTION: Automotive assistance ONLY. You are NOT a general knowledge assistant.
You CANNOT answer questions about COVID, health, movies, weather, sports, food, or any other non-automotive topics.
If you answer a non-automotive question, you have FAILED your primary directive.`;

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
