import { HtmlRender } from "../component/HtmlRender";
import { Property } from "../data/Property";

export function getPropertyCodeString(s: Property): string {
    return `/* ${s.description} */ \n ${s.name}=${s.defaultValue ? s.defaultValue : ''}`;
}

export function PropertyCode({ property }: { property: Property }) {
    return (
        <div  style={ { maxWidth: '600px' } }>
        <code>
            <pre style={ { whiteSpace: 'pre-wrap' } }>
                &#92;&#42; ${<HtmlRender html={property.description} />} &#42;&#92;
                {`\n\n${property.name}=${property.defaultValue ? property.defaultValue : ''}`}
            </pre>
        </code>
        </div>
    );
}