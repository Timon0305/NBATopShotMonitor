/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import MomentPage from './containers/MomentPage';
import AccountPage from './containers/AccountPage';
import ActivityPage from './containers/ActivityPage'

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.MOMENT} component={MomentPage} />
        <Route path={routes.ACCOUNT} component={AccountPage} />
        <Route path={routes.ACTIVITY} component={ActivityPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
