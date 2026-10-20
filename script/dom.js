"use strict";
// عناصر DOM المشتركة
window.CR = window.CR || {};

CR.dom = {
    loadingScreen: document.getElementById('loadingScreen'),
    loadingText: document.getElementById('loadingText'),
    loadingProgress: document.getElementById('loadingProgress'),
    loadingBarFill: document.getElementById('loadingBarFill'),
    loadingError: document.getElementById('loadingError'),
    loadingErrorText: document.getElementById('loadingErrorText'),
    loadingRetryBtn: document.getElementById('loadingRetryBtn'),
    skipLoadBtn: document.getElementById('skipLoadBtn'),

    generateBtn: document.getElementById('generateBtn'),
    copyBtn: document.getElementById('copyBtn'),
    qrContainer: document.getElementById('qrcode-container'),
    copyPopover: document.getElementById('copyPopover'),
    closePopoverBtn: document.getElementById('closePopoverBtn'),
    openLinkBtn: document.getElementById('openLinkBtn'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),

    randomIconsCheck: document.getElementById('randomIconsCheck'),
    forceSpellsCheck: document.getElementById('forceSpellsCheck'),
    forcePrincessCheck: document.getElementById('forcePrincessCheck'),
    forceAttackCardsCheck: document.getElementById('forceAttackCards'),

    deckContainer: document.getElementById('deckContainer'),
    mainContainer: document.querySelector('.container'),
    errorMsg: document.getElementById('errorMsg'),
    avgElixirDisplay: document.getElementById('avgElixirDisplay'),
    supportStatsImg: document.getElementById('supportStatsImg'),

    excludeBtn: document.getElementById('excludeBtn'),
    excludeBtnCount: document.getElementById('excludeBtnCount'),
    excludeModal: document.getElementById('excludeModal'),
    closeExcludeModal: document.getElementById('closeExcludeModal'),
    excludeSearchInput: document.getElementById('excludeSearchInput'),
    excludeCardsGrid: document.getElementById('excludeCardsGrid'),
    excludeCountSpan: document.getElementById('excludeCount'),
    resetExcludeBtn: document.getElementById('resetExcludeBtn'),

    siteHelpModal: document.getElementById('siteHelpModal'),
    siteHelpText: document.getElementById('siteHelpText'),
    closeSiteHelpBtn: document.getElementById('closeSiteHelpBtn'),

    siteConfirmModal: document.getElementById('siteConfirmModal'),
    siteConfirmText: document.getElementById('siteConfirmText'),
    closeSiteConfirmBtn: document.getElementById('closeSiteConfirmBtn'),
    siteConfirmYesBtn: document.getElementById('siteConfirmYesBtn'),
    siteConfirmNoBtn: document.getElementById('siteConfirmNoBtn')
};
