export default `
<section data-hook="landing-page">
  {{^loggedIn}}
    <div class="blue">
      <header id="main-header" class="content-wrapper">
        <h1>
          <span class="firefox-logo"></span>
          <span data-l10n-id="siteName">Firefox Test Pilot</span>
        </h1>
        <a data-l10n-id="landingFxaAlternateButton" href="/accounts/login/?next=/" class="button outline">Sign in</a>
      </header>
      <div class="centered-banner">
        <div class="copter-wrapper">
          <div class="copter fly-up"></div>
        </div>
        <h2>
          <span data-l10n-id="landingIntroOne">Test out new features.</span>
          <span data-l10n-id="landingIntroTwo">Give us feedback.</span>
          <span data-l10n-id="landingIntroThree">Help build Firefox.</span>
        </h2>
        <a data-l10n-id="landingFxaGetStartedButton" href="/accounts/login/?next=/" class="button large primary">Get started with a Firefox Account</a>
      </div>
      <p data-l10n-id="landingLegalNotice" class="legal-information">By proceeding, you agree to the <a href="https://www.mozilla.org/about/legal/terms/services/">Terms of Service</a> and <a href="https://www.mozilla.org/privacy/firefox-cloud/">Privacy Notice</a> of Test Pilot</p>
    </div>
    <div class="content-wrapper">
        <h2 class="experiment-list-header">Try these features today with Test Pilot</h2>
        <div data-hook='experiment-list'></div>
    </div>
    <div class="blue">
      <footer id="main-footer" class="content-wrapper">
        <div class="centered-banner">
          <div class="copter-wrapper">
            <div class="copter"></div>
          </div>
          <h2 data-l10n-id="landingPageFooterCopy">More tests coming soon!</h2>
          <a data-l10n-id="landingFxaGetStartedButton" href="/accounts/login/?next=/" class="button large primary">Get started with a Firefox Account</a>
        </div>
        <div data-hook="footer-view"></div>
      </footer>
    </div>
  {{/loggedIn}}
  {{#loggedIn}}
    <div id="full-page-wrapper" class="space-between">
      <header id="main-header" class="content-wrapper">
        <h1>
          <span class="firefox-logo"></span>
          <span data-l10n-id="siteName">Firefox Test Pilot</span>
        </h1>
      </header>
      <div class="centered-banner">
        <div class="copter-wrapper">
          <div class="copter fly-down"></div>
        </div>
        <h2>
          <span data-l10n-id="landingInstallHeaderOne">Install the Test Pilot Add-on</span>
          <span data-l10n-id="landingInstallHeaderTwo">and you're good to go!</span>
        </h2>
        <a href="{{ downloadUrl }}" class="button large default">
          <span data-l10n-id="landingInstallButton">Install the Add-on</span>
          <div class="state-change-inner no-display"></div>
        </a>
      </div>
      <footer id="main-footer" class="content-wrapper">
        <div data-hook="footer-view"></div>
      </footer>
    </div>
  {{/loggedIn}}
</section>
`;


