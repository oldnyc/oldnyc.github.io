import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { countPhotos, MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';

export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}

function hsv2rgb(h: number, s: number, v: number) {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * (s / 255) * Math.max(Math.min(k, 4 - k, 1), 0);
  const [r, g, b] = [f(5), f(3), f(1)].map((x) =>
    ('0' + Math.round(x).toString(16)).slice(-2),
  );
  return `#${r}${g}${b}`;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface TileInfo {
  minLat: number;
  minLng: number;
  tileWidth: number;
  tileHeight: number;
}

interface MarkerTile {
  bounds: Bounds;
  photos: typeof lat_lons;
  key: string;
}

function posToTile(tileInfo: TileInfo, latLng: [number, number]) {
  const [lat, lng] = latLng;
  const xc = Math.floor((lng - tileInfo.minLng) / tileInfo.tileWidth);
  const yc = Math.floor((lat - tileInfo.minLat) / tileInfo.tileHeight);
  const key = `${xc},${yc}`;
  return [xc, yc, key] as const;
}

function makeTiles(photos: typeof lat_lons): [TileInfo, MarkerTile[]] {
  const allPositions = Object.keys(photos).map(parseLatLon);
  
  const minLat = Math.min(...allPositions.map(p => p[0]));
  const maxLat = Math.max(...allPositions.map(p => p[0]));
  const minLng = Math.min(...allPositions.map(p => p[1]));
  const maxLng = Math.max(...allPositions.map(p => p[1]));
  
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
      const south = minLat + yc * h;
      const west = minLng + xc * w;
      keyToTile[key] = {
        key,
        photos: {},
        bounds: {
          south,
          west,
          north: south + h,
          east: west + w,
        },
      };
    }
    keyToTile[key].photos[latLngStr] = counts;
  }

  return [tileInfo, Object.values(keyToTile)];
}

function boundsIntersect(mapBounds: maplibregl.LngLatBounds, tileBounds: Bounds): boolean {
  const mapSouth = mapBounds.getSouth();
  const mapNorth = mapBounds.getNorth();
  const mapWest = mapBounds.getWest();
  const mapEast = mapBounds.getEast();
  
  return !(
    tileBounds.east < mapWest ||
    tileBounds.west > mapEast ||
    tileBounds.north < mapSouth ||
    tileBounds.south > mapNorth
  );
}

export interface MapLibreMarkersProps {
  map: maplibregl.Map;
  onClickMarker?: MarkerClickFn;
  selectedLatLng?: string;
  yearRange: YearRange;
}

export function MapLibreMarkers({
  map,
  onClickMarker,
  selectedLatLng,
  yearRange,
}: MapLibreMarkersProps) {
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const tilesRef = useRef<[TileInfo, MarkerTile[]] | null>(null);
  const visibleTilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tilesRef.current) {
      tilesRef.current = makeTiles(lat_lons);
    }
  }, []);

  const updateMarkers = useCallback(() => {
    if (!tilesRef.current) return;

    const [, tiles] = tilesRef.current;
    const bounds = map.getBounds();
    const newVisibleTiles = new Set<string>();

    // Find tiles that should be visible
    for (const tile of tiles) {
      if (boundsIntersect(bounds, tile.bounds)) {
        newVisibleTiles.add(tile.key);
      }
    }

    // Remove markers from tiles that are no longer visible
    for (const tileKey of visibleTilesRef.current) {
      if (!newVisibleTiles.has(tileKey)) {
        const tile = tiles.find(t => t.key === tileKey);
        if (tile) {
          for (const latLngStr in tile.photos) {
            const marker = markersRef.current.get(latLngStr);
            if (marker) {
              marker.remove();
              markersRef.current.delete(latLngStr);
            }
          }
        }
      }
    }

    // Add markers for newly visible tiles
    for (const tileKey of newVisibleTiles) {
      if (!visibleTilesRef.current.has(tileKey)) {
        const tile = tiles.find(t => t.key === tileKey);
        if (tile) {
          for (const latLngStr in tile.photos) {
            const pos = parseLatLon(latLngStr);
            const count = countPhotos(tile.photos[latLngStr], yearRange);
            
            if (count === 0) continue;

            const isSelected = latLngStr === selectedLatLng;
            const radius = isSelected ? (count === 1 ? 6 : 9) : (count === 1 ? 4.24 : 5.66);
            const fillColor = isSelected
              ? '#0000A0'
              : hsv2rgb(0, Math.min(255, 127 + (128 * count) / 100), 190);

            // Create marker element
            const el = document.createElement('div');
            el.style.width = `${radius * 2}px`;
            el.style.height = `${radius * 2}px`;
            el.style.borderRadius = '50%';
            el.style.backgroundColor = fillColor;
            el.style.cursor = 'pointer';
            el.style.border = 'none';

            const marker = new maplibregl.Marker(el)
              .setLngLat([pos[1], pos[0]])
              .addTo(map);

            // Add click handler
            if (onClickMarker) {
              el.addEventListener('click', (e) => {
                e.stopPropagation();
                onClickMarker(latLngStr);
              });
            }

            markersRef.current.set(latLngStr, marker);
          }
        }
      }
    }

    // Update marker styles for selection changes
    for (const [latLngStr, marker] of markersRef.current) {
      const tile = tiles.find(t => latLngStr in t.photos);
      if (tile) {
        const count = countPhotos(tile.photos[latLngStr], yearRange);
        const isSelected = latLngStr === selectedLatLng;
        const radius = isSelected ? (count === 1 ? 6 : 9) : (count === 1 ? 4.24 : 5.66);
        const fillColor = isSelected
          ? '#0000A0'
          : hsv2rgb(0, Math.min(255, 127 + (128 * count) / 100), 190);

        const el = marker.getElement();
        el.style.width = `${radius * 2}px`;
        el.style.height = `${radius * 2}px`;
        el.style.backgroundColor = fillColor;
      }
    }

    visibleTilesRef.current = newVisibleTiles;
  }, [map, onClickMarker, selectedLatLng, yearRange]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  useEffect(() => {
    const handleMove = () => {
      updateMarkers();
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);

    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
    };
  }, [map, updateMarkers]);

  // Cleanup all markers on unmount
  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      for (const marker of markers.values()) {
        marker.remove();
      }
      markers.clear();
    };
  }, []);

  return null;
}