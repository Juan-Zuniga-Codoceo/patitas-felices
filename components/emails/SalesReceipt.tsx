import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Configurando fuentes premium (Opcional pero recomendado para estética Boutique)
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKIGJYt61A8Q.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKIGJYt61A8Q.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 20,
        marginBottom: 20,
    },
    brandContainer: {
        flexDirection: 'column',
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'extrabold',
        color: '#263238',
        letterSpacing: -0.5,
    },
    brandHighlight: {
        color: '#5FAFE3',
    },
    companyInfo: {
        marginTop: 6,
        fontSize: 10,
        color: '#64748B',
        lineHeight: 1.4,
    },
    receiptTitleInfo: {
        alignItems: 'flex-end',
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5FAFE3',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    receiptNumber: {
        fontSize: 12,
        color: '#475569',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    customerInfoBox: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    customerText: {
        fontSize: 10,
        color: '#334155',
        marginBottom: 4,
        lineHeight: 1.4,
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#5FAFE3',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableHeaderCell: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tableCell: {
        fontSize: 10,
        color: '#334155',
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },

    totalsBox: {
        marginTop: 20,
        alignSelf: 'flex-end',
        width: 250,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    totalsLabel: {
        fontSize: 11,
        color: '#64748B',
    },
    totalsValue: {
        fontSize: 11,
        color: '#1E293B',
        fontWeight: 'bold',
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#CBD5E1',
    },
    finalTotalLabel: {
        fontSize: 14,
        fontWeight: 'extrabold',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    finalTotalValue: {
        fontSize: 14,
        fontWeight: 'extrabold',
        color: '#5FAFE3',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 9,
        color: '#94A3B8',
        lineHeight: 1.5,
    }
});

interface OrderData {
    id: string;
    customerName: string;
    customerRUT: string;
    customerAddress: string;
    comuna: string;
    items: {
        productName: string;
        quantity: number;
        priceAtPurchase: number;
    }[];
    shippingCost: number;
    totalPrice: number;
    createdAt: Date;
}

export function SalesReceipt({ order }: { order: OrderData }) {
    const subtotal = order.totalPrice - order.shippingCost;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <Text style={styles.brandName}>Patitas <Text style={styles.brandHighlight}>Felices</Text></Text>
                        <Text style={styles.companyInfo}>
                            SynapseDev SpA{'\n'}
                            RUT: 77.123.456-7{'\n'}
                            Av. Libertad 800, Viña del Mar{'\n'}
                            contacto@patitasfelices.cl
                        </Text>
                    </View>
                    <View style={styles.receiptTitleInfo}>
                        <Text style={styles.receiptTitle}>Comprobante</Text>
                        <Text style={styles.receiptNumber}>#{order.id.slice(-8).toUpperCase()}</Text>
                        <Text style={styles.companyInfo}>{new Date(order.createdAt).toLocaleDateString('es-CL')}</Text>
                    </View>
                </View>

                {/* Body - Customer */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos del Cliente</Text>
                    <View style={styles.customerInfoBox}>
                        <Text style={styles.customerText}><Text style={{ fontWeight: 'bold' }}>Señor(a):</Text> {order.customerName}</Text>
                        <Text style={styles.customerText}><Text style={{ fontWeight: 'bold' }}>RUT:</Text> {order.customerRUT}</Text>
                        <Text style={styles.customerText}><Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {order.customerAddress}, {order.comuna}</Text>
                    </View>
                </View>

                {/* Area de Items */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descripción</Text>
                        <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
                        <Text style={[styles.tableHeaderCell, styles.colPrice]}>P. Unit</Text>
                        <Text style={[styles.tableHeaderCell, styles.colTotal]}>Subtotal</Text>
                    </View>

                    {order.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.colDesc]}>{item.productName}</Text>
                            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, styles.colPrice]}>${item.priceAtPurchase.toLocaleString('es-CL')}</Text>
                            <Text style={[styles.tableCell, styles.colTotal]}>
                                ${(item.priceAtPurchase * item.quantity).toLocaleString('es-CL')}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totales */}
                <View style={styles.totalsBox}>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Subtotal</Text>
                        <Text style={styles.totalsValue}>${subtotal.toLocaleString('es-CL')}</Text>
                    </View>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Despacho</Text>
                        <Text style={styles.totalsValue}>${order.shippingCost.toLocaleString('es-CL')}</Text>
                    </View>
                    <View style={styles.finalTotalRow}>
                        <Text style={styles.finalTotalLabel}>Total Final</Text>
                        <Text style={styles.finalTotalValue}>${order.totalPrice.toLocaleString('es-CL')}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        ¡Gracias por comprar en Patitas Felices! Esperamos que tus mascotas disfruten su pedido.{'\n'}
                        Este documento es un comprobante de venta interna, no constituye boleta electrónica SII.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

// Exporting OrderData type for the generator
export type ReceiptOrderData = OrderData;
