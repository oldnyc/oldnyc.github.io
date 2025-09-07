import React from 'react';
import { MapLibreMap, useMap } from './MapLibreMap';
import { parseLatLon } from './util';

export interface Props {
  id?: string;
  className?: string;
  title?: string;
  onClick?: () => void;
  latLon: string;
}

export function StaticMap(props: Props) {
  const { latLon } = props;
  const latLng = React.useMemo(() => {
    const [lat, lng] = parseLatLon(latLon);
    return [lng, lat] as [number, number];
  }, [latLon]);
  return (
    <div id={props.id} className={props.className} title={props.title}>
      <MapLibreMap
        center={latLng}
        zoom={16}
        interactive={false}
        attributionControl={false}
      >
        <MapMarker latLng={latLng} />
      </MapLibreMap>
    </div>
  );
}

function MapMarker({ latLng }: { latLng: [number, number] }) {
  const map = useMap();

  const markersFC =
    React.useMemo((): GeoJSON.FeatureCollection<GeoJSON.Point> => {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: latLng,
            },
            properties: {},
          },
        ],
      };
    }, [latLng]);

  React.useEffect(() => {
    map?.addSource('marker-source', {
      type: 'geojson',
      data: markersFC,
    });
    map?.addLayer({
      id: 'marker-layer',
      type: 'circle',
      source: 'marker-source',
      paint: {
        'circle-color': '#be0000',
        'circle-radius': 5.66,
      },
    });

    return () => {
      // This is a hack to prevent an exception if we removeLayer on a map after
      // map.remove() has been called.
      const container = map?.getCanvasContainer();
      if (container?.parentElement) {
        map?.removeLayer('marker-layer');
        map?.removeSource('marker-source');
      } else {
        console.log('not removing layers from dead map');
      }
    };
  }, [map, markersFC]);

  return null;
}
