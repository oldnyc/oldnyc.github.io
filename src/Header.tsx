import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="social-about">
      <div id="about">
        <Link to="/about">About</Link>
      </div>

      <div id="mailing-list" className="hide-mobile">
        <a
          data-eo-form-toggle-id="b3f8e7de-19a8-11f1-a864-abd7d45650c1"
          href="#"
        >
          Subscribe
        </a>{' '}
        to OldNYC updates
      </div>
    </div>
  );
}
