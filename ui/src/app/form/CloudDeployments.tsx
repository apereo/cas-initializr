import React from "react";
import {
    Checkbox,
    FormControlLabel,
    Typography,
    Divider,
    Grid,
    Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import { Controller, Control } from "react-hook-form";
import { Overlay } from "../data/Overlay";

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters {...props} />
))(({ theme }: { theme: any }) => ({
    border: `0px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
        borderBottom: 0,
    },
    "&:before": {
        display: "none",
    },
}));

const PANEL_DESCRIPTION =
    "Terraform can define and provision all cloud infrastructure needed to run a CAS server, such as the container service, networking, ingress, IAM/service accounts, environment variables, secrets integration, scaling, and health checks. It also makes CAS deployments repeatable across dev/test/prod and across clouds, with changes reviewed and validated in CI before deployment.";

const CLOUD_OPTIONS: {
    title: string;
    fieldName: keyof Overlay;
}[] = [
    { title: "AWS App Runner", fieldName: "terraformAwsAppRunner" },
    { title: "GCP Cloud Run", fieldName: "terraformGcpCloudRun" },
    { title: "Azure Container Apps", fieldName: "terraformAzureContainerApps" },
];

interface CloudDeploymentsProps {
    control: Control<Overlay>;
}

export default function CloudDeployments({ control }: CloudDeploymentsProps) {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="cloud-deployments-content"
                id="cloud-deployments-header"
            >
                <Typography>Cloud Deployments</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontSize: "0.85rem" }}>
                    {PANEL_DESCRIPTION}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    {CLOUD_OPTIONS.map(({ title, fieldName }) => (
                        <Grid key={fieldName} size={{ xs: 12, sm: 4 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                                    {title}
                                </Typography>
                                <Divider sx={{ my: 0.5 }} />
                                <Controller
                                    control={control}
                                    name={fieldName}
                                    render={({ field: { onChange, value } }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={value === "true"}
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                                        onChange(event.target.checked ? "true" : "false")
                                                    }
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                                                    Enable {title}
                                                </Typography>
                                            }
                                            labelPlacement="end"
                                        />
                                    )}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}

