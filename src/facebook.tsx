/**
 * Why not use react-facebook?
 * See https://github.com/oldnyc/oldnyc.github.io/issues/30 for details, the gist
 * is that comments load much less reliably with whatever API it's using.
 */

import React from 'react';

export interface SocialProps {
  url: string;
}

export function Comment(props: SocialProps) {
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

export interface LikeProps extends SocialProps {
  id: string;
}

export function Like(props: LikeProps) {
  const { id, url } = props;
  React.useEffect(() => {
    if (typeof FB != 'undefined') {
      const like = document.getElementById(id);
      if (!like) {
        return;
      }
      like.innerHTML = `
        <fb:like
          layout="button"
          action="like"
          show_faces="false"
          share="true"
          href="${url}"
        />`;
      // eslint-disable-next-line
      FB.XFBML.parse(like);
    }
  }, [url]);

  return <div id={id}></div>;
}
