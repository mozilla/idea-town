import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { findLocalizedById } from '../util';

import RetireConfirmationDialog from '../../../src/app/components/RetireConfirmationDialog';

describe('app/components/RetireConfirmationDialog', () => {
  let props, mockClickEvent, subject;
  beforeEach(function() {
    props = {
      uninstallAddon: sinon.spy(),
      onDismiss: sinon.spy(),
      navigateTo: sinon.spy(),
      sendToGA: sinon.spy()
    };
    mockClickEvent = {
      preventDefault: sinon.spy()
    };
    subject = shallow(<RetireConfirmationDialog {...props} />);
  });

  it('should display expected content', () => {
    expect(subject.find('#retire-dialog-modal')).to.have.property('length', 1);
  });

  it('should call onDismiss when the cancel button is clicked', () => {
    subject.find('.modal-cancel').simulate('click', mockClickEvent);
    expect(props.onDismiss.called).to.be.true;
  });

  it('should uninstall the addon and ping GA when the proceed button is clicked', () => {
    findLocalizedById(subject, 'retireSubmitButton').find('button').simulate('click', mockClickEvent);
    expect(props.uninstallAddon.called).to.be.true;
    expect(props.navigateTo.called).to.be.true;
    expect(props.navigateTo.lastCall.args[0]).to.equal('/retire');
    expect(props.sendToGA.lastCall.args).to.deep.equal(['event', {
      eventCategory: 'HomePage Interactions',
      eventAction: 'button click',
      eventLabel: 'Retire'
    }]);
  });

});
