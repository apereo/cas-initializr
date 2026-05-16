import React, { useContext } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { usePreviewSelected } from "../store/PreviewReducer";
import { ThemeContext } from "../App";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
    javascript: "javascript",
    markdown: "markdown",
    kotlin: "kotlin",
    groovy: "java",
    java: "java",
    xml: "xml",
    properties: "ini",
    html: "html",
    css: "css",
    docker: "dockerfile",
    bash: "shell",
    yaml: "yaml",
    markup: "xml",
    git: "plaintext",
    archive: "plaintext",
    image: "plaintext",
    plaintext: "plaintext",
    json: "json",
};

const MONACO_THEME_MAP: Record<string, string> = {
    light: "vs",
    dark: "vs-dark",
    highContrast: "hc-black",
    blue: "vs-dark",
    solarizedLight: "vs",
    solarizedDark: "vs-dark",
    vscodeLight: "vs",
    vscodeDark: "vs-dark",
};

export function Code({ fontSize = 14, minimap = true, wordWrap = true, markdownPreview = false }: { fontSize?: number; minimap?: boolean; wordWrap?: boolean; markdownPreview?: boolean }) {
    const selected = usePreviewSelected();
    const { currentTheme } = useContext(ThemeContext);

    const monacoLanguage =
        selected?.type ? (MONACO_LANGUAGE_MAP[selected.type] ?? "plaintext") : "plaintext";
    const monacoTheme = MONACO_THEME_MAP[currentTheme] ?? "vs-dark";
    const isDark = !["light", "solarizedLight", "vscodeLight"].includes(currentTheme);

    if (selected?.type === "image" && selected.content) {
        return (
            <div style={{ padding: "1.5rem", height: "100%", backgroundColor: "#1e1e1e", boxSizing: "border-box" }}>
                <img src={selected.content} alt={selected.name} style={{ maxWidth: "100%" }} />
            </div>
        );
    }

    /* ── Markdown rendered preview ─────────────────────────────── */
    if (selected?.type === "markdown" && markdownPreview && selected.content) {
        return (
            <div
                style={{
                    height: "100%",
                    overflowY: "auto",
                    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
                    padding: "24px 40px",
                    boxSizing: "border-box",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: fontSize,
                    lineHeight: 1.7,
                    color: isDark ? "#d4d4d4" : "#24292e",
                }}
                className="md-preview"
            >
                <style>{`
                    .md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4,.md-preview h5,.md-preview h6{
                        color:${isDark ? "#e4e4e4" : "#111"};font-weight:600;margin:1.2em 0 0.4em;
                        border-bottom:${isDark?"1px solid #333":"1px solid #eee"};padding-bottom:0.2em;
                    }
                    .md-preview h1{font-size:2em} .md-preview h2{font-size:1.5em} .md-preview h3{font-size:1.2em}
                    .md-preview p{margin:0.6em 0}
                    .md-preview a{color:${isDark?"#4ec9b0":"#0366d6"};text-decoration:none}
                    .md-preview a:hover{text-decoration:underline}
                    .md-preview code{
                        background:${isDark?"#2d2d2d":"#f0f0f0"};
                        color:${isDark?"#ce9178":"#d63384"};
                        padding:2px 5px;border-radius:3px;
                        font-family:Consolas,'Courier New',monospace;font-size:0.9em;
                    }
                    .md-preview pre{
                        background:${isDark?"#1a1a1a":"#f5f5f5"};
                        border:1px solid ${isDark?"#333":"#ddd"};
                        border-radius:5px;padding:16px;overflow-x:auto;
                    }
                    .md-preview pre code{background:transparent;padding:0;color:${isDark?"#d4d4d4":"#333"}}
                    .md-preview blockquote{
                        border-left:4px solid ${isDark?"#007acc":"#0366d6"};
                        margin:0;padding:4px 16px;
                        color:${isDark?"#888":"#6a737d"};
                        background:${isDark?"#1a2740":"#f6f8fa"};
                        border-radius:0 4px 4px 0;
                    }
                    .md-preview ul,.md-preview ol{padding-left:2em;margin:0.4em 0}
                    .md-preview li{margin:0.2em 0}
                    .md-preview table{border-collapse:collapse;width:100%;margin:1em 0}
                    .md-preview th,.md-preview td{
                        border:1px solid ${isDark?"#444":"#ddd"};
                        padding:6px 13px;text-align:left;
                    }
                    .md-preview th{background:${isDark?"#252526":"#f0f0f0"};font-weight:600}
                    .md-preview tr:nth-child(even){background:${isDark?"#1e1e2e":"#f9f9f9"}}
                    .md-preview hr{border:none;border-top:1px solid ${isDark?"#333":"#ddd"};margin:1.5em 0}
                    .md-preview img{max-width:100%;border-radius:4px}
                `}</style>
                <ReactMarkdown>{selected.content}</ReactMarkdown>
            </div>
        );
    }

    return (
        <Editor
            height="100%"
            language={monacoLanguage}
            value={selected?.content ?? ""}
            theme={monacoTheme}
            options={{
                readOnly: true,
                contextmenu: true,
                fontSize,
                minimap: { enabled: minimap },
                scrollBeyondLastLine: false,
                wordWrap: wordWrap ? "on" : "off",
                lineNumbers: "on",
                renderLineHighlight: "all",
                automaticLayout: true,
                padding: { top: 16 },
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            }}
        />
    );
}
