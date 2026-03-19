import * as XLSX from 'xlsx';

/**
 * Format a raw RUT string into XX.XXX.XXX-X
 */
export function formatRUT(rut: string): string {
    if (!rut) return "";

    // Remove all non-alphanumeric characters
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    if (cleanRut.length < 2) return cleanRut;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Format body with dots
    let formattedBody = "";
    for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
        formattedBody = body.charAt(i) + formattedBody;
        if (j % 3 === 0 && i !== 0) {
            formattedBody = "." + formattedBody;
        }
    }

    return `${formattedBody}-${dv}`;
}

/**
 * Trigger a browser download of the provided JSON array as an XLSX file.
 */
export function exportToExcel<T>(data: T[], fileName: string) {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
