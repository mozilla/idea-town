/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global browser */

import PubSub from "pubsub-js";

import allTopics from "../../lib/topics";
import { log } from "./utils";
import { sendBootstrapMessage } from "./bootstrap";

export const bootstrapTopics = (...args) => allTopics("bootstrap", ...args);
export const webExtensionTopics = (...args) =>
  allTopics("webExtension", ...args);
export const environmentTopics = (...args) =>
  webExtensionTopics("environment", ...args);


const RESOURCE_UPDATE_INTERVAL = 1000 * 60 * 60 * 4; // 4 hours

const resources = {
  experiments: null,
  news_updates: null
};

let currentEnvironment = {
  name: "production",
  baseUrl: "https://testpilot.firefox.com"
};

export function getCurrentEnv() {
  return currentEnvironment;
}

function getEnvironment(onSuccess, onErr) {
  browser.storage.local.get("environment")
    .then((result) => {
      onSuccess(result.environment);
    }, onErr);
}

export async function setupEnvironment() {
  log("setupEnvironment");
  setInterval(fetchResources, RESOURCE_UPDATE_INTERVAL);
  browser.storage.onChanged.addListener((changes) => {
    Object.keys(changes).forEach((k) => {
      if (k === 'environment') {
        currentEnvironment = changes[k];
        fetchResources();
      }
    });
  });
}

export function getResources() {
  return resources;
}

async function fetchResources() {
  log("fetchResources");
  return Promise.all(
    Object.keys(resources).map(path =>
      fetch(`${currentEnvironment.baseUrl}/api/${path}.json`)
        .then(response => response.json())
        .then(data => [path, data])
        .catch(err => {
          log("fetchResources error", path, err);
          return [path, null];
        })
    )
  ).then(results => {
    log("fetchResources results", results);
    results.forEach(([path, data]) => (resources[path] = data));
    PubSub.publish(environmentTopics("resources"), resources);
  });
}
