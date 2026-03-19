"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCatalogProps {
    animationKey: string;
    children: React.ReactNode;
}

export function AnimatedCatalog({ animationKey, children }: AnimatedCatalogProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
