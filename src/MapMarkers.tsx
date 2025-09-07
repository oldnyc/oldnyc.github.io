import React, { useEffect } from 'react';
import { countPhotos, MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';
import maplibregl from 'maplibre-gl';
import { parseLatLon } from './util';
import { useMap } from './MapLibreMap';

function setPointerCursor(e: maplibregl.MapLayerMouseEvent) {
  e.target.getCanvas().style.cursor = 'pointer';
}
function clearCursor(e: maplibregl.MapLayerMouseEvent) {
  e.target.getCanvas().style.cursor = '';
}

export interface MapMarkerTileProps {
  map: maplibregl.Map;
  photos: typeof lat_lons;
  onClickMarker: (e: maplibregl.MapLayerMouseEvent) => void;
  yearRange: YearRange;
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

function MapMarkerTile(props: MapMarkerTileProps) {
  const { map, photos, onClickMarker, yearRange } = props;

  const layerId = `dots-layer`;
  const sourceId = `dots-source`;

  const markersFC =
    React.useMemo((): GeoJSON.FeatureCollection<GeoJSON.Point> => {
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
      return {
        type: 'FeatureCollection',
        features: theMarkers,
      };
    }, [photos, yearRange]);

  React.useEffect(() => {
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
  }, [layerId, map, sourceId]);

  React.useEffect(() => {
    const source = map.getSource<maplibregl.GeoJSONSource>(sourceId);
    source!.setData(markersFC);
  }, [map, markersFC, sourceId]);

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

export interface MapMarkersProps {
  onClickMarker?: MarkerClickFn;
  selectedLatLng?: string;
  yearRange: YearRange;
}

export function MapMarkers(props: MapMarkersProps) {
  const map = useMap();
  return map ? <MapMarkersWithMap {...props} map={map} /> : null;
}

function MapMarkersWithMap(props: MapMarkersProps & { map: maplibregl.Map }) {
  const { map, selectedLatLng, onClickMarker, yearRange } = props;

  const markerClickFn = React.useCallback(
    (e: maplibregl.MapLayerMouseEvent) => {
      if (e.features) {
        const { latLng } = e.features[0].properties;
        onClickMarker?.(latLng);
      }
    },
    [onClickMarker],
  );

  useEffect(() => {
    map.setGlobalStateProperty('selectedLatLng', selectedLatLng);
  }, [map, selectedLatLng]);

  return (
    <MapMarkerTile
      map={map}
      photos={lat_lons}
      onClickMarker={markerClickFn}
      yearRange={yearRange}
    />
  );
}
