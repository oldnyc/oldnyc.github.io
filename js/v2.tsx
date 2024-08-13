import React from "react";
import { createRoot } from "react-dom/client";
import { APIProvider, Map, MapCameraChangedEvent, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MAP_STYLE } from "./map-styles";

const API_KEY = "AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA";

function AppWithMap() {
  // Within this component, it's valid to reference the google.maps namespace
  const map = useMap();
  const [bounds, setBounds] = React.useState<google.maps.LatLngBoundsLiteral|undefined>();
  const handleBoundsChanged = (e: MapCameraChangedEvent) => {
    setBounds(e.detail.bounds);
  };

  return (
    <Map
      style={{ width: "100vw", height: "100vh" }}
      defaultCenter={{ lat: 40.74421, lng: -73.9737 }}
      defaultZoom={15}
      minZoom={10}
      maxZoom={18}
      mapTypeControl={false}
      streetViewControl
      panControl={false}
      gestureHandling={"greedy"}
      zoomControlOptions={{ position: google.maps.ControlPosition.LEFT_TOP }}
      mapTypeId={google.maps.MapTypeId.ROADMAP}
      onBoundsChanged={handleBoundsChanged}
      styles={MAP_STYLE}
    >
      {bounds && <OldNYCMarkers bounds={bounds} />}
    </Map>
  );
}

interface OldNYCMarkerProps {
  bounds: google.maps.LatLngBoundsLiteral;
}

function OldNYCMarkers(props: OldNYCMarkerProps) {
  const { markerIcons, selectedMarkerIcons } = React.useMemo(() => {
    // Create marker icons for each number.
    const marker_icons: google.maps.Icon[] = [];
    const selected_marker_icons: google.maps.Icon[] = [];
    marker_icons.push(null!); // it's easier to be 1-based.
    selected_marker_icons.push(null!);
    for (var i = 0; i < 100; i++) {
      var num = i + 1;
      var size = num == 1 ? 9 : 13;
      var selectedSize = num == 1 ? 15 : 21;
      marker_icons.push({
        url: "images/sprite-2014-08-29.png",
        size: new google.maps.Size(size, size),
        origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
        anchor: new google.maps.Point((size - 1) / 2, (size - 1) / 2),
      });
      selected_marker_icons.push({
        url: "images/selected-2014-08-29.png",
        size: new google.maps.Size(selectedSize, selectedSize),
        origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
        anchor: new google.maps.Point(
          (selectedSize - 1) / 2,
          (selectedSize - 1) / 2
        ),
      });
    }
    return {
      markerIcons: marker_icons,
      selectedMarkerIcons: selected_marker_icons,
    };
  }, []);

  const {bounds} = props;
  const markers = React.useMemo(() => {
    console.log('finding visible markers');
    const llBounds = new google.maps.LatLngBounds(bounds);
    const out: JSX.Element[] = [];
    for (const lat_lon in lat_lons) {
      var pos = parseLatLon(lat_lon);
      if (!llBounds.contains(pos)) continue;

      const count = countPhotos(lat_lons[lat_lon]);
      out.push(
        <Marker key={lat_lon} position={pos} visible icon={markerIcons[Math.min(count, 100)]} title={lat_lon} />
      )
    }
    console.log(out.length, 'markers');
    return out;
  }, [bounds]);

  return <>{markers}</>
}

interface YearToCount {
  [year: string]: number;
}

export function countPhotos(yearToCounts: YearToCount) {
  return Object.values(yearToCounts || {}).reduce((a, b) => a + b, 0);
}

export function parseLatLon(lat_lon: string) {
  var ll = lat_lon.split(",");
  return new google.maps.LatLng(parseFloat(ll[0]), parseFloat(ll[1]));
}

const App = () => {
  const coreLib = useMapsLibrary("core");
  return coreLib && <AppWithMap />;
};

const root = createRoot(document.querySelector("#app")!);
root.render(
  <React.StrictMode>
    <APIProvider apiKey={API_KEY}>
      <App />
    </APIProvider>
  </React.StrictMode>
);
