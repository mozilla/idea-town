import app from 'ampersand-app';

import BaseView from './base-view';

export default BaseView.extend({
  _template: `<section class="page {{#loggedIn}} loggedIn {{/loggedIn}}">
                {{^loggedIn}}
                  <h1>Introducing Idea Town</h1>
                  <p>We are building the next generation of Firefox features
                     and we want your feedback!
                  <p>Get started with a Firefox Account.
                  <a href="/accounts/login/?next=/home">Sign Up</button>
                {{/loggedIn}}
                {{#loggedIn}}
                  <h1>Thanks for Signing Up!</h1>
                  <p>Install the Idea Town add-on to participate in experiments
                     and give us feedback.
                  <a href="{{ downloadUrl }}">Install the Add-on</button>
                {{/loggedIn}}
              </section>`,

  render() {

    this.loggedIn = !!app.me.user.id;

    // TODO replace with an api endpoint that exposes idea town addon info?
    this.downloadUrl = app.me.addonUrl;

    BaseView.prototype.render.apply(this, arguments);
  }
});
