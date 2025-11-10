import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const HelpDialog = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography
                    variant="h5"
                    component="div"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <HelpOutlineIcon color="primary" />
                    How to Use Bosch Car Service AI Assistant
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" paragraph>
                    Welcome to the Bosch Car Service AI Assistant! This
                    intelligent system is designed to help you diagnose and
                    troubleshoot vehicle-related issues quickly and effectively.
                </Typography>

                <List>
                    <ListItem>
                        <ListItemIcon>
                            <CodeIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="DTC Code Analysis"
                            secondary="Enter any Diagnostic Trouble Code (DTC) to get detailed information about its meaning, common causes, and solutions."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <DirectionsCarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Vehicle Symptoms"
                            secondary="Describe any car problems or symptoms you're experiencing, and get expert diagnostic guidance."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <BuildIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Repair Guidance"
                            secondary="Receive step-by-step repair procedures, estimated repair times, and required tools information."
                        />
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <SearchIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Search Tips"
                            secondary="Be specific with your queries. Include vehicle make/model, year, and detailed symptoms for the most accurate assistance."
                        />
                    </ListItem>
                </List>

                <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 'bold' }}
                >
                    Example Queries:
                </Typography>
                <List sx={{ pl: 2 }} dense>
                    <ListItem>
                        <ListItemText primary="• 'P0300 DTC code meaning and fixes'" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• 'Car making knocking noise when turning'" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• 'How to diagnose ABS system problems'" />
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Got it!
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HelpDialog;
