import React, { Component } from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import AppNav from './web-components/AppNav';
import BrandingBar from './web-components/BrandingBar';
import axios from 'axios';

import About from './components/About';
import Points from './components/Points';
import Goals from './components/Goals';

class App extends Component {

  render() {
    return (
      <div style={styles.container}>
        <Route exact path='/race/prem' component={Points} />
        <Route exact path='/gd' component={Goals} />
        <Route exact path="/" render={() => {
          return <Redirect to="/gd" />
        }}/>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
}

export default withRouter(App);
