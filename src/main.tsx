import React from 'react';
import { createRoot } from 'react-dom/client';
import { Helmet } from 'react-helmet';

import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  useParams,
  useLocation,
} from 'react-router-dom';
import { Map } from './map';
import { DEFAULT_YEARS, TimeSlider, YearRange } from './TimeSlider';
import { Logo } from './Logo';
import { Slideshow } from './Slideshow';
import { getLatLonForPhotoId, photoIdToLatLon } from './photo-id-to-lat-lon';
import { PopularImages } from './PopularImages';
import { Header } from './Header';
import { About } from './About';

interface UrlParams {
  photoId?: string;
  lat?: string;
  lon?: string;
}

function pageTitle(params: UrlParams) {
  const app = 'Old NYC';
  if (params.photoId) {
    return `${app} - Photo ${params.photoId}`;
  } else if (params.lat && params.lon) {
    // TODO: include cross-streets in the title
    return `${app} - Grid`;
  } else {
    return `${app}: Mapping Historical Photographs of New York City`;
  }
}

function PhotoApp() {
  const [years, setYears] = React.useState(DEFAULT_YEARS);

  const history = useHistory();
  const handleMarkerClick = React.useCallback(
    (latLon: string) => {
      history.push(`/g:${latLon}`);
    },
    [history],
  );

  const location = useLocation();
  const isAbout = location.pathname === '/about';

  const params = useParams<UrlParams>();
  const { photoId } = params;
  let loc =
    params.lat && params.lon ? `${params.lat},${params.lon}` : undefined;
  if (photoId && !loc) {
    loc = photoIdToLatLon[photoId];
  }

  // TODO: make sure there's only one request in flight for any id4
  const [, setForceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (photoId && !loc) {
      (async () => {
        await getLatLonForPhotoId(photoId); // populates photoIdToLatLon
        setForceUpdate((n) => n + 1);
      })().catch((e) => {
        console.error(e);
      });
    }
  }, [photoId, loc]);

  const logTimeSlider = React.useCallback(([a, b]: YearRange) => {
    ga('send', 'event', 'link', 'time-slider', {
      page: `/#${a}–${b}`,
    });
  }, []);

  const resetYears = React.useCallback(() => {
    setYears(DEFAULT_YEARS);
    ga('send', 'event', 'link', 'time-slider-clear');
  }, []);

  React.useEffect(() => {
    // There may be some double-counting here, e.g. when you close an image
    // preview or go back to the map from the grid. No big deal.
    if (typeof ga !== 'undefined') {
      const url = location.pathname + location.search + location.hash;
      ga('send', 'pageview', { page: url });
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <title>{pageTitle(params)}</title>
      </Helmet>
      <Map
        yearRange={years}
        onClickMarker={handleMarkerClick}
        selectedLatLon={loc}
      />
      <div className="header">
        <Header />
        <Logo />
      </div>
      <FeedbackLink />
      <PopularImages />
      <TimeSlider years={years} onSlide={setYears} onChange={logTimeSlider} />
      {loc && (
        <Slideshow
          latLon={loc}
          selectedPhotoId={photoId}
          yearRange={years}
          onResetYears={resetYears}
        />
      )}
      {isAbout && <About />}
    </>
  );
}

const FeedbackLink = () => (
  <div id="feedback">
    <a
      href="https://docs.google.com/forms/d/1aFi1w4PY1Q-LofWDcPz0CKOyAno6eHNFaVS4x1glwlQ/viewform"
      target="_blank"
      rel="noreferrer"
    >
      Send feedback
    </a>
  </div>
);

const root = createRoot(document.querySelector('#app')!);
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
        <Route path="/:photoId">
          <PhotoApp />
        </Route>
        <Route path="">
          <PhotoApp />
        </Route>
      </Switch>
    </HashRouter>
  </React.StrictMode>,
);
