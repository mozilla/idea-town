// @flow
import { Localized } from 'fluent-react/compat';
import React from 'react';

import Copter from '../components/Copter';
import LayoutWrapper from '../components/LayoutWrapper';
import View from '../components/View';

type SharePageProps = {
  hasAddon: any,
  uninstallAddon: Function,
  sendToGA: Function,
  openWindow: Function
}


export default class SharePage extends React.Component {
  props: SharePageProps

  render() {
    return (
      <View spaceBetween={true} showNewsletterFooter={false} {...this.props}>
        <LayoutWrapper flexModifier="column-center">
          <div id="share" className="modal">
            <div className="modal-content centered">
              <Localized id="sharePrimary">
                <p>Love Test Pilot? Help us find some new recruits.</p>
              </Localized>
              <ul className="share-list">
                <li className="share-facebook"><a href={'https://www.facebook.com/sharer/sharer.php?u=' + this.shareUrl('facebook', true)} onClick={this.handleClick('facebook')} target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li className="share-twitter"><a href={'https://twitter.com/home?status=' + this.shareUrl('twitter', true)} onClick={this.handleClick('twitter')} target="_blank" rel="noopener noreferrer">Twitter</a></li>
                <li className="share-email">
                  <Localized id="shareEmail">
                    <a href={'mailto:?body=' + this.shareUrl('email', true)} onClick={this.handleClick('email')}>E-mail</a>
                  </Localized>
                </li>
              </ul>
              <Localized id="shareSecondary">
                <p>or just copy and paste this link...</p>
              </Localized>
              <fieldset className="share-url-wrapper">
                <div className="share-url">
                  <input type="text" readOnly value={this.shareUrl('copy', false)} />
                  <Localized id="shareCopy">
                    <button onClick={this.handleClick('copy')} data-clipboard-target=".share-url input">Copy</button>
                  </Localized>
                </div>
              </fieldset>
            </div>
          </div>
          <Copter animation="fade-in-fly-up" />
        </LayoutWrapper>
      </View>
    );
  }

  shareUrl(medium: string, urlencode: boolean) {
    const url = `https://testpilot.firefox.com/?utm_source=${medium}&utm_medium=social&utm_campaign=share-page`;
    return urlencode ? encodeURIComponent(url) : url;
  }

  handleClick(label: string) {
    return () => this.props.sendToGA('event', {
      eventCategory: 'ShareView Interactions',
      eventAction: 'button click',
      eventLabel: label
    });
  }
}
