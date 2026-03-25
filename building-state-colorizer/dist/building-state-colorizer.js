// ==UserScript==
// @name                WWDead Building State Colorizer
// @namespace           wwdead-building-state-colorizer
// @version             1.1.0
// @description         Colorizes a building's barricade level, door, ransack and ruin status, and machinery condition (WWDead compatible)
// @author              Ville Jokela
// @author              Bradley Sattem
// @contributor         DTTL — rewrite and modernization
// @include             https://wwdead.com/classic*
// @run-at              document-idle
// @grant               none
// @license             GNU General Public License v2 or later; http://www.gnu.org/licenses/gpl.txt
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
 
    // Full black outline text-shadow
    const outlineShadow = `
        -1px -1px 0 #000,
         1px -1px 0 #000,
        -1px  1px 0 #000,
         1px  1px 0 #000
    `;
 
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
                    // Skip italicized spraypaint messages
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
 
        var highlights = [
            // darkness
            { str: 'lights out', colour: '#000', bold: true },
 
            // barricades
            { str: 'extremely heavily barricaded', colour: 'inherit', underline: true },
            { str: 'very heavily barricaded', colour: '#3af' },
            { str: 'heavily barricaded', colour: '#3ff' },
            { str: 'very strongly barricaded', colour: '#3fa', bold: true, underline: true },
            { str: 'quite strongly barricaded', colour: '#af3' },
            { str: 'lightly barricaded', colour: '#ff3' },
            { str: 'loosely barricaded', colour: '#fa3', bold: true },
 
            // doors
            { str: 'have been secured', colour: '#f33', bold: true },
            { str: 'left wide open', colour: '#a00', bold: true },
            { str: 'hang open', colour: '#a00', bold: true },
            { str: 'ragged rectangle has been cut', colour: '#a00', bold: true },
            { str: 'opens directly onto the street', colour: '#a00', bold: true },
 
            // ransack
            { str: 'ransacked by looters', colour: 'inherit' },
            { str: 'ransacked', colour: '#a00' },
 
            // ruin
            { str: 'has been ruined', colour: '#333' },
            { str: 'has fallen into ruin', colour: '#333' },
            { str: 'are ruined', colour: '#333' },
 
            // damaged machinery
            { str: 'badly damaged portable generator', colour: '#a00', bold: true },
            { str: 'damaged portable generator', colour: '#f33', bold: true },
            { str: 'battered portable generator', colour: '#fa3', bold: true },
            { str: 'dented portable generator', colour: '#ff3', bold: true },
 
            { str: 'badly damaged radio transmitter', colour: '#a00', bold: true },
            { str: 'damaged radio transmitter', colour: '#f33', bold: true },
            { str: 'battered radio transmitter', colour: '#fa3', bold: true },
            { str: 'dented radio transmitter', colour: '#ff3', bold: true },
 
            // intact machinery
            { str: 'portable generator', colour: 'inherit', underline: true },
            { str: 'radio transmitter', colour: 'inherit', underline: true },
 
            // power state
            { str: 'is out of fuel', colour: '#333', bold: true },
            { str: 'powered-down', colour: '#333', bold: true },
            { str: 'is running', colour: 'inherit', underline: true },
            { str: 'powering', colour: 'inherit', underline: true },
            { str: 'enough to power', colour: 'inherit', underline: true },
            { str: 'low on fuel', colour: '#faa', bold: true },
            { str: 'only has a little fuel left', colour: '#faa', bold: true }
        ];
 
        var text = element.textContent;
 
        for (var i = 0; i < highlights.length; i++) {
 
            var hl = highlights[i];
            var index = text.indexOf(hl.str);
 
            if (index === -1) continue;
 
            // Avoid full-string replacement edge case
            if (index === 0 && text.length === hl.str.length) return;
 
            var frag = document.createDocumentFragment();
 
            frag.appendChild(
                document.createTextNode(text.substring(0, index))
            );
 
            var span = document.createElement('span');
            span.textContent = hl.str;
            span.style.color = hl.colour;
 
            if (hl.bold) span.style.fontWeight = 'bold';
            if (hl.underline) span.style.textDecoration = 'underline';
 
            // ADD FULL BLACK OUTLINE
            span.style.textShadow = outlineShadow;
 
            frag.appendChild(span);
 
            frag.appendChild(
                document.createTextNode(text.substring(index + hl.str.length))
            );
 
            processElement(frag);
            element.parentNode.replaceChild(frag, element);
            return;
        }
    }
 
    colorizeBarricades();
 
})();