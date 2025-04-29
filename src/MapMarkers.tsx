import React from 'react';
import L from 'leaflet';
import { useMapEvents, Marker, Rectangle, CircleMarker } from 'react-leaflet';
import { countPhotos, MarkerClickFn } from './map';

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

const BLUE: L.PathOptions = { color: 'blue', fillOpacity: 0 };
const BLACK = { color: 'black', fillOpacity: 0 };

export interface MapMarkerTileProps {
  bounds: L.LatLngBounds;
  photos: typeof lat_lons;
  isVisible: boolean;
  selectedLatLng?: string;
  onClickMarker: L.LeafletMouseEventHandlerFn;
}

// TODO: render selected marker
let numMarkers = 0;
function MapMarkerTile(props: MapMarkerTileProps) {
  const { photos, isVisible, onClickMarker } = props;
  const [hasBeenVisible, setHasBeenVisible] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible]);

  const markers = React.useMemo(() => {
    if (!hasBeenVisible) {
      return null;
    }
    const theMarkers = [];
    for (const latLng in photos) {
      const pos = parseLatLon(latLng);
      const count = countPhotos(photos[latLng]);

      theMarkers.push(
        <CircleMarker
          center={pos}
          radius={count == 1 ? 4 : 6}
          key={latLng}
          eventHandlers={{ click: onClickMarker }}
          // @ts-expect-error This gets passed along as an option, despite the type error.
          id={latLng}
        />,
      );
    }
    numMarkers += theMarkers.length;
    console.log('created', theMarkers.length, 'markers', numMarkers, 'total');
    return theMarkers;
  }, [hasBeenVisible, onClickMarker, photos]);

  return <>{markers}</>;
  // <Rectangle bounds={bounds} pathOptions={hasBeenVisible ? BLUE : BLACK} />
}

interface MarkerTile {
  bounds: L.LatLngBounds;
  photos: typeof lat_lons;
  key: string;
}

/** Carve up the lat/lngs into N rectangular tiles */
function makeTiles(photos: typeof lat_lons): MarkerTile[] {
  const startMs = Date.now();
  const bounds = new L.LatLngBounds(Object.keys(photos).map(parseLatLon));

  const { lng: minLat, lat: minLng } = bounds.getSouthWest();
  const { lng: maxLat, lat: maxLng } = bounds.getNorthEast();
  const w = (maxLng - minLng) / 15;
  const h = (maxLat - minLat) / 15;

  const keyToTile: { [key: string]: MarkerTile } = {};

  for (const [latLngStr, counts] of Object.entries(photos)) {
    const [lat, lng] = parseLatLon(latLngStr);
    const xc = Math.floor((lng - minLng) / w);
    const yc = Math.floor((lat - minLat) / h);
    const key = `${xc},${yc}`;
    if (!(key in keyToTile)) {
      const p0: L.PointExpression = [minLat + yc * h, minLng + xc * w];
      keyToTile[key] = {
        key,
        photos: {},
        bounds: new L.LatLngBounds(p0, [p0[0] + h, p0[1] + w]),
      };
    }
    keyToTile[key].photos[latLngStr] = counts;
  }

  const tiles = Object.values(keyToTile);
  const elapsedMs = Date.now() - startMs;
  console.log('Created', tiles.length, 'tiles in', Math.round(elapsedMs), 'ms');
  return tiles;
}

export interface MapMarkersProps {
  onClickMarker?: MarkerClickFn;
  selectedLatLng?: string;
}

export function MapMarkers(props: MapMarkersProps) {
  const { onClickMarker, selectedLatLng } = props;
  const [, forceUpdate] = React.useState(0);

  const map = useMapEvents({
    moveend() {
      console.log('moveend');
      forceUpdate((n) => n + 1);
    },
  });

  const markerClickFn = React.useCallback<L.LeafletMouseEventHandlerFn>(
    (e) => {
      // eslint-disable-next-line
      onClickMarker?.(e.target.options.id);
    },
    [onClickMarker],
  );

  // const [markerIcons, selectedMarkerIcons] = React.useMemo(createIcons, []);
  const tiles = React.useMemo(() => makeTiles(lat_lons), []);
  const bounds = map.getBounds();
  console.log('rendering', bounds.toBBoxString());

  const numVisible = tiles.filter((t) => bounds.intersects(t.bounds)).length;
  console.log('visible tiles', numVisible);

  return (
    <>
      {tiles.map((t) => (
        <MapMarkerTile
          key={t.key}
          bounds={t.bounds}
          selectedLatLng={selectedLatLng}
          photos={t.photos}
          onClickMarker={markerClickFn}
          isVisible={bounds.intersects(t.bounds)}
        />
      ))}
    </>
  );
}
