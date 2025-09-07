import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import MAP_STYLE from './oldnyc-gray.json';

interface MapLibreMapProps {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: maplibregl.LngLatBoundsLike;
  children?: JSX.Element;
  interactive?: boolean;
}

const MapContext = createContext<maplibregl.Map | undefined>(undefined);

export function useMap() {
  return useContext(MapContext);
}

export function MapLibreMap({
  center,
  zoom,
  minZoom = 10,
  maxZoom = 16,
  maxBounds,
  interactive = true,
  children,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapRef, setMapRef] = useState<maplibregl.Map | undefined>();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE as maplibregl.StyleSpecification,
      center,
      zoom,
      minZoom,
      maxZoom,
      dragRotate: false,
      rollEnabled: false,
      pitchWithRotate: false,
      maxBounds,
      interactive,
      attributionControl: false,
    });

    setMapRef(map);

    return () => {
      map.remove();
    };
  }, [center, zoom, minZoom, maxZoom, maxBounds, interactive]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <MapContext.Provider value={mapRef}>{children}</MapContext.Provider>
    </div>
  );
}
