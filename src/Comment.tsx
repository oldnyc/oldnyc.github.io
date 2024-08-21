import React from 'react';

export interface CommentProps {
  url: string;
}

export function Comment(props: CommentProps) {
  const { url } = props;
  React.useEffect(() => {
    if (typeof FB != 'undefined') {
      const comments = document.querySelector('.comments');
      if (!comments) {
        console.log('no comments el');
        return;
      }
      const width = Math.round(
        comments.parentElement!.getBoundingClientRect().width,
      );
      comments.innerHTML = `
        <fb:comments
          data-numposts="5"
          data-colorscheme="light"
          data-href="${url}"
          data-width="${width}"
          data-version="v2.3"
        />`;
      // eslint-disable-next-line
      FB.XFBML.parse(comments);
    }
  }, [url]);

  return <div className="comments"></div>;
}

/*
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    if (detailsRef.current) {
      // TODO: track window resizes?
      setWidth(detailsRef.current.getBoundingClientRect().width);
    }
  }, [detailsRef]);
*/
