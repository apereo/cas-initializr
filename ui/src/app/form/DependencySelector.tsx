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
} from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import React from "react";
import { Dependency } from "../data/Dependency";
import {
    useDependencyList,
    useDependencyListTypes,
} from "../store/OptionReducer";
import { Close, HighlightOff } from "@mui/icons-material";
import Fuse from "fuse.js";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { useOverlayDependencies } from "../store/OverlayReducer";

import { useHotkeys } from "react-hotkeys-hook";

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

function ItemRenderer(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const record = data[index];

    const { checked, id, type, description, name, handleToggle } = record;
    return (
        <ListItem style={style}>
            <ListItemButton
                role={undefined}
                onClick={() => handleToggle(id)}
                dense
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
                        <>
                            {name}
                            <Chip
                                label={type}
                                size="small"
                                color="primary"
                                style={{
                                    marginLeft: "1rem",
                                }}
                            />
                        </>
                    }
                    secondary={description}
                />
            </ListItemButton>
        </ListItem>
    );
}

export interface DependencySelectorProps {
    onSelectedChange(selected: string[]): void;
}

export default function DependencySelector({ onSelectedChange }: DependencySelectorProps ) {
    const available = useDependencyList();
    const selected = useOverlayDependencies();

    const engine = useFuseSearchEngine(available, options);
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState<string>("");
    const [limited, setLimited] = React.useState<Dependency[]>([...available]);
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
        setLimited(getSearchResults(search));
    }, [search, available, getSearchResults]);

    const depTypes = useDependencyListTypes();

    React.useEffect(() => {
        setFiltered(filterType !== null ? [...available].filter((d: Dependency) => d.type === filterType) : [...available]);
    }, [filterType, available]);

    useHotkeys("ctrl+B", () => handleClickOpen(), [handleClickOpen]);

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
                    <FormControl fullWidth sx={{ m: 1 }}>
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
                    <ButtonGroup
                        variant="contained"
                        aria-label="outlined primary button group"
                        style={{ marginLeft: "0.5rem" }}
                        size="small"
                    >
                        <Button onClick={() => setFilterType(null)}>All</Button>
                        {depTypes.map((type: string) => (
                            <Button
                                key={type}
                                disabled={type === filterType}
                                onClick={() => setFilterType(type)}
                            >
                                {type}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
                <Divider />
                <FixedSizeList
                    itemData={limited.map((i) => ({
                        ...i,
                        handleToggle,
                        checked: selected.indexOf(i.id) > -1,
                    }))}
                    height={1000}
                    itemCount={limited.length}
                    itemSize={72}
                    width={640}
                >
                    {ItemRenderer}
                </FixedSizeList>
            </Drawer>
        </>
    );
}
