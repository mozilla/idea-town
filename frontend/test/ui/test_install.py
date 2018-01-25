import os
import datetime

import pytest
from pages.desktop.experiments import Experiments
from pages.desktop.home import Home
from pages.desktop.detail import Detail


@pytest.mark.nondestructive
@pytest.mark.skipif(os.environ.get('SKIP_INSTALL_TEST') is not None,
                    reason='Skip install on Release and Beta Firefox.')
def test_install_of_test_pilot_addon(
        base_url, selenium, firefox, notifications):
    """Check that the testpilot addon is installable and installs."""
    page = Home(selenium, base_url).open()
    if not page.featured.is_displayed:
        experiments = page.header.click_install_button()
        firefox.browser.wait_for_notification(
            notifications.AddOnInstallComplete
        ).close()
        assert experiments.welcome_popup.is_title_displayed()
    else:
        experiments = page.featured.click_install_button()
        firefox.browser.wait_for_notification(
            notifications.AddOnInstallComplete
        ).close()
        assert experiments.welcome_popup.is_title_displayed()


@pytest.mark.skipif(os.environ.get('SKIP_INSTALL_TEST') is not None,
                    reason='Skip install on Release and Beta Firefox.')
@pytest.mark.nondestructive
def test_bottom_install_button(base_url, selenium, firefox, notifications):
    page = Home(selenium, base_url).open()
    experiments = page.bottom_install_button()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallComplete).close()
    assert experiments.welcome_popup.is_title_displayed()


@pytest.mark.skipif(os.environ.get('SKIP_INSTALL_TEST') is not None,
                    reason='Skip install on Release and Beta Firefox.')
@pytest.mark.nondestructive
def test_install_and_enable(base_url, selenium, firefox, notifications):
    Home(selenium, base_url).open()
    experiments = Experiments(selenium, base_url)
    experiment = experiments.find_experiment(experiment='Dev Example')
    experiment.install_and_enable()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallComplete).close()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallConfirmation).install()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallComplete).close()
    assert Detail(selenium, base_url).enabled_popup.is_popup_displayed()


@pytest.mark.nondestructive
@pytest.mark.skipif(os.environ.get('SKIP_INSTALL_TEST') is not None,
                    reason='Skip install on Release and Beta Firefox.')
def test_enable_and_disable_experiment(
        base_url, selenium, firefox, notifications):
    """Test enabling of an experiment."""
    page = Home(selenium, base_url).open()
    selenium.add_cookie({'name': 'updates-last-viewed-date',
                         'value': datetime.datetime.now().isoformat(),
                         'max_age': 120,
                         'domain': 'example.com'})
    if not page.featured.is_displayed:
        experiments = page.header.click_install_button()
    else:
        experiments = page.featured.click_install_button()

    firefox.browser.wait_for_notification(
        notifications.AddOnInstallComplete).close()

    experiments.welcome_popup.close()

    experiment = experiments.find_experiment(experiment='Dev Example')
    experiment.enable()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallConfirmation).install()
    firefox.browser.wait_for_notification(
        notifications.AddOnInstallComplete).close()
    exp_detail = Detail(selenium, base_url)
    assert exp_detail.enabled_popup.is_popup_displayed()
    exp_detail.enabled_popup.close()
    experiment.disable()
    assert experiment.enable_button.is_displayed()
