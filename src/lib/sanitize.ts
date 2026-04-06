/**
 * Minimal HTML sanitizer for blog content.
 * Strips dangerous elements and event handler attributes.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return html;
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/\son\w+\s*=/gi, ' data-removed="1" ')
        .replace(/javascript:/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^>]*>/gi, '')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
        .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi, '')
        .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
}
