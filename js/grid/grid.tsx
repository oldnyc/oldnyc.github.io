import React from "react";
import classNames from "classnames";
// import "./grid.css";
import { SuspenseImage } from "./SuspenseImage";

export interface GridImage {
  id: string;
  src: string;
  largesrc?: string;
  width: number;
  height: number;
}

export interface GridOptions {
  maxHeight?: number; // 750
  speed?: number; // 350
  easing?: string; // 'ease'
  imageMargin?: number; // 12
  rowHeight: number;
  leftDetails?: React.ComponentType<{ image: GridImage }>;
  details: React.ComponentType<{ image: GridImage }>;
}

export interface ExpandableGridProps extends GridOptions {
  images: readonly GridImage[];
  selectedId?: string;
  onClickLargeImage?: (image: GridImage) => void;
  onSelect?: (id: string) => void;
  onDeselect?: () => void;
}

export function ExpandableGrid(props: ExpandableGridProps) {
  const { selectedId } = props;
  const gridRef = React.createRef<HTMLUListElement>();
  const [width, setWidth] = React.useState<number | null>(null);
  // TODO: doesn't feel like this should be needed
  const [container, setContainer] = React.useState<HTMLUListElement | null>(
    null
  );

  const resizeFn = React.useCallback(() => {
    const box = gridRef.current?.getBoundingClientRect();
    if (box) {
      setWidth(box.width);
      setContainer(gridRef.current);
    }
  }, [gridRef]);

  React.useLayoutEffect(() => resizeFn, [resizeFn]);

  React.useEffect(() => {
    window.addEventListener("resize", resizeFn);
    return () => {
      window.removeEventListener("resize", resizeFn);
    };
  }, [resizeFn]);

  const prevSelectedId = React.useRef<undefined | string>(selectedId);
  React.useLayoutEffect(() => {
    const prevId = prevSelectedId.current;
    if (prevId !== selectedId) {
      // console.log('selected ID changed', prevId, '->', selectedId);
      // Only animate opening/closing
      const shouldTransition = prevId === undefined || selectedId === undefined;
      gridRef.current?.classList.toggle("og-transitionable", shouldTransition);
      prevSelectedId.current = selectedId;
    }
  }, [gridRef, selectedId]);

  return (
    <ul className="og-grid" ref={gridRef}>
      {width === null || container === null ? null : (
        <GridWithWidth {...props} containerWidth={width} gridEl={container} />
      )}
    </ul>
  );
}

interface GridWithWidthProps extends ExpandableGridProps {
  containerWidth: number;
  gridEl: HTMLUListElement;
}

function GridWithWidth(props: GridWithWidthProps) {
  const { images, selectedId, onSelect, onDeselect } = props;
  const imageMargin = props.imageMargin ?? 12;
  const maxHeight = props.maxHeight ?? 750;

  // TODO: memoize this
  const rows = partitionIntoRows(images, {
    maxRowHeight: props.rowHeight,
    imageMargin,
    containerWidth: props.containerWidth,
  });

  // const scrollParent = allParents(props.gridEl).find(isElementScrollable) ?? document.body;
  // TODO: does window.innerHeight = $(window).height()?
  // const scrollParentHeight = Math.min(scrollParent.getBoundingClientRect().height, window.innerHeight);
  const thumbnailHeight = props.rowHeight; // is this the same as this.$item.data('height')
  // const previewHeight = Math.min(scrollParentHeight - thumbnailHeight - 50, maxHeight);  // what's 50?
  const previewHeight = maxHeight;
  const itemHeight = previewHeight + thumbnailHeight + 10; // what's 10?
  // console.log('previewHeight', previewHeight, 'scrollParentHeight', scrollParentHeight);

  const handleClick: React.MouseEventHandler = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = e.currentTarget.parentElement!.getAttribute("data-id")!;
      if (id === selectedId) {
        onDeselect?.();
      } else {
        onSelect?.(id);
      }
    },
    [onDeselect, onSelect, selectedId]
  );

  const goLeftRight = React.useCallback(
    (delta: -1 | 1) => {
      const idx = images.findIndex((image) => image.id === selectedId);
      if (idx === -1) {
        return;
      }
      const newIdx = idx + delta;
      if (newIdx < 0 || newIdx >= images.length) {
        return;
      }
      onSelect?.(images[newIdx].id);
    },
    [images, onSelect, selectedId]
  );

  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        goLeftRight(-1);
      } else if (e.key === "ArrowRight") {
        goLeftRight(+1);
      } else if (e.key === "Escape") {
        onDeselect?.();
      }
    }
    document.addEventListener("keyup", handleKey);
    return () => document.removeEventListener("keyup", handleKey);
  }, [goLeftRight, onDeselect]);

  React.useEffect(() => {
    if (!selectedId) {
      return;
    }
    const el = document.querySelector(`[data-id="${selectedId}"]`);
    if (!el) {
      return;
    }
    const scrollParent =
      allParents(el).find(isElementScrollable) ?? document.body;
    const parentTop = el.parentElement!.getBoundingClientRect().top;
    const top = el.getBoundingClientRect().top;
    scrollParent.scrollTo({ top: top - parentTop, behavior: "smooth" });
  }, [selectedId]);

  return (
    <>
      {rows.flatMap((row) =>
        row.images.map((image, i) => (
          <li
            key={image.id}
            data-id={image.id}
            className={classNames({ "og-expanded": image.id === selectedId })}
            style={
              image.id === selectedId
                ? { height: itemHeight }
                : { height: row.height }
            }
          >
            <a href="#" onClick={handleClick}>
              <img
                src={image.src}
                height={row.height}
                width={Math.floor(image.width * (row.height / image.height))}
                loading="lazy"
              ></img>
            </a>
            {image.id === selectedId ? (
              <Preview
                image={image}
                details={props.details}
                leftDetails={props.leftDetails}
                rowHeight={row.height}
                height={previewHeight}
                onClose={props.onDeselect}
                onLeftRight={goLeftRight}
                onClickLargeImage={props.onClickLargeImage}
                isFirst={i === 0}
                isLast={i === images.length - 1}
              />
            ) : null}
          </li>
        ))
      )}
    </>
  );
}

interface PreviewProps {
  image: GridImage;
  rowHeight: number;
  height: number;
  leftDetails?: React.ComponentType<{ image: GridImage }>;
  details: React.ComponentType<{ image: GridImage }>;
  isFirst: boolean;
  isLast: boolean;
  onClose?: () => void;
  onClickLargeImage?: (image: GridImage) => void;
  onLeftRight: (delta: -1 | 1) => void;
}

function Preview(props: PreviewProps) {
  const { image, onLeftRight, onClickLargeImage } = props;

  return (
    <div className="og-expander" style={{ height: props.height }}>
      <div className="og-expander-inner">
        <span className="og-close" onClick={props.onClose}></span>
        <div className="og-fullimg">
          <React.Suspense fallback={<div className="og-loading" />}>
            <SuspenseImage
              src={image.largesrc ?? image.src}
              width={image.width}
              height={image.height}
              onClick={() => onClickLargeImage?.(image)}
            />
            {props.leftDetails && <props.leftDetails image={image} />}
          </React.Suspense>
        </div>
        <div className="og-details">
          <div style={{ display: "block" }}>
            <props.details image={image} />
          </div>
        </div>
      </div>
      {!props.isFirst && <div className="og-previous" onClick={() => onLeftRight(-1)}></div>}
      {!props.isLast && <div className="og-next" onClick={() => onLeftRight(+1)}></div>}
    </div>
  );
}

export interface Size {
  width: number;
  height: number;
}
export interface Row<T> {
  height: number;
  images: readonly T[];
}

interface PartitionOptions {
  containerWidth: number;
  imageMargin: number;
  maxRowHeight: number;
}

function partitionIntoRows<T extends Size>(
  images: readonly T[],
  options: PartitionOptions
): Row<T>[] {
  const { containerWidth, imageMargin, maxRowHeight } = options;
  const rows: Row<T>[] = [];
  let currentRow: T[] = [];
  for (const image of images) {
    currentRow.push(image);
    let denom = 0;
    for (const image of currentRow) {
      denom += image.width / image.height;
    }
    const height = Math.round(
      (containerWidth - imageMargin * currentRow.length) / denom
    );
    if (height < maxRowHeight) {
      rows.push({ height: height, images: currentRow });
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    rows.push({ height: maxRowHeight, images: currentRow });
  }
  return rows;
}

function isElementScrollable(el: Element) {
  return el.scrollHeight > el.clientHeight;
}

function allParents(node: Element) {
  const els = [];
  let parent = node.parentElement;
  while (parent) {
    els.push(parent);
    parent = parent.parentElement;
  }
  return els;
}
