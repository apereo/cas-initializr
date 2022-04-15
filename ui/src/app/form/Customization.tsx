import {
    Button,
    FormControl,
    FormHelperText,
    Input,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    Stack,
    Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useForm } from "react-hook-form";
import { Overlay } from "../data/Overlay";

const versions = ["6.5.x", "6.4.x", "6.3.x", "6.2.x", "6.1.x", "6.0.x"];

const FormItem = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
}));

export default function Customization () {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Overlay>();

    const onSubmit = handleSubmit((data) => console.log(data));
    const handleChange = (e: SelectChangeEvent<string>) =>
        setVersion(e.target.value);

    const [version, setVersion] = React.useState("6.5.x");

    console.log(watch("version"));

    return (
        <>
            <Typography variant="subtitle1" style={{marginBottom: '1rem'}}>Customization</Typography>
            <form onSubmit={onSubmit}>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="version-select-label">
                            Version
                        </InputLabel>
                        <Select
                            labelId="version-select-label"
                            id="version-select"
                            value={version}
                            label="Version"
                            {...register("version")}
                        >
                            {versions.map((v) => (
                                <MenuItem key={v} value={v}>
                                    {v}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField
                            id="group-input"
                            label="Group"
                            variant="outlined"
                            {...register("group")}
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
                            {...register("artifact")}
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
                            {...register("name")}
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
                            {...register("package")}
                        />
                        <FormHelperText id="package-helper-text">
                            ex. demo
                        </FormHelperText>
                    </FormControl>

                    <Button variant="outlined">Download</Button>
                </Stack>
            </form>
        </>
    );
}
