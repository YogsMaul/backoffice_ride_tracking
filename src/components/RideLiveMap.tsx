import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ridesAPI, RiderLocation } from '../lib/api';
import { MapPin } from 'lucide-react';

// Fix default icon path (vite tidak resolve otomatis)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  rideId: string;
  rideName?: string;
}

export default function RideLiveMap({ rideId, rideName }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ride-locations', rideId],
    queryFn: async () => {
      const res = await ridesAPI.getRideLocations(rideId);
      return res.data as { ride_id: string; locations: RiderLocation[] };
    },
    refetchInterval: 3000,
    enabled: !!rideId,
  });

  const locations = data?.locations ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-line bg-card p-6 text-sm text-muted">
        Memuat posisi rider...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-warn-fill p-6 text-center">
        <p className="text-sm font-medium text-warn-ink">Gagal memuat koordinat</p>
        <p className="mt-1 text-xs text-muted">Cek koneksi atau coba lagi.</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-dispatch">
          <MapPin className="h-7 w-7 text-dispatch-text" />
        </div>
        <p className="font-display font-semibold text-ink">{rideName ?? 'Ride terpilih'}</p>
        <p className="mt-1 text-sm text-muted">
          Belum ada koordinat. Pastikan rider sudah menekan <b>Mulai Perjalanan</b> dan GPS aktif.
        </p>
        <p className="mt-2 text-xs text-muted">Polling lokasi setiap 3 detik.</p>
      </div>
    );
  }

  const center: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line bg-dispatch px-4 py-2.5">
        <span className="ops-eyebrow text-[10px] text-dispatch-text">
          {locations.length} rider terdeteksi
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-dispatch-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber" /> Live — update 3s
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom
        style={{ height: 420, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.user_id} position={[loc.lat, loc.lng]} icon={defaultIcon}>
            <Popup>
              <div className="text-xs leading-tight">
                <b>{loc.user_name}</b>
                <br />
                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                {loc.speed != null && (
                  <>
                    <br />
                    Kecepatan: {(loc.speed * 3.6).toFixed(1)} km/jam
                  </>
                )}
                <br />
                <span className="text-[11px] text-muted">
                  {new Date(loc.timestamp).toLocaleTimeString('id-ID')}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="border-t border-line bg-paper px-4 py-2 text-xs text-muted">
        Pusat peta mengikuti rider pertama. Klik marker untuk detail kecepatan & waktu.
      </div>
    </div>
  );
}
