import React, {Fragment} from 'react';
import { Alert, AlertTitle, Backdrop, Box, CircularProgress, Divider, Grid, Tab, Tabs } from '@mui/material';
import Customization from './Customization';
import Dependencies from './Dependencies';
import ShareOverlay from "./ShareOverlay";

import { useApiLoaded, useVersionsLoaded } from '../store/AppReducer';
import { Overlay } from '../data/Overlay';
import { preselected, useCanDownload, useOverlay } from '../store/OverlayReducer';
import { getOverlayFromQs, getOverlayQuery } from '../data/Url';
import JSZip from "jszip";

import * as FileSaver from 'file-saver';

import { useDefaultValues } from '../store/OptionReducer';
import { API_PATH } from '../App.constant';
import { Preview } from '../preview/Preview';
import { useAppDispatch } from '../store/hooks';
import { setPreviewSelected, setPreviewState, setPreviewTree } from '../store/PreviewReducer';
import { setDependencies } from '../store/OverlayReducer';

import { getTree } from "../file/tree";
import DownloadOverlay from './DownloadOverlay';

export const downloadAsZip = (fileName: string, data: any) => {
    // const blob = new Blob([data], { type: 'text/zip;charset=utf-8' });
    FileSaver.saveAs(data, `${fileName}.tar.gz`);
};

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

interface ArchiveRequestError {
    title: string;
    message: string;
    body?: string;
}

const MAX_ERROR_BODY_LENGTH = 4000;

const formatErrorBody = (body: string): string | undefined => {
    const trimmed = body.trim();
    if (!trimmed) {
        return undefined;
    }

    let formatted = trimmed;
    try {
        formatted = JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch (_) {
        formatted = trimmed;
    }

    if (formatted.length > MAX_ERROR_BODY_LENGTH) {
        return `${formatted.substring(0, MAX_ERROR_BODY_LENGTH)}\n...`;
    }
    return formatted;
};

const getArchiveRequestError = async (response: Response, action: string): Promise<ArchiveRequestError> => {
    let body = "";
    try {
        body = await response.text();
    } catch (_) {
        body = "";
    }

    const status = `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
    return {
        title: `Unable to ${action}`,
        message: `Server responded with ${status}.`,
        body: formatErrorBody(body),
    };
};

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3, px: 0 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

export default function Initializr() {
    const apiLoaded = useApiLoaded();
    const versionsLoaded = useVersionsLoaded();
    const canDownload = useCanDownload();
    const overlay = useOverlay();
    const defaultValues = useDefaultValues();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = React.useState(false);
    const [requestError, setRequestError] = React.useState<ArchiveRequestError | null>(null);

    const fetchArchive = async (overlay: Overlay, type: string = "tgz") => {
        const string = getOverlayQuery(overlay);
        return await fetch(`${API_PATH}starter.${type}?${string}`);
    };

    const download = async (overlay: Overlay) => {
        setRequestError(null);
        setLoading(true);
        try {
            const response = await fetchArchive(overlay);
            if (!response.ok) {
                setRequestError(await getArchiveRequestError(response, "download the overlay"));
                return;
            }
            const file = await response.blob();
            downloadAsZip(
                overlay.name ? overlay.name : defaultValues.name || "cas",
                file
            );
        } catch (e) {
            setRequestError({
                title: "Unable to download the overlay",
                message: e instanceof Error ? e.message : "The request failed.",
            });
        } finally {
            setLoading(false);
        }
    };

    const explore = async (overlay: Overlay) => {

        setRequestError(null);
        setLoading(true);
        try {
            const response = await fetchArchive(overlay, "zip");
            if (!response.ok) {
                setRequestError(await getArchiveRequestError(response, "preview the overlay"));
                return;
            }
            const file = await response.blob();

            try {
                const zipJs = new JSZip();
                const { files } = await zipJs.loadAsync(file).catch(() => {
                    throw Error(`Could not load overlay.`);
                });
                const parsed = await getTree(files, zipJs);
                const { tree, selected } = parsed;
                dispatch(setPreviewTree(tree));
                dispatch(setPreviewSelected(selected));
                dispatch(setPreviewState(true));
            } catch (e) {
                setRequestError({
                    title: "Unable to preview the overlay",
                    message: e instanceof Error ? e.message : "Could not load the generated overlay.",
                });
            }
        } catch (e) {
            setRequestError({
                title: "Unable to preview the overlay",
                message: e instanceof Error ? e.message : "The request failed.",
            });
        } finally {
            setLoading(false);
        }
    };

    /*eslint-disable react-hooks/exhaustive-deps*/
    React.useEffect(() => {
        let { dependencies = [...preselected] } = getOverlayFromQs();
        if (!Array.isArray(dependencies) && typeof dependencies === 'string') {
            dependencies = [dependencies];
        }
        dispatch(setDependencies(dependencies));
    }, [defaultValues]);

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <Fragment>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={false}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid
                container
                rowSpacing={1}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                sx={{
                    padding: "2rem",
                    paddingBottom: "5rem",
                }}
            >
                {apiLoaded && versionsLoaded ? (
                    <>
                        <Grid size={{ xs: 6}} style={{ padding: "1rem" }}>
                            <Customization />
                            <Divider style={{ margin: "1rem 0rem" }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, xl: 4}}>
                                    <DownloadOverlay
                                        handleDownload={() => download(overlay)}
                                        disabled={!canDownload || loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, xl: 4}}>
                                    <Preview
                                        handlePreview={() => explore(overlay)}
                                        handleDownload={() => download(overlay)}
                                        disabled={!canDownload || loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, xl: 4}}>
                                    <ShareOverlay
                                        overlay={overlay}
                                        disabled={!canDownload || loading}
                                    />
                                </Grid>
                            </Grid>
                            {loading && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "2rem",
                                    }}
                                >
                                    <CircularProgress />
                                </div>
                            )}
                            {requestError && (
                                <Alert
                                    severity="error"
                                    onClose={() => setRequestError(null)}
                                    sx={{ mt: 2, alignItems: "flex-start" }}
                                >
                                    <AlertTitle>{requestError.title}</AlertTitle>
                                    {requestError.message}
                                    {requestError.body && (
                                        <Box
                                            component="pre"
                                            sx={{
                                                bgcolor: "rgba(0, 0, 0, 0.12)",
                                                borderRadius: 1,
                                                fontFamily: "monospace",
                                                fontSize: "0.75rem",
                                                mt: 1,
                                                overflow: "auto",
                                                p: 1,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {requestError.body}
                                        </Box>
                                    )}
                                </Alert>
                            )}
                        </Grid>
                        <Grid size={{xs: 6}}>

                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Dependencies" {...a11yProps(0)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={value} index={0}>
                                <Dependencies />
                            </TabPanel>
                        </Grid>
                    </>
                ) : (
                    <Grid
                        size={{xs: 12}}
                        style={{
                            padding: "1rem",
                            justifyContent: "center",
                            display: "flex",
                        }}
                    >
                        <CircularProgress />
                    </Grid>
                )}
            </Grid>
        </Fragment>
    );
}
