import React from 'react';
import { MapLibreMap } from './MapLibreMap';
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
      />
    </div>
  );
}
