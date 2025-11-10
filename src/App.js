import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import store from './redux/store';
import ChatInterface from './components/Chat/ChatInterface';

const theme = createTheme({
    palette: {
        primary: {
            main: '#005691', // Bosch Primary Blue
            light: '#009FDA', // Bosch Light Blue
            dark: '#003B5C', // Bosch Dark Blue
        },
        secondary: {
            main: '#007BC0', // Bosch Secondary Blue
            light: '#009FDA',
            dark: '#005691',
        },
        background: {
            default: '#F8F8F8', // Bosch Light Gray
            paper: '#ffffff',
        },
        grey: {
            100: '#F8F8F8', // Bosch Light Gray
            200: '#E8E8E8',
            300: '#7C878E', // Bosch Slate
            400: '#6A757D',
            500: '#7C878E', // Bosch Slate
        },
        text: {
            primary: '#003B5C', // Bosch Dark Blue
            secondary: '#7C878E', // Bosch Slate
        },
        action: {
            hover: 'rgba(0, 86, 145, 0.04)',
            selected: 'rgba(0, 86, 145, 0.08)',
            disabled: '#7C878E',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { color: '#003B5C' },
        h2: { color: '#003B5C' },
        h3: { color: '#003B5C' },
        h4: { color: '#003B5C' },
        h5: { color: '#003B5C' },
        h6: { color: '#003B5C' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                },
                contained: {
                    backgroundColor: '#005691',
                    '&:hover': {
                        backgroundColor: '#003B5C',
                    },
                },
                outlined: {
                    borderColor: '#005691',
                    color: '#005691',
                    '&:hover': {
                        borderColor: '#003B5C',
                        backgroundColor: 'rgba(0, 86, 145, 0.04)',
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #E8E8E8',
                    backgroundColor: '#F8F8F8',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(0, 86, 145, 0.04)',
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 86, 145, 0.08)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 86, 145, 0.12)',
                        },
                    },
                },
            },
        },
    },
});

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ChatInterface />
            </ThemeProvider>
        </Provider>
    );
}

export default App;
