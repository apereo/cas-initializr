import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import React, { Fragment } from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import { Dependency } from "../data/Dependency";
import DependencySelector from "./DependencySelector";
import { useAppDispatch } from "../store/hooks";
import { setDependencies, useMappedOverlayDependencies, useOverlayDependencies } from "../store/OverlayReducer";

export default function Dependencies() {
    const selectedDependencies = useMappedOverlayDependencies();
    const selected = useOverlayDependencies();
    const dispatch = useAppDispatch();

    const remove = (id: string) => {
        dispatch(setDependencies(selected.filter((s: string) => s !== id)));
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "",
                }}
            >
                <Typography
                    variant="subtitle1"
                    style={{ marginBottom: "0rem", marginRight: "1rem" }}
                >
                    Dependencies
                </Typography>
                <DependencySelector
                    onSelectedChange={(sel: string[]) =>
                        dispatch(setDependencies(sel))
                    }
                />
            </div>
            <List dense>
                {selectedDependencies.map(
                    (s: Dependency | undefined, idx: number) => (
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
                                    <ListItemText
                                        primary={s.name}
                                        secondary={s.description}
                                    />
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
