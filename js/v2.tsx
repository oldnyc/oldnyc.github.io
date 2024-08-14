import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  Route,
  Switch,
  useParams,
} from "react-router-dom";
import { Map } from "./map";
import { DEFAULT_YEARS, TimeSlider, YearRange } from "./TimeSlider";
import { Logo } from "./Logo";
import { Slideshow } from './Slideshow';

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

  const [years, setYears] = React.useState(DEFAULT_YEARS);
  const [selectedLatLon, setSelectedLatLon] = React.useState<string|undefined>();

  const handleMarkerClick = React.useCallback((latLon: string) => {
    setSelectedLatLon(latLon);
  }, []);

  const params = useParams<UrlParams>();
  const { photoId } = params;

  return (
    <>
      <Map yearRange={years} onClickMarker={handleMarkerClick} selectedLatLon={selectedLatLon} />
      <Logo />
      <TimeSlider years={years} onSlide={setYears} />
      {selectedLatLon && <Slideshow latLon={selectedLatLon} selectedPhotoId={photoId} yearRange={years} />}
    </>
  );

  /*
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

// TODO:
// [ ] GA tracking on all events

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
