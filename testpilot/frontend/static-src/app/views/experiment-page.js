import app from 'ampersand-app';
import Model from 'ampersand-model';
import Collection from 'ampersand-collection';
import querystring from 'querystring';

import PageView from './page-view';
import DetailView from './detail-view';
import ContributorView from './contributor-view';
import template from '../templates/experiment-page';
import DisableDialogView from './disable-dialog-view';

const changeHeaderOn = 127;

const CollectionExtended = Collection.extend({
  model: Model.extend({
    extraProperties: 'allow'
  })
});

export default PageView.extend({
  template: template,

  headerScroll: true,

  events: {
    'click [data-hook=install]': 'install',
    'click [data-hook=uninstall]': 'renderUninstallSurvey',
    'click [data-hook=feedback]': 'feedback'
  },

  bindings: {

    'model': {
      hook: 'bg',
      type: function setGradientBg(el, model) {
        el.setAttribute('style', `background: linear-gradient(135deg, ${model.gradient_start},
                                                                     ${model.gradient_stop}`);
        return el;
      }
    },

    'model.title': {
      type: 'text',
      hook: 'title'
    },

    'model.enabled': [{
      type: 'toggle',
      yes: '[data-hook=uninstall]',
      no: '[data-hook=install]'
    },
    {
      type: 'toggle',
      hook: 'feedback'
    },
    {
      type: 'toggle',
      hook: 'now-active'
    }],

    'model.modified': {
      type: (el, value) => {
        const d = new Date(value);

        // check for invalid date
        if (isNaN(d)) {
          el.style.display = 'none';
          return;
        }

        let formatted = '';

        // safari is the new IE :(
        try {
          formatted = d.toLocaleDateString();
        } catch (e) {
          formatted = `${d.getMonth() + 1} / ${d.getDate()} / ${d.getFullYear()}`;
        }

        el.innerHTML = formatted;
      },
      hook: 'modified-date'
    },

    'model.version': {
      hook: 'version'
    },

    'model.installation_count': {
      hook: 'install-count'
    },

    'model.contribute_url': [{
      hook: 'contribute-url'
    },
    {
      type: 'attribute',
      name: 'href',
      hook: 'contribute-url'
    }],

    'model.introduction': [{
      type: 'innerHTML',
      hook: 'introduction-html'
    },
    {
      type: 'toggle',
      hook: 'introduction-container',
      mode: 'visibility'
    }],

    'model.measurements': [{
      type: 'innerHTML',
      hook: 'measurements-html'
    },
    {
      type: 'toggle',
      hook: 'measurements-container'
    }],

    'model.privacy_notice_url': [{
      type: 'toggle',
      hook: 'privacy-notice-url',
      mode: 'visibility'
    },
    {
      type: 'attribute',
      name: 'href',
      hook: 'privacy-notice-url'
    }],

    'model.changelog_url': [{
      type: 'toggle',
      hook: 'changelog-url',
      mode: 'visibility'
    },
    {
      type: 'attribute',
      name: 'href',
      hook: 'changelog-url'
    }],

    'model.thumbnail': {
      type: 'attribute',
      name: 'src',
      hook: 'thumbnail'
    }
  },

  initialize(opts) {
    this.model = app.experiments.get(opts.slug, 'slug');

    this.didScroll = false;

    window.addEventListener('scroll', function scrollListener() {
      if (!this.didScroll) {
        this.didScroll = true;
        setTimeout(this.onScroll.bind(this), 50);
      }
    }.bind(this));

    this.pageTitle = 'Test Pilot - ' + this.model.title;
    this.pageTitleL10nID = 'pageTitleExperiment';
  },

  render() {
    PageView.prototype.render.apply(this, arguments);
    app.sendToGA('pageview', {
      'dimension4': this.model.enabled,
      'dimension5': this.model.title,
      'dimension6': this.model.installation_count
    });
    return this;
  },

  afterRender() {
    this.renderCollection(new CollectionExtended(this.model.details),
                          DetailView,
                          this.query('.details-list'));

    this.renderCollection(new CollectionExtended(this.model.contributors),
                          ContributorView,
                          this.query('.contributors'));

    PageView.prototype.afterRender.apply(this, arguments);
  },

  remove() {
    PageView.prototype.remove.apply(this, arguments);
  },

  // isInstall is a boolean: true if we are installing, false if uninstalling
  updateAddon(isInstall, model) {
    let eventType = 'install-experiment';

    if (!isInstall) {
      eventType = 'uninstall-experiment';
    }

    app.webChannel.sendMessage(eventType, {
      addon_id: model.addon_id,
      xpi_url: model.xpi_url
    });
  },

  install(evt) {
    evt.preventDefault();
    const width = evt.target.offsetWidth;
    evt.target.style.width = width + 'px';
    evt.target.classList.add('state-change');

    // TODO: Should this maybe be an event listener at a global level?
    app.once('webChannel:addon-install:install-ended', () => {
      this.model.enabled = true;
      evt.target.classList.remove('state-change');
      this.model.set('installation_count', this.model.installation_count + 1);
      this.model.fetch();
    });
    this.updateAddon(true, this.model);
    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Enable Experiment'
    });
  },

  uninstall(evt) {
    evt.preventDefault();
    const width = evt.target.offsetWidth;
    evt.target.style.width = width + 'px';
    evt.target.classList.add('state-change');

    // TODO: Should this maybe be an event listener at a global level?
    app.once('webChannel:addon-uninstall:uninstall-ended', () => {
      this.model.enabled = false;
      evt.target.classList.remove('state-change');
      if (this.model.installation_count > 0) {
        this.model.set('installation_count', this.model.installation_count - 1);
      }
      this.model.fetch();
    });
    this.updateAddon(false, this.model);
  },

  renderUninstallSurvey(evt) {
    evt.preventDefault();

    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Disable Experiment'
    });

    const queryParams = querystring.stringify({ref: 'disable', experiment: this.model.title});

    this.renderSubview(new DisableDialogView({
      id: 'disabled-feedback',
      experiment: this.model.url,
      title: 'feedbackUninstallTitle',
      surveyUrl: `${this.model.survey_url}?${queryParams}`,
      onSubmit: () => this.uninstall(evt)
    }), 'body');
  },

  onScroll() {
    const sy = window.pageYOffset || document.documentElement.scrollTop;

    if (sy > changeHeaderOn) {
      this.query('.details-header-wrapper').classList.add('stick');
    } else {
      this.query('.details-header-wrapper').classList.remove('stick');
    }

    this.didScroll = false;
  },

  feedback(evt) {
    evt.preventDefault();

    const queryParams = querystring.stringify({ref: 'givefeedback', experiment: this.model.title});

    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'Give Feedback',
      newTab: true,
      outboundURL: `${this.model.survey_url}?${queryParams}`
    });
  }
});
