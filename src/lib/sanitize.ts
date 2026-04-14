import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return html;
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
            'blockquote', 'code', 'pre', 'hr',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'span', 'div', 'section', 'article',
        ],
        ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'class', 'id', 'target', 'rel', 'width', 'height'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
        FORCE_BODY: true,
    });
}
