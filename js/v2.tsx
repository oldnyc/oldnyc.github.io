import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  Route,
  Switch,
  useHistory,
  useParams,
} from "react-router-dom";
import { Map } from "./map";
import { DEFAULT_YEARS, TimeSlider, YearRange } from "./TimeSlider";
import { Logo } from "./Logo";
import { Slideshow } from './Slideshow';
import { photoIdToLatLon } from "./photo-id-to-lat-lon";

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

  const history = useHistory();
  const handleMarkerClick = React.useCallback((latLon: string) => {
    history.push(`/g:${latLon}`);
  }, [history]);

  const params = useParams<UrlParams>();
  const { photoId } = params;
  let loc = params.lat && params.lon ? `${params.lat},${params.lon}` : undefined;
  if (photoId && !loc) {
    loc = photoIdToLatLon[photoId];
    if (loc) {
      console.log('got location from cache');
    } else {
      console.log('failed to get location from cache');
    }
  }
  // TODO: if no loc, then we need to load it (maybe this is an initial page load)

  return (
    <>
      <Map yearRange={years} onClickMarker={handleMarkerClick} selectedLatLon={loc} />
      <Logo />
      <TimeSlider years={years} onSlide={setYears} />
      {loc && <Slideshow latLon={loc} selectedPhotoId={photoId} yearRange={years} />}
    </>
  );
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
