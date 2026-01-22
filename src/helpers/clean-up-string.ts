export function cleanHtmlString(str: string): string {
    return str
        // Remove opening <div> tags
        .replace(/<div>/g, '')
        // Remove closing </div> tags and replace with <br>\n
        .replace(/<\/div>/g, '<br>\n')
        // Replace any remaining \r with <br>\n
        .replace(/\r/g, '<br>\n')
        // Clean up multiple consecutive <br>\n (optional)
        .replace(/(<br>\n){3,}/g, '<br>\n<br>\n');
}