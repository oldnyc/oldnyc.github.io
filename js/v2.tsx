import React from "react";
import { createRoot } from "react-dom/client";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MAP_STYLE } from "./map-styles";

const API_KEY = "AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA";

const App = () => {
  const coreLib = useMapsLibrary('core');
  const mapsLib = useMapsLibrary('maps');
  return (
    coreLib && mapsLib &&
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
      zoomControlOptions={{position: coreLib.ControlPosition.LEFT_TOP}}
      mapTypeId={mapsLib.MapTypeId.ROADMAP}
      styles={MAP_STYLE}
    />
  );
};

const root = createRoot(document.querySelector("#app")!);
root.render(
  <React.StrictMode>
    <APIProvider apiKey={API_KEY}>
      <App />
    </APIProvider>
  </React.StrictMode>
);
