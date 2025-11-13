import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Drawer,
    List,
    Button,
    useMediaQuery,
    useTheme,
    Skeleton,
    Zoom,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Message from './Message';
import BoschLogo from '../../assets/chat-bot.png';
import ChatHistoryItem from './ChatHistoryItem';
import HelpDialog from './HelpDialog';
import {
    addChat,
    addMessage,
    addFeedback,
    deleteChat,
    renameChat,
    setActiveChatId,
    setLoading,
    selectChats,
    selectActiveChat,
    selectActiveChatId,
    selectIsLoading,
} from '../../redux/chatSlice';
import { buildSystemPrompt } from '../../utils/promptBuilder';
import { storeFeedback } from '../../services/feedbackService';

const ChatInterface = () => {
    const dispatch = useDispatch();
    const chats = useSelector(selectChats);
    const activeChat = useSelector(selectActiveChat);
    const activeChatId = useSelector(selectActiveChatId);
    const isLoading = useSelector(selectIsLoading);
    const [input, setInput] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Function to call Perplexity AI API
    const callPerplexityAPI = async (query) => {
        const headers = {
            Authorization:
                'Bearer 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',
            'Content-Type': 'application/json',
        };

        // Build dynamic system prompt based on user preferences
        const systemPrompt = buildSystemPrompt();
        const payload = {
            model: 'sonar',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query },
            ],
        };

        try {
            const response = await fetch(
                'https://api.perplexity.ai/chat/completions',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();

            // Remove citation markers [1], [2], etc. from the response
            const content = data.choices[0].message.content;
            const cleanedContent = content.replace(/\[\d+\]/g, '');
            console.log('cleanedContent', cleanedContent);
            return cleanedContent;
        } catch (error) {
            console.error('Error calling Perplexity API:', error);
            return 'Sorry, I encountered an error processing your request. Please try again.';
        }
    };

    const createNewChat = () => {
        // Check if we can create a new chat
        if (chats.length === 0 || chats[0].messages.length > 0) {
            const newChat = {
                id: Date.now().toString(),
                title: 'New Chat',
                messages: [],
            };
            dispatch(addChat(newChat));
            dispatch(setActiveChatId(newChat.id));
            if (isMobile) {
                setDrawerOpen(false);
            }
        }
    };

    const handleSend = async () => {
        // Prevent sending if already loading or input is empty
        if (input.trim() && activeChatId && !isLoading) {
            const userMessage = {
                text: input.trim(),
                sender: 'user',
                timestamp: new Date().toISOString(),
            };
            dispatch(
                addMessage({ chatId: activeChatId, message: userMessage })
            );
            setInput('');
            dispatch(setLoading(true));
            scrollToBottom();

            // Get AI response
            const aiResponse = await callPerplexityAPI(input);
            const aiMessage = {
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };
            dispatch(addMessage({ chatId: activeChatId, message: aiMessage }));
            dispatch(setLoading(false));
            scrollToBottom();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Don't send if already loading or input is empty
            if (!isLoading && input.trim()) {
                handleSend();
            }
        }
    };

    const handleRename = (chatId, newTitle) => {
        dispatch(renameChat({ chatId, newTitle }));
    };

    const handleFeedbackSubmit = async (feedbackData) => {
        try {
            // Get the corresponding messages from the chat
            const chat = chats.find((c) => c.id === activeChatId);
            if (!chat) return;

            // Get user query and AI response for this message
            const messageIndex = feedbackData.messageIndex;
            let userQuery = '';
            let aiResponse = '';

            // Find the user message and AI response pair
            if (messageIndex > 0) {
                // The AI message is at messageIndex, user message is likely before it
                const aiMessage = chat.messages[messageIndex];
                const userMessage = chat.messages[messageIndex - 1];

                if (userMessage && userMessage.sender === 'user') {
                    userQuery = userMessage.text;
                }
                if (aiMessage && aiMessage.sender === 'ai') {
                    aiResponse = aiMessage.text;
                }
            }

            // Store feedback in Redux state (for local UI updates)
            dispatch(
                addFeedback({
                    chatId: activeChatId,
                    messageIndex: feedbackData.messageIndex,
                    feedback: {
                        type: feedbackData.type,
                        selections: feedbackData.selections,
                    },
                })
            );

            // Store feedback globally in Firebase
            const feedbackToStore = {
                ...feedbackData,
                userQuery,
                aiResponse,
                chatId: activeChatId,
            };

            await storeFeedback(feedbackToStore);

            console.log(
                'Feedback submitted and stored globally:',
                feedbackData
            );
            console.log('User query:', userQuery);
            console.log('AI response:', aiResponse);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            // Still store locally even if Firebase fails
            dispatch(
                addFeedback({
                    chatId: activeChatId,
                    messageIndex: feedbackData.messageIndex,
                    feedback: {
                        type: feedbackData.type,
                        selections: feedbackData.selections,
                    },
                })
            );
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                bgcolor: 'background.default',
            }}
        >
            {/* Help Dialog */}
            <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

            {/* Sidebar */}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: 320,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 320,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        justifyContent: 'flex-start ',
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={BoschLogo}
                        alt="Bosch Logo"
                        style={{
                            height: '50px',
                            width: 'auto',
                        }}
                    />
                    BCS AI Assistant
                </Box>
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={createNewChat}
                        sx={{
                            py: 1,
                            backgroundColor: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.dark' },
                            borderRadius: '8px',
                        }}
                    >
                        New Chat
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'calc(100% - 140px)',
                    }}
                >
                    <List sx={{ overflow: 'auto', px: 1, py: 2, flexGrow: 1 }}>
                        {chats.map((chat) => (
                            <ChatHistoryItem
                                key={chat.id}
                                chat={chat}
                                isSelected={chat.id === activeChatId}
                                onSelect={() => {
                                    dispatch(setActiveChatId(chat.id));
                                    if (isMobile) setDrawerOpen(false);
                                }}
                                onDelete={() => dispatch(deleteChat(chat.id))}
                                onRename={handleRename}
                            />
                        ))}
                    </List>
                    <Box
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'grey.200',
                        }}
                    >
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<HelpOutlineIcon />}
                            onClick={() => setHelpOpen(true)}
                            sx={{
                                py: 1,
                                borderRadius: '8px',
                            }}
                        >
                            Help & FAQ
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Main Chat Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    bgcolor: 'background.paper',
                }}
            >
                {/* Mobile Header */}
                {isMobile && (
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'grey.200',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                            BCS AI Assistant
                        </Typography>
                    </Box>
                )}

                {/* Messages Area */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        bgcolor: 'background.default',
                    }}
                >
                    {activeChat ? (
                        activeChat.messages.length > 0 ? (
                            <>
                                {activeChat.messages.map((message, index) => {
                                    // Find the user query for this AI response
                                    let userQuery = '';
                                    if (message.sender === 'ai' && index > 0) {
                                        // Get the previous user message
                                        const previousMessage =
                                            activeChat.messages[index - 1];
                                        if (
                                            previousMessage &&
                                            previousMessage.sender === 'user'
                                        ) {
                                            userQuery = previousMessage.text;
                                        }
                                    }

                                    return (
                                        <Zoom
                                            in={true}
                                            key={index}
                                            style={{
                                                transitionDelay: `${
                                                    index * 100
                                                }ms`,
                                            }}
                                        >
                                            <div>
                                                <Message
                                                    message={message}
                                                    messageIndex={index}
                                                    userQuery={userQuery}
                                                    isLoading={
                                                        isLoading &&
                                                        index ===
                                                            activeChat.messages
                                                                .length -
                                                                1
                                                    }
                                                    onFeedbackSubmit={
                                                        handleFeedbackSubmit
                                                    }
                                                />
                                            </div>
                                        </Zoom>
                                    );
                                })}
                                {isLoading && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                        }}
                                    >
                                        <Skeleton
                                            variant="circular"
                                            width={40}
                                            height={40}
                                        />
                                        <Skeleton
                                            variant="rounded"
                                            width="60%"
                                            height={60}
                                        />
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'text.primary',
                                        fontWeight: 500,
                                    }}
                                >
                                    Bosch Car Service AI Assistant
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        maxWidth: 600,
                                        textAlign: 'center',
                                        mb: 2,
                                        color: 'text.secondary',
                                    }}
                                >
                                    Enter a DTC code or describe your
                                    car-related issue to get expert diagnostic
                                    assistance.
                                </Typography>
                            </Box>
                        )
                    ) : (
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ color: 'text.primary' }}
                            >
                                No chat selected
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={createNewChat}
                                sx={{ mt: 2 }}
                            >
                                Start a new chat
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Input Area */}
                {activeChat && (
                    <Box
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'grey.200',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1,
                                display: 'flex',
                                gap: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: '8px',
                                bgcolor: 'background.default',
                                '&:focus-within': {
                                    borderColor: 'primary.main',
                                    boxShadow:
                                        '0 0 0 2px rgba(0, 86, 145, 0.2)',
                                },
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    isLoading
                                        ? 'Please wait while processing your request...'
                                        : 'Enter a DTC code or describe the issue...'
                                }
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        padding: 1,
                                        fontSize: '1rem',
                                        color: 'text.primary',
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: 'text.secondary',
                                        opacity: 0.8,
                                    },
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                sx={{
                                    alignSelf: 'flex-end',
                                    color: input.trim()
                                        ? 'primary.main'
                                        : 'text.disabled',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Paper>
                    </Box>
                )}

                {/* Help Dialog */}
                <HelpDialog
                    open={helpOpen}
                    onClose={() => setHelpOpen(false)}
                />
            </Box>
        </Box>
    );
};

export default ChatInterface;
