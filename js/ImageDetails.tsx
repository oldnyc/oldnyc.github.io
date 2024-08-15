import React from "react";
import {
  PhotoInfo,
  backId,
  descriptionForPhotoId,
  infoForPhotoId,
  libraryUrl,
} from "./photo-info";
import { getCanonicalUrlForPhoto } from "./social";
import { getFeedbackText } from "./feedback";
import { useResource } from "./use-resource";
import { SuspenseImage } from "./grid/SuspenseImage";

export function DetailView({
  image,
}: {
  image: GridImage & Partial<PhotoInfo>;
}) {
  const { id } = image;
  const info = infoForPhotoId(id);
  const library_url = libraryUrl(id, info.nypl_url);
  // var canonicalUrl = getCanonicalUrlForPhoto(id);

  // TODO: rename backId -> getBackId
  const bid = backId(id);
  const ocrText = useResource(`ocr-${bid}`, () => getFeedbackText(bid));
  const text =
    ocrText.status === "success"
      ? ocrText.data?.text ?? info.text
      : ocrText.status === "error"
      ? info.text
      : "";

  const hasBack = id.match("[0-9]f");
  const ocrUrl = `/ocr.html#${id}`;

  return (
    <>
      <div className="details">
        <div className="description">{descriptionForPhotoId(id)}</div>
        <div className="text">
          {ocrText.status === "pending" ? null : (
            <>
              {text}
              <p>
                <i>
                  Typos? Help{" "}
                  <a target="_blank" href={ocrUrl}>
                    fix them
                  </a>
                  .
                </i>
              </p>
              {!text && hasBack ? (
                <MoreOnBack ocrUrl={ocrUrl} libraryUrl={library_url} />
              ) : null}
            </>
          )}
        </div>

        <div className="feedback-link">
          Errors?{" "}
          <a href="#" className="feedback-button">
            Send feedback
          </a>
        </div>

        <div className="social">
          <div className="copy-link">
            <span className="octicon octicon-clippy"></span>
            <a href="#" className="email-share">
              Copy Link
            </a>
          </div>
          <div className="tweet"></div>
          <div className="facebook-holder"></div>
        </div>

        <div className="comments"></div>
      </div>
      {null && <Feedback />}
    </>
  );
}

export function ImagePreview({image} : {image: GridImage & Partial<PhotoInfo> }) {
  const [rotation, setRotation] = React.useState(0);
  const rotate: React.MouseEventHandler = React.useCallback((e) => {
    e.preventDefault();
    setRotation(r => r + 90);
    // TODO: track GA
  }, []);

  return (
    <React.Suspense fallback={<div className="og-loading" />}>
      <SuspenseImage
        src={image.largesrc ?? image.src}
        width={image.width}
        height={image.height}
        style={rotation ? {transform: `rotate(${rotation}deg)`} : undefined}
      />
      <div>
        <div className="nypl-link">
          <a target="_blank" href={libraryUrl(image.id, image.nypl_url)}>
            View complete item in NYPL Digital Collections
          </a>
          .
        </div>
        <div className="rotate">
          <a href="#" className="rotate-image-button" onClick={rotate}>
            <img src="/images/rotate.png" width="29" height="29" />
          </a>
        </div>
      </div>
    </React.Suspense>
  )
}

interface MoreOnBackProps {
  libraryUrl: string;
  ocrUrl: string;
}

function MoreOnBack(props: MoreOnBackProps) {
  return (
    <div className="more-on-back">
      There's no description available for this photo, but there may be some
      text on the back of the image in the
      <a className="nypl" href={props.libraryUrl} target="_blank">
        NYPL Digital Collections
      </a>
      . If so, you can help OldNYC by
      <a className="ocr-tool" href={props.ocrUrl} target="_blank">
        transcribing it
      </a>
      .
    </div>
  );
}

function Feedback() {
  return (
    <div className="feedback">
      <p>
        <a className="back" href="#">
          &larr; back
        </a>
      </p>
      <p>Tell us more about this image!</p>
      <button data-feedback="cut-in-half">It's only part of an image</button>
      <button data-feedback="large-border">
        It has an excessively large border
      </button>
      <button data-feedback="multiples">It's actually multiple images</button>
      <button data-feedback="wrong-location">It's in the wrong location</button>

      <p className="suggest-date">
        Suggest a date:
        <input type="text" placeholder="Sept. 7, 1941" />
        <button data-feedback-param data-feedback="date">
          Suggest
        </button>
      </p>
    </div>
  );
}
