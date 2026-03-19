export async function getDropiProduct(externalId: string, apiKey: string) {
    if (!apiKey) {
        return { success: false, error: "API Key requerida para Dropi" };
    }

    try {
        const response = await fetch(`https://app.dropi.cl/api/products/${externalId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            // Usamos revalidate para cache control a nuestro gusto, o force-cache si conviene
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            // Manejo de rechazos por IP o expiración del token (401 / 403)
            if (response.status === 401 || response.status === 403) {
                return { success: false, error: "Token de Dropi Expirado o IP Rechazada. Revisa el Token en Proveedores." };
            }
            if (response.status === 404) {
                return { success: false, error: `SKU Externo ${externalId} no encontrado en Dropi.` };
            }
            return { success: false, error: `Error HTTP: ${response.status} en la conexión con Dropi.` };
        }

        const data = await response.json();

        // Asumiendo la estructura estándar de e-commerce Dropshipping
        // que suele tener un campo stock_details o variantes y el sale_price base de Dropi
        const stock = data?.product?.stock || 0;
        const costPrice = data?.product?.sale_price || 0;

        return { success: true, stock, costPrice, data: data.product };
    } catch (error) {
        console.error("Error conectando a Dropi:", error);
        return { success: false, error: "Error de Red: Imposible conectar con Dropi Chile." };
    }
}
