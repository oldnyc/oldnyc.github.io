import React from "react";
import _ from "lodash";
import {
  PhotoInfo,
  infoForPhotoId,
  libraryUrl,
  loadInfoForLatLon,
  nameForLatLon,
} from "./photo-info";
import { YearRange, isFullTimeRange } from "./TimeSlider";
import { STATIC_MAP_STYLE } from "./map-styles";
import { ExpandableGrid } from "./grid/grid";
import { useHistory } from "react-router-dom";
import { photoIdToLatLon } from "./photo-id-to-lat-lon";
import { DetailView } from "./ImageDetails";

export interface SlideshowProps {
  latLon: string;
  selectedPhotoId?: string;
  yearRange: YearRange;
}

// A photo is in the date range if any dates mentioned in it are in the range.
// For example, "1927; 1933; 1940" is in the range [1920, 1930].
function isPhotoInDateRange(info: PhotoInfo, yearRange: [number, number]) {
  if (isFullTimeRange(yearRange)) return true;

  const [first, last] = yearRange;
  for (let i = 0; i < info.years.length; i++) {
    const year = info.years[i]; // could be empty string
    if (year && Number(year) >= first && Number(year) <= last) return true;
  }
  return false;
}

// lat_lon is a "lat,lon" string.
function makeStaticMapsUrl(lat_lon: string) {
  return (
    "http://maps.googleapis.com/maps/api/staticmap?center=" +
    lat_lon +
    "&zoom=15&size=150x150&scale=2&key=AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA&maptype=roadmap&markers=color:red%7C" +
    lat_lon +
    "&style=" +
    STATIC_MAP_STYLE
  );
}

export function Slideshow(props: SlideshowProps) {
  const { latLon, yearRange } = props;
  const [photoIds, setPhotoIds] = React.useState<string[] | null>();
  const isFullRange = isFullTimeRange(yearRange);

  // TODO: model this with resource pattern
  React.useEffect(() => {
    (async () => {
      const photoIds = await loadInfoForLatLon(latLon);
      for (const photoId of photoIds) {
        photoIdToLatLon[photoId] = latLon;
      }
      setPhotoIds(photoIds);
      // TODO: select first photo if <10 photos
    })().catch((e) => {
      console.error(e);
    });
  }, [latLon]);

  const images = React.useMemo(() => {
    if (!photoIds) return null;
    return _.sortBy(
      photoIds
        .map((photoId) => {
          var info = infoForPhotoId(photoId);
          if (!isPhotoInDateRange(info, yearRange)) return null;
          return {
            id: photoId,
            largesrc: info.image_url,
            src: info.thumb_url,
            ...info,
          };
        })
        .filter((x) => x !== null),
      (info) => info.years?.[0]
    );
  }, [photoIds, yearRange]);

  const history = useHistory();
  const handleSelect = React.useCallback(
    (photoId: string) => {
      console.log("select", photoId);
      // TODO: should this be replace or push?
      history.push("/" + photoId);
    },
    [history, latLon]
  );

  const handleDeselect = React.useCallback(() => {
    // TODO: should this be replace or push?
    history.push(`/g:${latLon}`);
  }, [history]);

  // TODO: wire up all the many ways to exit the slideshow
  const handleExit = React.useCallback(() => {
    history.push(`/`);
  }, [history]);

  return images ? (
    <div id="expanded">
      <div className="curtains"></div>

      <div className="header">
        <div className="logo">
          <div className="wrapper">
            <a className="exit" href="#">
              OldNYC
            </a>
          </div>
        </div>
        {!isFullRange && (
          <div id="filtered-slideshow">
            Only showing photos between
            <span id="slideshow-filter-first">{yearRange[0]}</span> and{" "}
            <span id="slideshow-filter-last">{yearRange[1]}</span>.
            {/* TODO: wire "Show all" up */}
            <a href="#" id="slideshow-all">
              Show all.
            </a>
          </div>
        )}
        <div
          id="exit-slideshow"
          className="exit"
          title="Exit Slideshow"
          onClick={handleExit}
        >
          ✕
        </div>
      </div>

      {/* TODO: wire these links up */}
      <div id="expanded-controls">
        <img
          id="preview-map"
          className="exit"
          title="Exit Slideshow"
          width="150"
          height="150"
          src={makeStaticMapsUrl(latLon)}
        />
        <div className="location">{nameForLatLon(latLon)}</div>
        <div className="nypl-logo">
          <a target="_blank">
            <img src="/images/nypl_logo.png" width="127" height="75" />
          </a>
        </div>
      </div>

      <div id="grid-container">
        <ExpandableGrid
          images={images}
          rowHeight={200}
          speed={200}
          selectedId={props.selectedPhotoId}
          leftDetails={LeftDetails}
          details={DetailView}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
        />
      </div>
    </div>
  ) : null;
}

function LeftDetails({ image }: { image: GridImage & Partial<PhotoInfo> }) {
  return (
    <div>
      <div className="nypl-link">
        <a target="_blank" href={libraryUrl(image.id, image.nypl_url)}>
          View complete item in NYPL Digital Collections
        </a>
        .
      </div>
      <div className="rotate">
        <a href="#" className="rotate-image-button">
          <img src="/images/rotate.png" width="29" height="29" />
        </a>
      </div>
    </div>
  );
}