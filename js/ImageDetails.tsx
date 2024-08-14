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

export function DetailView({
  image,
}: {
  image: GridImage & Partial<PhotoInfo>;
}) {
  const { id } = image;
  const info = infoForPhotoId(id);
  const library_url = libraryUrl(id, info.nypl_url);
  // var canonicalUrl = getCanonicalUrlForPhoto(id);

  // TODO: resource pattern
  const [text, setText] = React.useState<string | undefined>();
  React.useEffect(() => {
    (async () => {
      const ocr = await getFeedbackText(backId(id));
      console.log(ocr?.text, info.text);
      setText(ocr?.text ?? info.text);
    })().catch((e) => {
      console.error(e);
    });
  }, [id]);

  const hasBack = id.match("[0-9]f");
  const ocrUrl = `/ocr.html#${id}`;

  return (
    <>
      <div className="details">
        <div className="description">{descriptionForPhotoId(id)}</div>
        <div className="text">
          {text}
          {text && (
            <i>
              &nbsp; &nbsp; Typos? Help{" "}
              <a target="_blank" href={ocrUrl}>
                fix them
              </a>
              .
            </i>
          )}
          {!text && hasBack ? (
            <MoreOnBack ocrUrl={ocrUrl} libraryUrl={library_url} />
          ) : null}
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
