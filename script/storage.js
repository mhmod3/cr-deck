"use strict";
// دوال التخزين المحلي
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (_) {
        // وضع خاص أو امتلاء حصة التخزين — يستمر التطبيق بالعمل دون حفظ دائم
    }
}

CR.saveExcluded = function saveExcluded() {
    safeSetItem(CR.EXCLUDE_KEY, JSON.stringify(Array.from(CR.excludedIds)));
};

CR.loadExcluded = function loadExcluded() {
    try {
        const stored = localStorage.getItem(CR.EXCLUDE_KEY);
        if (stored) {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
                CR.excludedIds = new Set(arr.filter(x => Number.isInteger(x)));
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
    safeSetItem('deckBuilderChecks', JSON.stringify(checks));
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
        try {
            localStorage.removeItem('deckBuilderSavedDeck');
        } catch (_) {}
        return;
    }
    const saved = {
        mainCards: deckSlots.slice(0, 8).map(slot => ({
            id: slot.cardData.id,
            selectedIcon: slot.selectedIcon
        })),
        supportCardId: deckSlots[8].cardData.id
    };
    safeSetItem('deckBuilderSavedDeck', JSON.stringify(saved));
};

CR.loadDeckState = function loadDeckState() {
    try {
        const stored = localStorage.getItem('deckBuilderSavedDeck');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed &&
                Array.isArray(parsed.mainCards) &&
                parsed.mainCards.length === 8 &&
                parsed.mainCards.every(m => m && Number.isInteger(m.id)) &&
                Number.isInteger(parsed.supportCardId)) {
                return parsed;
            }
        }
    } catch (_) {}
    return null;
};
})();
