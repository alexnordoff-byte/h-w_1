/* ==========================================
   ПОДВОДНЫЕ ПРИКЛЮЧЕНИЯ — Сценарий
   ========================================== */

// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', () => {

  // ==============================================
  // 1. ЗАГРУЗКА ДАННЫХ
  // ==============================================
  let contentData = null;
  let favorites = JSON.parse(localStorage.getItem('pp_favorites') || '[]');

  function loadContent() {
    return fetch('content.json')
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки данных');
        return r.json();
      })
      .then(data => {
        contentData = data;
        initSite();
      })
      .catch(err => {
        console.warn('Не удалось загрузить content.json, используются встроенные данные');
        contentData = getFallbackData();
        initSite();
      });
  }

  // Встроенные данные на случай, если content.json не загрузится
  function getFallbackData() {
    return {
      nav: [
        { label: 'Главная', href: '#hero' },
        { label: 'Рыбки', href: '#fish' },
        { label: 'Советы', href: '#tips' },
        { label: 'Сообщество', href: '#community' },
        { label: 'Галерея', href: '#gallery' },
        { label: 'Контакты', href: '#contacts' }
      ],
      fish: [
        { id: 'clownfish', name: 'Рыба-клоун', latin: 'Amphiprion ocellaris', image: '🐠', size: 'до 11 см', difficulty: 'Лёгкая', temp: '25–27°C', ph: '8.1–8.4', description: 'Та самая рыбка из мультфильма! Очень общительная, любит прятаться в актиниях.', compatibility: 'Мирные рыбы, креветки', feeding: 'Хлопья, гранулы, замороженные корма 2 раза в день', aquarium: 'от 100 литров', tags: ['морские', 'новичкам', 'мирные'] },
        { id: 'guppy', name: 'Гуппи', latin: 'Poecilia reticulata', image: '🐟', size: 'до 4 см', difficulty: 'Очень лёгкая', temp: '22–26°C', ph: '6.8–7.8', description: 'Одна из самых популярных аквариумных рыбок. Яркие хвосты и неприхотливость делают их идеальным выбором для новичков.', compatibility: 'Любые мирные рыбы', feeding: 'Универсальный корм 1-2 раза в день', aquarium: 'от 30 литров', tags: ['пресноводные', 'новичкам', 'живородящие'] },
        { id: 'neon', name: 'Неон', latin: 'Paracheirodon innesi', image: '💎', size: 'до 6 см', difficulty: 'Средняя', temp: '23–27°C', ph: '5.5–7.0', description: 'Небольшие стайные рыбки с неоновой полосой. В стае выглядят потрясающе!', compatibility: 'Мирные стайные рыбы', feeding: 'Мелкие хлопья, артемия', aquarium: 'от 50 литров', tags: ['пресноводные', 'стайные', 'мирные'] },
        { id: 'discus', name: 'Дискус', latin: 'Symphysodon aequifasciatus', image: '🎨', size: 'до 20 см', difficulty: 'Высокая', temp: '28–31°C', ph: '6.0–7.0', description: 'Король аквариума! Дискусы требуют опыта и внимания, но их красота стоит усилий.', compatibility: 'Только дискусы и мирные донные', feeding: 'Специализированные корма, 3-4 раза в день', aquarium: 'от 300 литров', tags: ['пресноводные', 'опытным', 'требовательные'] },
        { id: 'angelfish', name: 'Скалярия', latin: 'Pterophyllum scalare', image: '🐟', size: 'до 15 см', difficulty: 'Средняя', temp: '24–28°C', ph: '6.5–7.4', description: 'Элегантные рыбки с формой полумесяца. Умные, узнают хозяина.', compatibility: 'Мирные рыбы, кроме мелких', feeding: 'Хлопья, гранулы, мотыль 2 раза в день', aquarium: 'от 100 литров (высокий)', tags: ['пресноводные', 'опытным', 'элегантные'] },
        { id: 'zebrafish', name: 'Данио-рерио', latin: 'Danio rerio', image: '🐟', size: 'до 5 см', difficulty: 'Очень лёгкая', temp: '18–24°C', ph: '6.5–7.5', description: 'Подвижные стайные рыбки в полоску. Настоящие непоседы!', compatibility: 'Любые мирные рыбы', feeding: 'Мелкие хлопья, гранулы', aquarium: 'от 40 литров', tags: ['пресноводные', 'новичкам', 'активные'] }
      ],
      tips: [
        { id: 'setup', title: 'Запуск аквариума', icon: '🚀', content: '<p>Запуск аквариума — самый ответственный этап. Не торопитесь!</p><h4>Чек-лист:</h4><ul><li>Выберите аквариум от 50 литров</li><li>Установите фильтр, обогреватель, светильник</li><li>Уложите грунт (2–4 см) и залейте воду</li><li>Добавьте бактерии для запуска азотного цикла</li><li>Посадите растения и включите свет на 6–8 часов</li><li>Подождите 3–6 недель до стабилизации</li><li>Запускайте рыбок маленькими группами</li></ul>', warning: 'Никогда не запускайте рыбок в свежую воду — это для них губительно!' },
        { id: 'feeding', title: 'Кормление', icon: '🍕', content: '<p>Правильное кормление — залог здоровья ваших питомцев.</p><h4>Основные правила:</h4><ul><li>Кормите 1–2 раза в день небольшими порциями</li><li>Рыбки должны съедать весь корм за 2–3 минуты</li><li>Чередуйте сухие и живые корма</li><li>Раз в неделю устраивайте «голодный день»</li></ul>', warning: 'Недоеденный корм разлагается и отравляет воду. Лучше недокормить, чем перекормить!' },
        { id: 'filtration', title: 'Фильтрация и свет', icon: '💡', content: '<p>Фильтр и свет — сердце и глаза аквариума.</p><h4>Фильтрация:</h4><ul><li>Выбирайте фильтр с запасом мощности</li><li>Промывайте губки в аквариумной воде</li><li>Меняйте наполнители по графику</li></ul><h4>Освещение:</h4><ul><li>Световой день: 8–10 часов</li><li>Используйте таймер для стабильного режима</li></ul>', warning: 'Слишком много света → зелёная вода. Слишком мало → погибают растения.' },
        { id: 'health', title: 'Лечение и профилактика', icon: '🩺', content: '<p>Профилактика всегда легче лечения!</p><h4>Профилактика:</h4><ul><li>Карантин новых рыб 2–4 недели</li><li>Регулярные подмены воды 20–30% в неделю</li><li>Наблюдайте за поведением каждый день</li></ul><h4>Признаки болезни:</h4><ul><li>Рыбка трется о декорации</li><li>Плавники прижаты или склеены</li><li>Появились пятна, налет</li><li>Отказ от еды, вялость</li></ul>', warning: 'Не сыпьте лекарства «на всякий случай»! Поставьте точный диагноз.' }
      ],
      community_posts: [
        { id: 1, author: 'МорскойВолк', avatar: '🐺', title: 'Мой первый морской аквариум!', text: 'Наконец решился! Запустил морской аквариум на 200 литров. Кто держит морских — дайте совет!', tags: ['#морской', '#первыйзапуск', '#новичок'], reactions: { fish: 24, heart: 15, search: 8 }, replies: 12 },
        { id: 2, author: 'ТравницаАня', avatar: '🌿', title: 'Травник через 6 месяцев', text: 'Показываю свой травник через полгода после запуска. Результатом довольна!', tags: ['#травник', '#растения', '#CO2'], reactions: { fish: 45, heart: 32, search: 10 }, replies: 27 },
        { id: 3, author: 'ЦихлидоМан', avatar: '🦎', title: 'Цихлиды Малави — моя любовь', text: 'Держу малавийских цихлид уже 5 лет. У каждой свой характер!', tags: ['#цихлиды', '#малави', '#африка'], reactions: { fish: 18, heart: 22, search: 6 }, replies: 19 },
        { id: 4, author: 'КреветкоЛюб', avatar: '🦐', title: 'Креветки-альбиносы: опыт разведения', text: 'Вывел свою популяцию вишен-альбиносов! Делюсь опытом.', tags: ['#креветки', '#разведение', '#вишни'], reactions: { fish: 31, heart: 28, search: 14 }, replies: 23 }
      ],
      gallery: [
        { id: 1, title: 'Рифовый рай', volume: '450л', type: 'Морской', emoji: '🪸', tags: ['риф', 'морской', 'кораллы'], views: [{emoji:'🪸', label:'Общий вид', desc:'Крупный риф с мягкими и жёсткими кораллами'},{emoji:'🐠', label:'Рыбки', desc:'Стая разноцветных рыб между кораллов'},{emoji:'🫧', label:'Пузырьки', desc:'Воздушные пузырьки создают динамичный фон'}] },
        { id: 2, title: 'Амазонский биотоп', volume: '250л', type: 'Биотоп', emoji: '🌳', tags: ['биотоп', 'пресноводный', 'растения'], views: [{emoji:'🌳', label:'Панорама', desc:'Плотные заросли амазонских растений'},{emoji:'🪵', label:'Коряги', desc:'Натуральные коряги для скалярий'},{emoji:'🍂', label:'Дно', desc:'Листовой опад и мягкий грунт'}] },
        { id: 3, title: 'Голландский травник', volume: '180л', type: 'Пресноводный', emoji: '🌿', tags: ['травник', 'растения', 'голландский'], views: [{emoji:'🌿', label:'Общий план', desc:'Террасы растений в голландском стиле'},{emoji:'🌱', label:'Ковёр', desc:'Хемиантус и бликса на переднем плане'},{emoji:'🌺', label:'Цветение', desc:'Надводные цветы людвигии'}] },
        { id: 4, title: 'Цихлидник', volume: '300л', type: 'Пресноводный', emoji: '🪨', tags: ['цихлиды', 'пресноводный', 'камни'], views: [{emoji:'🪨', label:'Пейзаж', desc:'Горки из камней формируют ландшафт'},{emoji:'🦎', label:'Мбуна', desc:'Яркие цихлиды охраняют территорию'},{emoji:'🏝️', label:'Сверху', desc:'Все пещеры видны при верхнем свете'}] },
        { id: 5, title: 'Мини-нано', volume: '20л', type: 'Пресноводный', emoji: '🫧', tags: ['нано', 'пресноводный', 'новичкам'], views: [{emoji:'🫧', label:'Общий вид', desc:'Компактный травник с креветками'},{emoji:'🦐', label:'Креветки', desc:'Красные кристаллы на мхах'},{emoji:'💎', label:'Деталь', desc:'Миниатюрный мир в малом объёме'}] },
        { id: 6, title: 'Псевдоморе', volume: '120л', type: 'Псевдоморе', emoji: '🦀', tags: ['псевдоморе', 'цихлиды', 'африка'], views: [{emoji:'🦀', label:'Панорама', desc:'Голубое освещение как на рифе'},{emoji:'🏔️', label:'Камни', desc:'Коралловые камни в пресной воде'},{emoji:'🐟', label:'Рыбы', desc:'Малавийцы на фоне белого песка'}] },
        { id: 7, title: 'Терапевтический', volume: '60л', type: 'Пресноводный', emoji: '🌸', tags: ['креветки', 'растения', 'мирный'], views: [{emoji:'🌸', label:'Общий вид', desc:'Мягкое освещение и стая неонов'},{emoji:'✨', label:'Неоны', desc:'Голубые вспышки в толще воды'},{emoji:'🌿', label:'Растения', desc:'Валлиснерия и ротала'}] },
        { id: 8, title: 'Морской гигант', volume: '800л', type: 'Морской', emoji: '🐋', tags: ['морской', 'большой', 'риф'], views: [{emoji:'🐋', label:'Панорама', desc:'Крупнейший риф длиной 2 метра'},{emoji:'🦈', label:'Акулы', desc:'Акулы и скаты в свободном плавании'},{emoji:'🪸', label:'Кораллы', desc:'Сотни видов от зелёных до фиолетовых'}] }
      ],
      faq: [
        { q: 'Сколько литров нужно для начинающего?', a: 'Оптимальный объём — 80–150 литров. В маленьких аквариумах сложнее поддерживать стабильные параметры.' },
        { q: 'Как часто кормить рыбок?', a: '1-2 раза в день мелкими порциями. Вся еда должна съедаться за 2-3 минуты.' },
        { q: 'Почему зеленеет вода?', a: 'Из-за избытка света и питательных веществ. Уменьшите световой день до 6 часов и делайте подмены воды.' },
        { q: 'Нужен ли CO2 для растений?', a: 'Для большинства неприхотливых растений CO2 не обязателен. Для травника — желателен.' },
        { q: 'Какие рыбки подойдут ребёнку?', a: 'Гуппи, меченосцы, данио, неоны — яркие, неприхотливые и безопасные.' }
      ],
      contacts: { email: 'hello@podvodnie.ru', socials: [{ name: 'VK', icon: '📘', url: '#' }, { name: 'Telegram', icon: '✈️', url: '#' }, { name: 'YouTube', icon: '▶️', url: '#' }, { name: 'Instagram', icon: '📸', url: '#' }] }
    };
  }

  // ==============================================
  // 2. ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ
  // ==============================================
  function initSite() {
    buildNav();
    buildFishCards();
    buildTips();
    buildCommunity();
    buildGallery();
    buildFaq();
    buildSocials();
    initBubbles();
    initFishGuide();
    initBurger();
    initHeaderScroll();
    initRevealAnimations();
    initContactForm();
    initSubscribeForm();
    initFavorites();
    initLightbox();
    initGalleryFilters();
    initSmoothScroll();
    initCardHoverBubbles();

    // Показываем приветствие
    showNotification('🐟 Привет! Я твой подводный гид!');
  }

  // ==============================================
  // 3. НАВИГАЦИЯ
  // ==============================================
  function buildNav() {
    const list = document.getElementById('navList');
    if (!list || !contentData) return;
    list.innerHTML = contentData.nav.map(item =>
      `<li><a href="${item.href}" class="nav__link">${item.label}</a></li>`
    ).join('');
  }

  // ==============================================
  // 4. SVG-ИКОНКИ РЫБОК
  // ==============================================
  const fishSvgs = {
    guppy: `<svg viewBox="0 0 86 46">
      <ellipse cx="38" cy="23" rx="22" ry="10" fill="#D4D4D4" stroke="#999" stroke-width="0.7"/>
      <path d="M16 23 Q0 3 4 23 Q0 43 16 23Z" fill="#FFD700" stroke="#DAA520" stroke-width="0.5"/>
      <path d="M16 23 Q4 10 6 23 Q4 36 16 23Z" fill="#FFF9C4" opacity="0.5"/>
      <path d="M33 13 Q38 6 43 13" stroke="#aaa" stroke-width="0.6" fill="#D4D4D4"/>
      <circle cx="54" cy="21" r="2.8" fill="#333"/>
      <circle cx="55" cy="20" r="1.2" fill="#fff"/>
      <path d="M43 18 Q41 22 43 26" stroke="#aaa" stroke-width="0.7" fill="none" stroke-linecap="round"/>
      <path d="M58 22 L61 20 L58 24" stroke="#888" stroke-width="0.8" fill="none" stroke-linecap="round"/>
    </svg>`,
    neon: `<svg viewBox="0 0 74 38">
      <defs><clipPath id="neonClip"><ellipse cx="30" cy="18" rx="22" ry="9"/></clipPath></defs>
      <ellipse cx="30" cy="18" rx="22" ry="9" fill="#E0E0E0" stroke="#aaa" stroke-width="0.6"/>
      <g clip-path="url(#neonClip)">
        <rect x="0" y="0" width="60" height="12" fill="#808080"/>
        <rect x="0" y="12" width="60" height="4" fill="#29B6F6"/>
        <rect x="0" y="16" width="60" height="5" fill="#E53935"/>
        <rect x="0" y="21" width="60" height="20" fill="#F5F5F5"/>
      </g>
      <polygon points="50,18 68,8 68,28" fill="#E0E0E0" stroke="#aaa" stroke-width="0.5"/>
      <polygon points="50,18 68,8 68,28" fill="#E53935" opacity="0.5"/>
      <polygon points="28 9 31 4 34 9" fill="#808080" stroke="#666" stroke-width="0.4"/>
      <circle cx="14" cy="16" r="2.2" fill="#333"/>
      <circle cx="13" cy="15" r="0.8" fill="#fff"/>
      <path d="M24 14 Q22 17 24 20" stroke="#aaa" stroke-width="0.6" fill="none"/>
      <path d="M8 17 L5 17 L8 19" stroke="#888" stroke-width="0.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    discus: `<svg viewBox="-4 0 84 68">
      <defs><clipPath id="discusClip"><ellipse cx="38" cy="34" rx="28" ry="24"/></clipPath></defs>
      <ellipse cx="38" cy="34" rx="28" ry="24" fill="#FF8A65" stroke="#E64A19" stroke-width="0.8"/>
      <g clip-path="url(#discusClip)">
        <path d="M16 22Q20 17 24 22Q28 27 32 22Q36 17 40 22Q44 27 48 22Q52 17 56 22" stroke="#C62828" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M14 30Q18 25 22 30Q26 35 30 30Q34 25 38 30Q42 35 46 30Q50 25 54 30" stroke="#C62828" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M16 38Q20 33 24 38Q28 43 32 38Q36 33 40 38Q44 43 48 38Q52 33 56 38" stroke="#C62828" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M20 46Q24 41 28 46Q32 51 36 46Q40 41 44 46Q48 51 52 46" stroke="#C62828" stroke-width="1.8" fill="none" opacity="0.4"/>
      </g>
      <path d="M10 34 Q-2 25 -2 34 Q-2 43 10 34Z" fill="#FF8A65" stroke="#E64A19" stroke-width="0.6"/>
      <path d="M22 10 Q38 2 54 10" fill="#FF8A65" stroke="#E64A19" stroke-width="0.6"/>
      <path d="M24 58 Q38 66 52 58" fill="#FF8A65" stroke="#E64A19" stroke-width="0.6"/>
      <circle cx="52" cy="30" r="4" fill="#FFD700" stroke="#E64A19" stroke-width="0.6"/>
      <circle cx="53" cy="30" r="2.2" fill="#333"/>
      <circle cx="53.8" cy="29" r="0.8" fill="#fff"/>
      <path d="M44 28 Q42 32 44 36" stroke="#BF360C" stroke-width="0.7" fill="none"/>
      <path d="M62 33 L65 31 L62 35" stroke="#BF360C" stroke-width="0.7" fill="none" stroke-linecap="round"/>
    </svg>`,
    angelfish: `<svg viewBox="0 0 80 84">
      <polygon points="32,16 66,42 32,68 4,42" fill="#D4D4D4"/>
      <path d="M32 16 Q36 2 48 0 Q56 6 56 24Z" fill="#D4D4D4"/>
      <path d="M32 68 Q36 82 48 84 Q56 78 56 60Z" fill="#D4D4D4"/>
      <polygon points="32,16 66,42 32,68 4,42" fill="none" stroke="#999" stroke-width="0.8"/>
      <path d="M32 16 Q36 2 48 0 Q56 6 56 24" fill="none" stroke="#999" stroke-width="0.6"/>
      <path d="M32 68 Q36 82 48 84 Q56 78 56 60" fill="none" stroke="#999" stroke-width="0.6"/>
      <path d="M66 42 Q74 32 76 32 Q74 40 66 42 Q74 48 76 56 Q74 50 66 42Z" fill="#D4D4D4" stroke="#999" stroke-width="0.6"/>
      <line x1="22" y1="28" x2="22" y2="56" stroke="#1A237E" stroke-width="3" opacity="0.7"/>
      <line x1="32" y1="18" x2="32" y2="66" stroke="#1A237E" stroke-width="3" opacity="0.8"/>
      <line x1="42" y1="24" x2="42" y2="60" stroke="#1A237E" stroke-width="3" opacity="0.7"/>
      <circle cx="24" cy="42" r="3.5" fill="#FFD700" stroke="#999" stroke-width="0.5"/>
      <circle cx="23" cy="42" r="2" fill="#333"/>
      <circle cx="22.5" cy="41" r="0.8" fill="#fff"/>
      <path d="M34 38 Q32 42 34 46" stroke="#aaa" stroke-width="0.7" fill="none"/>
      <path d="M5 43 L2 41 L5 45" stroke="#888" stroke-width="0.7" fill="none" stroke-linecap="round"/>
    </svg>`,
    zebrafish: `<svg viewBox="0 0 94 40">
      <defs><clipPath id="zebraClip"><ellipse cx="36" cy="20" rx="30" ry="9"/></clipPath></defs>
      <ellipse cx="36" cy="20" rx="30" ry="9" fill="#E8E4D8" stroke="#999" stroke-width="0.6"/>
      <g clip-path="url(#zebraClip)">
        <rect x="0" y="10" width="80" height="3" fill="#1565C0"/>
        <rect x="0" y="13" width="80" height="1.5" fill="#FFD700"/>
        <rect x="0" y="14.5" width="80" height="3" fill="#1565C0"/>
        <rect x="0" y="17.5" width="80" height="1.5" fill="#FFD700"/>
        <rect x="0" y="19" width="80" height="3" fill="#1565C0"/>
      </g>
      <polygon points="66,20 90,8 90,32" fill="#E8E4D8" stroke="#999" stroke-width="0.5"/>
      <line x1="69" y1="20" x2="88" y2="10" stroke="#1565C0" stroke-width="2.5"/>
      <line x1="69" y1="20" x2="88" y2="12" stroke="#FFD700" stroke-width="1.2"/>
      <line x1="69" y1="20" x2="88" y2="30" stroke="#1565C0" stroke-width="2.5"/>
      <line x1="69" y1="20" x2="88" y2="28" stroke="#FFD700" stroke-width="1.2"/>
      <circle cx="12" cy="18" r="2.5" fill="#333"/>
      <circle cx="11" cy="17" r="1" fill="#fff"/>
      <path d="M22 16 Q20 19 22 22" stroke="#aaa" stroke-width="0.6" fill="none"/>
      <path d="M6 19 L3 17 L6 21" stroke="#888" stroke-width="0.7" fill="none" stroke-linecap="round"/>
    </svg>`
  };

  function getFishImageHtml(fish) {
    if (fishSvgs[fish.id]) {
      return `<span class="fish-card__image fish-svg">${fishSvgs[fish.id]}</span>`;
    }
    return `<span class="fish-card__image">${fish.image}</span>`;
  }

  function getFishModalImageHtml(fish) {
    if (fishSvgs[fish.id]) {
      return `<div class="modal__fish-icon fish-svg fish-svg--modal">${fishSvgs[fish.id]}</div>`;
    }
    return `<div class="modal__fish-icon">${fish.image}</div>`;
  }

  // ==============================================
  // 5. КАРТОЧКИ РЫБОК
  // ==============================================
  function buildFishCards() {
    const grid = document.getElementById('fishGrid');
    if (!grid || !contentData) return;

    grid.innerHTML = contentData.fish.map(fish =>
      `<article class="fish-card glass-card reveal" data-fish-id="${fish.id}">
        ${getFishImageHtml(fish)}
        <h3 class="fish-card__name">${fish.name}</h3>
        <p class="fish-card__latin">${fish.latin}</p>
        <div class="fish-card__info">
          <span class="fish-card__tag">${fish.size}</span>
          <span class="fish-card__tag">${fish.difficulty}</span>
          <span class="fish-card__tag">${fish.temp}</span>
        </div>
        <div class="fish-card__bubbles"></div>
      </article>`
    ).join('');

    // Открытие модалки при клике
    grid.querySelectorAll('.fish-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.fishId;
        const fish = contentData.fish.find(f => f.id === id);
        if (fish) openFishModal(fish);
      });
    });
  }

  // ==============================================
  // 6. МОДАЛКА РЫБКИ
  // ==============================================
  function openFishModal(fish) {
    const modal = document.getElementById('fishModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      ${getFishModalImageHtml(fish)}
      <h2 class="modal__fish-name">${fish.name}</h2>
      <p class="modal__fish-latin">${fish.latin}</p>
      <p class="modal__fish-desc">${fish.description}</p>
      <div class="modal__params">
        <div class="modal__param"><div class="modal__param-label">Размер</div><div class="modal__param-value">${fish.size}</div></div>
        <div class="modal__param"><div class="modal__param-label">Температура</div><div class="modal__param-value">${fish.temp}</div></div>
        <div class="modal__param"><div class="modal__param-label">pH</div><div class="modal__param-value">${fish.ph}</div></div>
        <div class="modal__param"><div class="modal__param-label">Сложность</div><div class="modal__param-value">${fish.difficulty}</div></div>
        <div class="modal__param"><div class="modal__param-label">Аквариум</div><div class="modal__param-value">${fish.aquarium}</div></div>
        <div class="modal__param"><div class="modal__param-label">Кормление</div><div class="modal__param-value">${fish.feeding}</div></div>
      </div>
      <h4 class="modal__section-title">Совместимость</h4>
      <p style="color: var(--sand); opacity: 0.85; font-size: 0.92rem;">${fish.compatibility}</p>
      <div class="modal__tags">
        ${fish.tags.map(t => `<span class="modal__tag">#${t}</span>`).join('')}
      </div>
    `;

    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';

    // Закрытие
    const close = () => {
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    };
    document.getElementById('modalClose').onclick = close;
    document.getElementById('modalOverlay').onclick = close;
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });
  }

  // ==============================================
  // 6. СОВЕТЫ (ВКЛАДКИ)
  // ==============================================
  function buildTips() {
    const tabs = document.getElementById('tipsTabs');
    const panels = document.getElementById('tipsPanels');
    if (!tabs || !panels || !contentData) return;

    tabs.innerHTML = contentData.tips.map(t =>
      `<button class="tips__tab" data-tip-id="${t.id}">${t.icon} ${t.title}</button>`
    ).join('');

    panels.innerHTML = contentData.tips.map(t =>
      `<div class="tips__panel" data-tip-id="${t.id}">
        ${t.content}
        <div class="warning">${t.warning}</div>
      </div>`
    ).join('');

    // Активируем первую вкладку
    const firstTab = tabs.querySelector('.tips__tab');
    const firstPanel = panels.querySelector('.tips__panel');
    if (firstTab) firstTab.classList.add('tips__tab--active');
    if (firstPanel) firstPanel.classList.add('tips__panel--active');

    // Переключение
    tabs.addEventListener('click', e => {
      const btn = e.target.closest('.tips__tab');
      if (!btn) return;

      tabs.querySelectorAll('.tips__tab').forEach(t => t.classList.remove('tips__tab--active'));
      panels.querySelectorAll('.tips__panel').forEach(p => p.classList.remove('tips__panel--active'));

      btn.classList.add('tips__tab--active');
      const panel = panels.querySelector(`.tips__panel[data-tip-id="${btn.dataset.tipId}"]`);
      if (panel) panel.classList.add('tips__panel--active');

      showNotification(`💡 ${btn.textContent.trim()} — читай советы!`);
    });
  }

  // ==============================================
  // 7. СООБЩЕСТВО
  // ==============================================
  function buildCommunity() {
    const feed = document.getElementById('communityFeed');
    if (!feed || !contentData) return;

    feed.innerHTML = contentData.community_posts.map(post =>
      `<article class="post-card reveal">
        <div class="post-card__header">
          <span class="post-card__avatar">${post.avatar}</span>
          <span class="post-card__author">${post.author}</span>
        </div>
        <h3 class="post-card__title">${post.title}</h3>
        <p class="post-card__text">${post.text}</p>
        <div class="post-card__tags">
          ${post.tags.map(t => `<span class="post-card__tag">${t}</span>`).join('')}
        </div>
        <div class="post-card__footer">
          <span class="post-card__reaction">🐟 ${post.reactions.fish}</span>
          <span class="post-card__reaction">💙 ${post.reactions.heart}</span>
          <span class="post-card__reaction">🔍 ${post.reactions.search}</span>
          <span>💬 ${post.replies} ответов</span>
        </div>
      </article>`
    ).join('');
  }

  // ==============================================
  // 8. ГАЛЕРЕЯ
  // ==============================================
  function buildGallery() {
    const masonry = document.getElementById('galleryMasonry');
    if (!masonry || !contentData) return;

    masonry.innerHTML = contentData.gallery.map(item => {
      const views = item.views || [{emoji: item.emoji, label: '', desc: ''}];
      return `<div class="gallery-item reveal" data-tags="${item.tags.join(',')}" data-id="${item.id}">
        <div class="gallery-slider" id="gallerySlider${item.id}">
          <div class="gallery-slider__track" id="galleryTrack${item.id}">
            ${views.map((v, i) =>
              `<div class="gallery-slider__slide ${i === 0 ? 'gallery-slider__slide--active' : ''}">
                <span class="gallery-item__icon">${v.emoji}</span>
              </div>`
            ).join('')}
          </div>
          <div class="gallery-slider__dots" id="galleryDots${item.id}">
            ${views.map((v, i) =>
              `<button class="gallery-slider__dot ${i === 0 ? 'gallery-slider__dot--active' : ''}" data-index="${i}" aria-label="${v.label}"></button>`
            ).join('')}
          </div>
          <button class="gallery-slider__arrow gallery-slider__arrow--prev" data-id="${item.id}" aria-label="Назад">&#10094;</button>
          <button class="gallery-slider__arrow gallery-slider__arrow--next" data-id="${item.id}" aria-label="Вперёд">&#10095;</button>
        </div>
        <h3 class="gallery-item__title">${item.title}</h3>
        <p class="gallery-item__meta">${item.volume} · ${item.type}</p>
      </div>`;
    }).join('');

    // Инициализация слайдеров
    document.querySelectorAll('.gallery-slider').forEach(slider => {
      const id = slider.querySelector('.gallery-slider__arrow').dataset.id;
      const track = document.getElementById(`galleryTrack${id}`);
      const dots = slider.querySelectorAll('.gallery-slider__dot');
      let current = 0;

      function goTo(index) {
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => {
          d.classList.toggle('gallery-slider__dot--active', i === current);
        });
        slider.querySelectorAll('.gallery-slider__slide').forEach((s, i) => {
          s.classList.toggle('gallery-slider__slide--active', i === current);
        });
      }

      slider.querySelector('.gallery-slider__arrow--prev').addEventListener('click', e => {
        e.stopPropagation();
        const item = contentData.gallery.find(g => g.id == id);
        const views = item.views || [{emoji: item.emoji}];
        goTo((current - 1 + views.length) % views.length);
      });

      slider.querySelector('.gallery-slider__arrow--next').addEventListener('click', e => {
        e.stopPropagation();
        const item = contentData.gallery.find(g => g.id == id);
        const views = item.views || [{emoji: item.emoji}];
        goTo((current + 1) % views.length);
      });

      dots.forEach(dot => {
        dot.addEventListener('click', e => {
          e.stopPropagation();
          goTo(parseInt(dot.dataset.index));
        });
      });
    });

    // Открытие лайтбокса
    masonry.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id);
        const item = contentData.gallery.find(g => g.id === id);
        if (item) openGalleryLightbox(item);
      });
    });
  }

  // ==============================================
  // 9. ФИЛЬТРЫ ГАЛЕРЕИ
  // ==============================================
  function initGalleryFilters() {
    const container = document.getElementById('galleryFilters');
    const masonry = document.getElementById('galleryMasonry');
    if (!container || !masonry) return;

    container.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      masonry.querySelectorAll('.gallery-item').forEach(item => {
        if (filter === 'all') {
          item.style.display = '';
          return;
        }
        const tags = item.dataset.tags;
        item.style.display = tags && tags.includes(filter) ? '' : 'none';
      });

      showNotification(`🪸 Показываю: ${btn.textContent.trim()}`);
    });
  }

  // ==============================================
  // 10. ЛАЙТБОКС ГАЛЕРЕИ
  // ==============================================
  function openGalleryLightbox(item) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    const views = item.views || [{emoji: item.emoji, label: '', desc: item.volume + ' · ' + item.type}];

    let currentView = 0;

    function renderView(index) {
      const v = views[index];
      document.getElementById('lightboxEmoji').textContent = v.emoji;
      document.getElementById('lightboxTitle').textContent = item.title;
      document.getElementById('lightboxVolume').textContent = item.volume;
      document.getElementById('lightboxType').textContent = item.type;

      // Показываем описание вида
      const body = document.getElementById('lightboxBody');
      let viewLabel = body.querySelector('.lightbox__view-label');
      let viewDesc = body.querySelector('.lightbox__view-desc');
      if (!viewLabel) {
        viewLabel = document.createElement('p');
        viewLabel.className = 'lightbox__view-label';
        body.querySelector('.lightbox__placeholder').appendChild(viewLabel);
        viewDesc = document.createElement('p');
        viewDesc.className = 'lightbox__view-desc';
        body.querySelector('.lightbox__placeholder').appendChild(viewDesc);
      }
      viewLabel.textContent = v.label ? `${v.label} (${index + 1}/${views.length})` : '';
      viewDesc.textContent = v.desc || '';

      // Стрелки в лайтбоксе
      let nav = body.querySelector('.lightbox__nav');
      if (!nav) {
        nav = document.createElement('div');
        nav.className = 'lightbox__nav';
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox__nav-btn lightbox__nav-btn--prev';
        prevBtn.innerHTML = '&#10094;';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox__nav-btn lightbox__nav-btn--next';
        nextBtn.innerHTML = '&#10095;';
        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        body.querySelector('.lightbox__placeholder').appendChild(nav);

        prevBtn.addEventListener('click', e => {
          e.stopPropagation();
          currentView = (currentView - 1 + views.length) % views.length;
          renderView(currentView);
        });
        nextBtn.addEventListener('click', e => {
          e.stopPropagation();
          currentView = (currentView + 1) % views.length;
          renderView(currentView);
        });
      }

      // Точки
      let dotsContainer = body.querySelector('.lightbox__dots');
      if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'lightbox__dots';
        body.querySelector('.lightbox__placeholder').appendChild(dotsContainer);
      }
      dotsContainer.innerHTML = views.map((v, i) =>
        `<button class="lightbox__dot ${i === index ? 'lightbox__dot--active' : ''}" data-idx="${i}"></button>`
      ).join('');
      dotsContainer.querySelectorAll('.lightbox__dot').forEach(d => {
        d.addEventListener('click', e => {
          e.stopPropagation();
          currentView = parseInt(e.target.dataset.idx);
          renderView(currentView);
        });
      });
    }

    lb.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
    renderView(0);

    const close = () => {
      lb.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    };
    document.getElementById('lightboxClose').onclick = close;
    document.getElementById('lightboxOverlay').onclick = close;

    document.getElementById('lightboxFav').onclick = () => {
      showNotification('⭐ Добавлено в избранное!');
    };
    document.getElementById('lightboxShare').onclick = () => {
      showNotification('🔗 Ссылка скопирована!');
    };

    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
      if (e.key === 'ArrowLeft') { currentView = (currentView - 1 + views.length) % views.length; renderView(currentView); }
      if (e.key === 'ArrowRight') { currentView = (currentView + 1) % views.length; renderView(currentView); }
    });
  }

  // ==============================================
  // 11. FAQ (АККОРДЕОН)
  // ==============================================
  function buildFaq() {
    const list = document.getElementById('faqList');
    if (!list || !contentData) return;

    list.innerHTML = contentData.faq.map((item, i) =>
      `<div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          <span>${item.q}</span>
          <span class="faq-icon">▼</span>
        </button>
        <div class="faq-answer">${item.a}</div>
      </div>`
    ).join('');

    list.addEventListener('click', e => {
      const question = e.target.closest('.faq-question');
      if (!question) return;

      const item = question.parentElement;
      const isOpen = item.classList.contains('faq-item--open');

      // Закрываем все
      list.querySelectorAll('.faq-item--open').forEach(el => {
        el.classList.remove('faq-item--open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-item--open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ==============================================
  // 12. СОЦСЕТИ
  // ==============================================
  function buildSocials() {
    const block = document.getElementById('socialsBlock');
    if (!block || !contentData) return;

    block.innerHTML = contentData.contacts.socials.map(s =>
      `<a href="${s.url}" class="contacts__social" target="_blank" rel="noopener" aria-label="${s.name}">
        <span>${s.icon}</span>
        <span>${s.name}</span>
      </a>`
    ).join('');
  }

  // ==============================================
  // 13. ПУЗЫРЬКИ (ФОН)
  // ==============================================
  function initBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    function createBubble() {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 20 + 6;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDuration = (Math.random() * 8 + 6) + 's';
      bubble.style.animationDelay = '0s';
      container.appendChild(bubble);

      // Удаляем после анимации
      setTimeout(() => bubble.remove(), 14000);
    }

    // Создаём пузырьки периодически
    createBubble();
    setInterval(createBubble, 800);
  }

  // ==============================================
  // 14. РЫБКА-ГИД
  // ==============================================
  function initFishGuide() {
    const fish = document.getElementById('fishGuide');
    if (!fish) return;

    // Начальная позиция — центр экрана
    let targetX = window.innerWidth * 0.7;
    let targetY = window.innerHeight * 0.4;
    let currentX = targetX;
    let currentY = targetY;

    // Сразу ставим рыбку в начальную позицию
    fish.style.transform = `translate(${targetX}px, ${targetY}px)`;
    fish.style.opacity = '1';

    let hideTimeout = null;

    // Следим за мышью
    document.addEventListener('mousemove', e => {
      targetX = e.clientX;
      targetY = e.clientY;
      fish.style.opacity = '1';
      clearTimeout(hideTimeout);
    });

    // Прячем при бездействии
    document.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => {
        fish.style.opacity = '0';
      }, 3000);
    });

    // Плавное движение с комфортной скоростью
    function animateFish() {
      const speed = 0.25;
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;

      // Ограничиваем область
      const maxX = window.innerWidth - 130;
      const maxY = window.innerHeight - 100;
      const clampedX = Math.max(10, Math.min(maxX, currentX));
      const clampedY = Math.max(10, Math.min(maxY, currentY));

      // Поворот в сторону движения
      const dx = targetX - currentX;
      const rotation = Math.max(-20, Math.min(20, dx * 0.2));

      fish.style.transform = `translate(${clampedX}px, ${clampedY}px) rotate(${rotation}deg) ${
        dx < 0 ? 'scaleX(-1)' : ''
      }`;

      requestAnimationFrame(animateFish);
    }

    animateFish();

    // Показываем подсказки в ключевых секциях
    const sections = ['fish', 'tips', 'community', 'gallery', 'contacts'];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (sections.includes(id)) {
            const msgs = {
              fish: '🐟 Посмотри, какие тут рыбки!',
              tips: '💡 Тут много полезного!',
              community: '🤝 Заходи в сообщество!',
              gallery: '🖼️ Какая красота!',
              contacts: '✉️ Напиши нам!'
            };
            showNotification(msgs[id] || '🐟 Привет!');
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // ==============================================
  // 15. УВЕДОМЛЕНИЯ
  // ==============================================
  function showNotification(msg) {
    const el = document.getElementById('fishNotification');
    const msgEl = document.getElementById('notificationMsg');
    if (!el || !msgEl) return;

    msgEl.textContent = msg;
    el.classList.add('fish-notification--show');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => {
      el.classList.remove('fish-notification--show');
    }, 3000);
  }

  // ==============================================
  // 16. БУРГЕР-МЕНЮ
  // ==============================================
  function initBurger() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      burger.classList.toggle('burger--active');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Закрываем при клике на ссылку
    nav.addEventListener('click', e => {
      if (e.target.closest('.nav__link')) {
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ==============================================
  // 17. СКРЫТИЕ ШАПКИ ПРИ СКРОЛЛЕ
  // ==============================================
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 100) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      lastScroll = current;
    }, { passive: true });
  }

  // ==============================================
  // 18. АНИМАЦИИ ПРИ СКРОЛЛЕ (REVEAL)
  // ==============================================
  function initRevealAnimations() {
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ==============================================
  // 19. ФОРМА КОНТАКТОВ
  // ==============================================
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const message = document.getElementById('contactMessage');
    const nameErr = document.getElementById('contactNameError');
    const emailErr = document.getElementById('contactEmailError');
    const msgErr = document.getElementById('contactMessageError');

    function validateField(input, errorEl, validator) {
      const res = validator(input.value);
      if (res !== true) {
        input.classList.add('form-input--error');
        errorEl.textContent = res;
        return false;
      }
      input.classList.remove('form-input--error');
      errorEl.textContent = '';
      return true;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();

      const validName = validateField(name, nameErr, v => v.trim().length >= 2 ? true : 'Имя должно содержать хотя бы 2 символа');
      const validEmail = validateField(email, emailErr, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? true : 'Введите корректный email');
      const validMsg = validateField(message, msgErr, v => v.trim().length >= 10 ? true : 'Сообщение должно содержать минимум 10 символов');

      if (validName && validEmail && validMsg) {
        showNotification('✅ Спасибо! Мы получили ваше сообщение и ответим в ближайшее время.');
        form.reset();
      } else {
        showNotification('⚠️ Проверьте правильность заполнения полей');
      }
    });

    // Валидация при потере фокуса
    name.addEventListener('blur', () => validateField(name, nameErr, v => v.trim().length >= 2 ? true : 'Имя должно содержать хотя бы 2 символа'));
    email.addEventListener('blur', () => validateField(email, emailErr, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? true : 'Введите корректный email'));
    message.addEventListener('blur', () => validateField(message, msgErr, v => v.trim().length >= 10 ? true : 'Сообщение должно содержать минимум 10 символов'));
  }

  // ==============================================
  // 20. ПОДПИСКА
  // ==============================================
  function initSubscribeForm() {
    const form = document.getElementById('subscribeForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('subName');
      const email = document.getElementById('subEmail');

      if (name.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showNotification('🎉 Вы подписались! Ловите волну полезных советов!');
        form.reset();
      } else {
        showNotification('⚠️ Пожалуйста, введите имя и корректный email');
      }
    });
  }

  // ==============================================
  // 21. ИЗБРАННОЕ (LocalStorage)
  // ==============================================
  function initFavorites() {
    const btn = document.getElementById('saveFavoritesBtn');
    const msg = document.getElementById('saveFavoritesMsg');
    if (!btn || !msg) return;

    btn.addEventListener('click', () => {
      if (contentData && contentData.tips) {
        const activeTab = document.querySelector('.tips__tab--active');
        if (activeTab) {
          const id = activeTab.dataset.tipId;
          const tip = contentData.tips.find(t => t.id === id);
          if (tip) {
            if (!favorites.includes(id)) {
              favorites.push(id);
              localStorage.setItem('pp_favorites', JSON.stringify(favorites));
              msg.textContent = `⭐ "${tip.title}" сохранён в избранном!`;
              showNotification(`⭐ "${tip.title}" добавлен в избранное!`);
            } else {
              msg.textContent = `✅ "${tip.title}" уже в избранном`;
            }
          }
        } else {
          msg.textContent = 'Сначала выберите совет';
        }
      }
    });
  }

  // ==============================================
  // 22. ПУЗЫРЬКИ НА КАРТОЧКАХ (ХОВЕР)
  // ==============================================
  function initCardHoverBubbles() {
    document.addEventListener('mouseover', e => {
      const card = e.target.closest('.fish-card');
      if (!card) return;

      const container = card.querySelector('.fish-card__bubbles');
      if (!container) return;

      // Создаём 3 пузырька
      for (let i = 0; i < 3; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'fish-card__bubble';
        const size = Math.random() * 6 + 4;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = (Math.random() * 80 + 10) + '%';
        bubble.style.bottom = '10%';
        bubble.style.animationDuration = (Math.random() * 0.5 + 0.8) + 's';
        bubble.style.animationDelay = (i * 0.15) + 's';
        container.appendChild(bubble);

        setTimeout(() => bubble.remove(), 1500);
      }
    });
  }

  // ==============================================
  // 23. ПЛАВНЫЙ СКРОЛЛ
  // ==============================================
  function initSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = 64;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  }

  // ==============================================
  // 24. ЗАПУСК
  // ==============================================
  loadContent();

}); // Конец DOMContentLoaded
