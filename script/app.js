"use strict";
// ربط الأحداث وإقلاع التطبيق
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

dom.generateBtn.addEventListener('click', function() {
    if (!CR.dataLoaded) { CR.loadData(); return; }
    CR.generateDeck();
});

// ===== شريط الأزرار السفلي =====
dom.copyBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (dom.copyPopover.classList.contains('visible')) {
        CR.closePopover();
    } else {
        CR.showPopover();
    }
});

dom.closePopoverBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    CR.closePopover();
});

document.addEventListener('click', function(e) {
    if (dom.copyPopover.classList.contains('visible')) {
        const target = e.target;
        if (!dom.copyPopover.contains(target) && !dom.copyBtn.contains(target)) {
            CR.closePopover();
        }
    }
});

dom.copyPopover.addEventListener('click', function(e) {
    e.stopPropagation();
});

// ===== زر استبعاد البطاقات =====
dom.excludeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (dom.excludeModal.classList.contains('visible')) {
        CR.closeExcludeModalFunc();
    } else {
        CR.openExcludeModal();
    }
});

dom.closeExcludeModal.addEventListener('click', CR.closeExcludeModalFunc);
dom.resetExcludeBtn.addEventListener('click', CR.resetExcluded);

dom.excludeModal.addEventListener('click', function(e) {
    if (e.target === dom.excludeModal) {
        CR.closeExcludeModalFunc();
    }
});

dom.excludeSearchInput.addEventListener('input', function() {
    CR.renderExcludeModal();
});

// حفظ الخيارات عند تغييرها
[dom.randomIconsCheck, dom.forceSpellsCheck, dom.forcePrincessCheck, dom.forceAttackCardsCheck].forEach(chk => {
    chk.addEventListener('change', function() {
        CR.saveCheckboxes();
        CR.updateOptionStates();
    });
});

window.addEventListener('DOMContentLoaded', CR.loadData);
window.loadData = CR.loadData;
})();
