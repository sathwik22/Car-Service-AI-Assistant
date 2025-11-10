import React, { useState } from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    TextField,
    Box,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

const ChatHistoryItem = ({ chat, onSelect, onDelete, onRename, isSelected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(chat.title || 'New Chat');

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(chat.id);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSaveEdit = (e) => {
        e.stopPropagation();
        if (editedTitle.trim() !== '') {
            onRename(chat.id, editedTitle.trim());
            setIsEditing(false);
        }
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditedTitle(chat.title || 'New Chat');
        setIsEditing(false);
    };

    return (
        <ListItem
            disablePadding
            sx={{
                mb: 0.5,
                '&:hover .MuiIconButton-root': {
                    opacity: 1,
                },
            }}
            secondaryAction={
                <Box sx={{ display: 'flex' }}>
                    {isEditing ? (
                        <>
                            <Tooltip title="Save">
                                <IconButton
                                    onClick={handleSaveEdit}
                                    sx={{
                                        color: 'success.main',
                                        mr: 0.5,
                                    }}
                                >
                                    <DoneIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <IconButton
                                    onClick={handleCancelEdit}
                                    sx={{
                                        color: 'grey.500',
                                        mr: 0.5,
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Rename chat">
                                <IconButton
                                    onClick={handleEditClick}
                                    sx={{
                                        color: 'grey.500',
                                        opacity: 0,
                                        transition: '0.2s',
                                        mr: 0.5,
                                        '&:hover': {
                                            color: 'primary.main',
                                            bgcolor: 'primary.light',
                                        },
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete chat">
                                <IconButton
                                    edge="end"
                                    onClick={handleDelete}
                                    sx={{
                                        color: 'grey.500',
                                        opacity: 0,
                                        transition: '0.2s',
                                        '&:hover': {
                                            color: 'error.main',
                                            bgcolor: 'error.light',
                                        },
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            }
        >
            <ListItemButton
                onClick={() => onSelect(chat.id)}
                selected={isSelected}
                sx={{
                    borderRadius: 1,
                    py: 1.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 86, 145, 0.08)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 86, 145, 0.12)',
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                }}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>
                    <ChatIcon
                        fontSize="small"
                        sx={{
                            color: isSelected ? 'primary.main' : 'grey.500',
                            transition: '0.2s',
                        }}
                    />
                </ListItemIcon>
                {isEditing ? (
                    <TextField
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        fullWidth
                        autoFocus
                        sx={{ ml: -1 }}
                    />
                ) : (
                    <ListItemText
                        primary={chat.title || 'New Chat'}
                        primaryTypographyProps={{
                            noWrap: true,
                            fontSize: '0.875rem',
                            fontWeight: isSelected ? 500 : 400,
                            color: isSelected ? 'primary.main' : 'text.primary',
                        }}
                    />
                )}
            </ListItemButton>
        </ListItem>
    );
};

export default ChatHistoryItem;
