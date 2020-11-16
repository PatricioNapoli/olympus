import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { store } from './store.js'
import { Provider } from "react-redux";
import { BrowserRouter as Router } from 'react-router-dom';

import "react-table/react-table.css";
import "semantic-ui-less/semantic.less";

import "./assets/css/json_editor.css"
import "./assets/css/react_table_overrides.css"

import JavascriptTimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import history from './history';

JavascriptTimeAgo.addLocale(en)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App store={store} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
