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
    Tabs,
    Tab,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {
    getAllFeedbacks,
    getFeedbackStats,
    getAllSolutionFeedbacks,
    getSolutionFeedbackStats,
} from '../../services/feedbackService';

/**
 * Admin Dashboard to view all feedback stored in Firebase
 * This is an optional component for administrators to view feedback analytics
 */
const FeedbackDashboard = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [solutionFeedbacks, setSolutionFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [solutionStats, setSolutionStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadFeedbackData();
    }, []);

    const loadFeedbackData = async () => {
        try {
            setLoading(true);
            const [
                allFeedbacks,
                feedbackStats,
                allSolutionFeedbacks,
                solutionFeedbackStats,
            ] = await Promise.all([
                getAllFeedbacks(50),
                getFeedbackStats(),
                getAllSolutionFeedbacks(50),
                getSolutionFeedbackStats(),
            ]);
            setFeedbacks(allFeedbacks);
            setStats(feedbackStats);
            setSolutionFeedbacks(allSolutionFeedbacks);
            setSolutionStats(solutionFeedbackStats);
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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

            {/* Tabs for switching between General and Solution Feedbacks */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="General Feedback" />
                    <Tab label="Solution-Specific Feedback" />
                </Tabs>
            </Paper>

            {/* General Feedback Tab */}
            {activeTab === 0 && (
                <>
                    {/* Stats Cards */}
                    {stats && (
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Total General Feedback
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
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
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
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
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

                    {/* General Feedback List */}
                    <Paper sx={{ p: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ mb: 3, fontWeight: 500 }}
                        >
                            Recent General Feedback
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
                                                    feedback.feedbackType ===
                                                    'positive'
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
                                            secondary={
                                                feedback.userQuery || 'N/A'
                                            }
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
                                                    {feedback.aiResponse ||
                                                        'N/A'}
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
                                                                label={
                                                                    selection
                                                                }
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
                                No general feedback data available yet.
                            </Typography>
                        )}
                    </Paper>
                </>
            )}

            {/* Solution-Specific Feedback Tab */}
            {activeTab === 1 && (
                <>
                    {/* Solution Stats Cards */}
                    {solutionStats && (
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Total Solution Feedback
                                        </Typography>
                                        <Typography variant="h3">
                                            {solutionStats.total}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ bgcolor: 'success.light' }}>
                                    <CardContent>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Positive Solution Feedback
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
                                                {solutionStats.positive}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ bgcolor: 'error.light' }}>
                                    <CardContent>
                                        <Typography
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Negative Solution Feedback
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
                                                {solutionStats.negative}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Solution Feedback List */}
                    <Paper sx={{ p: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ mb: 3, fontWeight: 500 }}
                        >
                            Recent Solution-Specific Feedback
                        </Typography>
                        <List>
                            {solutionFeedbacks.map((feedback, index) => (
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
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Chip
                                                    icon={
                                                        feedback.type ===
                                                        'positive' ? (
                                                            <ThumbUpIcon />
                                                        ) : (
                                                            <ThumbDownIcon />
                                                        )
                                                    }
                                                    label={feedback.type}
                                                    color={
                                                        feedback.type ===
                                                        'positive'
                                                            ? 'success'
                                                            : 'error'
                                                    }
                                                    size="small"
                                                />
                                                <Chip
                                                    label={`Solution #${feedback.solutionNumber}`}
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
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
                                            secondary={
                                                feedback.userQuery || 'N/A'
                                            }
                                        />

                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Solution Title:
                                                </Typography>
                                            }
                                            secondary={
                                                feedback.solutionTitle || 'N/A'
                                            }
                                        />

                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Solution Content:
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxHeight: 150,
                                                        overflow: 'auto',
                                                        whiteSpace: 'pre-wrap',
                                                    }}
                                                >
                                                    {feedback.solutionContent ||
                                                        'N/A'}
                                                </Typography>
                                            }
                                        />

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Session: {feedback.sessionId}
                                        </Typography>
                                    </ListItem>
                                    {index < solutionFeedbacks.length - 1 && (
                                        <Divider component="li" />
                                    )}
                                </React.Fragment>
                            ))}
                        </List>

                        {solutionFeedbacks.length === 0 && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 4 }}
                            >
                                No solution-specific feedback data available
                                yet.
                            </Typography>
                        )}
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default FeedbackDashboard;
