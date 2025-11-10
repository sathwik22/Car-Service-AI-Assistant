/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F4F7FE',
                    100: '#E2E8FD',
                    200: '#C5D1FB',
                    300: '#A7BAF9',
                    400: '#8AA3F7',
                    500: '#6D8CF5',
                    600: '#4F75F3',
                    700: '#325EF1',
                    800: '#1447EF',
                    900: '#0B31BE',
                },
                chat: {
                    user: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    userBg: '#4338ca',
                    ai: '#ffffff',
                    aiBg: '#f8fafc',
                    aiHover: '#f1f5f9',
                    userHover: '#3730a3',
                    border: '#e2e8f0',
                    time: '#94a3b8',
                },
                accent: {
                    primary: '#8b5cf6',
                    secondary: '#6366f1',
                    tertiary: '#06b6d4',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                },
                surface: {
                    50: '#ffffff',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-user':
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                'gradient-ai':
                    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            },
            boxShadow: {
                message:
                    '0 2px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                'message-hover':
                    '0 8px 20px rgba(0,0,0,0.08), 0 2px 5px rgba(0,0,0,0.12)',
                'ai-message':
                    '0 2px 10px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)',
                'ai-message-hover':
                    '0 8px 20px rgba(0,0,0,0.05), 0 2px 5px rgba(0,0,0,0.08)',
                glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            },
            backdropBlur: {
                xs: '2px',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: 'inherit',
                        a: {
                            color: theme('colors.accent.primary'),
                            '&:hover': {
                                color: theme('colors.accent.secondary'),
                            },
                        },
                        'h1, h2, h3, h4, h5, h6': {
                            color: 'inherit',
                        },
                        code: {
                            color: 'inherit',
                        },
                        'pre code': {
                            backgroundColor: 'transparent',
                            color: 'inherit',
                        },
                    },
                },
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
    important: true,
};
