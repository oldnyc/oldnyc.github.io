import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  Route,
  Switch,
  useParams,
} from "react-router-dom";
import { Map, YearRange } from "./map";

interface UrlParams {
  photoId?: string;
  lat?: string;
  lon?: string;
}

const DEFAULT_YEARS: YearRange = [1800, 2000];

function PhotoApp() {
  React.useEffect(() => {
    console.log('mount');
    return () => {
      console.log('unmount');
    };
  }, []);

  return (
    <Map yearRange={DEFAULT_YEARS} onBoundsChange={bounds => { console.log(bounds.toJSON() )}} />
  );

  /*
  const { photoId, lat, lon } = useParams<UrlParams>();
  return <ul>
    <li>Photo: {photoId}</li>
    <li>Lat: {lat}</li>
    <li>Lon: {lon}</li>
    <li><Link to="/12345">12345</Link></li>
    <li><Link to="/12345,g:40,123">12345,g:40,123</Link></li>
    <li><Link to="g:40,123">g:40,123</Link></li>
  </ul>;
  */
}


const root = createRoot(document.querySelector("#app")!);
root.render(
  <React.StrictMode>
    <HashRouter basename="" hashType="noslash">
      <Switch>
        <Route path="/g::lat,:lon">
          <PhotoApp />
        </Route>
        <Route path="/:photoId,g::lat,:lon">
          <PhotoApp />
        </Route>
        <Route path="/:photoId">
          <PhotoApp />
        </Route>
        <Route path="">
          <PhotoApp />
        </Route>
      </Switch>
    </HashRouter>
  </React.StrictMode>
);
