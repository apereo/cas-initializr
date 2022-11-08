import React from 'react';
import { Button, CircularProgress, Divider, Grid } from '@mui/material';

import Customization from './Customization';
import Dependencies from './Dependencies';
import { useApiLoaded, useVersionsLoaded } from '../store/AppReducer';
import { Overlay } from '../data/Overlay';
import { useCanDownload, useOverlay } from '../store/OverlayReducer';
import { isNil, pickBy } from 'lodash';

import * as FileSaver from 'file-saver';
import useFetch from 'use-http';
import * as queryString from 'query-string';
import { useDefaultValues } from '../store/OptionReducer';

export const downloadAsZip = (fileName: string, data: any) => {
    // const blob = new Blob([data], { type: 'text/zip;charset=utf-8' });
    FileSaver.saveAs(data, `${fileName}.tar.gz`);
};

export default function Initializr() {

    const apiLoaded = useApiLoaded();
    const versionsLoaded = useVersionsLoaded();
    const canDownload = useCanDownload();

    const overlay = useOverlay();

    const defaults = useDefaultValues();

    const downloader = useFetch<any>(`api/starter.tgz`);

    const download = async (overlay: Overlay) => {
        const used = pickBy(overlay, (value: any) => value !== "" && !isNil(value));
        const string = queryString.stringify(used, { arrayFormat: "comma" });
        await downloader.get(`?${string}`);
        const file = await downloader.response.blob();
        if (downloader.response.ok) {
            downloadAsZip(overlay.name ? overlay.name : defaults.name || 'cas', file);
        }
    };

    return (
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
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            onClick={() => download(overlay)}
                            disabled={ !canDownload }
                        >
                            Download
                        </Button>
                    </Grid>
                    <Grid item xs={6} style={{ padding: "1rem" }}>
                        <Dependencies />
                    </Grid>
                </>
            ) : (
                <Grid item xs={12} style={{ padding: "1rem", justifyContent: 'center', display: 'flex' }} zeroMinWidth>
                    <CircularProgress />
                </Grid>
            )}
        </Grid>
    );
}

