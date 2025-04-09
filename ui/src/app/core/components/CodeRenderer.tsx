import React, { useState, useContext } from "react";
import {
    atomDark,
    prism,
    vscDarkPlus,
    solarizedlight,
    solarizedDarkAtom,
    dracula,
    materialOceanic
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Prism, SyntaxHighlighterProps} from 'react-syntax-highlighter';
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { ThemeContext } from "../../App";

const SyntaxHighlighter = Prism as typeof React.Component<SyntaxHighlighterProps>;

export default function CodeRenderer({ code, language, filename = "file" }: { code: string, language: string, filename?: string }) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const { currentTheme } = useContext(ThemeContext);
    const theme = useTheme();

    // Select the appropriate syntax highlighter theme based on the application theme
    const getSyntaxHighlighterTheme = () => {
        switch (currentTheme) {
            case 'light':
                return prism;
            case 'dark':
                return atomDark;
            case 'highContrast':
                return dracula;
            case 'blue':
                return materialOceanic;
            case 'solarizedLight':
                return solarizedlight;
            case 'solarizedDark':
                return solarizedDarkAtom;
            case 'vscodeDark':
                return vscDarkPlus;
            default:
                return atomDark;
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to download file: ', err);
        }
    };

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            <Tooltip
                title={copySuccess ? "Copied!" : "Copy to clipboard"}
                placement="top"
                open={copySuccess ? true : undefined}
            >
                <IconButton
                    onClick={handleCopy}
                    sx={{
                        position: 'absolute',
                        top: '10px',
                        right: '60px',
                        backgroundColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(33, 33, 33, 0.7)'}`,
                        color: theme.palette.common.white,
                        '&:hover': {
                            backgroundColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(66, 66, 66, 0.9)'}`,
                        },
                        zIndex: 1,
                    }}
                    size="medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </IconButton>
            </Tooltip>
            <Tooltip
                title={downloadSuccess ? "Downloaded!" : "Download file"}
                placement="top"
                open={downloadSuccess ? true : undefined}
            >
                <IconButton
                    onClick={handleDownload}
                    sx={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        backgroundColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(33, 33, 33, 0.7)'}`,
                        color: theme.palette.common.white,
                        '&:hover': {
                            backgroundColor: `${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(66, 66, 66, 0.9)'}`,
                        },
                        zIndex: 1,
                    }}
                    size="medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </IconButton>
            </Tooltip>
            <SyntaxHighlighter
                language={language}
                style={getSyntaxHighlighterTheme()}
                showLineNumbers={true}
                wrapLongLines={true}
                showInlineLineNumbers={true}
                lineNumberContainerStyle={{
                    width: "20px",
                }}
                customStyle={{
                    borderRadius: 0,
                    margin: 0,
                    height: "100%",
                    boxSizing: "border-box",
                    backgroundColor: theme.palette.background.paper,
                }}
                codeTagProps={{
                    style: {},
                }}
            >
                {code}
            </SyntaxHighlighter>
        </Box>
    );
}
