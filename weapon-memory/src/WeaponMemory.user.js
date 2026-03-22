// ==UserScript==
// @name         WWDead Weapon Memory
// @namespace    wwd-weapon-memory
// @version      1.0.0
// @author       xunoaib
// @description  Remembers last used weapon and attack target
// @include      /^https:\/\/wwdead\.com\/classic\/?(\?.*)?$/
// @grant        GM.setValue
// @grant        GM.getValue
// @license      GNU General Public License v2 or later; http://www.gnu.org/licenses/gpl.txt
// ==/UserScript==

// TODO:
// - Prevent "clobbering" when loading historical URLs.
// - Verify URL params against available select options before persisting to storage.

(async function() {
  'use strict';

  const profileLink = document.querySelector('div.gt a[href*="/profile/"]');
  if (!profileLink) return;
  const charId = profileLink.href.split('/').pop();

  const STORAGE_KEY = 'wwd_weapon-memory';
  let profiles = await GM.getValue(STORAGE_KEY, {});

  if (!profiles[charId]) {
    profiles[charId] = {};
  }

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

  if (dataChanged) {
    await GM.setValue(STORAGE_KEY, profiles);
  }

  const memory = profiles[charId];

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
