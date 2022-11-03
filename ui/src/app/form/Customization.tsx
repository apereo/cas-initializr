import React from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Stack,
    Divider,
    Button,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import { Overlay } from "../data/Overlay";
import {
    useCasTypes,
    useCasVersionsForType,
    useDefaultValues,
} from "../store/OptionReducer";
import { CasVersionOption, TypeOptionValue } from "../data/Option";
import { useAppDispatch } from "../store/hooks";
import { setCustomization } from "../store/OverlayReducer";

export default function Customization() {

    const defaultValues = useDefaultValues();
    const dispatch = useAppDispatch();

    const { register, watch, control } = useForm<Overlay>({
        defaultValues: {
            ...defaultValues,
            casVersion: ''
        },
        mode: 'onChange'
    });

    const type = watch('type');

    const types = useCasTypes();
    const versions = useCasVersionsForType(type);

    const formData = watch();

    React.useEffect(() => {
        dispatch(setCustomization(formData));
    }, [formData]);

    return (
        <>
            <Typography variant="subtitle1" style={{ marginBottom: "1rem" }}>
                Customization
            </Typography>
            <form>
                <Stack spacing={2}>
                    <FormControl fullWidth>
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
                                    Version
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
                            <Divider>Optional</Divider>
                            <FormControl fullWidth>
                                <TextField
                                    id="group-input"
                                    label="Group"
                                    variant="outlined"
                                    {...register("groupId")}
                                />
                                <FormHelperText id="group-helper-text">
                                    ex. com.example
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    id="artifact-input"
                                    label="Artifact"
                                    variant="outlined"
                                    {...register("artifactId")}
                                />
                                <FormHelperText id="artifact-helper-text">
                                    ex. demo
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    id="name-input"
                                    label="Name"
                                    variant="outlined"
                                    {...register("name")}
                                />
                                <FormHelperText id="name-helper-text">
                                    ex. demo
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    id="description-input"
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    {...register("description")}
                                />
                                <FormHelperText id="description-helper-text">
                                    ex. Demo CAS Initializr project
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    id="package-input"
                                    label="Package"
                                    variant="outlined"
                                    {...register("packaging")}
                                />
                                <FormHelperText id="package-helper-text">
                                    ex. demo
                                </FormHelperText>
                            </FormControl>
                        </React.Fragment>
                    )}
                </Stack>
            </form>
        </>
    );
}
