import {
    Dialog,
    DialogProps,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Typography,
    Button,
    Chip,
    ListItemButton,
    ListItemIcon,
    Checkbox,
} from '@mui/material';
import React from 'react';
import { Dependency } from '../data/Dependency';
import { useDependencies } from '../store/DependencyReducer';

export default function Dependencies() {

    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState<DialogProps["scroll"]>("paper");

    const handleClickOpen = (scrollType: DialogProps["scroll"]) => () => {
        setOpen(true);
        setScroll(scrollType);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const descriptionElementRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    const dependencies = useDependencies();

    const handleToggle = (val: string) => () => console.log(val);

    const checked: string[] = [];

    return (
        <>
            <Typography variant="subtitle1" style={{ marginBottom: "1rem" }}>
                Dependencies
            </Typography>
            <Button onClick={handleClickOpen("paper")}>Add Dependencies</Button>

            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Dependencies</DialogTitle>
                <DialogContent dividers={scroll === "paper"}>
                    <List
                        sx={{
                            width: "100%",
                        }}
                    >
                        {dependencies.map((dep: Dependency) => (
                            <ListItem key={dep.id}>
                                <ListItemButton
                                    role={undefined}
                                    onClick={handleToggle(dep.id)}
                                    dense
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={
                                                checked.indexOf(dep.id) !== -1
                                            }
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <>
                                                {dep.name}
                                                <Chip
                                                    label={dep.type}
                                                    size="small"
                                                    color="primary"
                                                    style={{marginLeft: '1rem'}}
                                                />
                                            </>
                                        }
                                        secondary={dep.description}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleClose} color="info">Update Dependencies</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
