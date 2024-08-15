import React from "react";

export function Header() {
  return (
    <div className="social-about">
      <div id="facebook">
        <div
          className="fb-like"
          data-href="http://www.oldnyc.org"
          data-layout="button_count"
          data-action="like"
          data-show-faces="false"
          data-share="true"
        ></div>
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
        <a href="/about.html">About</a>
      </div>

      <div id="mailing-list">
        <a target="_blank" href="http://eepurl.com/bouyCz">
          Subscribe
        </a>{" "}
        to OldNYC updates
      </div>
    </div>
  );
}
