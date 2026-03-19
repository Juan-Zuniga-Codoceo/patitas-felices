import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { SalesReceipt, ReceiptOrderData } from '@/components/emails/SalesReceipt';

/**
 * Generates a PDF receipt buffer in-memory, avoiding any disk writes.
 * @param orderData - The order data needed to inject into the React-PDF template.
 * @returns Buffer containing the rendered PDF.
 */
export async function generateReceiptPDFBuffer(orderData: ReceiptOrderData): Promise<Buffer> {
    try {
        const pdfStream = await renderToBuffer(<SalesReceipt order={ orderData } />);
        return pdfStream;
    } catch (error) {
        console.error('[PDF Generator] Error creating buffer:', error);
        throw error;
    }
}
