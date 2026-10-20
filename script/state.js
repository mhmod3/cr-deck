"use strict";
// متغيرات الحالة المشتركة
window.CR = window.CR || {};

CR.allCards = [];
CR.supportCards = [];
CR.spells = [];
CR.dataLoaded = false;
CR.isGenerating = false;
CR.lastDeckIds = null;
CR.preloadedImages = new Map();
CR.excludedIds = new Set();
CR.loadSkipped = false;
CR.renderSeq = 0;
CR.loadingInFlight = false;
