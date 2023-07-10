import React, { Fragment } from "react";
import {
    Button,
    ButtonGroup,
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
import ButtonPopover from "../component/ButtonPopover";
import { CopyAll } from "@mui/icons-material";
import useCopyToClipboard from "../core/UseCopyToClipboard";
import { PropertyCode, getPropertyCodeString } from "./PropertyActions";
import { HtmlRender } from "../component/HtmlRender";

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

    const copy = useCopyToClipboard();

    const handleCopy = React.useCallback((text: string) => {
        copy(text);
    }, [copy]);

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
                                        <ButtonGroup>
                                            <ButtonPopover
                                                icon={
                                                    <CopyAll />
                                                }
                                                label="Copy"
                                                onClick={() => { handleCopy(getPropertyCodeString(s)) }}
                                            >
                                                <PropertyCode property={s} />
                                            </ButtonPopover>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => remove(s.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ButtonGroup>
                                    }
                                >
                                    <Tooltip
                                        title={s.id}
                                        placement="top-start"
                                    >
                                        <ListItemText
                                            primary={
                                                <code style={ { backgroundColor: '#000', padding: '0.2rem 0.4rem', borderRadius: '0.3rem', fontSize: '0.8rem' } }>
                                                    {s.name}
                                                </code>
                                            }
                                            secondary={
                                                <div style={{ paddingRight: '3rem' }}>
                                                    <HtmlRender html={s.description} />
                                                </div>}
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
