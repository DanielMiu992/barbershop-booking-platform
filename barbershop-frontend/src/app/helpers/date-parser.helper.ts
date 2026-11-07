export function parseStringToDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');

    if (parts.length !== 3) return null;
    
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}
