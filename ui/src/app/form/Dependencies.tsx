import React, { Fragment } from "react";
import {
    Box,
    Button,
    Chip,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteIcon from "@mui/icons-material/Delete";
import { Dependency } from "../data/Dependency";
import DependencySelector from "./DependencySelector";
import { useAppDispatch } from "../store/hooks";
import {
    setDependencies,
    useMappedOverlayDependencies,
    useOverlayDependencies,
} from "../store/OverlayReducer";
import { Action, useCommand } from "../core/Keyboard";
import { useIsPreviewing } from "../store/PreviewReducer";

export default function Dependencies() {
    const selectedDependencies = useMappedOverlayDependencies();
    const selected = useOverlayDependencies();
    const dispatch = useAppDispatch();

    const remove = (id: string) => {
        dispatch(setDependencies(selected.filter((s: string) => s !== id)));
    };

    const clear = () => {
        dispatch(setDependencies([]));
    };

    const { label, keys, modifier, modifierIcon } = useCommand(Action.CLEAR);
    const isPreviewing = useIsPreviewing();

    useHotkeys(`${modifier}+${keys}`, () => clear(), { preventDefault: true, enabled: !isPreviewing }, [
        clear, isPreviewing,
    ]);

    const dependencies: Dependency[] = React.useMemo(() => selectedDependencies.filter(d => !!d), [selectedDependencies]);

    return (
        <>
            <Grid
                container
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
                <Grid size={{ md:6 }}>
                    <DependencySelector
                        onSelectedChange={(sel: string[]) =>
                            dispatch(setDependencies(sel))
                        }
                    />
                </Grid>

                {selected?.length > 0 && (
                    <Grid size={{md:6 }}
                        sx={{
                            textAlign: "end",
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => clear()}
                            startIcon={<DeleteForeverIcon />}
                        >
                            {label} (
                            {React.createElement(modifierIcon, {
                                fontSize: "small",
                            })}
                            +{keys})
                        </Button>
                    </Grid>
                )}
            </Grid>
            <List>
                {dependencies.map(
                    (s: Dependency, idx: number) => (
                        <Fragment key={idx}>
                            {s !== undefined ? (
                                <ListItem
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => remove(s.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <Tooltip
                                        title={s.id}
                                        placement="top-start"
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {s.type && (
                                                        <Chip
                                                            label={s.type}
                                                            color="primary"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ fontWeight: 600, letterSpacing: '0.03em' }}
                                                        />
                                                    )}
                                                    <span>{s.name}</span>
                                                </Box>
                                            }
                                            secondary={s.description}
                                        />
                                    </Tooltip>
                                </ListItem>
                            ) : (
                                <Fragment></Fragment>
                            )}
                        </Fragment>
                    )
                )}
            </List>
        </>
    );
}
