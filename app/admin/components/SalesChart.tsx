"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type SalesData = {
    date: string;
    ventas: number;
};

export function SalesChart({ data }: { data: SalesData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
                No hay datos de ventas disponibles.
            </div>
        );
    }

    // Custom Tooltip for Chilean Pesos formatting
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
                    <p className="text-brand-graphite font-bold text-lg">
                        ${payload[0].value.toLocaleString("es-CL")}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] min-h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5FAFE3" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#5FAFE3" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
                    <Area
                        type="monotone"
                        dataKey="ventas"
                        stroke="#5FAFE3"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorVentas)"
                        activeDot={{ r: 6, fill: "#5FAFE3", stroke: "#FFF", strokeWidth: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
