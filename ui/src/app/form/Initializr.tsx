import React, {Fragment} from 'react';
import { Backdrop, Button, CircularProgress, Divider, Grid } from '@mui/material';
import { useHotkeys } from "react-hotkeys-hook";
import Customization from './Customization';
import Dependencies from './Dependencies';
import ShareOverlay from "./ShareOverlay";

import { useApiLoaded, useVersionsLoaded } from '../store/AppReducer';
import { Overlay } from '../data/Overlay';
import { useCanDownload, useOverlay } from '../store/OverlayReducer';
import { getOverlayFromQs, getOverlayQuery } from '../data/Url';
import JSZip from "jszip";

import * as FileSaver from 'file-saver';

import { useDefaultValues } from '../store/OptionReducer';
import { API_PATH } from '../App.constant';
import { Preview } from '../preview/Preview';
import { Download } from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { setPreviewSelected, setPreviewState, setPreviewTree } from '../store/PreviewReducer';
import { setDependencies } from '../store/OverlayReducer';

import { getTree } from "../file/tree";

export const downloadAsZip = (fileName: string, data: any) => {
    // const blob = new Blob([data], { type: 'text/zip;charset=utf-8' });
    FileSaver.saveAs(data, `${fileName}.tar.gz`);
};

export default function Initializr() {
    const apiLoaded = useApiLoaded();
    const versionsLoaded = useVersionsLoaded();
    const canDownload = useCanDownload();
    const overlay = useOverlay();
    const defaultValues = useDefaultValues();
    const dispatch = useAppDispatch();

    const [loading, setLoading] = React.useState(false);

    const fetchArchive = async (overlay: Overlay, type: string = "tgz") => {
        const string = getOverlayQuery(overlay);
        return await fetch(`${API_PATH}starter.${type}?${string}`);
    };

    const download = async (overlay: Overlay) => {
        setLoading(true);
        const response = await fetchArchive(overlay);
        if (response.ok) {
            const file = await response.blob();
            setLoading(false);
            downloadAsZip(
                overlay.name ? overlay.name : defaultValues.name || "cas",
                file
            );
        }
    };

    const explore = async (overlay: Overlay) => {
        setLoading(true);
        const response = await fetchArchive(overlay, "zip");
        if (response.ok) {
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
            } catch (e) {}
            setLoading(false);
        }
    };

    useHotkeys("ctrl+space", () => explore(overlay), [overlay]);
    useHotkeys("ctrl+enter", () => download(overlay), [overlay]);

    /*eslint-disable react-hooks/exhaustive-deps*/
    React.useEffect(() => {
        const { dependencies = [] } = getOverlayFromQs();
        dispatch(setDependencies(dependencies));
    }, [defaultValues]);
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
                }}
            >
                {apiLoaded && versionsLoaded ? (
                    <>
                        <Grid item xs={6} style={{ padding: "1rem" }}>
                            <Customization />
                            <Divider style={{ margin: "1rem 0rem" }} />
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        onClick={() => download(overlay)}
                                        disabled={!canDownload || loading}
                                        startIcon={<Download />}
                                    >
                                        Download
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Preview
                                        handlePreview={() => explore(overlay)}
                                        handleDownload={() => download(overlay)}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <ShareOverlay overlay={overlay} />
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
                        </Grid>
                        <Grid item xs={6} style={{ padding: "1rem" }}>
                            <Dependencies />
                        </Grid>
                    </>
                ) : (
                    <Grid
                        item
                        xs={12}
                        style={{
                            padding: "1rem",
                            justifyContent: "center",
                            display: "flex",
                        }}
                        zeroMinWidth
                    >
                        <CircularProgress />
                    </Grid>
                )}
            </Grid>
        </Fragment>
    );
}

