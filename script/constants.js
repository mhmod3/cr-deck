"use strict";
// ثوابت التطبيق المشتركة
window.CR = window.CR || {};

CR.SPECIAL_CARD_ID = 26000106;
CR.FALLBACK_IMAGE_URL = 'https://cdns3.royaleapi.com/cdn-cgi/image/w=150,h=180,format=auto/static/img/cards/v10-9f6caa5e/ronin.png';

CR.TOWER_PRINCESS_CARD = {
    "name": "Tower Princess",
    "id": 159000000,
    "maxLevel": 16,
    "iconUrls": {
        "medium": "https://api-assets.clashroyale.com/cards/300/Nzo5Gjbh7NG6O3Hyu7ev54Pu5zK7vDMR2fbpGdVsS64.png"
    },
    "rarity": "common"
};

CR.ATTACK_CARD_IDS = [
    26000003, 26000006, 26000009, 26000021,
    26000024, 26000029, 26000051, 26000058,
    26000059, 26000060, 26000067, 26000085,
    26000056, 27000008
];

CR.SPELL_IDS = new Set([
    28000000, 28000001, 28000002, 28000003, 28000004, 28000005,
    28000006, 28000007, 28000008, 28000009, 28000010, 28000011,
    28000012, 28000013, 28000014, 28000015, 28000017, 28000018,
    28000023, 28000024, 28000026
]);

CR.CROWN_SVG =
    '<svg class="crown-icon" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg"><path d="M8 68 L14 28 L34 46 L50 14 L66 46 L86 28 L92 68 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

CR.STORAGE_KEY = 'cardsData';
CR.EXCLUDE_KEY = 'deckBuilderExcluded';
