import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Stack,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import { Overlay } from "../data/Overlay";
import {
    useCasTypes,
    useSortedCasVersionsForType,
    useDefaultValues,
} from "../store/OptionReducer";
import { CasVersionOption, TypeOptionValue } from "../data/Option";
import { useAppDispatch } from "../store/hooks";
import { setCustomization } from "../store/OverlayReducer";

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters {...props} />
))(({ theme }: {theme: any}) => ({
    border: `0px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
        borderBottom: 0,
    },
    "&:before": {
        display: "none",
    },
}));

export default function Customization() {

    const defaultValues = useDefaultValues();
    const dispatch = useAppDispatch();

    const { register, watch, control } = useForm<Overlay>({
        defaultValues: {
            ...defaultValues
        },
        mode: 'onChange'
    });

    const type = watch('type');

    const types = useCasTypes();
    const versions = useSortedCasVersionsForType(type);

    const formData = watch();

    React.useEffect(() => {
        dispatch(setCustomization(formData));
    }, [formData, dispatch]);

    return (
        <>
            <Typography variant="subtitle1" style={{ marginBottom: "1rem" }}>
                Build your CAS deployment
            </Typography>
            <Divider style={{marginBottom: '2rem'}} />
            <form>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="version-select-label">
                            Type *
                        </InputLabel>
                        <Controller
                            control={control}
                            name="type"
                            render={({
                                field: { onChange, onBlur, value, ref },
                            }) => (
                                <Select
                                    labelId="type-select-label"
                                    id="type-select"
                                    label="Type"
                                    value={value}
                                    onChange={onChange}
                                    inputRef={ref}
                                    required
                                >
                                    {types.map(
                                        (t: TypeOptionValue, idx: number) => (
                                            <MenuItem key={idx} value={t.id}>
                                                {t.name}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            )}
                        />
                    </FormControl>
                    {type && type !== "" && (
                        <React.Fragment>
                            <FormControl fullWidth>
                                <InputLabel id="version-select-label">
                                    Version *
                                </InputLabel>
                                <Controller
                                    control={control}
                                    name="casVersion"
                                    render={({
                                        field: { onChange, onBlur, value, ref },
                                    }) => (
                                        <Select
                                            labelId="version-select-label"
                                            id="version-select"
                                            label="Version"
                                            value={value}
                                            onChange={onChange}
                                            inputRef={ref}
                                            required
                                        >
                                            {versions.map(
                                                (
                                                    v: CasVersionOption,
                                                    idx: number
                                                ) => (
                                                    <MenuItem
                                                        key={idx}
                                                        value={v.version}
                                                    >
                                                        {v.version}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>Advanced Options</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <FormControl
                                        fullWidth
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <TextField
                                            id="group-input"
                                            label="Group"
                                            variant="outlined"
                                            {...register("groupId")}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <TextField
                                            id="artifact-input"
                                            label="Artifact"
                                            variant="outlined"
                                            {...register("artifactId")}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <TextField
                                            id="name-input"
                                            label="Name"
                                            variant="outlined"
                                            {...register("name")}
                                        />
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <TextField
                                            id="description-input"
                                            label="Description"
                                            variant="outlined"
                                            multiline
                                            {...register("description")}
                                        />
                                    </FormControl>
                                </AccordionDetails>
                            </Accordion>
                        </React.Fragment>
                    )}
                </Stack>
            </form>
        </>
    );
}
