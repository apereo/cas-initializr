import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItem,
    ListItemText,
    Typography,
    Button,
    Chip,
    ListItemButton,
    ListItemIcon,
    OutlinedInput,
    InputAdornment,
    IconButton,
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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import KeyboardControlKeyIcon from '@mui/icons-material/KeyboardControlKey';

import { Components, GroupedVirtuoso } from "react-virtuoso";
import { useOverlayDependencies } from "../store/OverlayReducer";

import { useHotkeys } from "react-hotkeys-hook";
import { groupBy } from "lodash";
import FuseHighlight from './Highlight';
import { useFuse } from "../data/useFuse";
import { Action, useCommand } from "../core/Keyboard";

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

export interface DependencySelectorProps {
    onSelectedChange(selected: string[]): void;
}

const ITEM_HEIGHT = 48;

const VList: Components['List'] = React.forwardRef(({ style, children }: any, listRef) => {
    return (
        <List
            style={{ padding: 0, ...style, margin: 0 }}
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

export default function DependencySelector({ onSelectedChange }: DependencySelectorProps) {
    /* DATA FETCHING */
    const available = useDependencyList();
    const selected = useOverlayDependencies();
    const depTypes = useDependencyListTypes();

    const { label, keys, modifier, modifierIcon } = useCommand(Action.ADD_DEPENDENCIES);

    /* STATE */
    const [open, setOpen] = React.useState(false);
    const [filterType, setFilterType] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [pendingMulti, setPendingMulti] = React.useState<string[]>([]);
    const searchRef = useRef<HTMLElement>(null);

    /* SEARCH */
    const filtered = React.useMemo(() => filterType !== null
        ? [...available].filter((d: Dependency) => d.type === filterType)
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
    const groupCount = React.useMemo(() => Object.values(grouped).map(({ length }) => length), [grouped]);

    React.useEffect(() => {
        search(searchQuery);
    }, [searchQuery, search]);

    const clearAndFocus = useCallback(() => {
        setSearchQuery('');
        setTimeout(() => {
            searchRef.current?.focus();
        }, 0);
    }, [setSearchQuery]);

    /* ITEM CLICK */
    const handleItemClick = (id: string, event: React.MouseEvent) => {
        const withModifier = event.metaKey || event.ctrlKey;
        if (withModifier) {
            setPendingMulti(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        } else {
            if (!selected.includes(id)) {
                onSelectedChange([...selected, id]);
            }
        }
    };

    const handleAddPending = () => {
        const toAdd = pendingMulti.filter(id => !selected.includes(id));
        if (toAdd.length > 0) {
            onSelectedChange([...selected, ...toAdd]);
        }
        setPendingMulti([]);
        clearAndFocus();
    };

    /* FILTER BY TYPE */
    const selectFilterType = (type: string | null) => {
        setFilterType(type);
        handleMenuClose();
    };

    /* MENU */
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const handleMenuButtonClick = (event: React.MouseEvent<HTMLElement>) => {
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
        setPendingMulti([]);
    };

    useHotkeys(`${modifier}+${keys}`, () => handleClickOpen(), { preventDefault: true }, [handleClickOpen]);

    return (
        <>
            <Button onClick={handleClickOpen} variant="contained">
                + {label} ({React.createElement(modifierIcon, { fontSize: 'small' })}+{keys})
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xl"
                fullWidth
                id="dependencies-dialog"
                slotProps={{ transition: { onEntered: () => searchRef.current?.focus() } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <span>Dependencies</span>
                    <IconButton onClick={handleClose} size="small" aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 2 }}>
                    <FormControl sx={{ mb: 2, width: '100%' }}>
                        <InputLabel htmlFor="dep-search-select-helper-label">
                            Search
                        </InputLabel>
                        <OutlinedInput
                            id="dep-search-select-helper-label"
                            fullWidth
                            label="Search"
                            value={searchQuery}
                            inputRef={searchRef}
                            onChange={(ev) => setSearchQuery(ev.target.value.trim())}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setSearchQuery("")}
                                        onMouseDown={() => setSearchQuery("")}
                                        edge="end"
                                    >
                                        <HighlightOffIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <Button
                            id="filter-button"
                            aria-controls={menuOpen ? "filter-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            onClick={handleMenuButtonClick}
                            startIcon={<FilterAltIcon />}
                            variant="contained"
                            size="small"
                        >
                            Filter
                        </Button>
                        <Menu
                            id="filter-menu"
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            slotProps={{
                                list: { "aria-labelledby": "filter-button" },
                                paper: {
                                    style: {
                                        maxHeight: ITEM_HEIGHT * 10.5,
                                        width: "30ch",
                                    },
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
                                onDelete={() => selectFilterType(null)}
                                label={filterType}
                                size="small"
                            />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Press{' '}
                            {isMac
                                ? <KeyboardCommandKeyIcon fontSize="inherit" sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                                : <KeyboardControlKeyIcon fontSize="inherit" sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                            }
                            {' '}for multiple modules
                        </Typography>
                    </div>

                    {hits?.length < 1 ? (
                        <Typography sx={{ p: 2 }} color="text.secondary">
                            No results found
                        </Typography>
                    ) : (
                        <GroupedVirtuoso
                            style={{ height: 640 }}
                            groupCounts={groupCount}
                            components={MUIComponents}
                            groupContent={(index: any) => (
                                <Typography
                                    variant="overline"
                                    sx={{
                                        display: 'block',
                                        px: 2,
                                        py: 0.5,
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                        color: 'text.secondary',
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    {groups[index]}
                                </Typography>
                            )}
                            itemContent={(index) => {
                                const record = hits[index];
                                const { item } = record;
                                const { id, description, aliases } = item;
                                const isAdded = selected.includes(id);
                                const isPending = pendingMulti.includes(id);

                                return (
                                    <ListItemButton
                                        onClick={(e) => handleItemClick(id, e)}
                                        selected={isPending}
                                        sx={{
                                            borderRadius: 1,
                                            ...(isPending && {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&.Mui-selected': { bgcolor: 'primary.main' },
                                                '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
                                            }),
                                            ...(isAdded && !isPending && {
                                                opacity: 0.6,
                                            }),
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {isAdded ? (
                                                <CheckCircleIcon color="success" fontSize="small" />
                                            ) : isPending ? (
                                                <AddCircleOutlineIcon sx={{ color: 'primary.contrastText' }} fontSize="small" />
                                            ) : (
                                                <AddCircleOutlineIcon color="disabled" fontSize="small" />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <FuseHighlight
                                                    hit={record}
                                                    attribute="name"
                                                />
                                            }
                                            secondary={
                                                <>
                                                    {description && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                display: "block",
                                                                color: isPending ? 'primary.contrastText' : "text.secondary",
                                                                opacity: isPending ? 0.85 : 1,
                                                            }}
                                                        >
                                                            {description}
                                                        </Typography>
                                                    )}
                                                    {aliases && aliases.length > 0 && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: "block",
                                                                fontFamily: "monospace",
                                                                mt: 0.5,
                                                                color: isPending ? 'primary.contrastText' : "text.disabled",
                                                                opacity: isPending ? 0.7 : 1,
                                                                wordBreak: "break-all",
                                                            }}
                                                        >
                                                            {JSON.stringify(aliases)}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItemButton>
                                );
                            }}
                        />
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
                    <div>
                        {pendingMulti.length > 0 && (
                            <Button variant="contained" color="primary" onClick={handleAddPending}>
                                Add {pendingMulti.length} selected
                            </Button>
                        )}
                    </div>
                    <Button variant="outlined" onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
