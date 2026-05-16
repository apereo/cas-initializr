import React from "react";

/* ── Material Icon Theme–inspired colour palette ─────────────── */
const C = {
    java:       "#CC3C24",
    kotlin:     "#7F52FF",
    groovy:     "#1BA94C",
    xml:        "#E37933",
    yaml:       "#CC3A24",
    props:      "#9E9E9E",
    markdown:   "#42A5F5",
    bash:       "#4EAA25",
    docker:     "#0DB7ED",
    html:       "#E34F26",
    css:        "#264DE4",
    js:         "#CBB400",
    json:       "#CBCB41",
    git:        "#F14E32",
    archive:    "#78909C",
    image:      "#CE93D8",
    text:       "#7B8C9E",
    code:       "#519ABA",
    /* Folders */
    folder:     "#90A4AE",
    fSrc:       "#66BB6A",
    fMain:      "#42A5F5",
    fTest:      "#EF5350",
    fGradle:    "#1BA94C",
    fResources: "#F4A261",
    fDocker:    "#0DB7ED",
    fWrapper:   "#80CBC4",
    fConfig:    "#9E9E9E",
    fJava:      "#CC3C24",
    fKotlin:    "#7F52FF",
    fDist:      "#78909C",
};

/* ── Generic badge icon (colored rect + short label) ─────────── */
function Badge({ color, label, size = 20 }: { color: string; label: string; size?: number }) {
    const fs = label.length <= 2 ? 8 : label.length === 3 ? 7 : 6;
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={color} />
            <text
                x="10" y="13.5"
                textAnchor="middle"
                fontSize={fs}
                fontWeight="bold"
                fontFamily="monospace"
                fill="white"
                style={{ userSelect: "none" }}
            >
                {label}
            </text>
        </svg>
    );
}

/* ── Folder icon (with open/closed variant + tab on top) ─────── */
function FolderIcon({ color, open = false, size = 20 }: { color: string; open?: boolean; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            {open ? (
                <path d="M1 6h5.5l1.5 2h10l-2 8H2z" fill={color} opacity="0.9" />
            ) : (
                <>
                    <path d="M1 6h6l1.5 2H19v9H1z" fill={color} opacity="0.75" />
                    <path d="M1 6h7.5l1.5 2H19v1H1z" fill={color} />
                </>
            )}
        </svg>
    );
}

/* ── Per-type icon definitions ───────────────────────────────── */
function JavaIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.java} />
            {/* Coffee cup silhouette */}
            <path d="M6 7h6v6c0 1-1 2-3 2s-3-1-3-2z" fill="white" opacity="0.9" />
            <path d="M12 9h1.5c.8 0 1.5.6 1.5 1.5S14.3 12 13.5 12H12" fill="none" stroke="white" strokeWidth="1" opacity="0.9" />
            <rect x="6.5" y="13.5" width="5" height="1" rx=".5" fill="white" opacity="0.9" />
        </svg>
    );
}

function KotlinIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.kotlin} />
            {/* K shape */}
            <path d="M6 5v10M6 10l6-5M6 10l6 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

function DockerIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.docker} />
            {/* Container stack */}
            <rect x="4" y="5" width="4" height="3" rx=".5" fill="white" opacity="0.9" />
            <rect x="9" y="5" width="4" height="3" rx=".5" fill="white" opacity="0.9" />
            <rect x="4" y="9" width="4" height="3" rx=".5" fill="white" opacity="0.9" />
            <rect x="9" y="9" width="4" height="3" rx=".5" fill="white" opacity="0.9" />
            <path d="M3 13c3 0 5 1.5 9 0" stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
        </svg>
    );
}

function GitIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.git} />
            {/* Branch */}
            <circle cx="7" cy="6" r="1.5" fill="white" />
            <circle cx="7" cy="14" r="1.5" fill="white" />
            <circle cx="13" cy="9" r="1.5" fill="white" />
            <line x1="7" y1="7.5" x2="7" y2="12.5" stroke="white" strokeWidth="1.2" />
            <path d="M7 8c0-2 2-3 3-3h2" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M13 7.5V9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}

function ImageIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.image} />
            <circle cx="7" cy="8" r="1.5" fill="white" opacity="0.9" />
            <path d="M3 15l4-4 3 3 2-2 5 5H3z" fill="white" opacity="0.9" />
        </svg>
    );
}

function ArchiveIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" fill={C.archive} />
            <rect x="4" y="5" width="12" height="2.5" rx="1" fill="white" opacity="0.9" />
            <rect x="4" y="9" width="12" height="7" rx="1" fill="white" opacity="0.5" />
            <rect x="7.5" y="10.5" width="5" height="1.5" rx=".5" fill={C.archive} />
        </svg>
    );
}

/* ── Main export ─────────────────────────────────────────────── */
export function FileTypeIcon({
    type,
    name,
    open,
    fontSize,
}: {
    type: string;
    name?: string;
    open?: boolean;
    fontSize?: any;
}) {
    const size = fontSize === "small" ? 16 : fontSize === "inherit" ? 14 : 18;

    if (type === "dir") {
        const n = (name ?? "").toLowerCase();
        const color =
            n === "src"                         ? C.fSrc :
            n === "main"                        ? C.fMain :
            n === "test" || n === "tests"       ? C.fTest :
            n === "gradle"                      ? C.fGradle :
            n === "resources"                   ? C.fResources :
            n === "docker"                      ? C.fDocker :
            n === "wrapper"                     ? C.fWrapper :
            n === "config" || n === "conf"      ? C.fConfig :
            n === "java"                        ? C.fJava :
            n === "kotlin"                      ? C.fKotlin :
            n === "dist" || n === "build"       ? C.fDist :
            n === "node_modules"                ? C.fDist :
            C.folder;
        return <FolderIcon color={color} open={open} size={size} />;
    }

    switch (type) {
        case "java":        return <JavaIcon size={size} />;
        case "kotlin":      return <KotlinIcon size={size} />;
        case "groovy":      return <Badge color={C.groovy}  label="G"   size={size} />;
        case "xml":         return <Badge color={C.xml}     label="XML" size={size} />;
        case "yaml":        return <Badge color={C.yaml}    label="YML" size={size} />;
        case "properties":  return <Badge color={C.props}   label="⚙"   size={size} />;
        case "markdown":    return <Badge color={C.markdown} label="MD" size={size} />;
        case "bash":        return <Badge color={C.bash}    label="SH"  size={size} />;
        case "docker":      return <DockerIcon size={size} />;
        case "html":        return <Badge color={C.html}    label="HTM" size={size} />;
        case "css":         return <Badge color={C.css}     label="CSS" size={size} />;
        case "javascript":  return <Badge color={C.js}      label="JS"  size={size} />;
        case "json":        return <Badge color={C.json}    label="{}"  size={size} />;
        case "git":         return <GitIcon size={size} />;
        case "archive":     return <ArchiveIcon size={size} />;
        case "image":       return <ImageIcon size={size} />;
        case "markup":      return <Badge color={C.xml}     label="TPL" size={size} />;
        case "plaintext":
        case "bash":        return <Badge color={C.text}    label="TXT" size={size} />;
        default:            return <Badge color={C.code}    label="<>"  size={size} />;
    }
}
