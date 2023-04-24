import React, { Fragment } from "react";
import {
    Button,
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
import { Property } from "../data/Property";
import PropertySelector from "./PropertySelector";
import { useAppDispatch } from "../store/hooks";
import {
    setProperties,
    useMappedOverlayProperties,
    useOverlayProperties,
} from "../store/OverlayReducer";
import { Action, useCommand } from "../core/Keyboard";

export default function Properties() {
    const selectedProperties = useMappedOverlayProperties();
    const selected = useOverlayProperties();
    const dispatch = useAppDispatch();

    const remove = (id: string) => {
        dispatch(setProperties(selected.filter((s: string) => s !== id)));
    };

    const clear = () => {
        dispatch(setProperties([]));
    };

    const { label, keys, modifier, modifierIcon } = useCommand(Action.CLEAR);

    useHotkeys(`${modifier}+${keys}`, () => clear(), { preventDefault: true }, [
        clear,
    ]);

    const properties: Property[] = React.useMemo(() => selectedProperties.filter(d => !!d), [selectedProperties]);

    return (
        <>
            <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
            >
                <Grid item md={6}>
                    <PropertySelector
                        onSelectedChange={(sel: string[]) =>
                            dispatch(setProperties(sel))
                        }
                    />
                </Grid>

                {selected?.length > 0 && (
                    <Grid
                        item
                        md={6}
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
                {properties.map(
                    (s: Property, idx: number) => (
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
                                            primary={s.name}
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
