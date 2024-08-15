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
import classNames from "classnames";

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
              {text !== null && <p>
                <i>
                  Typos? Help{" "}
                  <a target="_blank" href={ocrUrl}>
                    fix them
                  </a>
                  .
                </i>
              </p>}
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
          <CopyLink href={window.location.href} />{' '}
          <Tweet href={window.location.href} via="Old_NYC @NYPL" text={(info.original_title || info.title) + ' - ' + info.date} />{' '}
          <div className="facebook-holder"></div>
        </div>

        <div className="comments"></div>
      </div>
      {null && <Feedback />}
    </>
  );
}

function CopyLink({href}: {href: string}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copy: React.MouseEventHandler = (e) => {
    e.preventDefault();
    (async () => {
      await navigator.clipboard.writeText(href);
      setIsCopied(true);
    })().catch(e => {
      // ...
    });
  };

  return (
    <div className={classNames("copy-link", {clicked: isCopied})}>
      <span className={classNames('octicon', isCopied ? 'octicon-check' : 'octicon-clippy')}></span>
      <a href="#" className="email-share" onClick={copy}>
        {' '}{isCopied ? 'Copied' : 'Copy Link'}
      </a>
    </div>
  );
}

interface TweetProps {
  href: string;
  via: string;
  text: string;
}
function Tweet(props: TweetProps) {
  const {href, via, text} = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const created = React.useRef('');  // TODO: this seems like a crazy way to prevent double-firing!
  React.useEffect(() => {
    if (!ref.current || created.current === href) return;
    // Some browser plugins block twitter
    if (typeof(twttr) !== 'undefined') {
      created.current = href;
      twttr.ready(({widgets}) => {
        if (ref.current) {
          widgets.createShareButton(
            href,
            ref.current, {
              count: 'none',
              text,
              via,
            });
        }
      });
    }
  }, [ref, href, via, text, created]);

  return <div ref={ref} key={href} className="tweet" />;
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
