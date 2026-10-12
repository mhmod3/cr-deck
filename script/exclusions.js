"use strict";
// دوال نافذة استبعاد البطاقات وحالة الخيارات
window.CR = window.CR || {};
(function () {
const CR = window.CR;
const dom = CR.dom;

// تحديث حالة زر الاستبعاد (كمؤشر)
CR.updateExcludeToggle = function updateExcludeToggle() {
    dom.excludeBtn.classList.toggle('active', CR.excludedIds.size > 0);
    if (dom.excludeBtnCount) dom.excludeBtnCount.textContent = CR.excludedIds.size;
};

CR.updateOptionStates = function updateOptionStates() {
    // التحقق من استبعاد كل البواسل والمطورات (hasHero أو hasEvolution)
    const allMainCards = [...CR.allCards, ...CR.spells];
    const availableHeroEvo = allMainCards.filter(c =>
        !CR.excludedIds.has(c.id) && (c.hasHero || c.hasEvolution)
    );
    const hasHeroEvo = availableHeroEvo.length > 0;

    if (!hasHeroEvo && dom.randomIconsCheck.checked) {
        dom.randomIconsCheck.checked = false;
        CR.saveCheckboxes();
        alert('لا يمكن تفعيل "اختيار بواسل و مطورات عشوائيا" لأنك استبعدت كل البطاقات التي تحوي بواسل أو مطورات.');
    }
    dom.randomIconsCheck.disabled = !hasHeroEvo;
    if (!hasHeroEvo) {
        dom.randomIconsCheck.parentElement.style.opacity = '0.5';
        dom.randomIconsCheck.parentElement.style.cursor = 'not-allowed';
    } else {
        dom.randomIconsCheck.parentElement.style.opacity = '1';
        dom.randomIconsCheck.parentElement.style.cursor = 'pointer';
    }

    // التحقق من استبعاد كل التعويذات
    const availableSpells = CR.spells.filter(c => !CR.excludedIds.has(c.id));
    const hasSpells = availableSpells.length > 0;

    if (!hasSpells && dom.forceSpellsCheck.checked) {
        dom.forceSpellsCheck.checked = false;
        CR.saveCheckboxes();
        alert('لا يمكن تفعيل "إجباري التعويذات" لأنك استبعدت كل التعويذات.');
    }
    dom.forceSpellsCheck.disabled = !hasSpells;
    if (!hasSpells) {
        dom.forceSpellsCheck.parentElement.style.opacity = '0.5';
        dom.forceSpellsCheck.parentElement.style.cursor = 'not-allowed';
    } else {
        dom.forceSpellsCheck.parentElement.style.opacity = '1';
        dom.forceSpellsCheck.parentElement.style.cursor = 'pointer';
    }

    // التحقق من استبعاد كل البطاقات الهجومية
    const availableAttack = CR.allCards.filter(c =>
        !CR.excludedIds.has(c.id) && CR.ATTACK_CARD_IDS.includes(c.id)
    );
    const hasAttack = availableAttack.length > 0;

    if (!hasAttack && dom.forceAttackCardsCheck.checked) {
        dom.forceAttackCardsCheck.checked = false;
        CR.saveCheckboxes();
        alert('لا يمكن تفعيل "إجباري بطاقات هجومية" لأنك استبعدت كل البطاقات الهجومية.');
    }
    dom.forceAttackCardsCheck.disabled = !hasAttack;
    if (!hasAttack) {
        dom.forceAttackCardsCheck.parentElement.style.opacity = '0.5';
        dom.forceAttackCardsCheck.parentElement.style.cursor = 'not-allowed';
    } else {
        dom.forceAttackCardsCheck.parentElement.style.opacity = '1';
        dom.forceAttackCardsCheck.parentElement.style.cursor = 'pointer';
    }

    // تحديث حالة checkbox الاستبعاد (كمؤشر)
    CR.updateExcludeToggle();
};

// التحقق من صحة الاستبعاد
CR.canExcludeCard = function canExcludeCard(cardId) {
    // 1. لا يمكن استبعاد بطاقة إذا كان عدد البطاقات المتاحة سيصبح أقل من 8
    const allMainCards = [...CR.allCards, ...CR.spells];
    const availableAfter = allMainCards.filter(c => !CR.excludedIds.has(c.id) && c.id !== cardId);
    if (availableAfter.length < 8) {
        return { allowed: false, msg: 'لا يمكن استبعاد هذه البطاقة لأن عدد البطاقات المتاحة سيصبح أقل من 8.' };
    }

    // 2. لا يمكن استبعاد كل البطاقات من نوع champion
    const champions = allMainCards.filter(c => c.champion);
    const availableChampions = champions.filter(c => !CR.excludedIds.has(c.id) && c.id !== cardId);
    if (champions.length > 0 && availableChampions.length === 0) {
        return { allowed: false, msg: 'لا يمكن استبعاد كل البطاقات من نوع Champion.' };
    }

    // 3. إذا كان خيار "إجباري بطاقات هجومية" مفعّلا، يجب أن تبقى بطاقة هجومية واحدة على الأقل
    if (dom.forceAttackCardsCheck.checked && !dom.forceAttackCardsCheck.disabled) {
        const attackCards = allMainCards.filter(c => CR.ATTACK_CARD_IDS.includes(c.id));
        const availableAttack = attackCards.filter(c => !CR.excludedIds.has(c.id) && c.id !== cardId);
        if (attackCards.length > 0 && availableAttack.length === 0) {
            return { allowed: false, msg: 'لا يمكن استبعاد كل البطاقات الهجومية لأن خيار "إجباري بطاقات هجومية" مفعّل.' };
        }
    }

    // 4. إذا كان خيار "إجباري التعويذات" مفعّلا، يجب أن تبقى تعويذة واحدة على الأقل
    if (dom.forceSpellsCheck.checked && !dom.forceSpellsCheck.disabled) {
        const availableSpells = CR.spells.filter(c => !CR.excludedIds.has(c.id) && c.id !== cardId);
        if (CR.spells.length > 0 && availableSpells.length === 0) {
            return { allowed: false, msg: 'لا يمكن استبعاد كل التعويذات لأن خيار "إجباري التعويذات" مفعّل.' };
        }
    }

    // 5. إذا كان خيار "اختيار بواسل و مطورات عشوائيا" مفعّلا، يجب أن تبقى بطاقة بها hero/evolution واحدة على الأقل
    if (dom.randomIconsCheck.checked && !dom.randomIconsCheck.disabled) {
        const heroEvoCards = allMainCards.filter(c => c.hasHero || c.hasEvolution);
        const availableHeroEvo = heroEvoCards.filter(c => !CR.excludedIds.has(c.id) && c.id !== cardId);
        if (heroEvoCards.length > 0 && availableHeroEvo.length === 0) {
            return { allowed: false, msg: 'لا يمكن استبعاد كل البطاقات التي تحوي بواسل أو مطورات لأن خيار "اختيار بواسل و مطورات عشوائيا" مفعّل.' };
        }
    }

    return { allowed: true };
};

CR.renderExcludeModal = function renderExcludeModal() {
    if (!CR.dataLoaded) return;
    const allMainCards = [...CR.allCards, ...CR.spells];
    const searchTerm = dom.excludeSearchInput.value.trim().toLowerCase();

    let filteredCards = allMainCards;
    if (searchTerm) {
        filteredCards = allMainCards.filter(c =>
            c.name && c.name.toLowerCase().includes(searchTerm)
        );
    }

    filteredCards.sort((a, b) => {
        const aExcluded = CR.excludedIds.has(a.id) ? 1 : 0;
        const bExcluded = CR.excludedIds.has(b.id) ? 1 : 0;
        return aExcluded - bExcluded;
    });

    dom.excludeCardsGrid.innerHTML = '';
    filteredCards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'exclude-card';
        if (CR.excludedIds.has(card.id)) {
            div.classList.add('excluded');
        }

        const img = document.createElement('img');
        img.className = 'card-img';
        const iconUrl = (card.iconUrls && card.iconUrls.medium) ? card.iconUrls.medium :
            (card.iconUrls && card.iconUrls.evolutionMedium) ? card.iconUrls.evolutionMedium :
            (card.iconUrls && card.iconUrls.heroMedium) ? card.iconUrls.heroMedium :
            CR.FALLBACK_IMAGE_URL;
        img.src = iconUrl;
        img.alt = card.name || 'بطاقة';
        img.loading = 'lazy';
        img.onerror = function() {
            if (this.src !== CR.FALLBACK_IMAGE_URL) {
                this.src = CR.FALLBACK_IMAGE_URL;
            } else {
                this.style.display = 'none';
            }
        };
        div.appendChild(img);

        const nameLabel = document.createElement('span');
        nameLabel.className = 'card-name-label';
        nameLabel.textContent = card.name || '---';
        div.appendChild(nameLabel);

        const overlay = document.createElement('div');
        overlay.className = 'exclude-overlay';
        overlay.innerHTML = `
            <span class="exclude-label">مستبعدة</span>
        `;
        div.appendChild(overlay);

        div.addEventListener('click', function(e) {
            e.stopPropagation();
            CR.toggleExclude(card.id);
        });

        dom.excludeCardsGrid.appendChild(div);
    });

    CR.updateExcludeCount();
};

CR.toggleExclude = function toggleExclude(cardId) {
    // التحقق من صحة الاستبعاد
    const result = CR.canExcludeCard(cardId);
    if (!result.allowed) {
        alert(result.msg);
        return;
    }

    if (CR.excludedIds.has(cardId)) {
        CR.excludedIds.delete(cardId);
    } else {
        CR.excludedIds.add(cardId);
    }
    CR.saveExcluded();
    CR.renderExcludeModal();
    CR.updateOptionStates();
    if (CR.lastDeckIds) {
        CR.generateDeck();
    }
};

CR.updateExcludeCount = function updateExcludeCount() {
    dom.excludeCountSpan.textContent = CR.excludedIds.size;
    if (dom.resetExcludeBtn) {
        dom.resetExcludeBtn.style.display = CR.excludedIds.size > 0 ? 'inline-block' : 'none';
    }
};

CR.executeResetExcluded = function executeResetExcluded() {
    CR.excludedIds.clear();
    CR.saveExcluded();
    dom.excludeSearchInput.value = '';
    CR.renderExcludeModal();
    CR.updateOptionStates();
    if (CR.lastDeckIds) {
        CR.generateDeck();
    }
};

CR.resetExcluded = function resetExcluded() {
    if (CR.excludedIds.size === 0) return;
    CR.openSiteConfirm('هل أنت متأكد من إلغاء كل الاستبعادات؟', function() {
        CR.executeResetExcluded();
    });
};

CR.openExcludeModal = function openExcludeModal() {
    if (!CR.dataLoaded) {
        alert('البيانات لا تزال قيد التحميل. يرجى الانتظار.');
        return;
    }
    CR.renderExcludeModal();
    dom.excludeModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    dom.excludeSearchInput.value = '';
    // إعادة عرض البطاقات بعد مسح البحث
    setTimeout(() => CR.renderExcludeModal(), 50);
};

CR.closeExcludeModalFunc = function closeExcludeModalFunc() {
    dom.excludeModal.classList.remove('visible');
    document.body.style.overflow = '';
    // تحديث حالة checkbox بعد الإغلاق (كمؤشر على الاستبعادات)
    CR.updateExcludeToggle();
};
})();
