/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import { configure } from '@storybook/react';

import '../frontend/build/static/styles/experiments.css';
import '../frontend/build/static/styles/main.css';

const reqInSrcTree = require.context('../frontend/src/app', true, /\/stories.jsx?$/);

function loadStories() {
  reqInSrcTree.keys().forEach((filename) => reqInSrcTree(filename));
}

configure(loadStories, module);
