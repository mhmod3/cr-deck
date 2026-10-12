# HANDOFF — منشئ التشكيلات (M7mod)

تسليم قصير للجلسات/الوكالات القادمة: ما عُمّل، ما يُتجنب، وأين المسدود.

## 1. التعديلات الحالية والملفات المعدّلة

| الملف | الحالة | ما الذي تغيّر (مختصر) |
|---|---|---|
| `style.css` | **معاد كتابته كليًا** | عالم «صفحة جامع البطاقات»: توكنات جديدة في `:root` (أرض `#14161c`، عطر `#d32f8f` محجوز، سحّابات ندرة، خطوط Lalezar/Rubik/mono)؛ جيوب 2px بسحّابة خلفية 3px؛ `aspect-ratio: 1/1.14` على الجيب (يُبقي الحجم أثناء الوامض)؛ `.card-slot.animating` يبقي السحّابة **محايدة** (لون الندرة يُختم عند الكشف فقط)؛ حركات: `questionPulse` + `inkFlash` + `cardReveal .34s` (overshoot)؛ مقياس الإكسير `.meter i` (عرضه يقوده `--avg` من JS)؛ أسطح المتصفح (selection/scrollbar/caret/focus)؛ لا ظلال ملونة أبدًا. |
| `index.html` | تعديل مستهدف | رابط Google Fonts (Lalezar+Rubik)؛ `wordmark` **تحت** `h1` (لا فوق)؛ عنصر `<div class="meter"><i></i></div>` داخل `battle_stats`؛ `supportStatsImg` بحمل data-URI شفاف بدل `src=""` الفارغ. |
| `script/ui.js` | 4 سطور فقط | 3× `dom.avgElixirDisplay.closest('.battle_stats').style.setProperty('--avg', …)` (placeholder=0، skip/animated=المتوسط)؛ توقيت إزالة `reveal-anim` من 200→**600ms** حتى تكتمل الحركة. |
| `PRODUCT.md` | جديد | حقيقة المنتج (مستخدم، مهام، قيود، التزامات العلامة). |
| `DESIGN.md` + `.impeccable/design.json` | جديد | توثيق نظام التصميم: 23 توكن لون، ramp مقاسات `[10…44]`، زوايا `[2,3,4,5,6,10,50,999]`، القواعد المسمّاة (Elixir-Pink Reservation، Rarity-Only Chroma، Zero-Tracking، Shared-Baseline، Neutral-Shadow، 2px Pocket). |
| `.impeccable/surfaces/index-html.md` | جديد | موجز السطح + عقد الاتجاه (THESIS/OWN-WORLD/STORY/FIRST VIEWPORT/FORM/FINISH). |
| `.impeccable/*` (أدوات) | جديد | `data.json` (بيانات البطاقات الحقيقية)، `verify-reveal.py` / `final-shot.py` (لقطات مراجعة)، `mocks/decision/` (6 مخططات HTML)، `review/` (desktop/mobile/mobile-empty/flicker). |

**لا شيء آخر تغيّر.** كل منطق `script/` (generator/loading/links/exclusions/storage/state) كما هو؛ كل النصوص العربية كما هي.

## 2. ما يجب تجنّبه (قواعد صارمة من المستخدم والعالم)

- **لا ألوان ندرة أثناء الإنميشن** (طلب المستخدم صراحة): السحّابة تبقى `--border` المحايد تحت `.card-slot.animating`؛ اللون يُختم فقط لحظة الكشف.
- **النص العربي ثابت**: أزرار، تنبيهات `alert`، الفوتر بالكامل (M7mod · Discord: _.m6 · GitHub · سطر إخلاء AI) — لا إعادة صياغة.
- **فئات JS محظور كسرها**: `deck-grid, card-slot, empty-slot, card-art, animating-placeholder, placeholder-caption, exclude-card, card-img, card-name-label, exclude-overlay, rarity-*, visible/hidden/active/animating/reveal-anim/empty-value` + كل الـ ids في `script/dom.js`.
- **لا إطار عمل / لا build step**: الموقع ثابت (HTML/CSS/JS عادي، RTL).
- **لا ظلال/وهج ملون** على الخلفية الداكنة (neural shadows فقط).
- **لا حدود سميكة على زوايا دائرية**: السحّابة شريط خلفية 3px، الجيوب 2px.
- **لا kicker/eyebrow فوق العنوان** (القاعدة الممنوعة)؛ الـ wordmark تحت `h1`.
- **لا letter-spacing على العربية** (صفر دائمًا)؛ التتبّع للـ mono/لاتيني فقط.
- **العطر الوردي `#d32f8f` محجوز**: لحظات الإنشاء/التأكيد + حالات التحكم + مقياس الإكسير — لا زخرفة.
- **لا محتوى مخترع**: لا ختم «No. 0042» ولا إحصاءات/شهادات وهمية.
- **قياسات**: نص وظيفي ≥11px، جسم ≥12px؛ تباين ≥4.5:1.

## 3. النهايات المسدودة (لا تعد تجربتها)

- **خوادم صفحة القرار (serve-question)**: الخادم المنفصل كان يموت بين أشجار المعالجات؛ `--wait` خرج 4 (أُغلقت الصفحة بلا إجابة). حُلَّ بالأسئلة المهيكلة في المحادثة — **العالم «صفحة جامع البطاقات» مؤكد من المستخدم، لا حاجة لإعادة رمي أو عرض اتجاهات**.
- **الشبكة داخل sandbox (pwsh)**: `Invoke-WebRequest`/`curl` لفشل TLS → لا تنزيل من GitHub/impeccable.style من shell. **Chromium عبر Playwright لديه شبكة فعلًا** (نجح تنزيل `data.json` وأيقونات CDN منه).
- **Playwright CLI**: الأداة `playwright` العالمية هي نسخة **Python** (لا Node) وتتطلب build 1223 بينما الكاش 1234 → لا تعمل CLI مباشرة؛ استخدم API البايثون مع `executable_path=C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe` (سياسة الاعتماد حاليًا full-access دون موافقات).
- **لقطات file://**: تحميل CDN للأيقونات بطيء فتظهر جيوب فارغة في اللقطات المبكرة → انتظر `img.complete` أو استخدم زر «تخطي التحميل»؛ في الاستخدام الحقيقي التطبيق يpreload كل الأيقونات عند الإقلاع.
- **Detector (font-size)**: يشتق الـ ramp من قيم `fontSize` لكل دور في frontmatter **لا** من قوائم `typeRamp`/`fontSizes` → تبقى ~32 تنبيه استشاري مقصود (كل المقاسات موثقة في 3 مواضع). ألوان/زوايا انحلّت بالتوسيع. لا مزيد من التخمين على مفاتيح.
- **لوحات QUALITY BAR (impeccable.style)**: تنزيلها فشل دائمًا (TLS) → لم يُعَرَض بصريًا؛ العالم بُني من قواعد النظام النصية. لا تحاولة ثالثة.
- **وكلاء مخططات معطوبون**: 3 من 6 subagents تجمدوا دون ملف → قُطعت وكُتبت المخططات يدويًا. إن أفلست subagents في مهمة مخطوطة، أنهِها واكتب الملف مباشرة.
- **الـ goal المنعقد**: لا يمكن النموذج استئناف goal في وضع paused — المستخدم فقط.
