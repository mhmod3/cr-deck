"use strict";
// دوال اختيار البطاقات وإنشاء التشكيلة
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

CR.shuffleArray = function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

CR.pickEightCards = function pickEightCards(forceAttack) {
    let pool = CR.allCards.filter(c => !CR.excludedIds.has(c.id));

    if (pool.length < 8) {
        return null;
    }

    if (forceAttack) {
        const attackPool = pool.filter(c => CR.ATTACK_CARD_IDS.includes(c.id));
        if (attackPool.length === 0) {
            return null;
        }
        const chosen = attackPool[Math.floor(Math.random() * attackPool.length)];
        const idxChosen = pool.indexOf(chosen);
        if (idxChosen !== -1) pool.splice(idxChosen, 1);
        pool = pool.filter(c => !CR.ATTACK_CARD_IDS.includes(c.id));

        if (pool.length < 7) {
            return null;
        }

        CR.shuffleArray(pool);
        const rest = pool.slice(0, 7);
        let selected = [chosen, ...rest];
        if (selected.length !== 8) return null;
        CR.shuffleArray(selected);

        let championCount = selected.filter(c => c.champion).length;
        if (championCount > 2) {
            let attempts = 0;
            while (championCount > 2 && attempts < 20) {
                attempts++;
                const champIndices = [];
                selected.forEach((c, idx) => { if (c.champion) champIndices.push(idx); });
                if (champIndices.length === 0) break;
                const idxToReplace = champIndices[Math.floor(Math.random() * champIndices.length)];
                const candidates = pool.filter(c => !c.champion && !selected.includes(c));
                if (candidates.length === 0) break;
                const replacement = candidates[Math.floor(Math.random() * candidates.length)];
                selected[idxToReplace] = replacement;
                championCount = selected.filter(c => c.champion).length;
            }
            if (championCount > 2) return null;
        }
        return selected;
    } else {
        CR.shuffleArray(pool);
        let selected = pool.slice(0, 8);
        let championCount = selected.filter(c => c.champion).length;
        if (championCount <= 2) return selected;

        let attempts = 0;
        while (championCount > 2 && attempts < 20) {
            attempts++;
            const champIndices = [];
            selected.forEach((c, idx) => { if (c.champion) champIndices.push(idx); });
            if (champIndices.length === 0) break;
            const idxToReplace = champIndices[Math.floor(Math.random() * champIndices.length)];
            const candidates = pool.filter(c => !c.champion && !selected.includes(c));
            if (candidates.length === 0) break;
            const replacement = candidates[Math.floor(Math.random() * candidates.length)];
            selected[idxToReplace] = replacement;
            championCount = selected.filter(c => c.champion).length;
        }
        if (championCount > 2) return null;
        return selected;
    }
};

CR.orderSlots = function orderSlots(initialSelection, supportCard, useRandomIcons) {
    let pool = initialSelection.map(item => ({
        ...item,
        currentIcon: item.selectedIcon,
        currentUrl: item.iconUrl
    }));

    function setIcon(item, iconName) {
        item.currentIcon = iconName;
        const cardData = item.cardData;
        if (cardData.iconUrls && cardData.iconUrls[iconName]) {
            item.currentUrl = cardData.iconUrls[iconName];
        } else {
            item.currentUrl = cardData.iconUrls && cardData.iconUrls.medium ? cardData.iconUrls.medium : '';
        }
    }

    function extractCard(criteria, iconToSetIfFound) {
        for (let i = 0; i < pool.length; i++) {
            const item = pool[i];
            if (criteria(item)) {
                const removed = pool.splice(i, 1)[0];
                if (iconToSetIfFound !== null) setIcon(removed, iconToSetIfFound);
                return removed;
            }
        }
        return null;
    }

    const deck = [];

    if (!useRandomIcons) {
        const champions = [],
            normal = [],
            special = [];
        pool.forEach(item => {
            if (item.isChampion) champions.push(item);
            else if (!item.hasHero && !item.hasEvolution) normal.push(item);
            else special.push(item);
        });

        CR.shuffleArray(normal);
        CR.shuffleArray(special);
        CR.shuffleArray(champions);

        let slot0 = normal.length > 0 ? normal.splice(0, 1)[0] : (special.length > 0 ? special.splice(0, 1)[
            0] : champions.splice(0, 1)[0]);
        setIcon(slot0, 'medium');
        deck.push(slot0);

        let slot1 = champions.length > 0 ? champions.splice(0, 1)[0] : (normal.length > 0 ? normal.splice(0,
            1)[0] : (special.length > 0 ? special.splice(0, 1)[0] : { ...initialSelection[0] }));
        setIcon(slot1, 'medium');
        deck.push(slot1);

        let slot2 = champions.length > 0 ? champions.splice(0, 1)[0] : (normal.length > 0 ? normal.splice(0,
            1)[0] : (special.length > 0 ? special.splice(0, 1)[0] : { ...initialSelection[0] }));
        setIcon(slot2, 'medium');
        deck.push(slot2);

        const remaining = normal.concat(special, champions);
        CR.shuffleArray(remaining);
        while (remaining.length > 0) {
            const item = remaining.splice(0, 1)[0];
            setIcon(item, 'medium');
            deck.push(item);
        }

        if (deck.length !== 8) return null;
        const uniqueIds = new Set(deck.map(item => item.cardData.id));
        if (uniqueIds.size !== 8) return null;

        const supportObj = {
            cardData: supportCard,
            selectedIcon: 'medium',
            currentIcon: 'medium',
            isChampion: false,
            hasHero: false,
            hasEvolution: false,
            currentUrl: (supportCard.iconUrls && supportCard.iconUrls.medium) ? supportCard.iconUrls
                .medium : ''
        };
        deck.push(supportObj);

        return deck.map(item => ({
            cardData: item.cardData,
            selectedIcon: item.currentIcon,
            isChampion: item.isChampion || false,
            hasHero: item.hasHero || false,
            hasEvolution: item.hasEvolution || false,
            iconUrl: item.currentUrl || ''
        }));
    }

    let slot0 = extractCard(item => item.currentIcon === 'evolutionMedium', null) || extractCard(item => !
        item.hasEvolution, 'medium') || extractCard(item => !item.isChampion, 'medium');
    if (!slot0) return null;
    deck.push(slot0);

    let slot1 = extractCard(item => item.currentIcon === 'heroMedium', null) || extractCard(item => item
        .isChampion, 'medium') || extractCard(item => item.currentIcon === 'evolutionMedium', 'medium') ||
        extractCard(() => true, 'medium');
    if (!slot1) return null;
    deck.push(slot1);

    let slot2 = extractCard(item => item.currentIcon === 'heroMedium', null) || extractCard(item => item
        .currentIcon === 'evolutionMedium', null) || extractCard(item => item.isChampion, 'medium') ||
        extractCard(() => true, 'medium');
    if (!slot2) return null;
    deck.push(slot2);

    let championInPool = null,
        championIndex = -1;
    for (let i = 0; i < pool.length; i++) {
        if (pool[i].isChampion) { championInPool = pool[i];
            championIndex = i; break; }
    }

    if (championInPool) {
        let targetSlotIndex = -1;
        for (const idx of [1, 2]) {
            const slot = deck[idx];
            if (!slot.isChampion && !slot.hasHero && !slot.hasEvolution && slot.currentIcon === 'medium') {
                targetSlotIndex = idx;
                break;
            }
        }
        if (targetSlotIndex === -1) return null;
        const replacedCard = deck[targetSlotIndex];
        setIcon(championInPool, 'medium');
        deck[targetSlotIndex] = championInPool;
        pool[championIndex] = replacedCard;
    }

    for (let i = 0; i < 3; i++) {
        const slot = deck[i];
        if (slot.currentIcon === 'medium' && (slot.hasHero || slot.hasEvolution)) {
            let replacementIdx = -1;
            for (let j = 0; j < pool.length; j++) {
                if (!pool[j].hasHero && !pool[j].hasEvolution) { replacementIdx = j; break; }
            }
            if (replacementIdx === -1) return null;
            const replacement = pool.splice(replacementIdx, 1)[0];
            setIcon(replacement, 'medium');
            pool.push(slot);
            deck[i] = replacement;
        }
    }

    let usedHero = 0,
        usedEvo = 0;
    deck.slice(0, 3).forEach(item => {
        if (item.currentIcon === 'heroMedium') usedHero++;
        if (item.currentIcon === 'evolutionMedium') usedEvo++;
    });

    const remainingMedium = [],
        remainingHero = [],
        remainingEvo = [];
    while (pool.length > 0) {
        const item = pool.splice(0, 1)[0];
        if (item.currentIcon === 'medium') remainingMedium.push(item);
        else if (item.currentIcon === 'heroMedium') remainingHero.push(item);
        else if (item.currentIcon === 'evolutionMedium') remainingEvo.push(item);
        else remainingMedium.push(item);
    }
    CR.shuffleArray(remainingMedium);
    CR.shuffleArray(remainingHero);
    CR.shuffleArray(remainingEvo);

    for (const item of remainingMedium.concat(remainingHero, remainingEvo)) {
        if (item.currentIcon === 'heroMedium' && usedHero >= 2) setIcon(item, 'medium');
        else if (item.currentIcon === 'evolutionMedium' && usedEvo >= 2) setIcon(item, 'medium');
        else if (item.currentIcon === 'heroMedium') usedHero++;
        else if (item.currentIcon === 'evolutionMedium') usedEvo++;
        deck.push(item);
    }

    if (deck.length !== 8) return null;
    const uniqueIdsRandom = new Set(deck.map(item => item.cardData.id));
    if (uniqueIdsRandom.size !== 8) return null;

    const supportObj = {
        cardData: supportCard,
        selectedIcon: 'medium',
        currentIcon: 'medium',
        isChampion: false,
        hasHero: false,
        hasEvolution: false,
        currentUrl: (supportCard.iconUrls && supportCard.iconUrls.medium) ? supportCard.iconUrls.medium : ''
    };
    deck.push(supportObj);

    return deck.map(item => ({
        cardData: item.cardData,
        selectedIcon: item.currentIcon,
        isChampion: item.isChampion || false,
        hasHero: item.hasHero || false,
        hasEvolution: item.hasEvolution || false,
        iconUrl: item.currentUrl || ''
    }));
};

CR.tryGenerateOnce = function tryGenerateOnce(useRandomIcons, forceSpells, forcePrincess, forceAttack) {
    let eightCards = CR.pickEightCards(forceAttack);
    if (!eightCards) return null;

    if (forceSpells && CR.spells.length > 0) {
        let availableSpells = CR.spells.filter(c => !CR.excludedIds.has(c.id));
        if (availableSpells.length === 0) {
            return null;
        }
        let numSpells = Math.random() < 0.5 ? 1 : 2;
        if (numSpells < 1) numSpells = 1;
        if (availableSpells.length < numSpells) numSpells = availableSpells.length;
        const shuffledSpells = CR.shuffleArray(availableSpells.slice());
        const selectedSpells = shuffledSpells.slice(0, numSpells);
        let candidatesForReplacement = eightCards.map((c, idx) => ({ card: c, index: idx }))
            .filter(item => {
                if (item.card.isChampion || item.card.hasHero || item.card.hasEvolution) return false;
                if (forceAttack && CR.ATTACK_CARD_IDS.includes(item.card.id)) return false;
                return true;
            });
        if (candidatesForReplacement.length < numSpells) {
            return null;
        }
        CR.shuffleArray(candidatesForReplacement);
        const toReplace = candidatesForReplacement.slice(0, numSpells);
        for (let i = 0; i < toReplace.length; i++) {
            const idx = toReplace[i].index;
            eightCards[idx] = selectedSpells[i % selectedSpells.length];
        }
    }

    let supportCard;
    if (forcePrincess) {
        supportCard = { ...CR.TOWER_PRINCESS_CARD };
    } else {
        const availableSupport = CR.supportCards.filter(c => !CR.excludedIds.has(c.id));
        if (availableSupport.length === 0) {
            const supportIdx = Math.floor(Math.random() * CR.supportCards.length);
            supportCard = { ...CR.supportCards[supportIdx] };
        } else {
            const supportIdx = Math.floor(Math.random() * availableSupport.length);
            supportCard = { ...availableSupport[supportIdx] };
        }
    }

    let initialSelection = [];
    if (useRandomIcons) {
        let success = false,
            selectedIcons = [];
        for (let attempt = 0; attempt < 3; attempt++) {
            selectedIcons = eightCards.map(c => {
                const avail = c.availableIcons || ['medium'];
                return avail[Math.floor(Math.random() * avail.length)];
            });
            const heroCount = selectedIcons.filter(ic => ic === 'heroMedium').length;
            const evoCount = selectedIcons.filter(ic => ic === 'evolutionMedium').length;
            const champCount = eightCards.filter(c => c.champion).length;
            if (heroCount > 2 || evoCount > 2) continue;
            if (champCount === 2 && heroCount === 1) continue;
            if (heroCount === 2 && champCount === 1) continue;
            if (champCount === 2 && evoCount === 2) continue;
            success = true;
            break;
        }
        if (!success) return null;

        initialSelection = eightCards.map((card, idx) => {
            const icon = selectedIcons[idx];
            return {
                cardData: card,
                selectedIcon: icon,
                isChampion: card.champion || false,
                hasHero: card.hasHero || false,
                hasEvolution: card.hasEvolution || false,
                iconUrl: (card.iconUrls && card.iconUrls[icon]) ? card.iconUrls[icon] : (card
                    .iconUrls && card.iconUrls.medium ? card.iconUrls.medium : '')
            };
        });
    } else {
        initialSelection = eightCards.map(card => ({
            cardData: card,
            selectedIcon: 'medium',
            isChampion: card.champion || false,
            hasHero: card.hasHero || false,
            hasEvolution: card.hasEvolution || false,
            iconUrl: (card.iconUrls && card.iconUrls.medium) ? card.iconUrls.medium : ''
        }));
    }

    return CR.orderSlots(initialSelection, supportCard, useRandomIcons);
};

// إنشاء تشكيلة جديدة
CR.generateDeck = function generateDeck() {
    if (!CR.dataLoaded || CR.allCards.length === 0 || CR.supportCards.length === 0) {
        CR.showError('البيانات غير جاهزة بعد.');
        return;
    }
    if (CR.isGenerating) return;
    CR.isGenerating = true;
    dom.generateBtn.disabled = true;
    dom.copyBtn.disabled = true;
    dom.copyPopover.classList.remove('visible');
    CR.hideError();

    const availableCount = CR.allCards.filter(c => !CR.excludedIds.has(c.id)).length;
    if (availableCount < 8) {
        CR.showError('عدد البطاقات المتاحة أقل من 8. يرجى إلغاء استبعاد بعض البطاقات.');
        CR.isGenerating = false;
        dom.generateBtn.disabled = false;
        return;
    }

    const useRandomIcons = dom.randomIconsCheck.checked && !dom.randomIconsCheck.disabled;
    const forceSpells = dom.forceSpellsCheck.checked && !dom.forceSpellsCheck.disabled;
    const forcePrincess = dom.forcePrincessCheck.checked;
    const forceAttack = dom.forceAttackCardsCheck.checked && !dom.forceAttackCardsCheck.disabled;

    const isAvail = c => !CR.excludedIds.has(c.id);
    if (forceAttack && !CR.allCards.some(c => isAvail(c) && CR.ATTACK_CARD_IDS.includes(c.id))) {
        CR.showError('لا توجد بطاقات هجومية متاحة بعد الاستبعاد. أزل استبعادها أو عطّل خيار «إجباري بطاقات هجومية».');
        CR.isGenerating = false;
        dom.generateBtn.disabled = false;
        return;
    }
    if (forceSpells && CR.spells.length > 0 && !CR.spells.some(isAvail)) {
        CR.showError('لا توجد تعويذات متاحة بعد الاستبعاد. أزل استبعادها أو عطّل خيار «إجباري التعويذات».');
        CR.isGenerating = false;
        dom.generateBtn.disabled = false;
        return;
    }
    if (useRandomIcons && ![...CR.allCards, ...CR.spells].some(c => isAvail(c) && (c.hasHero || c.hasEvolution))) {
        CR.showError('لا توجد بواسل أو مطورات متاحة بعد الاستبعاد. أزل استبعادها أو عطّل خيار «بواسل و مطورات عشوائية».');
        CR.isGenerating = false;
        dom.generateBtn.disabled = false;
        return;
    }

    let finalDeck = null;
    let attempts = 0;

    while (attempts < 30) {
        attempts++;
        const result = CR.tryGenerateOnce(useRandomIcons, forceSpells, forcePrincess, forceAttack);
        if (result) {
            finalDeck = result;
            break;
        }
    }

    if (finalDeck && finalDeck.length === 9) {
        CR.renderDeck(finalDeck, false);
        CR.hideError();
    } else {
        // التشكيلة المعروضة تبقى كما هي — الخطأ لا يهدم الحالة الموجودة
        CR.showError('تعذر إيجاد تشكيلة صالحة بهذه الخيارات. عدّل الخيارات أو أعد المحاولة.');
    }

    CR.isGenerating = false;
    dom.generateBtn.disabled = false;
};
})();
