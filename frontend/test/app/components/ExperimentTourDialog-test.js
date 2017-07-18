import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { findLocalizedById } from '../util';

import ExperimentTourDialog from '../../../src/app/components/ExperimentTourDialog';

describe('app/components/ExperimentTourDialog', () => {
  let props, mockClickEvent, subject;
  beforeEach(() => {
    mockClickEvent = { preventDefault: sinon.spy() };

    props = {
      experiment: {
        title: 'Test Experiment',
        slug: 'test',
        tour_steps: [
          { image: '/example1.png', copy: 'Example 1', copy_l10nsuffix: 'foo' },
          { image: '/example2.png', copy: 'Example 2' },
          { image: '/example3.png', copy: 'Example 3' },
        ]
      },
      isExperimentEnabled: () => true,
      sendToGA: sinon.spy(),
      onComplete: sinon.spy(),
      onCancel: sinon.spy()
    };

    subject = mount(<ExperimentTourDialog {...props} />);
  });

  it('should render expected default content', () => {
    expect(findLocalizedById(subject, 'tourOnboardingTitle').prop('$title'))
      .to.equal(props.experiment.title);

    const expectedTourStep = props.experiment.tour_steps[0];
    expect(subject.find('.tour-image > img').prop('src'))
      .to.equal(expectedTourStep.image);
    // There is now a LocalizedHtml element between the
    // .tour-text element and the p element, so
    // '.tour-text > p' won't work, but '.tour-text p' does
    expect(subject.find('.tour-text p').html())
      .to.include(expectedTourStep.copy);
  });

  it('should render only the experiment title if not enabled', () => {
    subject.setProps({ isExperimentEnabled: () => false,
                       experiment: { ...props.experiment } });
    expect(subject.find('.modal-header').text()).to.equal(props.experiment.title);
  });

  it('should have the correct l10n IDs', () => {
    expect(findLocalizedById(subject, 'testToursteps0CopyFoo').length).to.equal(1);
  });

  it('should not have l10n IDs if the experiment is dev-only', () => {
    subject.setProps({ experiment: { dev: true, ...props.experiment } });
    expect(subject.find('.tour-text > Localized').prop('id')).to.equal(null);
  });

  it('should advance one step and ping GA when the next button is clicked', () => {
    subject.find('.tour-next').simulate('click', mockClickEvent);

    const expectedTourStep = props.experiment.tour_steps[1];
    expect(subject.find('.tour-image > img').prop('src'))
      .to.equal(expectedTourStep.image);
    expect(subject.find('.tour-text').html())
      .to.include(expectedTourStep.copy);

    expect(subject.state('currentStep')).to.equal(1);

    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: `forward to step 1`
    }]);
  });

  it('should rewind one step and ping GA when the back button is clicked', () => {
    expect(subject.find('.tour-back').hasClass('hidden')).to.be.true;
    subject.setState({ currentStep: 1 });
    expect(subject.find('.tour-back').hasClass('hidden')).to.be.false;

    subject.find('.tour-back').simulate('click', mockClickEvent);

    const expectedTourStep = props.experiment.tour_steps[0];
    expect(subject.find('.tour-image > img').prop('src'))
      .to.equal(expectedTourStep.image);
    expect(subject.find('.tour-text').html())
      .to.include(expectedTourStep.copy);

    expect(subject.state('currentStep')).to.equal(0);

    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: `back to step 0`
    }]);
  });

  it('should render dots to indicate and choose tour steps', () => {
    expect(subject.find('.tour-image .dot'))
      .to.have.property('length', props.experiment.tour_steps.length);

    subject.setState({ currentStep: 2 });
    expect(subject.find('.tour-image .dot').at(2).hasClass('current')).to.be.true;

    subject.find('.tour-image .dot').at(0).simulate('click', mockClickEvent);

    expect(subject.state('currentStep')).to.equal(0);

    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: `dot to step 0`
    }]);
  });

  it('should ping GA and call onCancel when cancel button clicked', () => {
    subject.find('.modal-cancel').simulate('click', mockClickEvent);

    expect(props.onCancel.called).to.be.true;

    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'cancel tour'
    }]);
  });

  it('should ping GA and call onComplete when done button clicked', () => {
    expect(subject.find('.tour-next').hasClass('no-display')).to.be.false;
    expect(subject.find('.tour-done').hasClass('no-display')).to.be.true;
    subject.setState({ currentStep: 2 });
    expect(subject.find('.tour-next').hasClass('no-display')).to.be.true;
    expect(subject.find('.tour-done').hasClass('no-display')).to.be.false;

    subject.find('.tour-done').simulate('click', mockClickEvent);

    expect(props.onComplete.called).to.be.true;

    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'complete tour'
    }]);
  });
});
