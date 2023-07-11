import React from 'react';

import DOMPurify from 'dompurify';

export function HtmlRender ({ html }: { html: string }) {

    const parsed = React.useMemo(() => {
        let rootElement = document.createElement("div");
        rootElement.appendChild(DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true }));
        return rootElement.innerHTML;
    }, [html]);

    return (
        <span dangerouslySetInnerHTML={{__html: parsed}} />
    );
}