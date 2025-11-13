import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {
    getAllFeedbacks,
    getFeedbackStats,
} from '../../services/feedbackService';

/**
 * Admin Dashboard to view all feedback stored in Firebase
 * This is an optional component for administrators to view feedback analytics
 */
const FeedbackDashboard = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFeedbackData();
    }, []);

    const loadFeedbackData = async () => {
        try {
            setLoading(true);
            const [allFeedbacks, feedbackStats] = await Promise.all([
                getAllFeedbacks(50),
                getFeedbackStats(),
            ]);
            setFeedbacks(allFeedbacks);
            setStats(feedbackStats);
            setError(null);
        } catch (err) {
            console.error('Error loading feedback:', err);
            setError(
                'Failed to load feedback. Make sure Firebase is configured correctly.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                Feedback Analytics Dashboard
            </Typography>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Total Feedback
                                </Typography>
                                <Typography variant="h3">
                                    {stats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'success.light' }}>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Positive Feedback
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <ThumbUpIcon />
                                    <Typography variant="h3">
                                        {stats.positive}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'error.light' }}>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Negative Feedback
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <ThumbDownIcon />
                                    <Typography variant="h3">
                                        {stats.negative}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Feedback List */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                    Recent Feedback
                </Typography>
                <List>
                    {feedbacks.map((feedback, index) => (
                        <React.Fragment key={feedback.id}>
                            <ListItem
                                alignItems="flex-start"
                                sx={{ flexDirection: 'column', gap: 1 }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Chip
                                        icon={
                                            feedback.feedbackType ===
                                            'positive' ? (
                                                <ThumbUpIcon />
                                            ) : (
                                                <ThumbDownIcon />
                                            )
                                        }
                                        label={feedback.feedbackType}
                                        color={
                                            feedback.feedbackType === 'positive'
                                                ? 'success'
                                                : 'error'
                                        }
                                        size="small"
                                    />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {new Date(
                                            feedback.timestamp
                                        ).toLocaleString()}
                                    </Typography>
                                </Box>

                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            User Query:
                                        </Typography>
                                    }
                                    secondary={feedback.userQuery || 'N/A'}
                                />

                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            AI Response:
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxHeight: 100,
                                                overflow: 'auto',
                                            }}
                                        >
                                            {feedback.aiResponse || 'N/A'}
                                        </Typography>
                                    }
                                />

                                {feedback.selections &&
                                    feedback.selections.length > 0 && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {feedback.selections.map(
                                                (selection, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={selection}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )
                                            )}
                                        </Box>
                                    )}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Session: {feedback.sessionId}
                                </Typography>
                            </ListItem>
                            {index < feedbacks.length - 1 && (
                                <Divider component="li" />
                            )}
                        </React.Fragment>
                    ))}
                </List>

                {feedbacks.length === 0 && (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 4 }}
                    >
                        No feedback data available yet.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default FeedbackDashboard;
