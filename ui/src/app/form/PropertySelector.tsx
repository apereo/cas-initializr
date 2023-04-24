import {
    Drawer,
    ListItem,
    ListItemText,
    Typography,
    Button,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    OutlinedInput,
    InputAdornment,
    IconButton,
    Divider,
    InputLabel,
    FormControl,
    ListSubheader,
    List,
} from "@mui/material";
import React from "react";
import { Property } from "../data/Property";
import {
    usePropertyList,
} from "../store/OptionReducer";
import { Close, HighlightOff } from "@mui/icons-material";

import { Components, Virtuoso } from "react-virtuoso";
import { useOverlayProperties } from "../store/OverlayReducer";

import { useHotkeys } from "react-hotkeys-hook";
import FuseHighlight from './Highlight';
import { useFuse } from "../data/useFuse";

export interface PropertySelectorProps {
    onSelectedChange(selected: string[]): void;
}

const VList: Components['List'] = React.forwardRef(({ style, children }: any, listRef) => {
    return (
        <List
            style={{ padding: 0, ...style, margin: 0, width: '640px' }}
            component="div"
            ref={listRef}
        >
            {children}
        </List>
    );
});

const VItem: Components['Item'] = ({ children, ...props }: any) => {
    return (
        <ListItem component="div" {...props} style={{ margin: 0 }}>
            {children}
        </ListItem>
    );
};

const VGroup: Components['Group'] = ({ children, style, ...props }: any) => {
    return (
        <ListSubheader
            component="div"
            {...props}
            style={{
                ...style,
                margin: 0,
            }}
        >
            {children}
        </ListSubheader>
    );
};

const MUIComponents = { List: VList, Item: VItem, Group: VGroup };

export default function PropertySelector({ onSelectedChange }: PropertySelectorProps ) {
    /* DATA FETCHING */
    const available = usePropertyList();
    const selected = useOverlayProperties();

    /* STATE */
    
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    /* SEARCH */
    
    const options = React.useMemo(() => ({
        includeScore: true,
        threshold: 0,
        ignoreLocation: true,
        useExtendedSearch: false,
        includeMatches: true,
        minMatchCharLength: searchQuery.length,
        findAllMatches: false,
        keys: ["name"],
    }), [searchQuery]);
    const { hits, search } = useFuse<Property>(available, true, options);

    React.useEffect(() => {
        search(searchQuery);
    }, [searchQuery, search])


    /* FILTER BY TYPE */

    const handleToggle = (val: string) => {
        onSelectedChange(
            selected.indexOf(val) > -1
                ? [...selected.filter((d) => d !== val)]
                : [...selected, val]
        );
    };

    /* HOTKEYS / OPEN & CLOSE */

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useHotkeys("ctrl+B", () => handleClickOpen(), [handleClickOpen]);

    return (
        <>
            <Button onClick={handleClickOpen} variant="contained">
                + Add Properties
            </Button>

            <Drawer open={open} onClose={handleClose} anchor="right" id="dependencies-drawer" sx={{width: '600px'}}>
                <div
                    style={{
                        padding: "1rem 1.5rem 0",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        variant="h6"
                        style={{ padding: "0rem 0rem 0rem 0rem" }}
                    >
                        Properties
                    </Typography>
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClose()}
                        onMouseDown={() => handleClose()}
                        edge="end"
                    >
                        <Close />
                    </IconButton>
                </div>
                <div
                    style={{ padding: "1rem 1.5rem 0", marginBottom: "1.5rem" }}
                >
                    <FormControl sx={{ marginBottom: 1, width: '600px' }}>
                        <InputLabel htmlFor="dep-search-select-helper-label">
                            Search
                        </InputLabel>
                        <OutlinedInput
                            id="dep-search-select-helper-label"
                            fullWidth
                            label="Search"
                            value={searchQuery}
                            onChange={(ev) =>
                                setSearchQuery(ev.target.value.trim())
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setSearchQuery("")}
                                        onMouseDown={() => setSearchQuery("")}
                                        edge="end"
                                    >
                                        <HighlightOff />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                </div>
                <Divider />
                {hits?.length < 1 ? (
                    <div
                        style={{
                            padding: "1rem 1.5rem 0",
                            marginBottom: "1.5rem",
                            width: '600px'
                        }}
                    >
                        {`No Results Found`}
                    </div>
                ) : (
                    <Virtuoso
                        style={{ height: 1000 }}
                        components={MUIComponents}
                        totalCount={hits.length}
                        itemContent={(index) => {
                            const record = hits[index];
                            const { item } = record;

                            const checked = selected.indexOf(item.name) > -1;

                            const { name, description, type, deprecated, defaultValue } = item;
                            return (
                                <ListItemButton
                                    onClick={() => handleToggle(name)}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            tabIndex={-1}
                                            checked={checked}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <React.Fragment>
                                                <FuseHighlight
                                                    hit={record}
                                                    attribute="name"
                                                />
                                                { deprecated ? ` - (deprecated)` : `` }
                                            </React.Fragment>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography variant="body2" sx={{fontWeight: 'bold'}}>{defaultValue ? `default: ${defaultValue} ` : ' ' }({ `${type}` })</Typography>
                                                <Typography
                                                    sx={{ display: 'inline' }}
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {description}
                                                </Typography>
                                                
                                          </React.Fragment>
                                        }
                                    />
                                </ListItemButton>
                            );
                        }}
                    />
                )}
            </Drawer>
        </>
    );
}
