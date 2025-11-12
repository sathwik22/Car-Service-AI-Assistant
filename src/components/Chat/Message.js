import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VideoPlayer from './VideoPlayer';
import FeedbackButtons from './FeedbackButtons';

const Message = ({ message, isLoading, messageIndex, onFeedbackSubmit }) => {
    const isAI = message.sender === 'ai';
    const [videoPlayer, setVideoPlayer] = useState({
        open: false,
        videoId: null,
    });

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
                                        {children}
                                    </p>
                                ),
                                h1: ({ children }) => (
                                    <h1 className="text-xl font-bold mb-3 mt-2 tracking-tight">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold mb-2 mt-2 tracking-tight">
                                        {children}
                                    </h2>
                                ),
                                li: ({ children }) => (
                                    <li className="mb-1.5">
                                        <span className="leading-relaxed">
                                            {children}
                                        </span>
                                    </li>
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
                            {message.text}
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
