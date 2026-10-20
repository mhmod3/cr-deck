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

window.addEventListener('resize', function() {
    if (dom.copyPopover.classList.contains('visible') && typeof CR.adjustPopoverPosition === 'function') {
        CR.adjustPopoverPosition();
    }
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

// البحث في نافذة الاستبعاد — تأخير خفيف حتى لا يُعاد رسم الشبكة مع كل ضغطة
let searchTimer = null;
dom.excludeSearchInput.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => CR.renderExcludeModal(), 150);
});

// إغلاق النوافذ بمفتاح Escape — الأعلى طابقاً أولًا
// قفزة التركيز: Tab يدور داخل أعلى نافذة مفتوحة ولا يفلت إلى الخلفية
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    let scope = null;
    if (dom.siteHelpModal.classList.contains('visible')) {
        scope = dom.siteHelpModal;
    } else if (dom.siteConfirmModal.classList.contains('visible')) {
        scope = dom.siteConfirmModal;
    } else if (dom.excludeModal.classList.contains('visible')) {
        scope = dom.excludeModal;
    }
    if (!scope) return;
    const isVisible = el => el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null;
    const focusables = Array.from(scope.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])'))
        .filter(isVisible);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !scope.contains(active))) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (dom.siteHelpModal.classList.contains('visible')) {
        CR.closeSiteHelp();
    } else if (dom.siteConfirmModal.classList.contains('visible')) {
        CR.closeSiteConfirm(false);
    } else if (dom.excludeModal.classList.contains('visible')) {
        CR.closeExcludeModalFunc();
    } else if (dom.copyPopover.classList.contains('visible')) {
        CR.closePopover();
    }
});

// صورة البرج الداعم في شريط الإحصائيات: إخفاؤها إن فشلت
dom.supportStatsImg.addEventListener('error', function() {
    this.style.visibility = 'hidden';
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
let lastFocusable = null;

function restoreFocus() {
    if (lastFocusable && document.contains(lastFocusable) && typeof lastFocusable.focus === 'function') {
        lastFocusable.focus();
    }
    lastFocusable = null;
}

CR.openSiteHelp = function openSiteHelp(text) {
    if (!dom.siteHelpModal) return;
    lastFocusable = document.activeElement;
    dom.siteHelpText.textContent = text;
    dom.siteHelpModal.classList.add('visible');
    dom.closeSiteHelpBtn.focus();
};

CR.closeSiteHelp = function closeSiteHelp() {
    if (!dom.siteHelpModal) return;
    dom.siteHelpModal.classList.remove('visible');
    restoreFocus();
};

CR.openSiteConfirm = function openSiteConfirm(msg, onConfirm) {
    if (!dom.siteConfirmModal) return;
    lastFocusable = document.activeElement;
    confirmCallback = onConfirm;
    dom.siteConfirmText.textContent = msg;
    dom.siteConfirmModal.classList.add('visible');
    dom.siteConfirmNoBtn.focus();
};

CR.closeSiteConfirm = function closeSiteConfirm(accepted) {
    if (!dom.siteConfirmModal) return;
    dom.siteConfirmModal.classList.remove('visible');
    restoreFocus();
    if (accepted && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    confirmCallback = null;
};

// أحداث أيقونات التوضيح
document.querySelectorAll('.help-icon').forEach(icon => {
    const helpText = icon.getAttribute('data-help') || icon.getAttribute('title') || '';
    icon.setAttribute('aria-label', helpText);
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        CR.openSiteHelp(helpText);
    });
    // وصولية لوحة المفاتيح
    icon.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            CR.openSiteHelp(helpText);
        }
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
