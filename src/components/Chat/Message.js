import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VideoPlayer from './VideoPlayer';
import FeedbackButtons from './FeedbackButtons';
import { extractSolutions, hasSolutions } from '../../utils/solutionParser';
import { storeSolutionFeedback } from '../../services/feedbackService';

const Message = ({
    message,
    isLoading,
    messageIndex,
    onFeedbackSubmit,
    userQuery,
}) => {
    const isAI = message.sender === 'ai';
    const [videoPlayer, setVideoPlayer] = useState({
        open: false,
        videoId: null,
    });
    const [copiedSolution, setCopiedSolution] = useState(null);
    const [solutionFeedback, setSolutionFeedback] = useState({});

    // Extract solutions if available
    const solutions =
        isAI && hasSolutions(message.text)
            ? extractSolutions(message.text)
            : [];

    const extractVideoId = (url) => {
        if (!url) return null;

        // Handle various YouTube URL formats
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\s]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\s]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    };

    const copySolution = async (solution) => {
        try {
            await navigator.clipboard.writeText(solution.content);
            setCopiedSolution(solution.number);
            setTimeout(() => setCopiedSolution(null), 2000);
        } catch (err) {
            console.error('Failed to copy solution:', err);
        }
    };

    // Handle solution-specific feedback
    const handleSolutionFeedback = async (solution, feedbackType) => {
        try {
            // Update local state to show feedback was given
            setSolutionFeedback((prev) => ({
                ...prev,
                [solution.number]: feedbackType,
            }));

            // Store feedback in Firebase - separate collection for solution feedbacks
            const feedbackData = {
                userQuery: userQuery || 'N/A',
                aiResponse: message.text,
                solutionNumber: solution.number,
                solutionTitle: solution.title,
                solutionContent: solution.content,
                type: feedbackType, // 'positive' or 'negative'
                feedbackContext: 'solution-specific',
                timestamp: new Date().toISOString(),
                messageIndex: messageIndex,
            };

            await storeSolutionFeedback(feedbackData);
            console.log(
                `Solution ${solution.number} feedback (${feedbackType}) stored successfully in solutionFeedbacks collection`
            );
        } catch (error) {
            console.error('Error storing solution feedback:', error);
        }
    };

    // Process message text to add copy buttons next to solutions
    const processedText =
        isAI && solutions.length > 0
            ? solutions.reduce((text, solution) => {
                  // Replace the entire match (including [SOLUTION]) with number, title, and copy button placeholder
                  const placeholder = `{{COPY_BUTTON_${solution.number}}}`;
                  return text.replace(
                      solution.fullMatch,
                      `${solution.number}. ${solution.title} ${placeholder}`
                  );
              }, message.text)
            : message.text;

    const CustomLink = ({ href, children }) => {
        const urlToCheck = href || (children && children.toString());
        const videoId = extractVideoId(urlToCheck);

        if (videoId) {
            return (
                <button
                    onClick={() => setVideoPlayer({ open: true, videoId })}
                    className={`inline-flex items-center space-x-1 ${
                        isAI
                            ? 'text-accent-primary hover:text-accent-secondary'
                            : 'text-white/90 hover:text-white'
                    } transition-all duration-300 ease-in-out hover:scale-[1.02]`}
                >
                    {children || href}
                </button>
            );
        }

        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1 ${
                    isAI
                        ? 'text-accent-primary hover:text-accent-secondary'
                        : 'text-white/90 hover:text-white'
                } transition-all duration-300 ease-in-out hover:scale-[1.02]`}
            >
                {children || href}
            </a>
        );
    };

    // Render text content with copy button support
    const renderTextWithCopyButton = (text) => {
        if (typeof text !== 'string') return text;

        // Check if this text contains a copy button placeholder
        const copyButtonPattern = /\{\{COPY_BUTTON_(\d+)\}\}/g;
        const matches = [...text.matchAll(copyButtonPattern)];

        if (matches.length === 0) return text;

        const parts = [];
        let lastIndex = 0;

        matches.forEach((match, idx) => {
            const solutionNumber = match[1];
            const solution = solutions.find((s) => s.number === solutionNumber);

            // Add text before the placeholder
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            // Add the copy button
            if (solution) {
                const hasFeedback = solutionFeedback[solutionNumber];

                parts.push(
                    <span
                        key={`solution-actions-${solutionNumber}`}
                        className="inline-flex items-center gap-2 ml-2"
                    >
                        {/* Copy Button */}
                        <button
                            onClick={() => copySolution(solution)}
                            className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 hover:scale-110 ${
                                copiedSolution === solutionNumber
                                    ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                                    : 'bg-surface-100 hover:bg-blue-500/10 text-surface-600 hover:text-blue-600 border border-surface-200 hover:border-blue-500/30'
                            } hover:shadow-md`}
                            title="Copy this solution"
                        >
                            {copiedSolution === solutionNumber ? (
                                <>
                                    <svg
                                        className="w-3.5 h-3.5 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M20 6.5a1 1 0 010 1.414l-10 10a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 15.586 18.586 6.5A1 1 0 0120 6.5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-3.5 h-3.5 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>

                        {/* Thumbs Up Button */}
                        <button
                            onClick={() =>
                                handleSolutionFeedback(solution, 'positive')
                            }
                            disabled={hasFeedback}
                            className={`inline-flex items-center justify-center p-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-110 ${
                                hasFeedback === 'positive'
                                    ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                                    : 'bg-surface-100 hover:bg-green-500/10 text-surface-600 hover:text-green-600 border border-surface-200 hover:border-green-500/30'
                            } ${
                                hasFeedback
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'hover:shadow-md'
                            }`}
                            title="This solution was helpful"
                        >
                            <svg
                                className="w-4 h-4"
                                fill={
                                    hasFeedback === 'positive'
                                        ? 'currentColor'
                                        : 'none'
                                }
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                            </svg>
                        </button>

                        {/* Thumbs Down Button */}
                        <button
                            onClick={() =>
                                handleSolutionFeedback(solution, 'negative')
                            }
                            disabled={hasFeedback}
                            className={`inline-flex items-center justify-center p-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-110 ${
                                hasFeedback === 'negative'
                                    ? 'bg-red-500/20 text-red-600 border border-red-500/30'
                                    : 'bg-surface-100 hover:bg-red-500/10 text-surface-600 hover:text-red-600 border border-surface-200 hover:border-red-500/30'
                            } ${
                                hasFeedback
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'hover:shadow-md'
                            }`}
                            title="This solution was not helpful"
                        >
                            <svg
                                className="w-4 h-4"
                                fill={
                                    hasFeedback === 'negative'
                                        ? 'currentColor'
                                        : 'none'
                                }
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                                />
                            </svg>
                        </button>
                    </span>
                );
                // Add line break after buttons
                parts.push(<br key={`line-break-${solutionNumber}`} />);
            }

            lastIndex = match.index + match[0].length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts.length > 1 ? <>{parts}</> : parts[0];
    };

    // Process children recursively to find and replace copy button placeholders
    const processChildren = (children) => {
        if (typeof children === 'string') {
            return renderTextWithCopyButton(children);
        }

        if (Array.isArray(children)) {
            return children.map((child, idx) => {
                if (typeof child === 'string') {
                    return (
                        <span key={idx}>{renderTextWithCopyButton(child)}</span>
                    );
                }
                return child;
            });
        }

        return children;
    };

    return (
        <div
            className={`flex items-end ${
                isAI ? 'justify-start' : 'justify-end'
            } mb-8 w-full group`}
        >
            <div
                className={`relative max-w-[80%] md:max-w-[85%] ${
                    isAI ? 'chat-ai' : 'chat-user'
                }`}
            >
                <div
                    className={`
                        rounded-2xl px-5 py-4
                        ${
                            isAI
                                ? 'bg-surface-50 border border-surface-200 shadow-ai-message hover:shadow-ai-message-hover backdrop-blur-xs'
                                : 'bg-gradient-user text-white shadow-message hover:shadow-message-hover'
                        }
                        transition-all duration-300 ease-in-out hover:-translate-y-0.5
                    `}
                >
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: CustomLink,
                                p: ({ children }) => (
                                    <p className="mb-3 last:mb-0 leading-relaxed">
                                        {processChildren(children)}
                                    </p>
                                ),
                                h1: ({ children }) => (
                                    <h1 className="text-xl font-bold mb-3 mt-2 tracking-tight">
                                        {processChildren(children)}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold mb-2 mt-2 tracking-tight">
                                        {processChildren(children)}
                                    </h2>
                                ),
                                li: ({ children }) => (
                                    <li className="mb-1.5">
                                        <span className="leading-relaxed">
                                            {processChildren(children)}
                                        </span>
                                    </li>
                                ),
                                strong: ({ children }) => (
                                    <strong>{processChildren(children)}</strong>
                                ),
                                code: ({ inline, children }) => {
                                    return (
                                        <code
                                            className={`${
                                                inline
                                                    ? 'px-1.5 py-0.5 rounded-md text-sm'
                                                    : 'block p-4 rounded-lg text-sm leading-relaxed overflow-x-auto'
                                            } ${
                                                isAI
                                                    ? 'bg-surface-100 border border-surface-200'
                                                    : 'bg-white/10 border border-white/20'
                                            } font-mono transition-all duration-300 ease-in-out hover:shadow-sm`}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {processedText}
                        </ReactMarkdown>
                    </div>

                    {/* Feedback Buttons - Only show for AI messages and not during loading */}
                    {isAI && !isLoading && (
                        <FeedbackButtons
                            messageId={message.timestamp}
                            messageIndex={messageIndex}
                            onFeedbackSubmit={onFeedbackSubmit}
                        />
                    )}
                </div>
            </div>
            <VideoPlayer
                videoId={videoPlayer.videoId}
                open={videoPlayer.open}
                onClose={() => setVideoPlayer({ open: false, videoId: null })}
            />
        </div>
    );
};

export default Message;
