import Code from "@mui/icons-material/Code";
import Css from "@mui/icons-material/Css";
import Folder from "@mui/icons-material/Folder";
import Html from "@mui/icons-material/Html";
import Javascript from "@mui/icons-material/Javascript";
import Settings from "@mui/icons-material/Settings";
import TextSnippet from "@mui/icons-material/TextSnippet";

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
