import React from "react";
import {
    Checkbox,
    FormControlLabel,
    Typography,
    Paper,
    Divider,
    Grid,
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

interface BuildFeatureCardProps {
    title: string;
    description: string;
    fieldName: keyof Overlay;
    control: Control<Overlay>;
}

function BuildFeatureCard({ title, description, fieldName, control }: BuildFeatureCardProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1.3 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1, fontSize: "0.8rem" }}>
                {description}
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
    );
}

const BUILD_FEATURES: {
    title: string;
    description: string;
    fieldName: keyof Overlay;
}[] = [
    {
        title: "Docker",
        description:
            "Generates a Dockerfile, docker-compose, and Gradle tasks to containerize CAS using Jib or Spring Boot Cloud Native Buildpacks. Supports building and pushing images with no Dockerfile required.",
        fieldName: "dockerSupported",
    },
    {
        title: "Helm",
        description:
            "Generates a Helm chart to deploy CAS on Kubernetes, providing a standardized way to package, configure, and release CAS in a cloud-native environment.",
        fieldName: "helmSupported",
    },
    {
        title: "Heroku",
        description:
            "Generates Heroku-specific deployment files (Procfile, system.properties) to deploy CAS to the Heroku platform with minimal configuration.",
        fieldName: "herokuSupported",
    },
    {
        title: "Shell",
        description:
            "Includes the CAS command-line shell, an interactive tool for querying server configuration, testing authentication sources, and inspecting CAS internals at runtime.",
        fieldName: "commandlineShellSupported",
    },
    {
        title: "Puppeteer",
        description:
            "Includes Node.js acceptance test scenarios powered by Puppeteer that drive a headless browser to verify CAS authentication flows end-to-end.",
        fieldName: "puppeteerSupported",
    },
    {
        title: "SBOM",
        description:
            "Generates a Software Bill of Materials in CycloneDX format, cataloging all direct and transitive dependencies for security auditing and supply chain compliance.",
        fieldName: "sbomSupported",
    },
    {
        title: "GitHub Actions",
        description:
            "Generates GitHub Actions CI/CD workflow files to automate building, testing, and deploying your CAS overlay directly from a GitHub repository.",
        fieldName: "githubActionsSupported",
    },
    {
        title: "Native Image",
        description:
            "Compiles CAS into a GraalVM native binary for dramatically faster startup times and lower memory usage. Requires GraalVM with the native-image tool installed.",
        fieldName: "nativeImageSupported",
    },
    {
        title: "OpenRewrite",
        description:
            "Integrates the OpenRewrite Gradle plugin to automate CAS version upgrades using curated recipes that handle dependency updates and build migrations.",
        fieldName: "openRewriteSupported",
    },
];

interface BuildFeaturesProps {
    control: Control<Overlay>;
}

export default function BuildFeatures({ control }: BuildFeaturesProps) {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="build-features-content"
                id="build-features-header"
            >
                <Typography>Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {BUILD_FEATURES.map((feature) => (
                        <Grid
                            key={feature.fieldName}
                            size={{ xs: 12, sm: 6, md: 4 }}
                        >
                            <BuildFeatureCard
                                title={feature.title}
                                description={feature.description}
                                fieldName={feature.fieldName}
                                control={control}
                            />
                        </Grid>
                    ))}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}
