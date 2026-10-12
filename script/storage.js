"use strict";
// دوال التخزين المحلي
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

CR.saveExcluded = function saveExcluded() {
    localStorage.setItem(CR.EXCLUDE_KEY, JSON.stringify(Array.from(CR.excludedIds)));
};

CR.loadExcluded = function loadExcluded() {
    try {
        const stored = localStorage.getItem(CR.EXCLUDE_KEY);
        if (stored) {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
                CR.excludedIds = new Set(arr);
                return;
            }
        }
    } catch (_) {}
    CR.excludedIds = new Set();
};

CR.saveCheckboxes = function saveCheckboxes() {
    const checks = {
        randomIcons: dom.randomIconsCheck.checked,
        forceSpells: dom.forceSpellsCheck.checked,
        forcePrincess: dom.forcePrincessCheck.checked,
        forceAttack: dom.forceAttackCardsCheck.checked
    };
    localStorage.setItem('deckBuilderChecks', JSON.stringify(checks));
};

CR.loadCheckboxes = function loadCheckboxes() {
    try {
        const stored = localStorage.getItem('deckBuilderChecks');
        if (stored) {
            const checks = JSON.parse(stored);
            dom.randomIconsCheck.checked = !!checks.randomIcons;
            dom.forceSpellsCheck.checked = !!checks.forceSpells;
            dom.forcePrincessCheck.checked = !!checks.forcePrincess;
            dom.forceAttackCardsCheck.checked = !!checks.forceAttack;
        }
    } catch (_) {}
};

CR.saveDeckState = function saveDeckState(deckSlots) {
    if (!deckSlots || deckSlots.length !== 9) {
        localStorage.removeItem('deckBuilderSavedDeck');
        return;
    }
    const saved = {
        mainCards: deckSlots.slice(0, 8).map(slot => ({
            id: slot.cardData.id,
            selectedIcon: slot.selectedIcon
        })),
        supportCardId: deckSlots[8].cardData.id
    };
    localStorage.setItem('deckBuilderSavedDeck', JSON.stringify(saved));
};

CR.loadDeckState = function loadDeckState() {
    try {
        const stored = localStorage.getItem('deckBuilderSavedDeck');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (_) {}
    return null;
};
})();
