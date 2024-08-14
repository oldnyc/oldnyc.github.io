import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  Route,
  Switch,
  useParams,
} from "react-router-dom";

/*
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/#g::lat,:lon',
    element: <Sub />,
  },
  {
    path: '/#:photo_id,g::lat,:lon',
    element: <Sub />,
  },
  {
    path: '/#:photo_id',
    element: <Sub />,
  }
])
*/

interface UrlParams {
  photoId?: string;
  lat?: string;
  lon?: string;
}

function PhotoApp() {
  React.useEffect(() => {
    console.log('mount');
    return () => {
      console.log('unmount');
    };
  }, []);

  const { photoId, lat, lon } = useParams<UrlParams>();
  return <ul>
    <li>Photo: {photoId}</li>
    <li>Lat: {lat}</li>
    <li>Lon: {lon}</li>
    <li><Link to="/12345">12345</Link></li>
    <li><Link to="/12345,g:40,123">12345,g:40,123</Link></li>
    <li><Link to="g:40,123">g:40,123</Link></li>
  </ul>;
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
