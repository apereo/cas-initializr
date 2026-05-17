import React, { Fragment } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Stack,
    Divider,
    Tooltip,
    RadioGroup,
    Radio,
    FormLabel,
    FormControlLabel,
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
    useCasVersion,
} from "../store/OptionReducer";
import { CasVersionOption, TypeOptionValue } from "../data/Option";
import { useAppDispatch } from "../store/hooks";
import { setCustomization } from "../store/OverlayReducer";
import { getOverlayFromQs } from "../data/Url";
import { defaults } from "lodash";
import BuildFeatures from "./BuildFeatures";

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

    const { register, watch, control, reset } = useForm<Overlay>({
        defaultValues: {
            ...defaultValues,
        },
        mode: "onChange",
    });

    const type = watch("type");

    /*eslint-disable react-hooks/exhaustive-deps*/
    React.useEffect(() => {
        const { dependencies, ...overlay } = getOverlayFromQs();
        const o = defaults(overlay as Overlay, defaultValues);

        reset({ ...o, type });
    }, [defaultValues, reset]);

    const types = useCasTypes();
    const versions = useSortedCasVersionsForType(type);

    const formData = watch();

    const selectedVersion = useCasVersion(formData.casVersion);

    React.useEffect(() => {
        dispatch(setCustomization({
            ...formData,
        }));
    }, [formData]);

    return (
        <>
            <Typography
                variant="h5"
                component="h3"
                style={{ marginBottom: "1rem" }}
            >
                Select your target CAS server version and add the required dependencies to your build.
                Then download the generated project, and start your CAS deployment right away!
            </Typography>
            <Divider style={{ marginBottom: "2rem" }} />
            <form>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="type-select-label">
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
                            { selectedVersion &&
                            <Accordion defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="platform-requirements-content"
                                    id="platform-requirements-header"
                                >
                                    <Typography>Platform Requirements</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" sx={{ my: 1 }}><strong>Java Version:</strong> {selectedVersion.javaVersion}</Typography>
                                    <Typography variant="body2" sx={{ my: 1 }}><strong>Spring Boot Version:</strong> {selectedVersion.bootVersion}</Typography>
                                    <Typography variant="body2" sx={{ my: 1 }}><strong>Gradle Version:</strong> {selectedVersion.gradleVersion}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}><strong>Apache Tomcat Version:</strong> {selectedVersion.tomcatVersion}</Typography>
                                </AccordionDetails>
                            </Accordion>
                            }
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>Metadata</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <FormControl
                                        fullWidth
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <FormLabel id="deployment-select-label">
                                            Deployment Type
                                        </FormLabel>
                                        <Controller
                                            control={control}
                                            name="deploymentType"
                                            render={({
                                                field: {
                                                    onChange,
                                                    onBlur,
                                                    value,
                                                    ref,
                                                },
                                            }) => (
                                                <RadioGroup
                                                    aria-labelledby="demo-radio-buttons-group-label"
                                                    defaultValue="female"
                                                    name="radio-buttons-group"
                                                    onChange={onChange}
                                                    ref={ref}
                                                    value={value}
                                                    row
                                                >
                                                    <Tooltip arrow placement="top" title="Build the CAS server as an executable web application, also referred to as a Fat Jar, that ships with an embedded servlet container such as Apache Tomcat which is managed and auto-configured by CAS.">
                                                        <FormControlLabel value="executable" control={<Radio />} label="Executable" />
                                                    </Tooltip>
                                                    <Tooltip arrow placement="top" title="Build the CAS server as a traditional web application that is then deployed into an external servlet container of choice, such as Apache Tomcat, that is downloaded, configured and tuned by you.">
                                                        <FormControlLabel value="web" control={<Radio />} label="Web" />
                                                    </Tooltip>
                                                    <Tooltip arrow placement="top" title="Build the CAS server as a Spring Boot executable JAR using an Apache Tomcat starter module.">
                                                        <FormControlLabel value="jar" control={<Radio />} label="JAR" />
                                                    </Tooltip>
                                                </RadioGroup>
                                            )}
                                        />
                                    </FormControl>
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
                            <BuildFeatures control={control} />
                        </React.Fragment>
                    )}
                </Stack>
            </form>
        </>
    );
}
