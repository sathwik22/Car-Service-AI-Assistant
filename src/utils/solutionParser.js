/**
 * Utility to parse solutions from AI response and extract individual solutions
 */

/**
 * Extracts individual solutions from the AI response
 * @param {string} content - The full AI response content
 * @returns {Array} Array of solution objects with { number, title, content }
 */
export const extractSolutions = (content) => {
    const solutions = [];

    // Match patterns like:
    // "1. [SOLUTION] Clean or replace the EGR valve (Success rate: 60-70%)"
    // "1. [SOLUTION] **Replace Drive Motor Inverter Temperature Sensor** (Success rate: 70%)"
    // The pattern now handles optional bold markers around the title
    const solutionPattern = /(\d+)\.\s*\[SOLUTION\]\s*(.*?)(?=\n|$)/g;

    let match;
    const matches = [];

    while ((match = solutionPattern.exec(content)) !== null) {
        let rawTitle = match[2].trim();

        // Remove bold markers if present
        rawTitle = rawTitle.replace(/^\*\*/, '').replace(/\*\*$/, '');

        matches.push({
            index: match.index,
            number: match[1],
            title: rawTitle,
            fullMatch: match[0],
        });
    }

    // Extract the content for each solution
    matches.forEach((match, idx) => {
        const startIndex = match.index;
        const nextIndex =
            idx < matches.length - 1 ? matches[idx + 1].index : content.length;

        // Extract everything from this solution until the next one
        let solutionContent = content.substring(startIndex, nextIndex);

        // If this is the last solution, try to end at the next major section
        if (idx === matches.length - 1) {
            const nextSectionMatch = solutionContent.match(/\n\n##\s/);
            if (nextSectionMatch) {
                solutionContent = solutionContent.substring(
                    0,
                    nextSectionMatch.index
                );
            }
        }

        solutions.push({
            number: match.number,
            title: match.title,
            content: solutionContent.trim(),
            fullMatch: match.fullMatch,
        });
    });

    return solutions;
};

/**
 * Checks if the content contains solutions with the [SOLUTION] marker
 * @param {string} content - The AI response content
 * @returns {boolean}
 */
export const hasSolutions = (content) => {
    return /\[SOLUTION\]/.test(content);
};

/**
 * Gets solution content by number
 * @param {string} content - The full AI response content
 * @param {number} solutionNumber - The solution number to extract
 * @returns {string|null} The solution content or null if not found
 */
export const getSolutionByNumber = (content, solutionNumber) => {
    const solutions = extractSolutions(content);
    const solution = solutions.find(
        (s) => s.number === solutionNumber.toString()
    );
    return solution ? solution.content : null;
};
