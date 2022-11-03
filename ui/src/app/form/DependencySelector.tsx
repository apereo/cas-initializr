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
} from "@mui/material";
import React from "react";
import { Dependency } from "../data/Dependency";
import { useDependencies } from "../store/OptionReducer";
import { Close } from "@mui/icons-material";
import Fuse from "fuse.js";
import { FixedSizeList, ListChildComponentProps } from "react-window";

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
    selected: string[];
    onSelectedChange(selected: string[]): void;
}

export default function DependencySelector({ selected, onSelectedChange }: DependencySelectorProps ) {
    const available = useDependencies();

    const engine = useFuseSearchEngine(available, options);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleToggle = (val: string) => {
        setChecked(
            checked.indexOf(val) > -1
                ? [...checked.filter((d) => d !== val)]
                : [...checked, val]
        );
    };

    const [checked, setChecked] = React.useState<string[]>(selected);
    const [search, setSearch] = React.useState<string>("");
    const [limited, setLimited] = React.useState<Dependency[]>([...available]);
    const getSearchResults = (search: string) =>
        engine.search(search).map((r) => r.item);

    React.useEffect(() => {
        setLimited(
            search.length > 1 ? getSearchResults(search) : [...available]
        );
    }, [search]);

    React.useEffect(() => {
        onSelectedChange(checked);
    }, [checked])

    return (
        <>
            <Button onClick={handleClickOpen} variant="contained">
                + Add Dependencies
            </Button>

            <Drawer open={open} onClose={handleClose} anchor="right" id="foo">
                <div
                    style={{ padding: "1rem 1.5rem 0", marginBottom: "1.5rem" }}
                >
                    <Typography
                        variant="h6"
                        style={{ padding: "0rem 0rem 1rem 0rem" }}
                    >
                        Dependencies
                    </Typography>
                    <OutlinedInput
                        id="search"
                        label="Search"
                        fullWidth
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
                                    <Close />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </div>
                <Divider />
                <FixedSizeList
                    itemData={limited.map((i) => ({
                        ...i,
                        handleToggle,
                        checked: checked.indexOf(i.id) > -1,
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
