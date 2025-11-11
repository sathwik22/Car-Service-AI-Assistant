import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chats: JSON.parse(localStorage.getItem('chats')) || [],
    activeChatId: localStorage.getItem('activeChatId') || null,
    isLoading: false,
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
            localStorage.setItem('chats', JSON.stringify(action.payload));
        },
        addChat: (state, action) => {
            // Only add a new chat if there are no chats, or if the most recent chat has messages
            if (
                state.chats.length === 0 ||
                state.chats[0].messages.length > 0
            ) {
                state.chats.unshift(action.payload);
                localStorage.setItem('chats', JSON.stringify(state.chats));
            }
        },
        deleteChat: (state, action) => {
            state.chats = state.chats.filter(
                (chat) => chat.id !== action.payload
            );
            localStorage.setItem('chats', JSON.stringify(state.chats));
            if (state.activeChatId === action.payload) {
                const newActiveChatId = state.chats[0]?.id || null;
                state.activeChatId = newActiveChatId;
                localStorage.setItem('activeChatId', newActiveChatId);
            }
        },
        setActiveChatId: (state, action) => {
            state.activeChatId = action.payload;
            localStorage.setItem('activeChatId', action.payload);
        },
        addMessage: (state, action) => {
            const { chatId, message } = action.payload;
            const chat = state.chats.find((c) => c.id === chatId);
            if (chat) {
                if (chat.messages.length === 0) {
                    chat.title = message.text.substring(0, 30) + '...';
                }
                chat.messages.push(message);
                localStorage.setItem('chats', JSON.stringify(state.chats));
            }
        },
        addFeedback: (state, action) => {
            const { chatId, messageIndex, feedback } = action.payload;
            const chat = state.chats.find((c) => c.id === chatId);
            if (chat && chat.messages[messageIndex]) {
                chat.messages[messageIndex].feedback = {
                    ...feedback,
                    timestamp: new Date().toISOString(),
                };
                localStorage.setItem('chats', JSON.stringify(state.chats));
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        renameChat: (state, action) => {
            const { chatId, newTitle } = action.payload;
            const chat = state.chats.find((c) => c.id === chatId);
            if (chat) {
                chat.title = newTitle;
                localStorage.setItem('chats', JSON.stringify(state.chats));
            }
        },
    },
});

export const {
    setChats,
    addChat,
    deleteChat,
    setActiveChatId,
    addMessage,
    addFeedback,
    setLoading,
    renameChat,
} = chatSlice.actions;

export const selectChats = (state) => state.chat.chats;
export const selectActiveChat = (state) =>
    state.chat.chats.find((chat) => chat.id === state.chat.activeChatId);
export const selectActiveChatId = (state) => state.chat.activeChatId;
export const selectIsLoading = (state) => state.chat.isLoading;

export default chatSlice.reducer;
