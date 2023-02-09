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
import React from "react";
import { Dependency } from "../data/Dependency";
import {
    useDependencyList,
    useDependencyListTypes,
} from "../store/OptionReducer";
import { Close, FilterAlt, HighlightOff } from "@mui/icons-material";
import Fuse from "fuse.js";
import { Components, GroupedVirtuoso } from "react-virtuoso";
import { useOverlayDependencies } from "../store/OverlayReducer";

import { useHotkeys } from "react-hotkeys-hook";
import { groupBy } from "lodash";

const options: Fuse.IFuseOptions<Dependency> = {
    includeScore: true,
    // Search in `author` and in `tags` array
    minMatchCharLength: 3,
    keys: ["id", "name"],
};

export function useFuseSearchEngine(
    list: Dependency[],
    options: Fuse.IFuseOptions<Dependency>
) {
    return React.useMemo(() => new Fuse(list, options), [list, options]);
}

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
    const available = useDependencyList();
    const selected = useOverlayDependencies();

    const engine = useFuseSearchEngine(available, options);
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState<string>("");
    const [limited, setLimited] = React.useState<Dependency[]>([...available]);
    const [groups, setGroups] = React.useState<string[]>([]);
    const [groupCount, setGroupCount] = React.useState<number[]>([]);
    const [filterType, setFilterType] = React.useState<string | null>(null);
    const [filtered, setFiltered] = React.useState<Dependency[]>([...available]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleToggle = (val: string) => {
        onSelectedChange(
            selected.indexOf(val) > -1
                ? [...selected.filter((d) => d !== val)]
                : [...selected, val]
        );
    };

    const getSearchResults = React.useCallback((search: string) => {
        return search.length > 0
            ? engine.search(search).map((r) => r.item)
            : [...filtered];
    }, [filtered, engine]);

    React.useEffect(() => {
        const results = getSearchResults(search);
        const grouped = groupBy(results, (item) => item.type);
        setLimited(results);
        setGroups(Object.keys(grouped));
        setGroupCount(Object.values(grouped).map((item) => item.length));
    }, [search, available, getSearchResults]);

    const depTypes = useDependencyListTypes();

    React.useEffect(() => {
        setFiltered(filterType !== null ? [...available].filter((d: Dependency) => d.type === filterType) : [...available]);
    }, [filterType, available]);

    useHotkeys("ctrl+B", () => handleClickOpen(), [handleClickOpen]);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const menuOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const selectFilterType = (type: string | null) => {
        setFilterType(type);
        handleMenuClose();
    };

    return (
        <>
            <Button onClick={handleClickOpen} variant="contained">
                + Add Dependencies
            </Button>

            <Drawer open={open} onClose={handleClose} anchor="right" id="foo">
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
                    <FormControl fullWidth sx={{ marginBottom: 1 }}>
                        <InputLabel htmlFor="dep-search-select-helper-label">
                            Search
                        </InputLabel>
                        <OutlinedInput
                            id="dep-search-select-helper-label"
                            fullWidth
                            label="Search"
                            value={search}
                            onChange={(ev) => setSearch(ev.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setSearch("")}
                                        onMouseDown={() => setSearch("")}
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
                        {filterType && <Chip sx={{marginLeft: '1rem'}} onDelete={() => selectFilterType(null)} label={filterType} />}
                    </div>
                </div>
                <Divider />
                <GroupedVirtuoso
                    style={{ height: 1000 }}
                    groupCounts={groupCount}
                    components={MUIComponents}
                    groupContent={(index: any) => <div>{groups[index]}</div>}
                    itemContent={(index) => {
                        const record = limited[index];
                        const checked = selected.indexOf(record.id) > -1;

                        const { id, description, name } = record;
                        return (
                            <ListItemButton onClick={() => handleToggle(id)}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        tabIndex={-1}
                                        checked={checked}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<>{name}</>}
                                    secondary={description}
                                />
                            </ListItemButton>
                        );
                    }}
                />
            </Drawer>
        </>
    );
}
