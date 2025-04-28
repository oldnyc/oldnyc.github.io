import React from 'react';
import L from 'leaflet';
import { useMapEvents, Marker } from 'react-leaflet';
import { countPhotos, MarkerClickFn } from './map';
import { create } from 'domain';

export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}

const marker_icons: L.DivIcon[] = [];
const selected_marker_icons: L.DivIcon[] = [];
export const lat_lon_to_marker: { [latLng: string]: L.Marker } = {};

export function createIcons() {
  if (marker_icons.length) {
    return [marker_icons, selected_marker_icons];
  }
  // Create marker icons for each number.
  marker_icons.push(null!); // it's easier to be 1-based.
  selected_marker_icons.push(null!);
  for (let i = 0; i < 100; i++) {
    const num = i + 1;
    const size = num == 1 ? 9 : 13;
    const selectedSize = num == 1 ? 15 : 21;
    const [x, y] = [i % 10, Math.floor(i / 10)];
    // Could alternatively use L.divIcon
    marker_icons.push(
      L.divIcon({
        iconAnchor: [(size - 1) / 2, (size - 1) / 2],
        className: `marker marker-${num} marker-x-${x} marker-y-${y}`,
      }),
    );
    selected_marker_icons.push(
      L.divIcon({
        iconAnchor: [(selectedSize - 1) / 2, (selectedSize - 1) / 2],
        className: `marker marker-selected marker-${num} marker-x-${x} marker-y-${y}`,
      }),
    );
  }
  return [marker_icons, selected_marker_icons];
}

export interface MapMarkersProps {
  onClickMarker?: MarkerClickFn;
}

export function MapMarkers(props: MapMarkersProps) {
  const { onClickMarker } = props;
  const map = useMapEvents({
    moveend() {
      console.log('moveend');
      addVisibleMarkers();
    },
  });

  const markerClickFn = React.useCallback<L.LeafletMouseEventHandlerFn>(
    (e) => {
      // eslint-disable-next-line
      onClickMarker?.(e.target.title);
    },
    [onClickMarker],
  );

  const markers = React.useMemo(() => {
    const [markerIcons, selectedMarkerIcons] = createIcons();
    const m = [];
    for (const latLng in lat_lons) {
      const pos = parseLatLon(latLng);

      const count = countPhotos(lat_lons[latLng]);

      m.push(
        <Marker
          position={pos}
          icon={markerIcons[Math.min(count, 100)]}
          key={latLng}
          title={latLng}
          eventHandlers={{ click: markerClickFn }}
        />,
      );
    }
    return m;
  }, [markerClickFn]);

  const addVisibleMarkers = React.useCallback(() => {
    const bounds = map.getBounds();
    const newMarkers = [];
    for (const latLng in lat_lons) {
      const pos = parseLatLon(latLng);
      if (!bounds.contains(pos)) continue;

      const count = countPhotos(lat_lons[latLng]);

      newMarkers.push(
        <Marker
          position={pos}
          icon={marker_icons[Math.min(count, 100)]}
          key={latLng}
          title={latLng}
          eventHandlers={{ click: markerClickFn }}
        />,
      );
    }

    // setMarkers(newMarkers);
  }, [map, markerClickFn]);

  // React.useEffect(addVisibleMarkers, [addVisibleMarkers]);

  return <>{markers}</>;
}
