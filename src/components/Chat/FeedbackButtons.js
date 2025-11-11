import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Collapse,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Button,
    Typography,
    Fade,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { positiveOptions, negativeOptions } from '../../utils/promptConfig';
import { processFeedback } from '../../utils/promptBuilder';

const FeedbackButtons = ({ messageId, messageIndex, onFeedbackSubmit }) => {
    const [feedbackType, setFeedbackType] = useState(null); // 'positive' | 'negative' | null
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const handleThumbClick = (type) => {
        if (submitted) return; // Don't allow changes after submission

        if (feedbackType === type) {
            // Clicking same thumb - collapse options
            setFeedbackType(null);
            setShowOptions(false);
            setSelectedOptions([]);
        } else {
            // Clicking different thumb or first click
            setFeedbackType(type);
            setShowOptions(true);
            setSelectedOptions([]);
        }
    };

    const handleOptionToggle = (optionId) => {
        setSelectedOptions((prev) => {
            if (prev.includes(optionId)) {
                return prev.filter((id) => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const handleSubmit = () => {
        if (selectedOptions.length === 0) return;

        // Process feedback and update preferences
        const newPreferences = processFeedback(feedbackType, selectedOptions);

        // Notify parent component
        if (onFeedbackSubmit) {
            onFeedbackSubmit({
                type: feedbackType,
                selections: selectedOptions,
                preferences: newPreferences,
                messageId,
                messageIndex,
            });
        }

        setSubmitted(true);
        setShowOptions(false);

        // Auto-hide confirmation after 3 seconds
        setTimeout(() => {
            setShowOptions(false);
        }, 3000);
    };

    const options =
        feedbackType === 'positive' ? positiveOptions : negativeOptions;
    const bgColor = feedbackType === 'positive' ? '#E8F5E9' : '#FFF3E0';

    return (
        <Box sx={{ mt: 2 }}>
            {/* Feedback Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <IconButton
                    onClick={() => handleThumbClick('positive')}
                    disabled={submitted}
                    sx={{
                        color:
                            feedbackType === 'positive' || submitted
                                ? 'success.main'
                                : 'grey.500',
                        '&:hover': {
                            color: 'success.main',
                            backgroundColor: 'success.light',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    {feedbackType === 'positive' ||
                    (submitted && feedbackType === 'positive') ? (
                        <ThumbUpIcon />
                    ) : (
                        <ThumbUpOutlinedIcon />
                    )}
                </IconButton>

                <IconButton
                    onClick={() => handleThumbClick('negative')}
                    disabled={submitted}
                    sx={{
                        color:
                            feedbackType === 'negative' ||
                            (submitted && feedbackType === 'negative')
                                ? 'warning.main'
                                : 'grey.500',
                        '&:hover': {
                            color: 'warning.main',
                            backgroundColor: 'warning.light',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    {feedbackType === 'negative' ||
                    (submitted && feedbackType === 'negative') ? (
                        <ThumbDownIcon />
                    ) : (
                        <ThumbDownOutlinedIcon />
                    )}
                </IconButton>

                {submitted && (
                    <Fade in={submitted}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'success.main',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                            }}
                        >
                            ✅ Thanks! Your feedback will improve future
                            responses.
                        </Typography>
                    </Fade>
                )}
            </Box>

            {/* Feedback Options */}
            <Collapse in={showOptions && !submitted}>
                <Box
                    sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: bgColor,
                        border: '1px solid',
                        borderColor:
                            feedbackType === 'positive'
                                ? 'success.light'
                                : 'warning.light',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1.5,
                            fontWeight: 600,
                            color:
                                feedbackType === 'positive'
                                    ? 'success.dark'
                                    : 'warning.dark',
                        }}
                    >
                        {feedbackType === 'positive'
                            ? '✨ What did you like about this response?'
                            : '💡 Help us improve! What went wrong?'}
                    </Typography>

                    <FormGroup>
                        {options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                control={
                                    <Checkbox
                                        checked={selectedOptions.includes(
                                            option.id
                                        )}
                                        onChange={() =>
                                            handleOptionToggle(option.id)
                                        }
                                        sx={{
                                            color:
                                                feedbackType === 'positive'
                                                    ? 'success.main'
                                                    : 'warning.main',
                                            '&.Mui-checked': {
                                                color:
                                                    feedbackType === 'positive'
                                                        ? 'success.main'
                                                        : 'warning.main',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        {option.label}
                                    </Typography>
                                }
                            />
                        ))}
                    </FormGroup>

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSubmit}
                        disabled={selectedOptions.length === 0}
                        sx={{
                            mt: 2,
                            backgroundColor:
                                feedbackType === 'positive'
                                    ? 'success.main'
                                    : 'warning.main',
                            '&:hover': {
                                backgroundColor:
                                    feedbackType === 'positive'
                                        ? 'success.dark'
                                        : 'warning.dark',
                            },
                            '&:disabled': {
                                backgroundColor: 'grey.300',
                                color: 'grey.500',
                            },
                        }}
                    >
                        Submit Feedback
                    </Button>
                </Box>
            </Collapse>
        </Box>
    );
};

export default FeedbackButtons;
