import React from 'react';
import { Link } from 'react-router-dom';
import { Like } from './facebook';

export function Header() {
  return (
    <div className="social-about">
      <div id="facebook">
        <Like
          // https would be better, but the like count is much lower.
          url="http://www.oldnyc.org"
          layout="button_count"
          id="header-like"
        />
      </div>
      <div id="twitter">
        <a
          href="http://twitter.com/share"
          className="twitter-share-button"
          data-count="horizontal"
          data-via="Old_NYC @NYPL"
        >
          Tweet
        </a>
      </div>

      <div id="about">
        <Link to="/about">About</Link>
      </div>

      <div id="mailing-list">
        <a target="_blank" href="http://eepurl.com/bouyCz">
          Subscribe
        </a>{' '}
        to OldNYC updates
      </div>
    </div>
  );
}
