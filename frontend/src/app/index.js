import "babel-polyfill/browser";
import "whatwg-fetch";
import Raven from "raven-js";
import moment from "moment";

import "./lib/ga-snippet";
import config from "./config";

import notfound from "../pages/notfound.js";
import error from "../pages/error.js";
import experiment from "../pages/experiment.js";
import experiments from "../pages/experiments.js";
import home from "../pages/home.js";
import onboarding from "../pages/onboarding.js";
import retire from "../pages/retire.js";
import news from "../pages/news.js";

Raven.config(config.ravenPublicDSN).install();
moment.locale(window.navigator.language);

const routes = {
  notfound,
  error,
  experiment,
  experiments,
  home,
  onboarding,
  retire,
  news
};

const name = document.body.dataset.pageName;
const param = document.body.dataset.pageParam;
if (name in routes) {
  routes[name](param);
} else {
  routes.error();
}
