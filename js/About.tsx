import React from "react";
import { useHistory } from "react-router-dom";

export function About() {
  const history = useHistory();
  const exit = () => {
    history.push("/");
  };

  return (
    <div id="about-page">
      <div className="curtains" onClick={exit}></div>
      <div id="exit-about" className="exit" title="Exit About" onClick={exit}>
        ✕
      </div>
      <div className="container">
        <iframe
          src="/about.html"
          scrolling="auto"
          frameBorder="0"
          width="100%"
          height="100%"
        ></iframe>
      </div>
    </div>
  );
}
