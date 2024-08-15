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
import { DetailView, ImagePreview, LeftDetails } from "./ImageDetails";

export interface SlideshowProps {
  latLon: string;
  selectedPhotoId?: string;
  yearRange: YearRange;
}

const LIBRARY_URL = 'https://digitalcollections.nypl.org/collections/photographic-views-of-new-york-city-1870s-1970s-from-the-collections-of-the-ne-2#/?tab=about';

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
  const { latLon, yearRange, selectedPhotoId } = props;
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

  const selectedImage = images && selectedPhotoId ? images.find(image => image.id === selectedPhotoId) : undefined;

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

  const handleExit = React.useCallback(() => {
    history.push(`/`);
  }, [history]);

  const exitIfSelfClick: React.MouseEventHandler = React.useCallback(e => {
    if (e.currentTarget === e.target || (e.target as HTMLElement).classList.contains('og-grid')) {
      handleExit();
    }
  }, [handleExit]);

  return images ? (
    <div id="expanded">
      <div className="curtains" onClick={handleExit}></div>

      <div className="header" onClick={handleExit}>
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
          <a target="_blank" href={selectedImage?.nypl_url ?? LIBRARY_URL}>
            <img src="/images/nypl_logo.png" width="127" height="75" />
          </a>
        </div>
      </div>

      <div id="grid-container" onClick={exitIfSelfClick}>
        <ExpandableGrid
          images={images}
          rowHeight={200}
          speed={200}
          selectedId={selectedPhotoId}
          imageEl={ImagePreview}
          details={DetailView}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
        />
      </div>
    </div>
  ) : null;
}
