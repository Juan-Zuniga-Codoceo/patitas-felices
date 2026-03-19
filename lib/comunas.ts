// Comunas de Chile agrupadas por región y factor de tarificación
export type Comuna = {
    name: string;
    region: string;
    zone: "RM" | "Norte" | "Sur" | "Extremo";
};

export const COMUNAS: Comuna[] = [
    // Región Metropolitana
    { name: "Santiago", region: "RM", zone: "RM" },
    { name: "Las Condes", region: "RM", zone: "RM" },
    { name: "Providencia", region: "RM", zone: "RM" },
    { name: "Ñuñoa", region: "RM", zone: "RM" },
    { name: "Maipú", region: "RM", zone: "RM" },
    { name: "La Florida", region: "RM", zone: "RM" },
    { name: "Vitacura", region: "RM", zone: "RM" },
    { name: "Peñalolén", region: "RM", zone: "RM" },
    { name: "San Bernardo", region: "RM", zone: "RM" },
    { name: "Puente Alto", region: "RM", zone: "RM" },
    { name: "Quilicura", region: "RM", zone: "RM" },
    { name: "Lo Barnechea", region: "RM", zone: "RM" },
    { name: "El Bosque", region: "RM", zone: "RM" },
    { name: "La Pintana", region: "RM", zone: "RM" },
    { name: "Recoleta", region: "RM", zone: "RM" },

    // Norte
    { name: "Arica", region: "Arica y Parinacota", zone: "Norte" },
    { name: "Iquique", region: "Tarapacá", zone: "Norte" },
    { name: "Alto Hospicio", region: "Tarapacá", zone: "Norte" },
    { name: "Antofagasta", region: "Antofagasta", zone: "Norte" },
    { name: "Calama", region: "Antofagasta", zone: "Norte" },
    { name: "Tocopilla", region: "Antofagasta", zone: "Norte" },
    { name: "Copiapó", region: "Atacama", zone: "Norte" },
    { name: "Vallenar", region: "Atacama", zone: "Norte" },
    { name: "La Serena", region: "Coquimbo", zone: "Norte" },
    { name: "Coquimbo", region: "Coquimbo", zone: "Norte" },
    { name: "Ovalle", region: "Coquimbo", zone: "Norte" },

    // Zona Central / Sur
    { name: "Valparaíso", region: "Valparaíso", zone: "Sur" },
    { name: "Viña del Mar", region: "Valparaíso", zone: "Sur" },
    { name: "Quilpué", region: "Valparaíso", zone: "Sur" },
    { name: "Villa Alemana", region: "Valparaíso", zone: "Sur" },
    { name: "San Antonio", region: "Valparaíso", zone: "Sur" },
    { name: "Rancagua", region: "O'Higgins", zone: "Sur" },
    { name: "San Fernando", region: "O'Higgins", zone: "Sur" },
    { name: "Curicó", region: "Maule", zone: "Sur" },
    { name: "Talca", region: "Maule", zone: "Sur" },
    { name: "Linares", region: "Maule", zone: "Sur" },
    { name: "Chillán", region: "Ñuble", zone: "Sur" },
    { name: "Los Ángeles", region: "Biobío", zone: "Sur" },
    { name: "Concepción", region: "Biobío", zone: "Sur" },
    { name: "Talcahuano", region: "Biobío", zone: "Sur" },
    { name: "Coronel", region: "Biobío", zone: "Sur" },
    { name: "Temuco", region: "La Araucanía", zone: "Sur" },
    { name: "Padre Las Casas", region: "La Araucanía", zone: "Sur" },
    { name: "Villarrica", region: "La Araucanía", zone: "Sur" },
    { name: "Valdivia", region: "Los Ríos", zone: "Sur" },
    { name: "Osorno", region: "Los Lagos", zone: "Sur" },
    { name: "Puerto Montt", region: "Los Lagos", zone: "Sur" },
    { name: "Castro", region: "Los Lagos", zone: "Sur" },

    // Extremo Sur
    { name: "Coyhaique", region: "Aysén", zone: "Extremo" },
    { name: "Puerto Aysén", region: "Aysén", zone: "Extremo" },
    { name: "Punta Arenas", region: "Magallanes", zone: "Extremo" },
    { name: "Puerto Natales", region: "Magallanes", zone: "Extremo" },
    { name: "Porvenir", region: "Magallanes", zone: "Extremo" },
];

export const ZONE_FACTORS: Record<string, number> = {
    RM: 1.0,
    Norte: 1.5,
    Sur: 1.3,
    Extremo: 2.0,
};

/**
 * Calcula el factor de tarificación entre dos comunas.
 * Si son de zonas distintas, se aplica el factor mayor + 0.2 extra.
 */
export function calcularFactorEnvio(origenZone: string, destinoZone: string): number {
    const fOrigen = ZONE_FACTORS[origenZone] ?? 1;
    const fDestino = ZONE_FACTORS[destinoZone] ?? 1;
    const maxFactor = Math.max(fOrigen, fDestino);
    // Recargo inter-zona si las zonas son distintas
    return origenZone !== destinoZone ? maxFactor + 0.2 : maxFactor;
}
