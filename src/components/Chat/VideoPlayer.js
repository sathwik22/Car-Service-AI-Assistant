import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const VideoPlayer = ({ videoId, open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    bgcolor: 'black',
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                        zIndex: 1,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0, aspectRatio: '16/9' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default VideoPlayer;
