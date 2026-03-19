"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet icons issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: require("leaflet/dist/images/marker-icon.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: require("leaflet/dist/images/marker-shadow.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Icon for styling `#5FAFE3` map points
const customMarkerHtml = `
  <div style="background-color: #5FAFE3; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
  </div>
`;

const customIcon = L.divIcon({
    html: customMarkerHtml,
    className: "custom-leaflet-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

interface Branch {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    provider: "starken" | "bluexpress";
}

interface MapComponentProps {
    branches: Branch[];
    selectedBranchId: string | null;
    onBranchSelect: (id: string) => void;
    centerMap?: [number, number];
}

export default function MapComponent({ branches, selectedBranchId, onBranchSelect, centerMap }: MapComponentProps) {
    const defaultCenter: [number, number] = centerMap || [-33.0456, -71.6202]; // V Region Default (Valparaiso/Viña area)

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0">
            <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={false} className="h-full w-full relative z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {branches.map((branch) => (
                    <Marker
                        key={branch.id}
                        position={[branch.lat, branch.lng]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => onBranchSelect(branch.id),
                        }}
                    >
                        <Popup>
                            <div className="font-sans text-sm">
                                <strong className="block text-[#5FAFE3]">{branch.name} ({branch.provider === 'starken' ? 'Starken' : 'Blue Express'})</strong>
                                <p className="mt-1 text-gray-600 mb-2">{branch.address}</p>
                                <button
                                    onClick={() => onBranchSelect(branch.id)}
                                    className="w-full bg-[#5FAFE3] text-white py-1 px-2 rounded-lg text-xs font-bold"
                                >
                                    Seleccionar Sucursal
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
