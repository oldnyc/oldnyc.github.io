import React from 'react';
import { CSSTransition } from 'react-transition-group';
import {
  PhotoInfo,
  backId,
  descriptionForPhotoId,
  getCanonicalUrlForPhoto,
  infoForPhotoId,
  libraryUrl,
} from './photo-info';
import { FeedbackType, getFeedbackText, sendFeedback } from './feedback';
import { useResource } from './use-resource';
import { SuspenseImage } from './grid/SuspenseImage';
import classNames from 'classnames';
import { GridImage } from './grid/grid';
import { Comment } from './Comment';

export function DetailView({
  image,
}: {
  image: GridImage & Partial<PhotoInfo>;
}) {
  const { id } = image;
  const info = infoForPhotoId(id);
  const library_url = libraryUrl(id, info.nypl_url);
  const canonicalUrl = getCanonicalUrlForPhoto(id);

  // TODO: rename backId -> getBackId
  const bid = backId(id);
  const ocrText = useResource(`ocr-${bid}`, () => getFeedbackText(bid));
  const text =
    ocrText.status === 'success'
      ? (ocrText.data?.text ?? info.text)
      : ocrText.status === 'error'
        ? info.text
        : '';

  const hasBack = /[0-9]f/.exec(id);
  const ocrUrl = `/ocr.html#${id}`;

  const detailsRef = React.useRef<HTMLDivElement>(null);
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);

  const showFeedback: React.MouseEventHandler = React.useCallback((e) => {
    e.preventDefault();
    setFeedbackVisible(true);
  }, []);
  const hideFeedback = React.useCallback(() => {
    setFeedbackVisible(false);
  }, []);

  const nodeRef = React.useRef(null);

  return (
    <>
      <CSSTransition
        nodeRef={detailsRef}
        in={!feedbackVisible}
        timeout={400}
        classNames="fade"
      >
        <div className="details" ref={detailsRef}>
          <div className="description">{descriptionForPhotoId(id)}</div>
          <div className="text">
            {ocrText.status === 'pending' ? null : (
              <>
                {text}
                {text && (
                  <p>
                    <i>
                      Typos? Help{' '}
                      <a target="_blank" href={ocrUrl}>
                        fix them
                      </a>
                      .
                    </i>
                  </p>
                )}
                {!text && hasBack ? (
                  <MoreOnBack ocrUrl={ocrUrl} libraryUrl={library_url} />
                ) : null}
              </>
            )}
          </div>

          <div className="feedback-link">
            Errors?{' '}
            <a href="#" className="feedback-button" onClick={showFeedback}>
              Send feedback
            </a>
          </div>

          <div className="social">
            <CopyLink href={window.location.href} />{' '}
            <Tweet
              href={window.location.href}
              via="Old_NYC @NYPL"
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              text={(info.original_title || info.title) + ' - ' + info.date}
            />{' '}
            {/*
            <div className="facebook-holder">
              <Like
                href={canonicalUrl}
                layout="button"
                action="like"
                showFaces={false}
                share
              />
            </div>
            */}
          </div>

          <div className="comments">
            <Comment url={canonicalUrl} />
            {/*
            <Comments
              numPosts={5}
              colorScheme="light"
              href={canonicalUrl}
              width={width}
            />
            */}
          </div>
        </div>
      </CSSTransition>
      <CSSTransition
        nodeRef={nodeRef}
        in={feedbackVisible}
        timeout={400}
        classNames="fade"
      >
        <Feedback ref={nodeRef} id={id} onClose={hideFeedback} />
      </CSSTransition>
    </>
  );
}

function CopyLink({ href }: { href: string }) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copy: React.MouseEventHandler = (e) => {
    e.preventDefault();
    (async () => {
      await navigator.clipboard.writeText(href);
      setIsCopied(true);
    })().catch((e) => {
      console.error(e);
    });
  };

  return (
    <div className={classNames('copy-link', { clicked: isCopied })}>
      <span
        className={classNames(
          'octicon',
          isCopied ? 'octicon-check' : 'octicon-clippy',
        )}
      ></span>
      <a href="#" className="email-share" onClick={copy}>
        {' '}
        {isCopied ? 'Copied' : 'Copy Link'}
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
  const { href, via, text } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const created = React.useRef(''); // TODO: this seems like a crazy way to prevent double-firing!
  React.useEffect(() => {
    if (!ref.current || created.current === href) return;
    // Some browser plugins block twitter
    if (typeof twttr !== 'undefined') {
      created.current = href;
      twttr.ready(({ widgets }) => {
        if (ref.current) {
          void widgets.createShareButton(href, ref.current, {
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

export function ImagePreview({
  image,
}: {
  image: GridImage & Partial<PhotoInfo>;
}) {
  const { id } = image;
  const [rotation, setRotation] = React.useState(0);
  const rotate: React.MouseEventHandler = React.useCallback(
    (e) => {
      e.preventDefault();
      const newRotation = rotation + 90;
      setRotation(newRotation);
      ga('send', 'event', 'link', 'rotate', {
        page: `/#${id}(${newRotation})`,
      });
    },
    [id, rotation],
  );

  return (
    <React.Suspense fallback={<div className="og-loading" />}>
      <SuspenseImage
        src={image.largesrc ?? image.src}
        width={image.width}
        height={image.height}
        style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
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
  );
}

interface MoreOnBackProps {
  libraryUrl: string;
  ocrUrl: string;
}

function MoreOnBack(props: MoreOnBackProps) {
  return (
    <div className="more-on-back">
      There's no description available for this photo, but there may be some{' '}
      text on the back of the image in the{' '}
      <a className="nypl" href={props.libraryUrl} target="_blank">
        NYPL Digital Collections
      </a>
      . If so, you can help OldNYC by{' '}
      <a className="ocr-tool" href={props.ocrUrl} target="_blank">
        transcribing it
      </a>
      .
    </div>
  );
}

interface FeedbackProps {
  id: string;
  onClose: () => void;
}

const Feedback = React.forwardRef<HTMLDivElement, FeedbackProps>(
  (props, ref) => {
    const { id, onClose } = props;
    const handleBack: React.MouseEventHandler = React.useCallback(
      (e) => {
        e.preventDefault();
        onClose();
      },
      [onClose],
    );

    return (
      <div className="feedback" ref={ref}>
        <p>
          <a className="back" href="#" onClick={handleBack}>
            &larr; back
          </a>
        </p>
        <p>Tell us more about this image!</p>
        <FeedbackButton id={id} type="cut-in-half">
          It's only part of an image
        </FeedbackButton>
        <FeedbackButton id={id} type="large-border">
          It has an excessively large border
        </FeedbackButton>
        <FeedbackButton id={id} type="multiples">
          It's actually multiple images
        </FeedbackButton>
        <FeedbackButton id={id} type="wrong-location">
          It's in the wrong location
        </FeedbackButton>

        <DateFeedbackForm id={id} />
      </div>
    );
  },
);

interface FeedbackButtonProps {
  id: string;
  type: FeedbackType;
  children?: JSX.Element | string;
}

function FeedbackButton(props: FeedbackButtonProps) {
  const [disabled, setDisabled] = React.useState(false);
  const [thanks, setThanks] = React.useState(false);

  const handleClick = () => {
    setDisabled(true);

    (async () => {
      await sendFeedback(props.id, props.type, { [props.type]: true });
      setThanks(true);
    })().catch((e) => {
      console.error(e);
    });
  };

  return (
    <button disabled={disabled} onClick={handleClick}>
      {thanks ? 'Thanks!' : props.children}
    </button>
  );
}

function DateFeedbackForm({ id }: { id: string }) {
  const [date, setDate] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);
  const [thanks, setThanks] = React.useState(false);

  const handleClick = () => {
    setDisabled(true);

    (async () => {
      await sendFeedback(id, 'date', { date });
      setThanks(true);
    })().catch((e) => {
      console.error(e);
    });
  };

  return (
    <p className="suggest-date">
      Suggest a date:{' '}
      <input
        disabled={disabled}
        type="text"
        placeholder="Sept. 7, 1941"
        value={date}
        onChange={(e) => setDate(e.currentTarget.value)}
      />{' '}
      <button onClick={handleClick} disabled={disabled}>
        {thanks ? 'Thanks!' : 'Suggest'}
      </button>
    </p>
  );
}
