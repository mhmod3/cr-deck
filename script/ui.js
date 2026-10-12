"use strict";
// دوال العرض والأنيميشن
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

CR.showError = function showError(msg) {
    dom.errorMsg.textContent = msg;
    dom.errorMsg.classList.add('visible');
};

CR.hideError = function hideError() {
    dom.errorMsg.classList.remove('visible');
};

CR.showPlaceholder = function showPlaceholder() {
    dom.deckContainer.innerHTML = '';

    const gridDiv = document.createElement('div');
    gridDiv.className = 'deck-grid';
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'card-slot empty-slot';
        slot.innerHTML = CR.CROWN_SVG;
        gridDiv.appendChild(slot);
    }
    dom.deckContainer.appendChild(gridDiv);

    const caption = document.createElement('div');
    caption.className = 'placeholder-caption';
    caption.textContent = 'اضغط على زر "إنشاء تشكيلة" لإنشاء تشكيلة عشوائية';
    dom.deckContainer.appendChild(caption);

    dom.supportStatsImg.removeAttribute('src');
    dom.supportStatsImg.style.visibility = 'hidden';
    dom.avgElixirDisplay.textContent = '—';
    dom.avgElixirDisplay.classList.add('empty-value');
    dom.avgElixirDisplay.closest('.battle_stats').style.setProperty('--avg', 0);

    dom.copyBtn.disabled = true;
    dom.copyPopover.classList.remove('visible');
    CR.lastDeckIds = null;
    localStorage.removeItem('deckBuilderSavedDeck');
};

CR.getRarityClass = function getRarityClass(rarity) {
    switch (rarity) {
        case 'common':
            return 'rarity-common';
        case 'rare':
            return 'rarity-rare';
        case 'epic':
            return 'rarity-epic';
        case 'legendary':
            return 'rarity-legendary';
        case 'champion':
            return 'rarity-champion';
        default:
            return 'rarity-common';
    }
};

// بطاقة = صورة فقط (كما في example-frontend)
CR.createCardElement = function createCardElement(slot) {
    const div = document.createElement('div');
    div.className = 'card-slot ' + CR.getRarityClass(slot.cardData.rarity);

    const artWrap = document.createElement('div');
    artWrap.className = 'card-art';

    const placeholder = document.createElement('div');
    placeholder.className = 'animating-placeholder';
    placeholder.textContent = '?';
    artWrap.appendChild(placeholder);

    const img = document.createElement('img');
    img.loading = 'eager';
    img.dataset.cardId = slot.cardData.id;

    img.onerror = function() {
        const id = parseInt(this.dataset.cardId);
        if (id === CR.SPECIAL_CARD_ID) {
            if (this.src === CR.FALLBACK_IMAGE_URL) {
                this.style.display = 'none';
                return;
            }
            this.src = CR.FALLBACK_IMAGE_URL;
        } else {
            this.style.display = 'none';
        }
    };

    artWrap.appendChild(img);
    div.appendChild(artWrap);

    return div;
};

CR.animateCardSlot = function animateCardSlot(cardElement, finalSlotData) {
    return new Promise((resolve) => {
        const img = cardElement.querySelector('img');

        cardElement.classList.add('animating');

        let counter = 0;
        const totalSteps = 8;
        const stepDuration = 45;

        const intervalId = setInterval(() => {
            counter++;

            if (counter >= totalSteps) {
                clearInterval(intervalId);

                img.src = finalSlotData.iconUrl || '';
                img.dataset.cardId = finalSlotData.cardData.id;

                cardElement.classList.remove('animating');
                cardElement.classList.add('reveal-anim');

                setTimeout(() => {
                    cardElement.classList.remove('reveal-anim');
                    resolve();
                }, 600);
            }
        }, stepDuration);
    });
};

// 8 بطاقات في الشبكة + البطاقة الداعمة في شريط الإحصائيات
CR.renderDeck = function renderDeck(deckSlots, skipAnimation = false) {
    dom.deckContainer.innerHTML = '';
    const ids = [];
    const cardElements = [];

    const gridDiv = document.createElement('div');
    gridDiv.className = 'deck-grid';

    deckSlots.slice(0, 8).forEach((slot) => {
        const div = CR.createCardElement(slot);
        gridDiv.appendChild(div);
        ids.push(slot.cardData.id);
        cardElements.push({ element: div, finalData: slot });
    });

    dom.deckContainer.appendChild(gridDiv);

    // البطاقة الداعمة (التاسعة) في شريط الإحصائيات
    if (deckSlots.length === 9) {
        const supportSlot = deckSlots[8];
        dom.supportStatsImg.src = supportSlot.iconUrl || '';
        dom.supportStatsImg.alt = supportSlot.cardData.name || 'Tower';
        dom.supportStatsImg.style.visibility = 'visible';
        ids.push(supportSlot.cardData.id);
    }

    CR.lastDeckIds = ids;
    CR.saveDeckState(deckSlots);
    dom.copyPopover.classList.remove('visible');

    // متوسط الإكسير
    const mainCards = deckSlots.slice(0, 8);
    let totalElixir = 0;
    let count = 0;
    mainCards.forEach(slot => {
        if (slot.cardData && typeof slot.cardData.elixirCost === 'number') {
            totalElixir += slot.cardData.elixirCost;
            count++;
        }
    });
    const avg = count > 0 ? (totalElixir / count) : 0;

    if (skipAnimation) {
        cardElements.forEach(({ element, finalData }) => {
            const img = element.querySelector('img');
            img.src = finalData.iconUrl || '';
            img.dataset.cardId = finalData.cardData.id;
            element.style.animation = 'cardPopIn .2s ease both';
        });
        dom.avgElixirDisplay.textContent = avg.toFixed(1);
        dom.avgElixirDisplay.classList.remove('empty-value');
        dom.avgElixirDisplay.closest('.battle_stats').style.setProperty('--avg', avg);
        dom.copyBtn.disabled = false;
    } else {
        dom.avgElixirDisplay.textContent = '—';
        dom.avgElixirDisplay.classList.add('empty-value');
        dom.avgElixirDisplay.closest('.battle_stats').style.setProperty('--avg', 0);

        const promises = cardElements.map((item, index) => {
            const delay = index * 50;
            return new Promise((resolve) => {
                setTimeout(() => {
                    CR.animateCardSlot(item.element, item.finalData).then(resolve);
                }, delay);
            });
        });

        Promise.all(promises).then(() => {
            dom.avgElixirDisplay.textContent = avg.toFixed(1);
            dom.avgElixirDisplay.classList.remove('empty-value');
            dom.avgElixirDisplay.closest('.battle_stats').style.setProperty('--avg', avg);
            dom.copyBtn.disabled = false;
        });
    }
};

// استعادة التشكيلة المحفوظة
CR.restoreDeck = function restoreDeck(savedState) {
    if (!CR.dataLoaded || CR.allCards.length === 0) {
        setTimeout(() => CR.restoreDeck(savedState), 200);
        return;
    }

    const mainCardIds = savedState.mainCards.map(item => item.id);
    const supportId = savedState.supportCardId;

    let mainCards = [];
    let missing = false;
    mainCardIds.forEach(id => {
        if (CR.excludedIds.has(id)) {
            missing = true;
        }
        const card = CR.allCards.find(c => c.id === id);
        if (card) {
            mainCards.push(card);
        } else {
            missing = true;
        }
    });

    let supportCard = CR.supportCards.find(c => c.id === supportId);
    if (supportId === CR.TOWER_PRINCESS_CARD.id) {
        supportCard = { ...CR.TOWER_PRINCESS_CARD };
    }
    if (!supportCard) {
        supportCard = CR.supportCards[0] || CR.TOWER_PRINCESS_CARD;
    }

    if (CR.excludedIds.has(supportId)) {
        missing = true;
    }

    if (missing || mainCards.length !== 8) {
        CR.showPlaceholder();
        return;
    }

    const deckSlots = mainCards.map((card, index) => {
        const savedIcon = savedState.mainCards[index].selectedIcon || 'medium';
        const iconUrl = (card.iconUrls && card.iconUrls[savedIcon]) ?
            card.iconUrls[savedIcon] :
            (card.iconUrls && card.iconUrls.medium ? card.iconUrls.medium : '');
        return {
            cardData: card,
            selectedIcon: savedIcon,
            isChampion: card.champion || false,
            hasHero: card.hasHero || false,
            hasEvolution: card.hasEvolution || false,
            iconUrl: iconUrl
        };
    });

    const supportSlot = {
        cardData: supportCard,
        selectedIcon: 'medium',
        isChampion: false,
        hasHero: false,
        hasEvolution: false,
        iconUrl: (supportCard.iconUrls && supportCard.iconUrls.medium) ? supportCard.iconUrls.medium : ''
    };
    deckSlots.push(supportSlot);

    CR.renderDeck(deckSlots, true);
};
})();
