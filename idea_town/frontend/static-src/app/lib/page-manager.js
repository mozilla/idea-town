import app from 'ampersand-app';
import AmpersandViewSwitcher from 'ampersand-view-switcher';

import ErrorPage from '../views/error-page';
import ExperimentPage from '../views/experiment-page';
import HeaderView from '../views/header-view';
import ScrollHeaderView from '../views/scroll-header-view';
import HomePage from '../views/home-page';
import LandingPage from '../views/landing-page';
import NotFoundPage from '../views/not-found-page';

// PageManager is an ampersand-view-switcher wrapper
//
// * Acts as a Dispatcher: Router converts URL to event, this class subscribes
//   to the event, creates the page, and swaps it in
export default class PageManager {
  constructor(opts) {
    if (!opts.pageContainer) {
      throw new Error('PageManager constructor must be passed a pageContainer element');
    }

    this.header = document.querySelector('header');

    this.pages = {
      'landing': LandingPage,
      'home': HomePage,
      'experimentDetail': ExperimentPage,
      'notFound': NotFoundPage,
      'error': ErrorPage
    };

    this._viewSwitcher = new AmpersandViewSwitcher(opts.pageContainer);
    app.on('router:new-page', this.onNewPage.bind(this));
  }

  onNewPage(data) {
    const page = data && data.page;
    const opts = data && data.opts;
    if (page in this.pages) {
      // instantiate new page
      const Ctor = this.pages[page];
      const newPage = new Ctor(opts);

      if (newPage.headerScroll) {
        this.headerView = new ScrollHeaderView(opts);
      } else {
        this.headerView = new HeaderView();
      }

      this.headerView.render();
      this.header.innerHTML = '';
      this.header.appendChild(this.headerView.el);
      // load new page
      this._viewSwitcher.set(newPage);
    } else {
      // if the router is broken, it's better to show the user an error page
      // than to do nothing or show a broken, blank page
      console.error('PageManager: Unknown page requested: ' + page); // eslint-disable-line no-console
      app.router.redirectTo('error');
    }
  }
}
