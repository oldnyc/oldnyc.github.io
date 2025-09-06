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

function setPointerCursor(e: maplibregl.MapLayerMouseEvent) {
  e.target.getCanvas().style.cursor = 'pointer';
}
function clearCursor(e: maplibregl.MapLayerMouseEvent) {
  e.target.getCanvas().style.cursor = '';
}

export interface MapMarkerTileProps {
  map: maplibregl.Map;
  bounds: maplibregl.LngLatBounds;
  photos: typeof lat_lons;
  isVisible: boolean;
  onClickMarker: (e: maplibregl.MapLayerMouseEvent) => void;
  yearRange: YearRange;
  tileKey: string;
}

const MARKER_COLOR: maplibregl.ExpressionSpecification = [
  'interpolate-hcl',
  ['linear'],
  ['get', 'count'],
  0,
  '#be5f5f',
  100,
  '#be0000',
];

// TODO: render selected marker
let numMarkers = 0;
function MapMarkerTile(props: MapMarkerTileProps) {
  const { map, photos, isVisible, onClickMarker, yearRange } = props;
  const [hasBeenVisible, setHasBeenVisible] = React.useState(isVisible);

  const layerId = `markers-${props.tileKey}`;
  const sourceId = `source-${props.tileKey}`;

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
      }
      numMarkers += theMarkers.length;
      return {
        type: 'FeatureCollection',
        features: theMarkers,
      };
    }, [hasBeenVisible, photos, yearRange]);

  React.useEffect(() => {
    if (!hasBeenVisible) {
      return;
    }
    map.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-color': [
          'case',
          ['==', ['global-state', 'selectedLatLng'], ['get', 'latLng']],
          'blue',
          MARKER_COLOR,
        ],
        'circle-radius': ['case', ['==', ['get', 'count'], 1], 4.24, 5.66],
      },
    });
    map.on('mouseenter', layerId, setPointerCursor);
    map.on('mouseleave', layerId, clearCursor);

    return () => {
      map.removeLayer(layerId);
      map.removeSource(sourceId);
    };
  }, [hasBeenVisible, layerId, map, sourceId]);

  React.useEffect(() => {
    if (hasBeenVisible) {
      const source = map.getSource<maplibregl.GeoJSONSource>(sourceId);
      source!.setData(markersFC);
    }
  }, [hasBeenVisible, map, markersFC, sourceId]);

  React.useEffect(() => {
    map.on('click', layerId, onClickMarker);
    return () => {
      map.off('click', layerId, onClickMarker);
    };
  }, [layerId, map, onClickMarker]);

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
  const { map, onClickMarker, yearRange } = props;
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
    (e: maplibregl.MapLayerMouseEvent) => {
      if (e.features) {
        const { latLng } = e.features[0].properties;
        onClickMarker?.(latLng);
      }
    },
    [onClickMarker],
  );

  // const [markerIcons, selectedMarkerIcons] = React.useMemo(createIcons, []);
  const [tileInfo, tiles] = React.useMemo(() => makeTiles(lat_lons), []);
  const bounds = map.getBounds();

  return (
    <>
      {tiles.map((t) => (
        <MapMarkerTile
          key={t.key}
          map={map}
          tileKey={t.key}
          bounds={t.bounds}
          photos={t.photos}
          onClickMarker={markerClickFn}
          isVisible={intersects(bounds, t.bounds)}
          yearRange={yearRange}
        />
      ))}
    </>
  );
}
