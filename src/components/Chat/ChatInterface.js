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
    Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Message from './Message';
import BoschLogo from '../../assets/Bosch-logopng.png';
import ChatHistoryItem from './ChatHistoryItem';
import HelpDialog from './HelpDialog';
import {
    addChat,
    addMessage,
    deleteChat,
    renameChat,
    setActiveChatId,
    setLoading,
    selectChats,
    selectActiveChat,
    selectActiveChatId,
    selectIsLoading,
} from '../../redux/chatSlice';

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

        const systemPrompt = `You are an expert AI assistant specializing in troubleshooting Bosch car service related issues and DTCs (Diagnostic Trouble Codes). 

When given an error code or issue, provide a comprehensive response in this format:

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
   - List 5 proven solutions from reputable sources
   - Order them from most successful to least successful
   - Include estimated repair time and difficulty level
   - Mention if special tools are required

5. RELEVANT RESOURCES:
   - Include links to official Bosch documentation if available
   - Add relevant YouTube tutorial links with timestamps
   - Reference Technical Service Bulletins (TSBs) if applicable

6. PREVENTIVE MEASURES:
   - Suggest maintenance steps to prevent this issue
   - Include service intervals if applicable

Format YouTube links as complete URLs (e.g., https://www.youtube.com/watch?v=VIDEO_ID).
Use bullet points for better readability.
If the input is not a DTC, provide a similar structured response for general car diagnostic queries.`;

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
            return data.choices[0].message.content;
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
        if (input.trim() && activeChatId) {
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
            handleSend();
        }
    };

    const handleRename = (chatId, newTitle) => {
        dispatch(renameChat({ chatId, newTitle }));
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
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={BoschLogo}
                        alt="Bosch Logo"
                        style={{
                            height: '35px',
                        }}
                    />
                    <Tooltip title="Help">
                        <IconButton
                            onClick={() => setHelpOpen(true)}
                            size="small"
                            sx={{ ml: 1 }}
                        >
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
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
                            p: 1,
                            borderBottom: 1,
                            borderColor: 'grey.200',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
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
                                {activeChat.messages.map((message, index) => (
                                    <Zoom
                                        in={true}
                                        key={index}
                                        style={{
                                            transitionDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <div>
                                            <Message
                                                message={message}
                                                isLoading={
                                                    isLoading &&
                                                    index ===
                                                        activeChat.messages
                                                            .length -
                                                            1
                                                }
                                            />
                                        </div>
                                    </Zoom>
                                ))}
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
                                placeholder="Enter a DTC code or describe the issue..."
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
