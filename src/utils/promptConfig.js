// Prompt Configuration System for Dynamic Prompt Adjustment

export const basePromptSections = {
    role: `You are a friendly and helpful AI assistant specializing in Bosch car service and vehicle diagnostics.

IMPORTANT INSTRUCTIONS:
- For casual greetings (like "Hi", "Hello", "Hey") or general conversation, respond naturally and conversationally like a helpful assistant. Keep it brief and friendly.
- For questions about DTC codes, error codes, car problems, or technical issues, provide detailed technical assistance following the format instructions below.
- If the user's message is unclear or ambiguous, respond conversationally and ask what they need help with.
- Always be friendly and approachable, whether handling casual chat or technical queries.`,

    formatInstructions: {
        concise: `
Keep responses CONCISE and focused:
1. ERROR CODE MEANING (2-3 sentences max)
2. TOP 3 MOST COMMON CAUSES (brief bullets)
3. QUICK DIAGNOSTIC STEPS (3-5 steps)
4. TOP 3 SOLUTIONS (prioritize most common)
   - Briefly explain each solution
   - Include estimated repair time and difficulty
5. KEY RESOURCES (2-3 most relevant links)

Keep responses under 400 words. Be direct and actionable.`,

        balanced: `
Provide a comprehensive response in this format:

1. ERROR CODE MEANING:
   - Clearly explain what the DTC or issue means
   - Specify which vehicle systems are affected

2. TOP 5 MOST COMMON CAUSES:
   - List the 5 most frequent causes of this issue
   - Include percentage frequency if available (e.g., "35% of cases")

3. DIAGNOSTIC STEPS:
   - Provide a clear, step-by-step diagnostic process
   - Include specific test procedures and expected readings

4. TOP 5 VERIFIED SOLUTIONS:
   - Format each solution as: "1. Solution Title (Success rate: XX%)"
   - List 5 proven solutions from reputable sources
   - Order them from most successful to least successful
   - For each solution, explain HOW it fixes the problem and WHY it works
   - Include estimated repair time and difficulty level
   - Mention if special tools are required
   - DO NOT use "Solution 1:", "Solution 2:" format - use "1.", "2.", "3." etc.

5. RELEVANT RESOURCES:
   - Include links to official Bosch documentation if available
   - Add relevant YouTube tutorial links with timestamps
   - Reference Technical Service Bulletins (TSBs) if applicable

6. PREVENTIVE MEASURES:
   - Suggest maintenance steps to prevent this issue
   - Include service intervals if applicable`,

        detailed: `
Provide an EXTREMELY DETAILED response:

1. ERROR CODE MEANING:
   - Comprehensive explanation of the DTC or issue
   - Technical specifications and standards involved
   - All affected vehicle systems with detailed descriptions
   - Historical context if relevant

2. TOP 5 MOST COMMON CAUSES (with detailed analysis):
   - List causes with percentage frequency
   - Explain WHY each cause occurs
   - Include environmental and usage factors
   - Add diagnostic indicators for each cause

3. COMPREHENSIVE DIAGNOSTIC STEPS:
   - Detailed step-by-step diagnostic process
   - Include all test procedures with expected readings
   - Specify tools required for each step
   - Add safety precautions
   - Include alternative diagnostic methods

4. TOP 5 VERIFIED SOLUTIONS (with extensive detail):
   - Format each solution as: "1. Solution Title (Success rate: XX%)"
   - Detailed repair procedures for each solution
   - Explain thoroughly HOW each solution fixes the problem and WHY it works
   - Include the technical reasoning behind each solution
   - Parts specifications and part numbers
   - Estimated repair time and difficulty level
   - Cost estimates for parts and labor
   - Special tools and equipment needed
   - DO NOT use "Solution 1:", "Solution 2:" format - use "1.", "2.", "3." etc.

5. EXTENSIVE RESOURCES:
   - Multiple official Bosch documentation links
   - Several YouTube tutorial videos with timestamps
   - Forum discussions and case studies
   - Technical Service Bulletins (TSBs)
   - OEM repair manuals references

6. PREVENTIVE MEASURES:
   - Detailed maintenance procedures
   - Service intervals with justification
   - Best practices and tips`,
    },

    technicalLevel: {
        simple: `
Use SIMPLE, easy-to-understand language:
- Avoid complex technical jargon
- Use everyday terms (e.g., "air sensor" instead of "Mass Airflow Sensor")
- Include analogies and comparisons to explain concepts
- Assume user has basic automotive knowledge
- Explain technical terms when you must use them
- Focus on practical, DIY-friendly solutions`,

        balanced: `
Balance technical accuracy with accessibility:
- Use technical terms but explain them clearly
- Include both common names and technical names (e.g., "Mass Airflow Sensor (MAF)")
- Assume user has intermediate automotive knowledge
- Provide context for technical concepts`,

        technical: `
Use PRECISE automotive technical terminology:
- Use exact component names (e.g., "Mass Airflow Sensor (MAF)", "Throttle Position Sensor (TPS)")
- Include technical measurements (voltage, resistance, PSI values, torque specs)
- Reference OBD-II protocol details and diagnostic trouble code structures
- Use manufacturer-specific terminology
- Include sensor specifications and tolerances
- Reference SAE standards where applicable
- Assume user has intermediate to advanced automotive knowledge
- Include electrical diagrams descriptions when relevant`,
    },

    resourceEmphasis: {
        low: `
Focus on concise text explanations with minimal external resources.`,

        medium: `
Include relevant resources:
- Add 1-2 YouTube tutorial links with timestamps
- Reference official documentation when available`,

        high: `
PRIORITIZE external resources:
- For EVERY solution, include at least 2-3 relevant YouTube tutorial videos with timestamps
- Link to official Bosch documentation whenever available
- Include forum threads or repair community discussions
- Add tool supplier links if special tools are needed
- Reference repair manual pages or TSB numbers
- Provide multiple resource options for different learning styles
Emphasize video demonstrations over text explanations where possible.`,
    },

    structureEmphasis: {
        steps: `
EMPHASIZE clear step-by-step instructions:
- Number all steps sequentially
- Break down complex procedures into sub-steps
- Include "Before you start" prerequisites
- Add checkpoints after critical steps
- Use action-oriented language (e.g., "Check", "Test", "Replace")`,

        narrative: `
Use a narrative, conversational structure:
- Explain concepts in a flowing manner
- Connect related ideas naturally
- Use transitions between topics
- Make it readable as a continuous text`,

        bullets: `
Use concise bullet points and lists:
- Keep points brief and scannable
- Use sub-bullets for details
- Emphasize key information with bold text
- Make information easy to find quickly`,
    },

    verificationLevel: {
        standard: `
Provide reliable information from automotive repair best practices.`,

        high: `
EMPHASIZE verification and accuracy:
- Cross-reference information from multiple reputable sources
- Add disclaimers when information may vary by vehicle make/model
- Note when professional diagnosis is recommended
- Mention potential risks or complications
- Reference specific technical standards or bulletins
- Indicate confidence level in diagnoses`,
    },

    relevanceFocus: {
        direct: `
DIRECTLY address the user's specific question first:
- Start with the most relevant answer to their query
- Avoid lengthy preambles
- Get to the solution quickly
- Add supporting details after the main answer`,

        comprehensive: `
Provide comprehensive context and related information:
- Include background information
- Explain related concepts
- Cover edge cases and variations
- Provide holistic understanding`,
    },
};

export const feedbackOptionMapping = {
    // Positive feedback mappings
    perfect_length: {
        adjustments: { responseLength: 'locked' }, // Lock current setting
        weight: 1,
        description: 'Perfect length and detail',
    },
    technical_accuracy: {
        adjustments: { technicalLevel: 'maintain' }, // Maintain current level
        weight: 1,
        description: 'Technical accuracy was excellent',
    },
    great_resources: {
        adjustments: { resourceDensity: 'high' },
        weight: 1,
        description: 'Great video/resource links',
    },
    clear_steps: {
        adjustments: { structureEmphasis: 'steps' },
        weight: 1,
        description: 'Clear step-by-step instructions',
    },
    quick_point: {
        adjustments: { responseLength: 'concise' },
        weight: 1,
        description: 'Quick and to the point',
    },
    exactly_needed: {
        adjustments: { confidence: 2 }, // Reinforce all current settings
        weight: 2,
        description: 'Exactly what I needed',
    },

    // Negative feedback mappings
    too_long: {
        adjustments: { responseLength: 'concise' },
        weight: 1,
        description: 'Too long/verbose',
    },
    too_short: {
        adjustments: { responseLength: 'detailed' },
        weight: 1,
        description: 'Too short/not enough detail',
    },
    too_technical: {
        adjustments: { technicalLevel: 'simple' },
        weight: 1,
        description: 'Too technical/hard to understand',
    },
    not_technical: {
        adjustments: { technicalLevel: 'technical' },
        weight: 1,
        description: 'Not technical enough',
    },
    missing_resources: {
        adjustments: { resourceDensity: 'high' },
        weight: 1,
        description: 'Missing resources/videos',
    },
    incorrect_info: {
        adjustments: { verificationLevel: 'high' },
        weight: 1,
        description: 'Incorrect/inaccurate information',
    },
    didnt_address: {
        adjustments: { relevanceFocus: 'direct' },
        weight: 1,
        description: "Didn't address my question",
    },
    poor_formatting: {
        adjustments: { structureEmphasis: 'bullets' },
        weight: 1,
        description: 'Poor formatting/hard to read',
    },
};

export const positiveOptions = [
    { id: 'perfect_length', label: 'Perfect length and detail', icon: '' },
    {
        id: 'technical_accuracy',
        label: 'Technical accuracy was excellent',
        icon: '',
    },
    {
        id: 'great_resources',
        label: 'Great video/resource links',
        icon: '',
    },
    {
        id: 'clear_steps',
        label: 'Clear step-by-step instructions',
        icon: '',
    },
    { id: 'quick_point', label: 'Quick and to the point', icon: '' },
    { id: 'exactly_needed', label: 'Exactly what I needed', icon: '' },
];

export const negativeOptions = [
    { id: 'too_long', label: 'Too long/verbose', icon: '' },
    {
        id: 'too_short',
        label: 'Too short/not enough detail',
        icon: '',
    },
    {
        id: 'too_technical',
        label: 'Too technical/hard to understand',
        icon: '',
    },
    {
        id: 'not_technical',
        label: 'Not technical enough',
        icon: '',
    },
    {
        id: 'missing_resources',
        label: 'Missing resources/videos',
        icon: '',
    },
    {
        id: 'incorrect_info',
        label: 'Incorrect/inaccurate information',
        icon: '',
    },
    {
        id: 'didnt_address',
        label: "Didn't address my question",
        icon: '',
    },
    {
        id: 'poor_formatting',
        label: 'Poor formatting/hard to read',
        icon: '',
    },
];
