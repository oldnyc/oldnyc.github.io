import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  Route,
  Switch,
} from "react-router-dom";

/*
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/#g::lat,:lon',
    element: <Sub />,
  },
  {
    path: '/#:photo_id,g::lat,:lon',
    element: <Sub />,
  },
  {
    path: '/#:photo_id',
    element: <Sub />,
  }
])
*/


const root = createRoot(document.querySelector("#app")!);
root.render(
  <React.StrictMode>
    <HashRouter basename="" hashType="noslash">
      <Switch>
        <Route path="/:photo_id">
          Photoblah
        </Route>
        <Route path="">
          Root2 <Link to="/123456">link</Link>
        </Route>
      </Switch>
    </HashRouter>
  </React.StrictMode>
);
