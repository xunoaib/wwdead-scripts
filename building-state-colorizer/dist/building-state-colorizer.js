// ==UserScript==
// @name                WWDead Building State Colorizer
// @namespace           wwdead-building-state-colorizer
// @version             1.1.1
// @description         Colorizes a building's barricade level, door, ransack and ruin status, and machinery condition (WWDead compatible)
// @author              Ville Jokela
// @author              Bradley Sattem
// @contributor         DTTL — rewrite and modernization
// @include             https://wwdead.com/classic*
// @run-at              document-idle
// @grant               none
// @license             GNU General Public License v2 or later; http://www.gnu.org/licenses/gpl.txt
// @downloadURL         https://greasyfork.org/en/scripts/567666-wwdead-building-state-colorizer.user.js
// @updateURL           https://greasyfork.org/en/scripts/567666-wwdead-building-state-colorizer.meta.js
// ==/UserScript==
/**
 * Original Script:
 *   UD Building State Colorizer
 *   © 2010 Bradley Sattem -- bradkun@gmail.com
 *   © 2008 Ville Jokela -- midianian@mbnet.fi
 *
 * Initial Adaptation for World Wide Dead:
 *   © 2026 DTTL
 *
 * Thanks to xikkub and the Urban Dead/World Wide Dead scripting community for inspiration.
 *

 *
 * License:
 *   GNU General Public License v2 or later
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * This script is a derivative work of the original
 * Urban Dead userscript and is distributed under
 * the terms of the GPL.
 */

(function () {
    'use strict';

// ==================================================
// USER CUSTOMIZATION (EDIT HERE)
// ==================================================
// The section below controls ALL colors used by the script.
//
// ─────────────────────────────────────────────────
// HOW TO CHANGE COLORS
// ─────────────────────────────────────────────────
// Each setting uses a color value. You can use:
//
//   • Hex codes:      #ff0000 (red), #00ff00 (green), #3af (short form)
//   • Named colors:   red, cyan, orange
//   • 'inherit':      Uses the game's default text color
//
// 👉 Pick colors here:
// https://www.w3schools.com/colors/colors_picker.asp
//
// ─────────────────────────────────────────────────
// TEXT OUTLINE (SHADOW)
// ─────────────────────────────────────────────────
// enableTextShadow:
//   • true  → Adds a black outline (recommended)
//   • false → No outline (cleaner but harder to read)
//
// outlineShadow:
//   • Controls the outline style
//   • Default = full black outline
//   • Advanced users can tweak this or set to 'none'
//
// ─────────────────────────────────────────────────
// COLOR LEGEND (WHAT THESE MEAN)
// ─────────────────────────────────────────────────
//
// Barricades:
//   eHB  = Extremely Heavily Barricaded
//   VHB  = Very Heavily Barricaded
//   HB   = Heavily Barricaded
//   VSB  = Very Strongly Barricaded
//   QSB  = Quite Strongly Barricaded
//   LB   = Lightly Barricaded
//   LoB  = Loosely Barricaded
//
// Doors:
//   doorsOpen     = Open / destroyed doors
//   doorsSecured  = Secured doors
//
// Building State:
//   ransacked = Looted buildings
//   ruined    = Ruined buildings
//   lightsOut = No power
//
// Generators:
//   genBad      = Badly damaged
//   genDamaged  = Damaged
//   genBattered = Battered
//   genDented   = Light damage
//
// Fuel:
//   lowFuel = Low fuel warnings
//
// ─────────────────────────────────────────────────
// PRESET THEMES (OPTIONAL)
// ─────────────────────────────────────────────────
// You can quickly switch styles by copying one of these
// into the "colors" section below.
//
// ▶ Classic (default-ish):
//   Blues = barricades, Reds = danger
//
// ▶ High Contrast:
//   Use brighter colors for visibility
//   Example:
//     VHB: '#00f',
//     HB:  '#0ff',
//     LB:  '#ff0',
//     LoB: '#f80'
//
// ▶ Minimal:
//   Use mostly 'inherit' to reduce noise
//   Example:
//     eHB: 'inherit',
//     VHB: 'inherit',
//     HB:  'inherit'
//
// ▶ Danger Mode:
//   Everything important = red/orange tones
//
// Tip: You can mix and match—no need to follow a preset exactly.
//
// ─────────────────────────────────────────────────
// 🔄 RESET TO DEFAULT
// ─────────────────────────────────────────────────
// If something breaks:
//
//   1. Reinstall/update the script
//   OR
//   2. Replace this section with the original version
//
// ─────────────────────────────────────────────────
// 💡 EXTRA TIPS
// ─────────────────────────────────────────────────
// • Bright colors are easier to see at a glance
// • Use text shadow if colors feel hard to read
// • Keep similar things in similar colors (helps scanning)
//
// ==================================================

    const SETTINGS = {
        enableTextShadow: true,

        outlineShadow: `
            -1px -1px 0 #000,
             1px -1px 0 #000,
            -1px  1px 0 #000,
             1px  1px 0 #000
        `,

        colors: {
            // Barricades
            eHB: 'inherit',
            VHB: '#3af',
            HB: '#3ff',
            VSB: '#3fa',
            QSB: '#af3',
            LB: '#ff3',
            LoB: '#fa3',

            // Doors
            doorsOpen: '#a00',
            doorsSecured: '#f33',

            // States
            ransacked: '#a00',
            ruined: '#333',
            lightsOut: '#838131',

            // Generators
            genBad: '#a00',
            genDamaged: '#f33',
            genBattered: '#fa3',
            genDented: '#ff3',

            // Fuel
            lowFuel: '#faa'
        }
    };

    // ==================================================
    // HIGHLIGHT RULES
    // ==================================================
    function getHighlights() {
        return [
            { str: 'lights out', colour: SETTINGS.colors.lightsOut, bold: true },

            { str: 'extremely heavily barricaded', colour: SETTINGS.colors.eHB, underline: true },
            { str: 'very heavily barricaded', colour: SETTINGS.colors.VHB },
            { str: 'heavily barricaded', colour: SETTINGS.colors.HB },
            { str: 'very strongly barricaded', colour: SETTINGS.colors.VSB, bold: true, underline: true },
            { str: 'quite strongly barricaded', colour: SETTINGS.colors.QSB },
            { str: 'lightly barricaded', colour: SETTINGS.colors.LB },
            { str: 'loosely barricaded', colour: SETTINGS.colors.LoB, bold: true },

            { str: 'have been secured', colour: SETTINGS.colors.doorsSecured, bold: true },
            { str: 'left wide open', colour: SETTINGS.colors.doorsOpen, bold: true },
            { str: 'hang open', colour: SETTINGS.colors.doorsOpen, bold: true },
            { str: 'ragged rectangle has been cut', colour: SETTINGS.colors.doorsOpen, bold: true },
            { str: 'opens directly onto the street', colour: SETTINGS.colors.doorsOpen, bold: true },

            { str: 'ransacked by looters', colour: 'inherit' },
            { str: 'ransacked', colour: SETTINGS.colors.ransacked },

            { str: 'has been ruined', colour: SETTINGS.colors.ruined },
            { str: 'has fallen into ruin', colour: SETTINGS.colors.ruined },
            { str: 'are ruined', colour: SETTINGS.colors.ruined },

            { str: 'badly damaged portable generator', colour: SETTINGS.colors.genBad, bold: true },
            { str: 'damaged portable generator', colour: SETTINGS.colors.genDamaged, bold: true },
            { str: 'battered portable generator', colour: SETTINGS.colors.genBattered, bold: true },
            { str: 'dented portable generator', colour: SETTINGS.colors.genDented, bold: true },

            { str: 'low on fuel', colour: SETTINGS.colors.lowFuel, bold: true },
            { str: 'only has a little fuel left', colour: SETTINGS.colors.lowFuel, bold: true }
        ];
    }

    // ==================================================
    // CORE LOGIC
    // ==================================================
    function colorizeBarricades() {
        var result = document.evaluate(
            '//td[@class="gp"]/div[@class="gt"]',
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        if (result.snapshotLength === 0) return;

        var div = result.snapshotItem(0);
        processElement(div);
    }

    function processElement(element) {
        if (!element || !element.childNodes) return;

        for (var i = 0; i < element.childNodes.length; i++) {
            var el = element.childNodes[i];

            switch (el.nodeType) {
                case Node.ELEMENT_NODE:
                    if (el.tagName === 'I') return;
                    processElement(el);
                    break;

                case Node.DOCUMENT_FRAGMENT_NODE:
                case Node.DOCUMENT_NODE:
                    processElement(el);
                    break;

                case Node.TEXT_NODE:
                    processText(el);
                    break;
            }
        }
    }

    function processText(element) {
        var highlights = getHighlights();
        var text = element.textContent;

        for (var i = 0; i < highlights.length; i++) {
            var hl = highlights[i];
            var index = text.indexOf(hl.str);

            if (index === -1) continue;
            if (index === 0 && text.length === hl.str.length) return;

            var frag = document.createDocumentFragment();

            frag.appendChild(document.createTextNode(text.substring(0, index)));

            var span = document.createElement('span');
            span.textContent = hl.str;
            span.style.color = hl.colour;

            if (hl.bold) span.style.fontWeight = 'bold';
            if (hl.underline) span.style.textDecoration = 'underline';

            if (SETTINGS.enableTextShadow) {
                span.style.textShadow = SETTINGS.outlineShadow;
            }

            frag.appendChild(span);

            frag.appendChild(
                document.createTextNode(text.substring(index + hl.str.length))
            );

            processElement(frag);
            element.parentNode.replaceChild(frag, element);
            return;
        }
    }

    // ==================================================
    // INIT
    // ==================================================
    colorizeBarricades();
function colorAltTrigger() {
    var el = document.getElementById('alt-trigger');
    if (el) {
        el.style.color = '#c99'; // change to any color you like
    }
}

// call it after colorizing buildings
colorizeBarricades();
colorAltTrigger();

})();