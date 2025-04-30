import React from 'react';
import L from 'leaflet';
import { useMapEvents, CircleMarker } from 'react-leaflet';
import { countPhotos, MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';

export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}

// const BLUE: L.PathOptions = { color: 'blue', fillOpacity: 0 };
// const BLACK = { color: 'black', fillOpacity: 0 };

export interface MapMarkerTileProps {
  bounds: L.LatLngBounds;
  photos: typeof lat_lons;
  isVisible: boolean;
  selectedLatLng?: string;
  onClickMarker: L.LeafletMouseEventHandlerFn;
  yearRange: YearRange;
}

// TODO: precompute this
function hsv2rgb(h: number, s: number, v: number) {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * (s / 255) * Math.max(Math.min(k, 4 - k, 1), 0);
  const [r, g, b] = [f(5), f(3), f(1)].map((x) =>
    ('0' + Math.round(x).toString(16)).slice(-2),
  );
  return `#${r}${g}${b}`;
}

// TODO: render selected marker
let numMarkers = 0;
function MapMarkerTile(props: MapMarkerTileProps) {
  const { photos, isVisible, selectedLatLng, onClickMarker, yearRange } = props;
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
      const count = countPhotos(photos[latLng], yearRange);
      if (count === 0) {
        continue;
      }
      const isSelected = latLng === selectedLatLng;

      theMarkers.push(
        <CircleMarker
          center={pos}
          fill
          fillOpacity={1}
          fillColor={
            isSelected
              ? '#0000A0'
              : hsv2rgb(0, Math.min(255, 127 + (128 * count) / 100), 190)
          }
          stroke={false}
          radius={isSelected ? (count == 1 ? 6 : 9) : count == 1 ? 4.24 : 5.66}
          // The key has to change for leaflet to notice the new color
          key={latLng + isSelected}
          eventHandlers={{ click: onClickMarker }}
          // @ts-expect-error This gets passed along as an option, despite the type error.
          id={latLng}
        />,
      );
    }
    numMarkers += theMarkers.length;
    console.log('created', theMarkers.length, 'markers', numMarkers, 'total');
    return theMarkers;
  }, [hasBeenVisible, onClickMarker, photos, selectedLatLng, yearRange]);

  return <>{markers}</>;
  // <Rectangle bounds={bounds} pathOptions={hasBeenVisible ? BLUE : BLACK} />
}

interface MarkerTile {
  bounds: L.LatLngBounds;
  photos: typeof lat_lons;
  key: string;
}

interface TileInfo {
  minLat: number;
  minLng: number;
  tileWidth: number;
  tileHeight: number;
}

function posToTile(tileInfo: TileInfo, latLng: [number, number]) {
  const [lat, lng] = latLng;
  const xc = Math.floor((lng - tileInfo.minLng) / tileInfo.tileWidth);
  const yc = Math.floor((lat - tileInfo.minLat) / tileInfo.tileHeight);
  const key = `${xc},${yc}`;
  return [xc, yc, key] as const;
}

/** Carve up the lat/lngs into N rectangular tiles */
function makeTiles(photos: typeof lat_lons): [TileInfo, MarkerTile[]] {
  const startMs = Date.now();
  const bounds = new L.LatLngBounds(Object.keys(photos).map(parseLatLon));

  const { lat: minLat, lng: minLng } = bounds.getSouthWest();
  const { lat: maxLat, lng: maxLng } = bounds.getNorthEast();
  const w = (maxLng - minLng) / 15;
  const h = (maxLat - minLat) / 15;

  const keyToTile: { [key: string]: MarkerTile } = {};

  const tileInfo: TileInfo = {
    minLat,
    minLng,
    tileWidth: w,
    tileHeight: h,
  };

  for (const [latLngStr, counts] of Object.entries(photos)) {
    const pos = parseLatLon(latLngStr);
    const [xc, yc, key] = posToTile(tileInfo, pos);

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
  return [tileInfo, tiles];
}

export interface MapMarkersProps {
  onClickMarker?: MarkerClickFn;
  selectedLatLng?: string;
  yearRange: YearRange;
}

export function MapMarkers(props: MapMarkersProps) {
  const { onClickMarker, selectedLatLng, yearRange } = props;
  const [, forceUpdate] = React.useState(0);

  const map = useMapEvents({
    moveend() {
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
  const [tileInfo, tiles] = React.useMemo(() => makeTiles(lat_lons), []);
  const bounds = map.getBounds();

  const selectionKey = React.useMemo(() => {
    if (!selectedLatLng) return undefined;
    const pos = parseLatLon(selectedLatLng);
    console.log(pos);
    const [, , key] = posToTile(tileInfo, pos);
    return key;
  }, [selectedLatLng, tileInfo]);

  console.log(selectionKey);
  return (
    <>
      {tiles.map((t) => (
        <MapMarkerTile
          key={t.key}
          bounds={t.bounds}
          selectedLatLng={t.key == selectionKey ? selectedLatLng : undefined}
          photos={t.photos}
          onClickMarker={markerClickFn}
          isVisible={bounds.intersects(t.bounds)}
          yearRange={yearRange}
        />
      ))}
    </>
  );
}
