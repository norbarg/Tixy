import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

type EventMapProps = {
    lat: number;
    lng: number;
    title?: string;
};

export function EventMap({ lat, lng, title }: EventMapProps) {
    const position: LatLngExpression = [lat, lng];

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ width: '100%', height: '320px' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position}>
                <Popup>{title || 'Event location'}</Popup>
            </Marker>
        </MapContainer>
    );
}
