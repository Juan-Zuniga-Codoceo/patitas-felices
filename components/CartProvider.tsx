"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    allowsCOD: boolean;
    provider: "Dropi" | "External";
    category: "Dog" | "Cat" | "Both";
    variantId?: string;
    variantColor?: string;
};

export type CartItem = Product & { quantity: number };

type CartContextType = {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    subtotal: number;
    totalPrice: number;
    discount: number;
    applyDiscount: (val: number) => void;
    canUseCOD: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<number>(1); // e.g., 0.95 for 5% off

    const applyDiscount = (val: number) => {
        setDiscount(val);
        toast.success("¡Descuento aplicado con éxito! 🐾", { style: { borderColor: '#5FAFE3', color: '#5FAFE3' } });
    };

    const addToCart = (product: Product) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (i) => i.id === product.id && i.variantId === product.variantId
            );

            let newItems;
            if (existingIndex >= 0) {
                newItems = [...prev];
                newItems[existingIndex].quantity += 1;
            } else {
                newItems = [...prev, { ...product, quantity: 1 }];
            }

            toast.success('Producto agregado al carrito 🐾', {
                style: { borderColor: '#FF9800', color: '#FF9800' }
            });

            return newItems;
        });
    };

    const removeFromCart = (productId: string, variantId?: string) => {
        setItems((prev) => prev.filter((i) => !(i.id === productId && i.variantId === variantId)));
    };

    const clearCart = () => {
        setItems([]);
        setDiscount(1);
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = Math.round(subtotal * discount);

    // Smart Checkout Logic: Disable COD if ANY product is not from 'Dropi'.
    const canUseCOD = items.length > 0 && items.every((item) => item.provider === "Dropi");

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, clearCart, subtotal, totalPrice, discount, applyDiscount, canUseCOD }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
