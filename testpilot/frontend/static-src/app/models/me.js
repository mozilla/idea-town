import app from 'ampersand-app';
import cookies from 'js-cookie';
import Model from 'ampersand-model';

// Abstract away the underlying django cookies by making them
// observable, derived properties.
// TODO: session cookies aren't visible to JS by default; switch to
//       some kind of session-check API that sends over the user model
//       (email, name, avatar, addon status) if the user's logged in.
export default Model.extend({
  url: '/api/me',

  props: {
    user: 'object',
    clientUUID: 'string',
    installed: {type: 'object', default: () => {}},
    hasAddon: {type: 'boolean', required: true, default: false},
    addonTimeout: {type: 'number', default: 1000}
  },

  derived: {
    csrfToken: {
      cache: false,
      fn: () => { return cookies.get('csrftoken'); }
    }
  },

  initialize() {
    this.hasAddon = Boolean(window.navigator.testpilotAddon);
    app.on('webChannel:addon-self:installed', () => this.hasAddon = true);
    app.on('webChannel:addon-self:uninstalled', () => this.hasAddon = false);
  },

  fetch() {
    return fetch(this.url, {
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    }).then((response) => response.json()).then((userData) => {
      this.user = userData;
      if (!this.user.profile) { return false; }

      this.hasAddon = Boolean(window.navigator.testpilotAddon);
      if (!this.hasAddon) { return false; }

      return app.waitForMessage('sync-installed', userData.installed)
        .then(result => {
          this.clientUUID = result.clientUUID;
          this.installed = result.installed;
        });
    });
  },

  updateEnabledExperiments(experiments) {
    if (!this.installed) { return; }
    experiments.forEach(experiment => {
      experiment.enabled = !!this.installed[experiment.addon_id];
    });
  }

});
