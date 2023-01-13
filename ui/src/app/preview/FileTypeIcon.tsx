import { Code, Css, Folder, Html, Javascript, Settings, TextSnippet } from "@mui/icons-material";

export function FileTypeIcon({ type }: { type: string }) {
    switch (type) {
        case "dir":
            return <Folder />;
        case "css":
            return <Css />;
        case "javascript":
            return <Javascript />;
        case "properties":
            return <Settings />;
        case "html":
            return <Html />;
        case "markdown":
        case "plaintext":
            return <TextSnippet />;
        default:
            return <Code />;
    }
}