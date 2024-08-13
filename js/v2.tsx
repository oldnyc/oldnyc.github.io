import React from 'react';
import {createRoot} from 'react-dom/client';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import {MAP_STYLE} from './map-styles';

const API_KEY='AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA';

const App = () => (
  <APIProvider apiKey={API_KEY}>
    <Map
      style={{width: '100vw', height: '100vh'}}
      defaultCenter={{lat: 40.74421, lng: -73.97370}}
      defaultZoom={15}
      gestureHandling={'greedy'}
      styles={MAP_STYLE}
    />
  </APIProvider>
);

const root = createRoot(document.querySelector('#app')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
