import React from 'react';
import { popular_photos, PopularPhoto } from './popular-photos';
import { Link } from 'react-router-dom';
import { deleteCookie, setCookie } from './feedback';

// TODO: inline image source into popular-photos.js and get rid of this.
function expandedImageUrl(photo_id: string) {
  return `//oldnyc-assets.nypl.org/600px/${photo_id}.jpg`;
}

export function PopularImages() {
  const [isVisible, setIsVisible] = React.useState(
    !document.cookie.includes('nopop='),
  );

  const shownPhotos = React.useMemo(() => {
    // Rotate the images daily.
    const elapsedMs = new Date().getTime() - new Date('2015/12/15').getTime();
    const elapsedDays = Math.floor(elapsedMs / 86400 / 1000);
    const shift = elapsedDays % popular_photos.length;
    return popular_photos.slice(shift).concat(popular_photos.slice(0, shift));
  }, []);

  const show: React.MouseEventHandler = React.useCallback((e) => {
    e.preventDefault();
    setIsVisible(true);
    deleteCookie('nopop');
  }, []);

  const hide: React.MouseEventHandler = React.useCallback(() => {
    setIsVisible(false);
    setCookie('nopop', '1');
  }, []);

  return isVisible ? (
    <div id="popular">
      <h2>Popular Photos</h2>
      <div className="close" onClick={hide}>
        ✕
      </div>
      {shownPhotos.map((photo) => (
        <PopularPhoto key={photo.id} photo={photo} />
      ))}
    </div>
  ) : (
    <div className="popular-link">
      <h2>
        <a href="#" onClick={show}>
          Popular Photos
        </a>
      </h2>
    </div>
  );
}

function PopularPhoto(props: { photo: PopularPhoto }) {
  const { photo } = props;
  return (
    <div className="popular-photo">
      <Link to={`/${photo.id}`}>
        <img
          className="popular-image"
          src={expandedImageUrl(photo.id)}
          width={200}
          height={photo.height}
          loading="lazy"
        />
      </Link>
      <p>
        <span className="desc">{photo.desc}</span>
        <br />
        <span className="loc">{photo.loc}</span>{' '}
        <span className="date">({photo.date || 'undated'})</span>
      </p>
    </div>
  );
}
