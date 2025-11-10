import React from 'react';
import { Box } from '@mui/material';
import boschLogo from '../../assets/chat-bot.png';

const BoschLogo = ({ size = 24 }) => (
    <Box
        component="img"
        src={boschLogo}
        alt="Bosch Logo"
        sx={{
            width: size * 1.5,
            height: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0.95)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                filter: 'brightness(1)',
            },
        }}
    />
);

export default BoschLogo;
