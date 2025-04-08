import React from "react";
import { usePreviewSelected } from "../store/PreviewReducer";
import { Box, Typography } from "@mui/material";
import CodeRenderer from "../core/components/CodeRenderer";
import ReactMarkdown from "react-markdown";

export function Code() {

    const selected = usePreviewSelected();

    const item = React.useMemo(() => {
        if (selected && selected.content) {
            switch (selected.type) {
                case "markdown":
                    return (
                        <div style={{ padding: "1.5rem" }}>
                            <ReactMarkdown>{selected.content}</ReactMarkdown>
                        </div>
                    );
                case "image":
                    return (
                        <div style={{ padding: "1.5rem" }}>
                            <img src={selected.content} alt={selected.name} />
                        </div>
                    );
                case "archive":
                    return (<Typography variant="body2" style={{padding: '1.5rem'}}>
                        Unable to display contents of this file.
                    </Typography>);
                default:
                    return (
                        <CodeRenderer
                            code={selected.content}
                            language={selected.type}
                            filename={selected.name}
                        />
                    );
            }
        } else {
            return (
                <Typography variant="body2" style={{ padding: "1.5rem", fontStyle: 'italic' }}>
                    (empty)
                </Typography>
            );
        }
    }, [selected])

    return (
        <Box
            sx={{
                height: "calc(100vh - 64px)",
                overflow: "scroll",
                backgroundColor: "#212121",
            }}
        >
            {item}
        </Box>
    );
}
