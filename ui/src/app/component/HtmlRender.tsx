import React, { Fragment } from 'react';

import DOMPurify from 'dompurify';

export function HtmlRender ({ html }: { html: string }) {

    const parsed = React.useMemo(() => {
        return DOMPurify.sanitize(html);
    }, [html]);

    return (
        <span dangerouslySetInnerHTML={{ __html: parsed }} />
    );
}