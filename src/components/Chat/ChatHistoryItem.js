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
    Menu,
    MenuItem,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatHistoryItem = ({
    chat,
    onSelect,
    onDelete,
    onRename,
    isSelected,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(chat.title || 'New Chat');
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = (e) => {
        if (e) e.stopPropagation();
        setAnchorEl(null);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        handleMenuClose();
        onDelete(chat.id);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        handleMenuClose();
        setEditedTitle(chat.title || 'New Chat');
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
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{
                                    color: 'grey.500',
                                    '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'rgba(0, 86, 145, 0.08)',
                                    },
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                onClick={(e) => e.stopPropagation()}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    sx: {
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        minWidth: 140,
                                    },
                                }}
                            >
                                <MenuItem
                                    onClick={handleEditClick}
                                    sx={{
                                        fontSize: '0.875rem',
                                        gap: 1,
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 86, 145, 0.08)',
                                        },
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                    Rename
                                </MenuItem>
                                <MenuItem
                                    onClick={handleDelete}
                                    sx={{
                                        fontSize: '0.875rem',
                                        gap: 1,
                                        color: 'error.main',
                                        '&:hover': {
                                            bgcolor: 'rgba(211, 47, 47, 0.08)',
                                        },
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                    Delete
                                </MenuItem>
                            </Menu>
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
