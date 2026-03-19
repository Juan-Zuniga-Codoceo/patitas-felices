"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix generic Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: require("leaflet/dist/images/marker-icon.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: require("leaflet/dist/images/marker-shadow.png").default || "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

interface TrackingMapProps {
    comuna: string;
}

export default function TrackingMap({ comuna }: TrackingMapProps) {
    // In a real app we would use geocoding to find lat/lng of the comuna.
    // For Patitas Felices context, let's detect V region vs generic Santiago
    let center: [number, number] = [-33.4489, -70.6693]; // Santiago default
    let zoom = 10;

    if (comuna === "Viña del Mar") {
        center = [-33.0245, -71.5518];
        zoom = 12;
    } else if (comuna === "Quilpué") {
        center = [-33.0480, -71.4420];
        zoom = 12;
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            zoomControl={false}
            dragging={false}
            className="w-full h-full z-0 absolute inset-0"
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center} icon={customIcon}>
                <Popup>
                    <div className="text-center font-bold text-[#5FAFE3] text-sm font-sans">{comuna}</div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
