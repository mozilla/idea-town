/* global describe, it */
import React from "react";
import { expect } from "chai";
import sinon from "sinon";
import { mount } from "enzyme";

import NewsletterForm from "./index";

describe("app/components/NewsletterForm", () => {
  const makeSubject = (args = {}) => {
    const props = {
      subscribe: sinon.spy(),
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      ...args
    };
    return mount(<NewsletterForm {...props} />);
  };

  describe("email field", () => {
    const subject = makeSubject().find('input[type="email"]');

    it("should be rendered by default", () => {
      expect(subject).to.have.length(1);
    });
  });

  describe("privacy field", () => {
    it("should be hidden by default", () => {
      const subject = makeSubject().find("label");
      expect(subject.hasClass("reveal")).to.equal(false);
      expect(subject.hasClass("revealed-field")).to.equal(true);
    });

    it("should be shown when an email is entered", () => {
      const subject = makeSubject();
      subject.setState({email: "a"});
      const label = subject.find("label");
      expect(label.hasClass("reveal")).to.equal(true);
    });

    it("should be unchecked by default", () => {
      const subject = makeSubject().find('input[name="privacy"]');
      expect(subject.prop("checked")).to.be.undefined;
    });
  });

  describe("submit button", () => {
    it("should be rendered and enabled by default", () => {
      const subject = makeSubject().find("button");
      expect(subject).to.have.length(1);
      expect(subject.prop("disabled")).to.be.undefined;
    });

    it("should be disabled if submitting", () => {
      const subject = makeSubject({ isSubmitting: true }).find("button");
      expect(subject.prop("disabled")).to.equal(true);
    });

    it("should fire subscribe on submit", () => {
      const subscribe = sinon.spy();
      const subject = makeSubject({ subscribe, privacy: true }).find("form");
      subject.simulate("submit");
      expect(subscribe.calledOnce).to.equal(true);
    });
  });
});
