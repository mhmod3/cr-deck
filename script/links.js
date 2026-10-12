"use strict";
// دوال الروابط والمنبثق (popover)
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

CR.getDeckUrl = function getDeckUrl() {
    if (!CR.lastDeckIds || CR.lastDeckIds.length !== 9) return null;
    const deckIds = CR.lastDeckIds.slice(0, 8).join(';');
    const supportId = CR.lastDeckIds[8];
    return `https://link.clashroyale.com/en/?clashroyale://copyDeck?deck=${deckIds}&l=Royals&tt=${supportId}`;
};

CR.getAppUrl = function getAppUrl(webUrl) {
    if (!webUrl) return null;
    const match = webUrl.match(/clashroyale:\/\/(copyDeck\?[^&]+&[^&]+&[^&]+)/);
    if (match) {
        return `clashroyale://${match[1]}`;
    }
    try {
        const urlObj = new URL(webUrl);
        const params = new URLSearchParams(urlObj.search);
        const deepLink = params.get('clashroyale://copyDeck');
        if (deepLink) {
            return `clashroyale://copyDeck?${deepLink}`;
        }
    } catch (_) {}
    return null;
};

CR.showPopover = function showPopover() {
    const webUrl = CR.getDeckUrl();
    if (!webUrl) {
        alert('لا توجد تشكيلة جاهزة للنسخ. قم بإنشاء تشكيلة أولا');
        return;
    }

    dom.qrContainer.innerHTML = '';
    try {
        new QRCode(dom.qrContainer, {
            text: webUrl,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.warn('QR generation error:', e);
        dom.qrContainer.innerHTML = '<span style="color:#ff8a80;font-size:0.7rem;">تعذر إنشاء QR</span>';
    }

    dom.copyLinkBtn.onclick = function() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(webUrl).then(() => {
                dom.copyLinkBtn.textContent = 'تم النسخ!';
                setTimeout(() => { dom.copyLinkBtn.textContent = 'نسخ رابط التشكيلة'; }, 2000);
            }).catch(() => CR.fallbackCopy(webUrl));
        } else {
            CR.fallbackCopy(webUrl);
        }
    };

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const appUrl = CR.getAppUrl(webUrl);

    dom.openLinkBtn.onclick = function() {
        if (isMobile && appUrl) {
            window.location.href = appUrl;
        } else {
            window.open(webUrl, '_blank');
        }
    };

    dom.copyPopover.classList.add('visible');
    CR.adjustPopoverPosition();
};

CR.adjustPopoverPosition = function adjustPopoverPosition() {
    if (!dom.copyPopover || !dom.copyBtn) return;
    // إعادة ضبط الحسابات التلقائية
    dom.copyPopover.style.left = '0px';
    dom.copyPopover.style.right = 'auto';

    const popoverRect = dom.copyPopover.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const padding = 12;

    // إذا تجاوز الجانب الأيمن شاشة العرض
    if (popoverRect.right > viewportWidth - padding) {
        const overflowX = popoverRect.right - (viewportWidth - padding);
        dom.copyPopover.style.left = `-${overflowX}px`;
    }

    // التحقق من الجانب الأيسر
    const updatedRect = dom.copyPopover.getBoundingClientRect();
    if (updatedRect.left < padding) {
        const currentLeft = parseFloat(dom.copyPopover.style.left) || 0;
        dom.copyPopover.style.left = `${currentLeft + (padding - updatedRect.left)}px`;
    }
};

CR.fallbackCopy = function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        dom.copyLinkBtn.textContent = 'تم النسخ!';
        setTimeout(() => { dom.copyLinkBtn.textContent = 'نسخ رابط التشكيلة'; }, 2000);
    } catch (e) {
        alert('تعذر نسخ الرابط. يمكنك نسخه يدويا\n' + text);
    }
    document.body.removeChild(textarea);
};

CR.closePopover = function closePopover() {
    dom.copyPopover.classList.remove('visible');
};
})();
