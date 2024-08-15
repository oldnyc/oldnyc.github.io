import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  useParams,
  useLocation,
} from "react-router-dom";
import { Map } from "./map";
import { DEFAULT_YEARS, TimeSlider } from "./TimeSlider";
import { Logo } from "./Logo";
import { Slideshow } from './Slideshow';
import { getLatLonForPhotoId, photoIdToLatLon } from "./photo-id-to-lat-lon";
import { PopularImages } from "./PopularImages";
import { Header } from "./Header";
import { About } from "./About";
import { FacebookProvider } from "react-facebook";

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

  const location = useLocation();
  const isAbout = location.pathname === '/about';

  const params = useParams<UrlParams>();
  const { photoId } = params;
  let loc = params.lat && params.lon ? `${params.lat},${params.lon}` : undefined;
  if (photoId && !loc) {
    loc = photoIdToLatLon[photoId];
  }

  // TODO: make sure there's only one request in flight for any id4
  const [, setForceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (photoId && !loc) {
      (async () => {
        await getLatLonForPhotoId(photoId);  // populates photoIdToLatLon
        setForceUpdate(n => n + 1);
      })().catch(e => {
        console.error(e);
      })
    }
  }, [photoId, loc]);

  return (
    <FacebookProvider appId="598168753565519">
      <Map yearRange={years} onClickMarker={handleMarkerClick} selectedLatLon={loc} />
      <div className="header">
        <Header />
        <Logo />
      </div>
      <FeedbackLink />
      <PopularImages />
      <TimeSlider years={years} onSlide={setYears} />
      {loc && <Slideshow latLon={loc} selectedPhotoId={photoId} yearRange={years} />}
      {isAbout && <About />}
    </FacebookProvider>
  );
}

const FeedbackLink = () => <div id="feedback"><a href="https://docs.google.com/forms/d/1aFi1w4PY1Q-LofWDcPz0CKOyAno6eHNFaVS4x1glwlQ/viewform" target="_blank">Send feedback</a></div>

// TODO:
// [ ] GA tracking on all events

const root = createRoot(document.querySelector("#app")!);
root.render(
  <React.StrictMode>
    <HashRouter basename="" hashType="noslash">
      <Switch>
        <Route path="/about">
          <PhotoApp />
        </Route>
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
