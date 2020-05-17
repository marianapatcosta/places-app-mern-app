import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import { AuthContext } from "./shared/context/auth-context";
//import Authentication from "./user/pages/Authentication/Authentication";
//import NewPlace from "./places/pages/NewPlace/NewPlace";
import MainNavigation from "./shared/Navigation/MainNavigation/MainNavigation";
//import UpdatePlace from "./places/pages/UpdatePlace/UpdatePlace";
//import Users from "./user/pages/Users";
//import UserPlaces from "./places/pages/UserPlaces/UserPlaces";
import useAuth from "./shared/Hooks/auth-hook";
import LoadingSpinner from "./shared/UIElements/LoadingSpinner/LoadingSpinner";

const Users = React.lazy(() => import("./user/pages/Users"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces/UserPlaces"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace/NewPlace"));
const UpdatePlace = React.lazy(() =>
  import("./places/pages/UpdatePlace/UpdatePlace")
);
const Authentication = React.lazy(() =>
  import("./user/pages/Authentication/Authentication")
);

const App = () => {
  const [token, login, logout, userId] = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId" exact>
          {/* This route must be after /places/new otherwise every path containing "/places/xxx will enter this route; 
  ex "/new will be considered an id*/}
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/login" exact>
          <Authentication />
        </Route>
        <Redirect to="/login" />
      </Switch>
    );
  }

  //every route/component wrapped in AuthContext can access to this context; when login changes, this value wil be passed
  //to all the components accessing the context
  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!token, token, userId, login, logout }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
