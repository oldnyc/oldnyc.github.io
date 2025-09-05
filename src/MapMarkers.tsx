import React, { useEffect } from 'react';
import { countPhotos, MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';
import maplibregl from 'maplibre-gl';

export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}

function boundsForLatLngs(
  latLngs: readonly [number, number][],
): maplibregl.LngLatBounds {
  if (!latLngs.length) {
    throw new Error('Cannot get bounds of empty lat/lng array');
  }
  const bounds = new maplibregl.LngLatBounds({
    lat: latLngs[0][0],
    lng: latLngs[0][1],
  });
  for (const [lat, lng] of latLngs.slice(1)) {
    bounds.extend({ lat, lng });
  }

  return bounds;
}

// const BLUE: L.PathOptions = { color: 'blue', fillOpacity: 0 };
// const BLACK = { color: 'black', fillOpacity: 0 };

export interface MapMarkerTileProps {
  map: maplibregl.Map;
  bounds: maplibregl.LngLatBounds;
  photos: typeof lat_lons;
  isVisible: boolean;
  selectedLatLng?: string;
  onClickMarker: (e: maplibregl.MapMouseEvent) => void;
  yearRange: YearRange;
  tileKey: string;
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
  const { map, photos, isVisible, selectedLatLng, onClickMarker, yearRange } =
    props;
  const [hasBeenVisible, setHasBeenVisible] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible]);

  const markersFC =
    React.useMemo((): GeoJSON.FeatureCollection<GeoJSON.Point> => {
      if (!hasBeenVisible) {
        return { type: 'FeatureCollection', features: [] };
      }
      const theMarkers: GeoJSON.Feature<GeoJSON.Point>[] = [];
      for (const latLng in photos) {
        const pos = parseLatLon(latLng);
        const count = countPhotos(photos[latLng], yearRange);
        if (count === 0) {
          continue;
        }
        // const isSelected = latLng === selectedLatLng;

        theMarkers.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pos[1], pos[0]],
          },
          properties: {
            latLng,
            count,
          },
        });

        /*
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
          id={latLng}
        />,
        */
      }
      numMarkers += theMarkers.length;
      // console.log('created', theMarkers.length, 'markers', numMarkers, 'total');
      return {
        type: 'FeatureCollection',
        features: theMarkers,
      };
    }, [hasBeenVisible, photos, yearRange]);

  React.useEffect(() => {
    map.addSource(`source-${props.tileKey}`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: `markers-${props.tileKey}`,
      type: 'circle',
      source: `source-${props.tileKey}`,
      paint: {
        'circle-color': 'blue',
        'circle-radius': 10,
      },
    });

    return () => {
      map.removeLayer(`markers-${props.tileKey}`);
      map.removeSource(`source-${props.tileKey}`);
    };
  }, [map, props.tileKey]);

  React.useEffect(() => {
    const source = map.getSource<maplibregl.GeoJSONSource>(
      `source-${props.tileKey}`,
    );
    source!.setData(markersFC);
  }, [map, markersFC, props.tileKey]);

  return null;
  // This is useful for debugging lazy creation of markers
  // <Rectangle bounds={bounds} pathOptions={hasBeenVisible ? BLUE : BLACK} />
}

interface MarkerTile {
  bounds: maplibregl.LngLatBounds;
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
  // const startMs = Date.now();

  const bounds = boundsForLatLngs(Object.keys(photos).map(parseLatLon));

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
      const p0: maplibregl.LngLatLike = {
        lat: minLat + yc * h,
        lng: minLng + xc * w,
      };
      keyToTile[key] = {
        key,
        photos: {},
        bounds: new maplibregl.LngLatBounds(p0, {
          lat: p0.lat + h,
          lng: p0.lng + w,
        }),
      };
    }
    keyToTile[key].photos[latLngStr] = counts;
  }

  const tiles = Object.values(keyToTile);
  // const elapsedMs = Date.now() - startMs;
  // console.log('Created', tiles.length, 'tiles in', Math.round(elapsedMs), 'ms');
  return [tileInfo, tiles];
}

export interface MapMarkersProps {
  map: maplibregl.Map;
  onClickMarker?: MarkerClickFn;
  selectedLatLng?: string;
  yearRange: YearRange;
}

function intersects(
  a: maplibregl.LngLatBounds,
  b: maplibregl.LngLatBounds,
): boolean {
  return (
    a.getWest() <= b.getEast() &&
    a.getEast() >= b.getWest() &&
    a.getSouth() <= b.getNorth() &&
    a.getNorth() >= b.getSouth()
  );
}

export function MapMarkers(props: MapMarkersProps) {
  const { map, onClickMarker, selectedLatLng, yearRange } = props;
  const [, forceUpdate] = React.useState(0);

  useEffect(() => {
    const listener = () => {
      forceUpdate((n) => n + 1);
    };
    map.on('moveend', listener);
    return () => {
      map.off('moveend', listener);
    };
  });

  const markerClickFn = React.useCallback(
    (e: maplibregl.MapMouseEvent) => {
      // onClickMarker?.(e.target.options.id);
      console.log(e);
    },
    [onClickMarker],
  );

  // const [markerIcons, selectedMarkerIcons] = React.useMemo(createIcons, []);
  const [tileInfo, tiles] = React.useMemo(() => makeTiles(lat_lons), []);
  const bounds = map.getBounds();

  const selectionKey = React.useMemo(() => {
    if (!selectedLatLng) return undefined;
    const pos = parseLatLon(selectedLatLng);
    const [, , key] = posToTile(tileInfo, pos);
    return key;
  }, [selectedLatLng, tileInfo]);

  return (
    <>
      {tiles.map((t) => (
        <MapMarkerTile
          key={t.key}
          map={map}
          tileKey={t.key}
          bounds={t.bounds}
          selectedLatLng={t.key == selectionKey ? selectedLatLng : undefined}
          photos={t.photos}
          onClickMarker={markerClickFn}
          isVisible={intersects(bounds, t.bounds)}
          yearRange={yearRange}
        />
      ))}
    </>
  );
}
