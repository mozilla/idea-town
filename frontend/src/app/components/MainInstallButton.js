import React, { PropTypes } from 'react';
import classnames from 'classnames';

export default class MainInstallButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isInstalling: false
    };
  }

  install(evt, experimentTitle) {
    const { sendToGA, eventCategory, hasAddon, installAddon } = this.props;
    if (hasAddon) { return; }
    this.setState({ isInstalling: true });
    installAddon(this.context.store, sendToGA, eventCategory, experimentTitle);
  }

  render() {
    const { isFirefox, isMinFirefox, hasAddon } = this.props;
    const isInstalling = this.state.isInstalling && !hasAddon;
    const experimentTitle = ('experimentTitle' in this.props &&
                             this.props.experimentTitle);

    return (
      <div>
        {(isMinFirefox) ? this.renderInstallButton(experimentTitle, isInstalling, hasAddon) : this.renderAltButton(isFirefox) }
        {isMinFirefox && <p data-l10n-id="landingLegalNotice" className="legal-information">By proceeding,
          you agree to the <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Notice</a> of Test Pilot</p>}
      </div>
    );
  }

  renderInstallButton(experimentTitle, isInstalling, hasAddon) {
    return (
      <div>
        <button onClick={e => this.install(e, experimentTitle)} data-hook="install"
                className={classnames('button extra-large primary install', { 'state-change': isInstalling })}>
          {hasAddon && <span className="progress-btn-msg" data-l10n-id="landingInstallingButton">Installed</span>}
          {!hasAddon && !isInstalling &&
            <span className="default-btn-msg" data-l10n-id="landingInstallButton">Install the Test Pilot Add-on</span>}
          {!hasAddon && isInstalling &&
            <span className="progress-btn-msg" data-l10n-id="landingInstallingButton">Installing...</span>}
          <div className="state-change-inner"></div>
        </button>
      </div>
    );
  }


  renderAltButton(isFirefox) {
    return (
      <div>
          {(!isFirefox) ? (
              <span data-l10n-id="landingDownloadFirefoxDesc" className="parens">(Test Pilot is available for Firefox on Windows, OS X and Linux)</span>
            ) : (
              <span className="parens" data-l10n-id="landingUpgradeDesc">Test Pilot requires Firefox 45 or higher.</span>
            )
          }
          <a href="https://www.mozilla.org/firefox" className="button primary download-firefox">
            <div className="button-icon">
              <div className="button-icon-badge"></div>
            </div>
            <div className="button-copy">
              {(!isFirefox) ? (
                  <div data-l10n-id="landingDownloadFirefoxTitle" className="button-title">Firefox</div>
                ) : (
                  <div data-l10n-id="landingUpgradeFirefoxTitle" className="button-title">Upgrade Firefox</div>
                )
              }
              <div data-l10n-id="landingDownloadFirefoxSubTitle" className="button-description">Free Download</div>
            </div>
          </a>
      </div>
    );
  }
}

MainInstallButton.contextTypes = {
  store: PropTypes.object.isRequired
};
