import React from 'react';
import { MapLibreMap, useMap } from './MapLibreMap';
import { parseLatLon } from './util';
import { useHistory } from 'react-router-dom';

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
        onClick={props.onClick}
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
      }
    };
  }, [map, markersFC]);

  return null;
}

// The idea here is to keep the static map loaded, so that subsequent
// clicks on locations render it very quickly.
export function StaticMapForExpanded({
  latLon,
}: {
  latLon: string | undefined;
}) {
  const [hasRendered, setHasRendered] = React.useState(false);
  React.useEffect(() => {
    if (latLon && !hasRendered) {
      setHasRendered(true);
    }
  }, [hasRendered, latLon]);

  const history = useHistory();
  const handleExit = React.useCallback(() => {
    history.push(`/`);
  }, [history]);

  return hasRendered ? (
    <StaticMap
      id="preview-map"
      title="Exit Slideshow"
      className={latLon ? '' : 'invisible'}
      onClick={handleExit}
      latLon={latLon ?? '-74,41'}
    />
  ) : null;
}
