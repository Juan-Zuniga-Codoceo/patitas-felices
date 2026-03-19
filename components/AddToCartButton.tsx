"use client";

import { useCart, Product } from "./CartProvider";

export function AddToCartButton({ product, selectedVariant = null }: { product: any, selectedVariant?: any }) {
    const { addToCart } = useCart();

    // Map Prisma product to CartProvider product format
    const cartProduct: Product = {
        id: product.id,
        name: product.name,
        // Override price if a variant with priceAdjustment is selected
        price: selectedVariant ? product.price + (selectedVariant.priceAdjustment || 0) : product.price,
        imageUrl: product.image || product.imageUrl,
        allowsCOD: product.allowsCOD,
        provider: product.providerType,
        category: product.category as any,
        variantId: selectedVariant?.id,
        variantColor: selectedVariant?.color,
    };

    return (
        <button
            onClick={() => addToCart(cartProduct)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#FF9800' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Agregar al Carrito
        </button>
    );
}
