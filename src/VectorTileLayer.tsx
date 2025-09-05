import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

interface VectorGridLayer extends L.Layer {
  addTo(map: L.Map): this;
}

declare module 'leaflet' {
  namespace vectorGrid {
    function protobuf(
      url: string,
      options?: VectorTileOptions,
    ): VectorGridLayer;
  }
}

interface StyleOptions {
  fill?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  stroke?: boolean;
  color?: string;
  strokeWidth?: number;
  weight?: number;
  opacity?: number;
}

interface VectorTileOptions {
  attribution?: string;
  opacity?: number;
  interactive?: boolean;
  vectorTileLayerStyles?: Record<string, StyleOptions>;
  maxNativeZoom?: number;
  subdomains?: string;
}

interface VectorTileLayerProps {
  url: string;
  attribution?: string;
  opacity?: number;
  style?: Record<string, StyleOptions>;
}

const defaultStyle: any = {
  water: {
    fill: true,
    weight: 1,
    fillColor: '#06cccc',
    color: '#06cccc',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  admin: {
    weight: 1,
    fillColor: 'pink',
    color: 'pink',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  waterway: {
    weight: 1,
    fillColor: '#2375e0',
    color: '#2375e0',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  landcover: {
    fill: true,
    weight: 1,
    fillColor: '#53e033',
    color: '#53e033',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  landuse: {
    fill: true,
    weight: 1,
    fillColor: '#e5b404',
    color: '#e5b404',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  park: {
    fill: true,
    weight: 1,
    fillColor: '#84ea5b',
    color: '#84ea5b',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  boundary: {
    weight: 1,
    fillColor: '#c545d3',
    color: '#c545d3',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  aeroway: {
    weight: 1,
    fillColor: '#51aeb5',
    color: '#51aeb5',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  road: {
    // mapbox & nextzen only
    weight: 1,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  tunnel: {
    // mapbox only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  bridge: {
    // mapbox only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  transportation: {
    // openmaptiles only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  transit: {
    // nextzen only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  building: {
    fill: true,
    weight: 1,
    fillColor: '#2b2b2b',
    color: '#2b2b2b',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  water_name: {
    weight: 1,
    fillColor: '#022c5b',
    color: '#022c5b',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  transportation_name: {
    weight: 1,
    fillColor: '#bc6b38',
    color: '#bc6b38',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  place: {
    weight: 1,
    fillColor: '#f20e93',
    color: '#f20e93',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  housenumber: {
    weight: 1,
    fillColor: '#ef4c8b',
    color: '#ef4c8b',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  poi: {
    weight: 1,
    fillColor: '#3bb50a',
    color: '#3bb50a',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  earth: {
    // nextzen only
    fill: true,
    weight: 1,
    fillColor: '#c0c0c0',
    color: '#c0c0c0',
    fillOpacity: 0.2,
    opacity: 0.4,
  },

  // Do not symbolize some stuff for mapbox
  country_label: [],
  marine_label: [],
  state_label: [],
  place_label: [],
  waterway_label: [],
  poi_label: [],
  road_label: [],
  housenum_label: [],

  // Do not symbolize some stuff for openmaptiles
  country_name: [],
  marine_name: [],
  state_name: [],
  place_name: [],
  waterway_name: [],
  poi_name: [],
  road_name: [],
  housenum_name: [],
};
// Monkey-patch some properties for nextzen layer names, because
// instead of "building" the data layer is called "buildings" and so on
defaultStyle.buildings = defaultStyle.building;
defaultStyle.boundaries = defaultStyle.boundary;
defaultStyle.places = defaultStyle.place;
defaultStyle.pois = defaultStyle.poi;
defaultStyle.roads = defaultStyle.road;

export function VectorTileLayer({
  url,
  attribution,
  opacity = 1,
  style,
}: VectorTileLayerProps) {
  const map = useMap();

  useEffect(() => {
    const vectorTileOptions: VectorTileOptions = {
      attribution: attribution ?? '',
      opacity,
      interactive: false,
      maxNativeZoom: 14,
      subdomains: '0123',
      vectorTileLayerStyles: style ?? defaultStyle,
    };

    const vectorLayer = L.vectorGrid.protobuf(url, vectorTileOptions);

    vectorLayer.addTo(map);

    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [map, url, attribution, opacity, style]);

  return null;
}
