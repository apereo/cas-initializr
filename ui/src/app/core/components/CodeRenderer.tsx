import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeRenderer({ code, language }: { code: string, language: string }) {
    return (
        <SyntaxHighlighter
            language={language}
            style={atomDark}
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
                backgroundColor: "#212121",
            }}
            codeTagProps={{
                style: {},
            }}
        >
            {code}
        </SyntaxHighlighter>
    );
}
