import {
    Drawer,
    ListItem,
    ListItemText,
    Typography,
    Button,
    Chip,
    ListItemButton,
    ListItemIcon,
    Checkbox,
    OutlinedInput,
    InputAdornment,
    IconButton,
    Divider,
    InputLabel,
    FormControl,
    Menu,
    MenuItem,
    ListSubheader,
    List,
} from "@mui/material";
import React, { useCallback, useRef } from "react";
import { Dependency } from "../data/Dependency";
import {
    useDependencyList,
    useDependencyListTypes,
} from "../store/OptionReducer";
import { Close, FilterAlt, HighlightOff } from "@mui/icons-material";

import { Components, GroupedVirtuoso } from "react-virtuoso";
import { useOverlayDependencies } from "../store/OverlayReducer";

import { useHotkeys } from "react-hotkeys-hook";
import { groupBy } from "lodash";
import FuseHighlight from './Highlight';
import { useFuse } from "../data/useFuse";

export interface DependencySelectorProps {
    onSelectedChange(selected: string[]): void;
}

const ITEM_HEIGHT = 48;

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

export default function DependencySelector({ onSelectedChange }: DependencySelectorProps ) {
    /* DATA FETCHING */
    const available = useDependencyList();
    const selected = useOverlayDependencies();
    const depTypes = useDependencyListTypes();

    /* STATE */

    const [open, setOpen] = React.useState(false);
    const [filterType, setFilterType] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const searchRef = useRef<HTMLElement>(null);

    /* SEARCH */

    const filtered = React.useMemo(() => filterType !== null
                ? [...available].filter(
                      (d: Dependency) => d.type === filterType
                  )
                : [...available], [filterType, available]);

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
    const { hits, search } = useFuse<Dependency>(filtered, true, options);

    const grouped = React.useMemo(() => groupBy([...hits], ({ item }) => item.type), [hits]);
    const groups = React.useMemo(() => Object.keys(grouped), [grouped]);
    const groupCount = React.useMemo(() => Object.values(grouped).map(({length}) => length), [grouped]);

    React.useEffect(() => {
        search(searchQuery);
    }, [searchQuery, search])


    const clearAndFocus = useCallback(() => {
        setSearchQuery('');
        setTimeout(() => {
            searchRef.current?.focus();
            console.log(searchRef.current?.focus);
        }, 0);
    }, [setSearchQuery])

    /* FILTER BY TYPE */

    const handleToggle = (val: string) => {
        onSelectedChange(
            selected.indexOf(val) > -1
                ? [...selected.filter((d) => d !== val)]
                : [...selected, val]
        );
        clearAndFocus();
    };

    const selectFilterType = (type: string | null) => {
        setFilterType(type);
        handleMenuClose();
    };

    /* MENU */

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const menuOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
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
                + Add Dependencies
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
                        Dependencies
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
                            inputRef={ searchRef }
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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Button
                            id="basic-button"
                            aria-controls={open ? "basic-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                            onClick={handleClick}
                            startIcon={<FilterAlt />}
                            variant="contained"
                        >
                            Filter
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            MenuListProps={{
                                "aria-labelledby": "basic-button",
                            }}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * 10.5,
                                    width: "30ch",
                                },
                            }}
                        >
                            {depTypes.map((type: string) => (
                                <MenuItem
                                    key={type}
                                    selected={type === filterType}
                                    onClick={() => selectFilterType(type)}
                                >
                                    {type}
                                </MenuItem>
                            ))}
                        </Menu>
                        {filterType && (
                            <Chip
                                sx={{ marginLeft: "1rem" }}
                                onDelete={() => selectFilterType(null)}
                                label={filterType}
                            />
                        )}
                    </div>
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
                    <GroupedVirtuoso
                        style={{ height: 1000 }}
                        groupCounts={groupCount}
                        components={MUIComponents}
                        groupContent={(index: any) => (
                            <div>{groups[index]}</div>
                        )}
                        itemContent={(index) => {
                            const record = hits[index];
                            const { item } = record;

                            const checked = selected.indexOf(item.id) > -1;

                            const { id, description } = item;
                            return (
                                <ListItemButton
                                    onClick={() => handleToggle(id)}
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
                                            <FuseHighlight
                                                hit={record}
                                                attribute="name"
                                            />
                                        }
                                        secondary={description}
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
