#!/bin/bash
set -ex
export PATH=~/project/firefox:$PATH

# Skip builds for Pontoon commits
IS_PONTOON=$(git show -s --format=%s | grep -q 'Pontoon:' && echo 'true' || echo '')
if [[ $IS_PONTOON ]]; then
  echo "Skipping Integration Tests on Pontoon commit.";
  exit 0;
fi

mozinstall $(ls -t firefox-downloads/firefox/*.tar.bz2 | head -1)
firefox --version
export PYTEST_ADDOPTS=--html=integration-test-results/ui-test-release.html
export SKIP_INSTALL_TEST=True
tox -e ui-tests
