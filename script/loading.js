"use strict";
// دوال التحميل والتقدم
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

CR.updateLoadingProgress = function updateLoadingProgress(loaded, total) {
    const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
    dom.loadingProgress.textContent = percent + '%';
    dom.loadingBarFill.style.width = percent + '%';
};

CR.showLoadingError = function showLoadingError(msg) {
    dom.loadingErrorText.textContent = msg;
    dom.loadingError.classList.add('visible');
    dom.loadingRetryBtn.classList.add('visible');
    dom.skipLoadBtn.style.display = 'none';
    dom.loadingText.textContent = 'حدث خطأ';
};

CR.hideLoadingError = function hideLoadingError() {
    dom.loadingError.classList.remove('visible');
    dom.loadingRetryBtn.classList.remove('visible');
    dom.loadingText.textContent = 'جاري تحميل البطاقات...';
};

CR.hideLoading = function hideLoading() {
    dom.loadingScreen.classList.add('hidden');
    if (dom.mainContainer) dom.mainContainer.classList.add('ready');
};

CR.showLoading = function showLoading() {
    dom.loadingScreen.classList.remove('hidden');
    dom.loadingProgress.textContent = '0%';
    dom.loadingBarFill.style.width = '0%';
    dom.skipLoadBtn.style.display = 'none';
    CR.hideLoadingError();
    dom.loadingText.textContent = 'جاري تحميل البطاقات...';
};

CR.loadAllImages = function loadAllImages(cards) {
    const urls = new Set();
    cards.forEach(card => {
        if (card.iconUrls) {
            Object.values(card.iconUrls).forEach(url => { if (url) urls.add(url); });
        }
    });
    if (CR.TOWER_PRINCESS_CARD.iconUrls.medium) urls.add(CR.TOWER_PRINCESS_CARD.iconUrls.medium);
    urls.add(CR.FALLBACK_IMAGE_URL);

    const urlArray = Array.from(urls);
    let loaded = 0;
    const total = urlArray.length;
    CR.loadSkipped = false;

    return new Promise((resolve) => {
        if (total === 0) { CR.updateLoadingProgress(100, 100); resolve(); return; }
        let resolved = false;

        function checkDone() {
            if (!resolved && loaded === total) { resolved = true; resolve(); }
        }

        function trySkip() {
            if (!resolved) {
                CR.loadSkipped = true;
                resolved = true;
                resolve();
            }
        }

        dom.skipLoadBtn.style.display = 'inline-block';
        dom.skipLoadBtn.onclick = trySkip;

        urlArray.forEach(url => {
            if (CR.preloadedImages.has(url)) {
                loaded++;
                CR.updateLoadingProgress(loaded, total);
                checkDone();
                return;
            }
            const img = new Image();
            img.onload = () => {
                if (CR.loadSkipped) return;
                loaded++;
                CR.preloadedImages.set(url, img);
                CR.updateLoadingProgress(loaded, total);
                checkDone();
            };
            img.onerror = () => {
                if (CR.loadSkipped) return;
                loaded++;
                CR.preloadedImages.set(url, img);
                CR.updateLoadingProgress(loaded, total);
                checkDone();
            };
            img.src = url;
            CR.preloadedImages.set(url, img);
        });
    });
};

CR.processCard = function processCard(card) {
    const iconUrls = card.iconUrls || {};
    const hasHero = iconUrls.hasOwnProperty('heroMedium');
    const hasEvolution = iconUrls.hasOwnProperty('evolutionMedium');
    const availableIcons = ['medium'];
    if (hasHero) availableIcons.push('heroMedium');
    if (hasEvolution) availableIcons.push('evolutionMedium');
    return {
        ...card,
        hasHero,
        hasEvolution,
        availableIcons,
        champion: (card.rarity === 'champion'),
        isSpell: CR.SPELL_IDS.has(card.id)
    };
};

CR.loadData = async function loadData() {
    // حارس الموازاة: ضغطة مزدوجة على «إعادة المحاولة» لا تطلق تحميلين متوازيين
    if (CR.loadingInFlight) return;
    CR.loadingInFlight = true;
    try {
        await CR.loadOnce();
    } finally {
        CR.loadingInFlight = false;
    }
};

CR.loadOnce = async function loadOnce() {
    CR.showLoading();
    dom.generateBtn.disabled = true;
    dom.copyBtn.disabled = true;
    dom.copyPopover.classList.remove('visible');

    const stored = (() => {
        try {
            return localStorage.getItem(CR.STORAGE_KEY);
        } catch (_) {
            return null;
        }
    })();
    let data = null;

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0 &&
                Array.isArray(parsed.supportItems) && parsed.supportItems.length > 0) {
                data = parsed;
            }
        } catch (_) {}
    }

    if (!data) {
        try {
            const apiUrl = 'https://raw.githubusercontent.com/mhmod3/cr-deck/refs/heads/main/data.json';
            const ctrl = new AbortController();
            const timeoutId = setTimeout(() => ctrl.abort(), 25000);
            let response;
            try {
                response = await fetch(apiUrl, { signal: ctrl.signal });
            } finally {
                clearTimeout(timeoutId);
            }
            if (!response.ok) throw new Error('Network response not ok');
            data = await response.json();
            if (!data || !Array.isArray(data.items) || data.items.length === 0 ||
                !Array.isArray(data.supportItems) || data.supportItems.length === 0) {
                throw new Error('Invalid data structure');
            }
        } catch (err) {
            console.warn('Fetch error:', err);
            CR.showLoadingError(err && err.name === 'AbortError'
                ? 'انتهت مهلة التحميل. تحقق من اتصالك بالإنترنت وحاول مجدداً.'
                : 'تعذر تحميل البيانات. تأكد من اتصالك بالإنترنت وحاول مجدداً.');
            dom.loadingRetryBtn.onclick = function() {
                CR.hideLoadingError();
                CR.loadData();
            };
            return;
        }
        try {
            localStorage.setItem(CR.STORAGE_KEY, JSON.stringify(data));
        } catch (_) {}
    }

    const processedItems = data.items.map(c => CR.processCard(c));
    const processedSupport = data.supportItems.slice();
    const allCardsData = [...processedItems, ...processedSupport];

    CR.allCards = processedItems.filter(c => !c.isSpell);
    CR.spells = processedItems.filter(c => c.isSpell);
    CR.supportCards = processedSupport;
    CR.dataLoaded = true;

    await CR.loadAllImages(allCardsData);

    // تحميل البطاقات المستبعدة
    CR.loadExcluded();

    CR.hideLoading();
    dom.generateBtn.disabled = false;

    // تحميل الخيارات المحفوظة
    CR.loadCheckboxes();

    // محاولة استعادة التشكيلة المحفوظة
    const savedState = CR.loadDeckState();
    if (savedState) {
        CR.restoreDeck(savedState);
    } else {
        CR.showPlaceholder();
    }
    CR.hideError();

    // تحديث حالة الخيارات بناءً على الاستبعاد
    CR.updateOptionStates();
    // تحديث حالة checkbox الاستبعاد (كمؤشر)
    CR.updateExcludeToggle();
};
})();
