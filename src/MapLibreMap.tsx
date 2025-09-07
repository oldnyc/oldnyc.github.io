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

interface MapLibreMapProps extends Partial<maplibregl.MapOptions> {
  children?: JSX.Element;
}

const MapContext = createContext<maplibregl.Map | undefined>(undefined);

export function useMap() {
  return useContext(MapContext);
}

export function MapLibreMap({ children, ...mapOptions }: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapRef, setMapRef] = useState<maplibregl.Map | undefined>();
  const [initialOptions] = useState<typeof mapOptions>(mapOptions);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE as maplibregl.StyleSpecification,
      dragRotate: false,
      rollEnabled: false,
      pitchWithRotate: false,
      ...initialOptions,
    });

    setMapRef(map);

    return () => {
      map.remove();
    };
  }, [initialOptions]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <MapContext.Provider value={mapRef}>{children}</MapContext.Provider>
    </div>
  );
}
