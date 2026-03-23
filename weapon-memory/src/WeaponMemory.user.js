// ==UserScript==
// @name         WWDead Weapon Memory
// @namespace    wwd-weapon-memory
// @version      1.0.0
// @author       xunoaib
// @description  Remembers last used weapon and attack target
// @include      /^https:\/\/wwdead\.com\/classic\/?(\?.*)?$/
// @grant        none
// @license      GNU General Public License v2 or later; http://www.gnu.org/licenses/gpl.txt
// ==/UserScript==

// TODO:
// - Prevent "clobbering" when loading historical URLs.
// - Verify URL params against available select options before persisting to storage.

(function() {
  'use strict';

  const STORAGE_KEY = 'wwd_weapon_memory';

  // identify character
  const profileLink = document.querySelector('div.gt a[href*="/profile/"]');
  if (!profileLink) return;
  const charId = profileLink.href.split('/').pop();

  // load data from localstorage
  let profiles = {};
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    profiles = rawData ? JSON.parse(rawData) : {};
  } catch (e) {
    console.error("Failed to parse weapon memory storage", e);
  }

  if (!profiles[charId]) {
    profiles[charId] = {};
  }

  // update memory from url params
  const urlParams = new URLSearchParams(window.location.search);
  const lastAttackParam = urlParams.get('lastAttack');
  const lastTargetParam = urlParams.get('lastTarget');
  let dataChanged = false;

  if (lastAttackParam) {
    profiles[charId].weapon = lastAttackParam;
    dataChanged = true;
  }
  if (lastTargetParam) {
    profiles[charId].target = lastTargetParam;
    dataChanged = true;
  }

  // save back to localstorage
  if (dataChanged) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }

  const memory = profiles[charId];

  // apply memory to dom
  if (memory.weapon) {
    const weaponSelect = document.querySelector('select[name="attackType"]');
    if (weaponSelect && [...weaponSelect.options].some(o => o.value === memory.weapon)) {
      weaponSelect.value = memory.weapon;
    }
  }

  if (memory.target) {
    const targetSelect = document.querySelector('select[name="targetId"]');
    if (targetSelect && [...targetSelect.options].some(o => o.value === memory.target)) {
      targetSelect.value = memory.target;
    }
  }
})();
