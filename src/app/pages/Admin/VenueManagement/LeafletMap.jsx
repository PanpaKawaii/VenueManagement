import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

export default function LeafletMap({ location, height, getLocation, onMapClick }) {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map(mapContainerRef.current).setView([10.875190123204305, 106.80053114891052], 13);
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);
        const venueIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });
        if (location.latitude && location.longitude) {
            const marker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)], { icon: venueIcon })
                .addTo(map)
                .bindPopup(`<b>${location.name}</b>`)
                .openPopup();
            map.setView([location.latitude, location.longitude], 13);
        }

        if (getLocation == true) {
            map.on('click', async function (e) {
                const { lat, lng } = e.latlng;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                const data = await response.json();
                console.log('Location:', lat, lng);
                console.log('Address:', data.display_name);
                if (onMapClick)
                    onMapClick({
                        latitude: lat,
                        longitude: lng,
                        address: data.display_name || 'Không xác định',
                    });
            });
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [location]);

    return <div ref={mapContainerRef} style={{ width: '100%', minWidth: '240px', height: height }} />;
}
