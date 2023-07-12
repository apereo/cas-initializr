import React from 'react';

import DOMPurify from 'dompurify';

export function HtmlRender ({ html }: { html: string }) {

    const parsed = React.useMemo(() => {
        let rootElement = document.createElement("div");
        const pattern = /\{@code (.+?)\}/gi;
        let finalHtml = html?.replace(pattern, (match, $1) => {
            return "<code>" + $1 + "</code>";
        });
        rootElement.appendChild(DOMPurify.sanitize(finalHtml, { RETURN_DOM_FRAGMENT: true }));
        return rootElement.innerHTML;
    }, [html]);

    return (
        <span dangerouslySetInnerHTML={{__html: parsed}} />
    );
}
