import React from 'react';
import L from 'leaflet';
import { useMapEvents, Marker } from 'react-leaflet';
import { countPhotos, MarkerClickFn } from './map';

export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}

const markers: L.Marker[] = [];
const marker_icons: L.Icon[] = [];
const selected_marker_icons: L.Icon[] = [];
export const lat_lon_to_marker: { [latLng: string]: L.Marker } = {};

export function initialize_leaflet() {
  // Create marker icons for each number.
  marker_icons.push(null!); // it's easier to be 1-based.
  selected_marker_icons.push(null!);
  for (let i = 0; i < 100; i++) {
    const num = i + 1;
    const size = num == 1 ? 9 : 13;
    const selectedSize = num == 1 ? 15 : 21;
    const [x, y] = [(i % 10) * 39, Math.floor(i / 10) * 39];
    // Could alternatively use L.divIcon
    marker_icons.push(
      L.icon({
        iconUrl: 'images/sprite-2014-08-29.png',
        iconSize: [size, size],
        // origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
        iconAnchor: [(size - 1) / 2, (size - 1) / 2],
        className: `marker-x-${x} marker-y-${y}`,
      }),
    );
    selected_marker_icons.push(
      L.icon({
        iconUrl: 'images/selected-2014-08-29.png',
        iconSize: [selectedSize, selectedSize],
        // origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
        iconAnchor: [(selectedSize - 1) / 2, (selectedSize - 1) / 2],
        className: `marker-x-${x} marker-y-${y}`,
      }),
    );
  }
}

export interface MapMarkersProps {
  onClickMarker?: MarkerClickFn;
}

export function MapMarkers(props: MapMarkersProps) {
  const { onClickMarker } = props;
  const [markers, setMarkers] = React.useState<JSX.Element[]>([]);
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

  const addVisibleMarkers = React.useCallback(() => {
    const bounds = map.getBounds();
    const newMarkers = [];
    for (const latLng in lat_lons) {
      const pos = parseLatLon(latLng);
      if (!bounds.contains(pos)) continue;

      // const count = countPhotos(lat_lons[latLng]);
      // icon={marker_icons[Math.min(count, 100)]}

      newMarkers.push(
        <Marker
          position={pos}
          key={latLng}
          title={latLng}
          eventHandlers={{ click: markerClickFn }}
        />,
      );
    }

    setMarkers(newMarkers);
  }, [map, markerClickFn]);

  React.useEffect(addVisibleMarkers, [addVisibleMarkers]);

  return <>{markers}</>;
}
