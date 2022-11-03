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
import { useDependencies } from "../store/OptionReducer";
import DependencySelector from "./DependencySelector";
import { useAppDispatch } from "../store/hooks";
import { setDependencies } from "../store/OverlayReducer";

export default function Dependencies() {
    const deps = useDependencies();
    const dispatch = useAppDispatch();

    const [selected, setSelected] = React.useState<string[]>([]);
    const [mapped, setMapped] = React.useState<(Dependency | undefined)[]>([]);

    const mapSelected = (sel: string[]) => {
        setSelected(sel);
    };

    const remove = (id: string) => {
        if (id) {
            setSelected(
                selected.filter((s: string) => s !== id)
            );
        }
    };

    React.useEffect(() => {
        setMapped(
            selected.map((s: string) =>
                deps.find((d: Dependency) => d.id === s)
            )
        );
        dispatch(setDependencies(selected));
    }, [selected]);

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
                    selected={selected}
                    onSelectedChange={(selected: string[]) =>
                        mapSelected(selected)
                    }
                />
            </div>
            <List dense>
                {mapped.map((s: Dependency | undefined, idx: number) => (
                    <Fragment key={idx}>
                        {s !== undefined ? (
                            <ListItem
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => remove(s?.id)}
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
                ))}
            </List>
        </>
    );
}
