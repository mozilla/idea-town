// @flow

import classnames from "classnames";
import { Localized } from "fluent-react/compat";
import React from "react";

import LocalizedHtml from "../LocalizedHtml";

import { defaultState } from "../../reducers/newsletter-form";

import "./index.scss";

type NewsletterFormProps = {
  email?: string,
  privacy?: boolean,
  isModal?: boolean,
  subscribe?: Function,
  setEmail?: Function,
  setPrivacy?: Function,
  buttonRef?: Function
}

type NewsletterFormState = {
  privacyNote: boolean
}

export default class NewsletterForm extends React.Component {
  props: NewsletterFormProps
  state: NewsletterFormState
  handleEmailChange: Function
  handlePrivacyClick: Function
  handleSubmit: Function

  static defaultProps = defaultState();

  constructor(props: NewsletterFormProps) {
    super(props);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePrivacyClick = this.handlePrivacyClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      privacyNote: false
    };
  }

  makeRevealedClassNames() {
    return classnames("revealed-field", {
      reveal: !!this.props.email
    });
  }

  handleEmailChange(evt: Object) {
    if (typeof this.props.setEmail !== "undefined") {
      this.props.setEmail(evt.target.value);
    }
  }

  renderEmailField() {
    return (
      <Localized id="newsletterFormEmailPlaceholder">
        <input
          type='email'
          required
          value={this.props.email}
          onChange={this.handleEmailChange}
        />
      </Localized>
    );
  }

  handlePrivacyClick(evt: Object) {
    if (typeof this.props.setPrivacy !== "undefined") {
      this.props.setPrivacy(evt.target.checked);
    }
  }

  renderPrivacyField() {
    const fieldName = "privacy";
    const privacy = <Localized id="newsletterFormPrivacyNoticePrivacyLink">
      <a target="_blank" rel="noopener noreferrer"
        href="/privacy"/>
    </Localized>;

    return <div>
      <input name={fieldName} id={fieldName} type="checkbox" checked={this.props.privacy} required
        onChange={this.handlePrivacyClick} onClick={this.handlePrivacyClick} />
      <label className={this.makeRevealedClassNames()} htmlFor={fieldName}>
        <span className="newsletter-form__check" />
        { this.state.privacyNote ? <Localized id="newsletterFormPrivacyAgreementRequired">
          <span>
            Please check this box if you want to proceed.
          </span>
        </Localized> : null }
        <LocalizedHtml id="newsletterFormPrivacyNotice" $privacy={privacy}>
          <span>
            I&apos;m okay with Mozilla handling my info as explained in {privacy}.
          </span>
        </LocalizedHtml>
      </label>
    </div>;
  }

  renderSubmitButton() {
    if (this.props.submitting) {
      return (
        <Localized id='newsletterFormSubmitButtonSubmitting'>
          <button disabled={true} className="button outline large newsletter-form-submitting">
            Submitting...
          </button>
        </Localized>
      );
    }
    return <Localized id='newsletterFormSubmitButton'>
      <button className={classnames("button", "large", this.props.isModal ? "default" : "outline")}
        ref={this.props.buttonRef}>Sign Up Now</button>
    </Localized>;
  }

  renderDisclaimer() {
    return (
      <Localized id='newsletterFormDisclaimer'>
        <p className="disclaimer">
          We will only send you Test Pilot-related information.
        </p>
      </Localized>
    );
  }

  handleSubmit(evt: Object) {
    evt.preventDefault();
    if (!this.props.privacy) {
      this.setState({ privacyNote: true });
    } else {
      this.setState({ privacyNote: false });
      if (typeof this.props.subscribe !== "undefined") {
        this.props.subscribe(this.props.email);
      }
    }
  }

  render() {
    return (
      <form className={ classnames("newsletter-form", { "newsletter-form-modal": this.props.isModal }) }
        onSubmit={this.handleSubmit} data-no-csrf>
        {this.renderEmailField()}
        {this.renderPrivacyField()}
        {this.renderSubmitButton()}
        {this.renderDisclaimer()}
      </form>
    );
  }
}
