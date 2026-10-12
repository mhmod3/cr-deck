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

// ===== إشعارات الموقع المخصصة (توضيح وتأكيد) =====
let confirmCallback = null;

CR.openSiteHelp = function openSiteHelp(text) {
    if (!dom.siteHelpModal) return;
    dom.siteHelpText.textContent = text;
    dom.siteHelpModal.classList.add('visible');
};

CR.closeSiteHelp = function closeSiteHelp() {
    if (!dom.siteHelpModal) return;
    dom.siteHelpModal.classList.remove('visible');
};

CR.openSiteConfirm = function openSiteConfirm(msg, onConfirm) {
    if (!dom.siteConfirmModal) return;
    confirmCallback = onConfirm;
    dom.siteConfirmText.textContent = msg;
    dom.siteConfirmModal.classList.add('visible');
};

CR.closeSiteConfirm = function closeSiteConfirm(accepted) {
    if (!dom.siteConfirmModal) return;
    dom.siteConfirmModal.classList.remove('visible');
    if (accepted && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    confirmCallback = null;
};

// أحداث أيقونات التوضيح
document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const helpText = this.getAttribute('data-help') || this.getAttribute('title') || '';
        CR.openSiteHelp(helpText);
    });
});

if (dom.closeSiteHelpBtn) {
    dom.closeSiteHelpBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        CR.closeSiteHelp();
    });
}

if (dom.siteHelpModal) {
    dom.siteHelpModal.addEventListener('click', function(e) {
        if (e.target === dom.siteHelpModal) {
            CR.closeSiteHelp();
        }
    });
}

if (dom.closeSiteConfirmBtn) {
    dom.closeSiteConfirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        CR.closeSiteConfirm(false);
    });
}

if (dom.siteConfirmNoBtn) {
    dom.siteConfirmNoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        CR.closeSiteConfirm(false);
    });
}

if (dom.siteConfirmYesBtn) {
    dom.siteConfirmYesBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        CR.closeSiteConfirm(true);
    });
}

if (dom.siteConfirmModal) {
    dom.siteConfirmModal.addEventListener('click', function(e) {
        if (e.target === dom.siteConfirmModal) {
            CR.closeSiteConfirm(false);
        }
    });
}

window.addEventListener('DOMContentLoaded', CR.loadData);
window.loadData = CR.loadData;
})();
