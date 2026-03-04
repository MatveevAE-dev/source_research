/**
 * Справочник источников — загрузка из Google Sheets или CSV, фильтры, поиск, инструкция
 */

// В таблице несколько листов; по умолчанию экспортируется первый («Ответы на форму»). Указываем gid листа «Реестр источников» (gid виден в ссылке при открытии этого листа в таблице).
const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1RjulbapYc5d-ePahN2KVvwRufOit03VRNQ7kl2jsgoI/export?format=csv&gid=6407604';

const COLUMNS = [
  'Направление',
  'Наименование источника',
  'Ссылка',
  'Комментарии',
  'Категория',
  'Тип источника',
  'Страна',
  'Список',
];

// Инструкция по категориям (цели анализа) — из листа «Списки по направлениям»
const CATEGORY_INSTRUCTIONS = {
  'Отраслевой агрегатор новостей и аналитики': `Что это: отраслевые медиа/дайджесты, собирающие новости, кейсы, регуляторные изменения и «что происходит на рынке».
Зачем использовать:
Быстро понимать контекст и повестку отрасли (что обсуждают, кто растёт/падает).
Отслеживать сделки, партнёрства, продуктовые запуски, изменения в цепочках поставок.
Ловить «слабые сигналы» через повторяющиеся темы/кейсы.`,
  'Консалтинговые отчеты': `Что это: материалы крупных консалтинговых компаний (мегатренды, отраслевые трансформации, бенчмарки).
Зачем использовать:
Формировать стратегический narrative (куда движется отрасль и почему).
Получать фреймворки и "executive language" для топ-менеджмента.
Находить кейсы трансформаций и типовые дорожные карты.`,
  'Рыночные исследования и отчеты': `Что это: отчёты исследовательских агентств, отраслевые обзоры, sizing, сегментации, прогнозы.
Зачем использовать:
Быстро получить цифры TAM/SAM/SOM, CAGR, драйверы/барьеры.
Сверять свою гипотезу с внешним «консенсусом».
Находить готовые сегментации и критерии выбора.`,
  'Макроэкономические и демографические данные': `Что это: показатели доходов, инфляции, занятости, миграции, структуры населения, потребления и т.п.
Зачем использовать:
Проверять, «тянет ли» рынок гипотезу: ёмкость, платежеспособность, динамика.
Делать сценарии и прогнозы спроса (рост/стагнация, смена сегментов).
Обосновывать стратегию географий и ICP через факты.`,
  'Нацстатслужба': `Что это: официальная статистика страны (иногда глубже и «чище», чем агрегаторы).
Зачем использовать:
Подтверждать рыночные тезисы официальными данными (для инвесторов/совета).
Доставать разрезы, которых нет в медиа: регионы, отрасли, структура занятости.
Нормализовать показатели для моделей (базовые ряды, методологии).`,
  'Компании/финансы/реестры': `Что это: базы юрлиц, финансовая отчётность, реестры, сведения о владельцах/директорах/долгах/судах (в зависимости от страны).
Зачем использовать:
Оценивать устойчивость и масштабы игроков (выручка, динамика, риски).
Делать short-list партнёров/поставщиков/целей для M&A.
Проверять «кто реально стоит за компанией» и признаки проблем.`,
  'Голос клиента и отзывы': `Что это: отзывы, форумы, соцсети, app-reviews, support-треды, комьюнити.
Зачем использовать:
Добывать "pain points" реальным языком клиента (JTBD, триггеры покупки).
Находить фичи-запросы и причины оттока (что «бесит», что «не хватает»).
Валидировать позиционирование и ценностные обещания.`,
  'Академические и патентные исследования': `Что это: научные публикации, препринты, базы патентов и цитирования.
Зачем использовать:
Видеть, куда реально движется технология (SOTA), до того как это станет «мейнстримом».
Понимать, кто владеет IP/барьерами входа, где «белые пятна».
Искать прикладные направления и сигналы коммерциализации.`,
  'Каталог стартапов/проектов': `Что это: базы стартапов, продуктовые витрины, трекеры, комьюнити проектов.
Зачем использовать:
Ловить ранние тренды через новые запуски.
Находить партнёров/поставщиков технологий/команды для пилотов.
Смотреть, куда идёт венчур и какие темы привлекают деньги.`,
  'Цифровая конкурентная разведка': `Что это: источники, позволяющие наблюдать цифровой след конкурентов (продукты, маркетинг, найм, трафик, контент, позиции).
Зачем использовать:
Понимать GTM конкурентов: каналы, офферы, сегменты, messaging.
Отслеживать изменения продукта (фичи, цены, пакеты) и скорости релизов.
Находить «окна возможностей» — где конкуренты слабые/медленные.`,
  'Инструменты для анализа цен': `Что это: сервисы мониторинга цен, динамики, промо-акций, ассортимента, иногда — маркетплейсы.
Зачем использовать:
Вести конкурентный прайсинг и промо-стратегию.
Отслеживать ценовые войны, скидочные механики, "price corridors".
Оценивать готовность рынка платить и чувствительность к цене.`,
  'Каталоги софта/техстеки': `Что это: каталоги продуктов/инструментов/платформ, реестры интеграций.
Зачем использовать:
Быстро составлять карту рынка (категории, игроки, подкатегории, интеграции).
Идентифицировать "best-in-class" решения и стандарты де-факто.
Генерировать гипотезы дифференциации (что у всех одинаково, где есть пробел).`,
  'Паттерны/флоу/мобильные': `Что это: библиотеки UX-паттернов, типовые пользовательские сценарии.
Зачем использовать:
Быстрее проектировать интерфейсы на основе привычных паттернов.
Сравнивать, «как принято» решать задачу (онбординг, оплата, подписки).
Находить идеи для улучшения конверсии и удержания.`,
  'Мобильные приложения/Stores': `Что это: каталоги приложений и аналитика сторов (карточки, рейтинги, релизы, отзывы, ASO-сигналы).
Зачем использовать:
Смотреть конкурентов «вживую»: фичи, скриншоты, тексты, апдейты.
Понимать тренды монетизации и подписок, ценовые уровни.
Мониторить изменения по релизам и реакцию пользователей.`,
  'Дизайн/UX тренды (издания и дайджесты)': `Что это: медиа/дайджесты про дизайн, продукт, интерфейсы, исследования поведения.
Зачем использовать:
Держать руку на пульсе эстетики и взаимодействия (что становится нормой).
Находить референсы и аргументацию для дизайн-решений.
Подмечать новые паттерны в AI-интерфейсах, персонализации.`,
  'Галереи/шоукейсы (веб)': `Что это: подборки лучших сайтов/лендингов/продуктовых страниц, витрины кейсов.
Зачем использовать:
Быстро собирать референсы для UI и маркетинговых страниц.
Анализировать «как упаковывают ценность» (структура, блоки, доказательства).
Искать новые форматы: интерактив, микроанимации, сторителлинг.`,
  'Цифровые тренды/веб-спрос': `Что это: данные о поисковом спросе, трафике, интересе аудитории, сезонности.
Зачем использовать:
Быстро валидировать наличие спроса и его динамику.
Находить rising-topics, сезонные пики, региональные различия.
Поддерживать decisions по контенту, SEO, продуктовым приоритетам.`,
  'Рекламные библиотеки/креативы': `Что это: библиотеки рекламных объявлений и креативов, иногда с метаданными (платформа/даты/форматы).
Зачем использовать:
Понимать, какие офферы конкуренты реально «крутят» и что тестируют.
Снимать креативные паттерны по сегментам (боли, триггеры, доказательства).
Находить идеи для A/B-тестов и позиционирования.`,
};

/**
 * Парсинг CSV с учётом кавычек и переносов строк внутри полей
 */
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const row = [];
    while (i < len) {
      if (text[i] === '"') {
        let cell = '';
        i++;
        while (i < len) {
          if (text[i] === '"') {
            if (text[i + 1] === '"') {
              cell += '"';
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            cell += text[i];
            i++;
          }
        }
        row.push(cell);
        if (text[i] === ',') i++;
        else if (text[i] === '\r') { i++; if (text[i] === '\n') i++; break; }
        else if (text[i] === '\n') { i++; break; }
        else if (i >= len) break;
        else i++;
      } else {
        let cell = '';
        while (i < len && text[i] !== ',' && text[i] !== '\r' && text[i] !== '\n') {
          cell += text[i];
          i++;
        }
        row.push(cell.trim());
        if (text[i] === ',') i++;
        else if (text[i] === '\r') { i++; if (text[i] === '\n') i++; break; }
        else if (text[i] === '\n') { i++; break; }
        else break;
      }
    }
    if (row.some(cell => cell !== '')) rows.push(row);
  }

  return rows;
}

/**
 * Преобразование строк CSV в массив объектов по заголовкам
 */
function csvToSources(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.trim());
  const sources = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj = {};
    header.forEach((key, i) => {
      obj[key] = (row[i] != null ? String(row[i]).trim() : '');
    });
    if (obj['Направление'] && obj['Наименование источника']) {
      sources.push(obj);
    }
  }
  return sources;
}

/**
 * Группировка источников: Направление → Категория → массив записей
 */
function groupByDirectionAndCategory(sources) {
  const map = new Map();
  for (const s of sources) {
    const dir = (s['Направление'] || '').trim() || 'Без направления';
    const cat = (s['Категория'] || '').trim() || 'Без категории';
    if (!map.has(dir)) map.set(dir, new Map());
    const byCat = map.get(dir);
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(s);
  }
  const result = [];
  const sortedDirs = [...map.keys()].sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return String(a).localeCompare(b);
  });
  for (const dir of sortedDirs) {
    const byCat = map.get(dir);
    const categories = [...byCat.keys()].sort();
    result.push({
      direction: dir,
      categories: categories.map(cat => ({ name: cat, items: byCat.get(cat) })),
    });
  }
  return result;
}

/**
 * Нормализация ссылки (добавить https:// при отсутствии протокола)
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return 'https://' + u;
}

/**
 * Получение уникальных значений для фильтров
 */
function getUniqueValues(sources, key) {
  const set = new Set();
  for (const s of sources) {
    const v = (s[key] || '').trim();
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

// --- DOM
const el = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  content: document.getElementById('content'),
  search: document.getElementById('search'),
  triggerDirection: document.getElementById('trigger-direction'),
  triggerCategory: document.getElementById('trigger-category'),
  triggerCountry: document.getElementById('trigger-country'),
  panelDirection: document.getElementById('panel-direction'),
  panelCategory: document.getElementById('panel-category'),
  panelCountry: document.getElementById('panel-country'),
  btnInstruction: document.getElementById('btn-instruction'),
  modal: document.getElementById('modal-instruction'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  modalClose: document.getElementById('modal-close'),
  instructionList: document.getElementById('instruction-list'),
};

const FILTER_CONFIG = {
  direction: { key: 'Направление', labelAll: 'Все направления', trigger: null, panel: null },
  category: { key: 'Категория', labelAll: 'Все категории', trigger: null, panel: null },
  country: { key: 'Страна', labelAll: 'Все страны', trigger: null, panel: null },
};

let allSources = [];
let grouped = [];

function showLoading(show) {
  el.loading.classList.toggle('hidden', !show);
}

function showError(message) {
  el.error.textContent = message || '';
  el.error.classList.toggle('hidden', !message);
}

function showContent(show) {
  el.content.classList.toggle('hidden', !show);
}

function getSelectedFilterValues(panel) {
  if (!panel) return [];
  const checkboxes = panel.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function updateFilterTriggerLabel(trigger, labelEl, selected, labelAll) {
  if (!labelEl) return;
  if (selected.length === 0) {
    labelEl.textContent = labelAll;
  } else if (selected.length === 1) {
    labelEl.textContent = selected[0];
  } else {
    labelEl.textContent = `Выбрано: ${selected.length}`;
  }
}

function fillFilters(sources) {
  const dirs = getUniqueValues(sources, 'Направление');
  const cats = getUniqueValues(sources, 'Категория');
  const countries = getUniqueValues(sources, 'Страна');

  const buildPanel = (panel, values) => {
    panel.innerHTML = '';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'filter-dropdown__reset';
    resetBtn.textContent = 'Сбросить';
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      panel.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
      applyFiltersAndRender();
    });
    panel.appendChild(resetBtn);
    values.forEach(v => {
      const label = document.createElement('label');
      label.className = 'filter-checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = v;
      input.addEventListener('change', applyFiltersAndRender);
      label.appendChild(input);
      label.appendChild(document.createTextNode(v));
      panel.appendChild(label);
    });
  };

  buildPanel(el.panelDirection, dirs);
  buildPanel(el.panelCategory, cats);
  buildPanel(el.panelCountry, countries);

  FILTER_CONFIG.direction.trigger = el.triggerDirection;
  FILTER_CONFIG.direction.panel = el.panelDirection;
  FILTER_CONFIG.category.trigger = el.triggerCategory;
  FILTER_CONFIG.category.panel = el.panelCategory;
  FILTER_CONFIG.country.trigger = el.triggerCountry;
  FILTER_CONFIG.country.panel = el.panelCountry;

  updateFilterTriggerLabel(el.triggerDirection, el.triggerDirection.querySelector('.filter-dropdown__label'), [], 'Все направления');
  updateFilterTriggerLabel(el.triggerCategory, el.triggerCategory.querySelector('.filter-dropdown__label'), [], 'Все категории');
  updateFilterTriggerLabel(el.triggerCountry, el.triggerCountry.querySelector('.filter-dropdown__label'), [], 'Все страны');
}

function filterSources(sources) {
  const search = (el.search.value || '').trim().toLowerCase();
  const selectedDirs = getSelectedFilterValues(el.panelDirection);
  const selectedCats = getSelectedFilterValues(el.panelCategory);
  const selectedCountries = getSelectedFilterValues(el.panelCountry);

  const setD = selectedDirs.length > 0 ? new Set(selectedDirs) : null;
  const setC = selectedCats.length > 0 ? new Set(selectedCats) : null;
  const setCo = selectedCountries.length > 0 ? new Set(selectedCountries) : null;

  const filtered = sources.filter(s => {
    if (setD && !setD.has((s['Направление'] || '').trim())) return false;
    if (setC && !setC.has((s['Категория'] || '').trim())) return false;
    if (setCo && !setCo.has((s['Страна'] || '').trim())) return false;
    if (search) {
      const name = (s['Наименование источника'] || '').toLowerCase();
      const comments = (s['Комментарии'] || '').toLowerCase();
      if (!name.includes(search) && !comments.includes(search)) return false;
    }
    return true;
  });

  updateFilterTriggerLabel(el.triggerDirection, el.triggerDirection.querySelector('.filter-dropdown__label'), selectedDirs, 'Все направления');
  updateFilterTriggerLabel(el.triggerCategory, el.triggerCategory.querySelector('.filter-dropdown__label'), selectedCats, 'Все категории');
  updateFilterTriggerLabel(el.triggerCountry, el.triggerCountry.querySelector('.filter-dropdown__label'), selectedCountries, 'Все страны');

  return filtered;
}

function render(filtered) {
  const groupedFiltered = groupByDirectionAndCategory(filtered);

  const html = groupedFiltered.map(({ direction, categories }) => {
    const catsHtml = categories.map(({ name, items }) => {
      const cardsHtml = items.map(item => {
        const link = normalizeUrl(item['Ссылка']);
        const name = escapeHtml(item['Наименование источника'] || '—');
        const country = escapeHtml((item['Страна'] || '').trim() || '—');
        const comments = escapeHtml((item['Комментарии'] || '').trim() || '—');
        return `
          <article class="card">
            <h3 class="card__name">${name}</h3>
            <div class="card__meta"><span class="card__country">${country}</span></div>
            <p class="card__description">${comments}</p>
            <a href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer" class="card__link">Открыть источник</a>
          </article>`;
      }).join('');
      return `
        <div class="section-category">
          <h3 class="section-category__title">${escapeHtml(name)} <span class="section-category__count">${items.length}</span></h3>
          <div class="cards">${cardsHtml}</div>
        </div>`;
    }).join('');

    return `
      <section class="section-direction" aria-labelledby="dir-${escapeAttr(direction)}">
        <h2 class="section-direction__title" id="dir-${escapeAttr(direction)}">${escapeHtml(direction)}</h2>
        ${catsHtml}
      </section>`;
  }).join('');

  el.content.innerHTML = html || '<p class="loading">Нет источников по выбранным фильтрам.</p>';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function escapeAttr(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function applyFiltersAndRender() {
  const filtered = filterSources(allSources);
  render(filtered);
}

function buildInstructionModal() {
  el.instructionList.innerHTML = Object.entries(CATEGORY_INSTRUCTIONS).map(([name, text]) => `
    <div class="instruction-item">
      <h3 class="instruction-item__name">${escapeHtml(name)}</h3>
      <p class="instruction-item__text">${escapeHtml(text)}</p>
    </div>
  `).join('');
}

function openModal() {
  el.modal.hidden = false;
  el.modalClose.focus();
}

function closeModal() {
  el.modal.hidden = true;
}

// Загрузка данных: сначала Google Sheets (напрямую или через CORS-прокси), при неудаче — локальный CSV
async function loadFromGoogleSheets() {
  const tryFetch = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    const text = await res.text();
    const sources = csvToSources(text);
    if (sources.length === 0) throw new Error('В таблице нет данных.');
    return sources;
  };
  try {
    return await tryFetch(GOOGLE_SHEETS_CSV_URL);
  } catch (e) {
    console.warn('Google Sheets (прямой запрос):', e);
  }
  if (!GOOGLE_SHEETS_CSV_URL) return null;
  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(GOOGLE_SHEETS_CSV_URL);
    return await tryFetch(proxyUrl);
  } catch (e2) {
    console.warn('Google Sheets (через прокси):', e2);
    return null;
  }
}

async function loadLocalCsv() {
  const paths = [
    'Источники сигналов - Реестр источников.csv',
    'data/sources.csv',
  ];
  for (const path of paths) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const text = await res.text();
      const sources = csvToSources(text);
      if (sources.length > 0) return sources;
    } catch (_) {}
  }
  return null;
}

function applyData(sources) {
  allSources = sources;
  grouped = groupByDirectionAndCategory(sources);
  showLoading(false);
  showError('');
  showContent(true);
  fillFilters(sources);
  applyFiltersAndRender();
}

// Инициализация
function init() {
  buildInstructionModal();

  el.btnInstruction.addEventListener('click', openModal);
  el.modalClose.addEventListener('click', closeModal);
  el.modalBackdrop.addEventListener('click', closeModal);
  el.modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  el.search.addEventListener('input', applyFiltersAndRender);

  function closeAllFilterPanels() {
    [el.panelDirection, el.panelCategory, el.panelCountry].forEach(panel => {
      panel.hidden = true;
    });
    [el.triggerDirection, el.triggerCategory, el.triggerCountry].forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleFilterPanel(trigger, panel) {
    const isOpen = !panel.hidden;
    closeAllFilterPanels();
    if (!isOpen) {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  el.triggerDirection.addEventListener('click', () => toggleFilterPanel(el.triggerDirection, el.panelDirection));
  el.triggerCategory.addEventListener('click', () => toggleFilterPanel(el.triggerCategory, el.panelCategory));
  el.triggerCountry.addEventListener('click', () => toggleFilterPanel(el.triggerCountry, el.panelCountry));

  document.addEventListener('click', (e) => {
    if (e.target.closest('.filter-dropdown')) return;
    closeAllFilterPanels();
  });

  (async () => {
    showLoading(true);
    showContent(false);
    let sources = await loadFromGoogleSheets();
    if (!sources || sources.length === 0) {
      sources = await loadLocalCsv();
    }
    if (sources && sources.length > 0) {
      applyData(sources);
    } else {
      showLoading(false);
      showError('Не удалось загрузить данные из Google Таблицы (возможна блокировка CORS). Убедитесь, что в config.js указана ссылка на таблицу или что в папке с сайтом есть файл «Источники сигналов - Реестр источников.csv».');
      showContent(false);
    }
  })();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
