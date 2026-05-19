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
        { id: 1, title: 'Рифовый рай', volume: '450л', type: 'Морской', emoji: '🪸', tags: ['риф', 'морской', 'кораллы'], views: [{img:'IMAGE/rp1.png',svgKey:'1_0',emoji:'🪸',label:'Общий вид',desc:'Крупный риф с мягкими и жёсткими кораллами под голубым светом'},{img:'IMAGE/rp2.png',svgKey:'1_1',emoji:'🐠',label:'Коралловый сад',desc:'Разноцветные рыбы среди коралловых полипов'},{img:'IMAGE/rp3.png',svgKey:'1_2',emoji:'🫧',label:'Стая в толще',desc:'Косяк рыб в открытой голубой воде'},{img:'IMAGE/rp4.png',svgKey:'1_3',emoji:'🪸',label:'Сверху',desc:'Вид на риф сверху — структура кораллов'}] },
        { id: 2, title: 'Амазонский биотоп', volume: '250л', type: 'Биотоп', emoji: '🌳', tags: ['биотоп', 'пресноводный', 'растения'], views: [{img:'IMAGE/ab1.jpeg',svgKey:'2_0',emoji:'🌳',label:'Панорама',desc:'Плотные заросли амазонских растений вдоль задней стенки'},{img:'IMAGE/ab2.jpeg',svgKey:'2_1',emoji:'🪵',label:'Коряги',desc:'Натуральные коряги создают укрытия для скалярий'},{img:'IMAGE/ab3.jpeg',svgKey:'2_2',emoji:'🍂',label:'Дно',desc:'Листовой опад и мягкий грунт — естественная среда'},{img:'IMAGE/ab4.jpeg',svgKey:'2_3',emoji:'🐟',label:'Скалярии',desc:'Скалярии среди вертикальных стеблей растений'}] },
        { id: 3, title: 'Голландский травник', volume: '180л', type: 'Пресноводный', emoji: '🌿', tags: ['травник', 'растения', 'голландский'], views: [{svgKey:'3_0',emoji:'🌿',label:'Общий план',desc:'Классический голландский аквариум с террасами растений'},{svgKey:'3_1',emoji:'🌱',label:'Передний план',desc:'Ковёр из хемиантуса и бликсы на переднем плане'},{svgKey:'3_2',emoji:'🌺',label:'Цветущий',desc:'Надводные цветы людвигии и роталы'}] },
        { id: 4, title: 'Цихлидник', volume: '300л', type: 'Пресноводный', emoji: '🪨', tags: ['цихлиды', 'пресноводный', 'камни'], views: [{svgKey:'4_0',emoji:'🪨',label:'Каменный пейзаж',desc:'Горки из камней формируют природный ландшафт'},{svgKey:'4_1',emoji:'🦎',label:'Обитатели',desc:'Мбуна с яркой окраской охраняют свою территорию'},{svgKey:'4_2',emoji:'🏝️',label:'Вид сверху',desc:'Все камни и пещеры видны при верхнем освещении'},{svgKey:'4_3',emoji:'🪨',label:'В пещере',desc:'Внутри каменной пещеры с цихлидами'}] },
        { id: 5, title: 'Мини-нано', volume: '20л', type: 'Пресноводный', emoji: '🫧', tags: ['нано', 'пресноводный', 'новичкам'], views: [{svgKey:'5_0',emoji:'🫧',label:'Общий вид',desc:'Компактный травник с креветками и мхами'},{svgKey:'5_1',emoji:'🦐',label:'Креветки',desc:'Красные кристаллы пасутся на листьях яванского мха'},{svgKey:'5_2',emoji:'💎',label:'Макро',desc:'Крупный план мелких растений и мха'},{svgKey:'5_3',emoji:'🫧',label:'Миниатюра',desc:'Весь миниатюрный мир в малом объёме'}] },
        { id: 6, title: 'Псевдоморе', volume: '120л', type: 'Псевдоморе', emoji: '🦀', tags: ['псевдоморе', 'цихлиды', 'африка'], views: [{svgKey:'6_0',emoji:'🦀',label:'Панорама',desc:'Голубое освещение имитирует подводный риф'},{svgKey:'6_1',emoji:'🏔️',label:'Декорации',desc:'Коралловые камни и ракушки в пресной воде'},{svgKey:'6_2',emoji:'🐟',label:'Население',desc:'Цихлиды озера Малави на фоне белого песка'}] },
        { id: 7, title: 'Терапевтический', volume: '60л', type: 'Пресноводный', emoji: '🌸', tags: ['креветки', 'растения', 'мирный'], views: [{svgKey:'7_0',emoji:'🌸',label:'Общий вид',desc:'Мягкое освещение, стая неонов и креветки'},{svgKey:'7_1',emoji:'✨',label:'Неоны',desc:'Голубые и красные вспышки в толще воды'},{svgKey:'7_2',emoji:'🌿',label:'Растительность',desc:'Густые заросли валлиснерии и роталы'},{svgKey:'7_3',emoji:'🌸',label:'Мшистый угол',desc:'Тихий уголок с яванским мхом'}] },
        { id: 8, title: 'Морской гигант', volume: '800л', type: 'Морской', emoji: '🐋', tags: ['морской', 'большой', 'риф'], views: [{svgKey:'8_0',emoji:'🐋',label:'Вся панорама',desc:'Огромный риф длиной 2 метра с крупными рыбами'},{svgKey:'8_1',emoji:'🦈',label:'Акула',desc:'Силуэт акулы в открытой воде'},{svgKey:'8_2',emoji:'🪸',label:'Коралловый сад',desc:'Сотни видов кораллов от зелёных до фиолетовых'},{svgKey:'8_3',emoji:'🐋',label:'Скат',desc:'Морской скат парит над рифом'}] }
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
  // AQUARIUM VIEW SVG SCENES
  // ==============================================
  const aquariumViews = {
    '1_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a1_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#08335c"/><stop offset="0.5" stop-color="#0f5a8a"/><stop offset="1" stop-color="#1a7a9a"/></linearGradient><linearGradient id="a1_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9af7b"/><stop offset="1" stop-color="#8b7355"/></linearGradient><radialGradient id="a1_v0_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="a1_v0_ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.12)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a1_v0_bg)"/>
<polygon points="30,0 70,0 160,160 80,160" fill="url(#a1_v0_ray)" opacity="0.5"/><polygon points="140,0 180,0 230,160 180,160" fill="url(#a1_v0_ray)" opacity="0.35"/>
<rect x="0" y="132" width="240" height="28" fill="url(#a1_v0_sd)" rx="3"/>
<path d="M10 132 Q30 118 60 126 Q90 115 120 128 Q150 116 180 126 Q210 118 230 130 L230 160 L10 160Z" fill="#a08555" opacity="0.5"/>
<path d="M55 120 L62 75 L67 75 L60 120Z" fill="#e8735a"/><path d="M70 118 L78 65 L83 65 L75 118Z" fill="#e8735a"/><path d="M68 120 L72 85 L76 85 L72 120Z" fill="#f0a050"/>
<path d="M130 115 L138 70 L143 70 L135 115Z" fill="#d06080"/><path d="M145 112 L152 60 L157 60 L150 112Z" fill="#d06080"/><path d="M140 114 L145 80 L149 80 L144 114Z" fill="#c040a0"/>
<path d="M180 120 L184 90 L188 90 L184 120Z" fill="#f0a050"/><path d="M190 118 L196 80 L200 80 L194 118Z" fill="#e8735a"/>
<ellipse cx="95" cy="100" rx="6" ry="3" fill="#ff6b35"/><ellipse cx="105" cy="94" rx="5" ry="2.5" fill="#4fc3f7"/><ellipse cx="88" cy="106" rx="4" ry="2" fill="#ffeb3b"/>
<ellipse cx="160" cy="90" rx="5" ry="2.5" fill="#e040fb"/><ellipse cx="168" cy="85" rx="4" ry="2" fill="#ff6b35"/>
<circle cx="35" cy="45" r="2" fill="rgba(255,255,255,0.35)"/><circle cx="90" cy="35" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="145" cy="55" r="2.5" fill="rgba(255,255,255,0.3)"/><circle cx="200" cy="40" r="2" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a1_v0_vg)"/>
</svg>`,
    '1_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a1_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2d50"/><stop offset="0.4" stop-color="#0e4a73"/><stop offset="1" stop-color="#16688a"/></linearGradient><radialGradient id="a1_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="a1_v1_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.15)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a1_v1_bg)"/>
<polygon points="60,0 110,0 200,160 130,160" fill="url(#a1_v1_ray)" opacity="0.4"/>
<path d="M0 135 Q20 120 40 130 Q60 110 80 125 Q100 108 120 120 Q140 110 160 125 Q180 115 200 122 Q220 108 240 120 L240 160 L0 160Z" fill="#c9af7b"/>
<path d="M30 125 Q40 100 50 120" stroke="#e8735a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M45 120 Q55 90 65 115" stroke="#d06080" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M80 118 Q90 85 100 112" stroke="#f0a050" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M95 112 Q105 75 115 108" stroke="#e040fb" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M140 120 Q150 95 160 116" stroke="#e8735a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M155 115 Q165 80 175 110" stroke="#4fc3f7" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="60" cy="105" r="3" fill="#ffeb3b"/><circle cx="110" cy="100" r="2.5" fill="#4fc3f7"/><circle cx="170" cy="95" r="3" fill="#ff6b35"/>
<circle cx="25" cy="50" r="1.5" fill="rgba(255,255,255,0.3)"/><circle cx="120" cy="60" r="2" fill="rgba(255,255,255,0.25)"/><circle cx="190" cy="40" r="1.8" fill="rgba(255,255,255,0.3)"/>
<rect width="240" height="160" fill="url(#a1_v1_vg)"/>
</svg>`,
    '1_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a1_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#072a4a"/><stop offset="1" stop-color="#0f5a8a"/></linearGradient><radialGradient id="a1_v2_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a1_v2_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a1_v2_bg)"/>
<polygon points="20,0 50,0 150,160 90,160" fill="url(#a1_v2_ray)" opacity="0.4"/><polygon points="120,0 150,0 220,160 180,160" fill="url(#a1_v2_ray)" opacity="0.3"/>
<rect x="0" y="145" width="240" height="15" fill="#1a5a7a" rx="2"/>
<ellipse cx="70" cy="80" rx="4" ry="2" fill="#4fc3f7"/><ellipse cx="80" cy="76" rx="4" ry="2" fill="#4fc3f7"/><ellipse cx="90" cy="82" rx="4" ry="2" fill="#4fc3f7"/><ellipse cx="60" cy="78" rx="3.5" ry="1.8" fill="#4fc3f7"/><ellipse cx="100" cy="80" rx="3.5" ry="1.8" fill="#4fc3f7"/>
<ellipse cx="75" cy="80" rx="3" ry="1.5" fill="#ff6b35"/><ellipse cx="85" cy="78" rx="3" ry="1.5" fill="#ffeb3b"/><ellipse cx="95" cy="81" rx="3" ry="1.5" fill="#ff6b35"/>
<ellipse cx="150" cy="100" rx="5" ry="2.5" fill="#4fc3f7"/><ellipse cx="162" cy="96" rx="4" ry="2" fill="#4fc3f7"/><ellipse cx="140" cy="102" rx="4" ry="2" fill="#4fc3f7"/><ellipse cx="170" cy="98" rx="4" ry="2" fill="#4fc3f7"/>
<ellipse cx="200" cy="60" rx="4" ry="2" fill="#e040fb"/><ellipse cx="210" cy="58" rx="3.5" ry="1.8" fill="#ff6b35"/>
<circle cx="40" cy="50" r="2" fill="rgba(255,255,255,0.3)"/><circle cx="130" cy="45" r="1.8" fill="rgba(255,255,255,0.25)"/><circle cx="180" cy="55" r="2.2" fill="rgba(255,255,255,0.2)"/>
<rect width="240" height="160" fill="url(#a1_v2_vg)"/>
</svg>`,
    '1_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a1_v3_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3560"/><stop offset="1" stop-color="#0f5080"/></linearGradient><radialGradient id="a1_v3_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a1_v3_bg)"/>
<ellipse cx="100" cy="80" rx="50" ry="40" fill="#1a5a7a" opacity="0.5"/><ellipse cx="160" cy="90" rx="40" ry="35" fill="#1a5a7a" opacity="0.4"/><ellipse cx="50" cy="70" rx="35" ry="30" fill="#1a5a7a" opacity="0.45"/>
<ellipse cx="100" cy="80" rx="35" ry="28" fill="#b8965a" opacity="0.6"/><ellipse cx="160" cy="90" rx="25" ry="22" fill="#b8965a" opacity="0.5"/><ellipse cx="50" cy="70" rx="22" ry="18" fill="#b8965a" opacity="0.55"/>
<circle cx="100" cy="80" r="12" fill="#e8735a" opacity="0.7"/><circle cx="120" cy="75" r="8" fill="#d06080" opacity="0.7"/><circle cx="85" cy="88" r="6" fill="#f0a050" opacity="0.7"/>
<circle cx="160" cy="90" r="10" fill="#e040fb" opacity="0.6"/><circle cx="170" cy="82" r="7" fill="#4fc3f7" opacity="0.6"/>
<circle cx="50" cy="70" r="9" fill="#f0a050" opacity="0.65"/><circle cx="42" cy="65" r="5" fill="#e8735a" opacity="0.65"/>
<ellipse cx="140" cy="60" rx="4" ry="2.5" fill="#4fc3f7"/><ellipse cx="180" cy="70" rx="3.5" ry="2" fill="#ff6b35"/><ellipse cx="70" cy="55" rx="3" ry="1.8" fill="#ffeb3b"/>
<circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="150" cy="25" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="40" r="1.8" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a1_v3_vg)"/>
</svg>`,
    '2_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a2_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e14"/><stop offset="0.5" stop-color="#3d2b1f"/><stop offset="1" stop-color="#5c4a3a"/></linearGradient><linearGradient id="a2_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a2a"/><stop offset="1" stop-color="#2a1e14"/></linearGradient><radialGradient id="a2_v0_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a2_v0_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(200,180,150,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a2_v0_bg)"/>
<polygon points="50,0 90,0 180,160 110,160" fill="url(#a2_v0_ray)" opacity="0.3"/>
<rect x="0" y="130" width="240" height="30" fill="url(#a2_v0_sd)" rx="3"/>
<path d="M60 128 L40 90 Q50 60 70 85 L80 128Z" fill="#5c3a1e"/><path d="M120 130 L110 80 Q100 50 130 70 L150 130Z" fill="#4a2e1a"/><path d="M180 128 L175 90 Q180 60 195 80 L200 128Z" fill="#5c3a1e"/>
<path d="M20 125 Q40 70 60 125" stroke="#2d5c3a" stroke-width="3" fill="none"/><path d="M30 125 Q50 60 70 125" stroke="#3a7a4a" stroke-width="2.5" fill="none"/>
<path d="M140 125 Q160 55 180 125" stroke="#2d5c3a" stroke-width="3" fill="none"/><path d="M155 125 Q175 50 195 125" stroke="#3a7a4a" stroke-width="2.5" fill="none"/>
<ellipse cx="100" cy="100" rx="5" ry="3" fill="#6a5a4a"/><ellipse cx="160" cy="110" rx="4" ry="2.5" fill="#6a5a4a"/>
<circle cx="40" cy="50" r="2" fill="rgba(200,180,150,0.2)"/><circle cx="110" cy="65" r="1.5" fill="rgba(200,180,150,0.15)"/><circle cx="200" cy="55" r="1.8" fill="rgba(200,180,150,0.2)"/>
<rect width="240" height="160" fill="url(#a2_v0_vg)"/>
</svg>`,
    '2_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a2_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e14"/><stop offset="0.5" stop-color="#4a3426"/><stop offset="1" stop-color="#5c4a3a"/></linearGradient><radialGradient id="a2_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="a2_v1_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(200,180,150,0.12)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a2_v1_bg)"/>
<polygon points="70,0 110,0 190,160 140,160" fill="url(#a2_v1_ray)" opacity="0.35"/>
<path d="M80 160 L60 60 Q80 40 100 55 L120 160Z" fill="#5c3a1e"/><path d="M100 160 L90 70 Q110 50 130 65 L160 160Z" fill="#4a2e1a"/>
<path d="M65 70 Q75 55 95 60" stroke="#3a7a4a" stroke-width="3" fill="none"/><path d="M60 80 Q70 65 90 70" stroke="#2d5c3a" stroke-width="2.5" fill="none"/>
<path d="M95 68 Q110 52 130 60" stroke="#3a7a4a" stroke-width="3" fill="none"/><path d="M90 78 Q105 62 125 70" stroke="#2d5c3a" stroke-width="2.5" fill="none"/>
<ellipse cx="150" cy="100" rx="4" ry="2.5" fill="#6a5a4a"/><ellipse cx="170" cy="110" rx="3.5" ry="2" fill="#6a5a4a"/>
<circle cx="40" cy="40" r="1.5" fill="rgba(200,180,150,0.2)"/><circle cx="130" cy="55" r="2" fill="rgba(200,180,150,0.15)"/><circle cx="190" cy="60" r="1.5" fill="rgba(200,180,150,0.2)"/>
<rect width="240" height="160" fill="url(#a2_v1_vg)"/>
</svg>`,
    '2_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a2_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a120a"/><stop offset="0.3" stop-color="#2a1e14"/><stop offset="1" stop-color="#4a3a2a"/></linearGradient><radialGradient id="a2_v2_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a2_v2_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(200,180,150,0.08)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a2_v2_bg)"/>
<polygon points="30,0 60,0 140,160 80,160" fill="url(#a2_v2_ray)" opacity="0.25"/>
<rect x="0" y="135" width="240" height="25" fill="#3a2a1a"/>
<ellipse cx="50" cy="138" rx="8" ry="2" fill="#5c4a3a" opacity="0.6"/><ellipse cx="120" cy="142" rx="10" ry="3" fill="#5c4a3a" opacity="0.5"/><ellipse cx="180" cy="140" rx="6" ry="2" fill="#5c4a3a" opacity="0.6"/>
<path d="M30 135 L35 120 Q40 115 42 125 L38 135Z" fill="#4a3a2a"/><path d="M100 138 L105 118 Q110 112 112 125 L108 138Z" fill="#4a3a2a"/>
<ellipse cx="80" cy="115" rx="5" ry="3" fill="#6a5a4a"/><ellipse cx="160" cy="120" rx="4" ry="2.5" fill="#6a5a4a"/>
<circle cx="60" cy="50" r="1.5" fill="rgba(200,180,150,0.15)"/><circle cx="150" cy="65" r="2" fill="rgba(200,180,150,0.1)"/>
<rect width="240" height="160" fill="url(#a2_v2_vg)"/>
</svg>`,
    '2_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a2_v3_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e14"/><stop offset="0.4" stop-color="#3d2b1f"/><stop offset="1" stop-color="#5c4a3a"/></linearGradient><radialGradient id="a2_v3_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="a2_v3_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(200,180,150,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a2_v3_bg)"/>
<polygon points="40,0 80,0 170,160 100,160" fill="url(#a2_v3_ray)" opacity="0.3"/>
<rect x="0" y="135" width="240" height="25" fill="#3a2a1a" rx="2"/>
<path d="M30 130 Q50 50 70 130" stroke="#2d5c3a" stroke-width="4" fill="none" opacity="0.8"/><path d="M55 130 Q75 40 95 130" stroke="#3a7a4a" stroke-width="3.5" fill="none" opacity="0.8"/><path d="M80 130 Q100 45 120 130" stroke="#2d5c3a" stroke-width="4" fill="none" opacity="0.8"/>
<path d="M140 130 Q160 55 180 130" stroke="#3a7a4a" stroke-width="3.5" fill="none" opacity="0.8"/><path d="M165 130 Q185 40 205 130" stroke="#2d5c3a" stroke-width="4" fill="none" opacity="0.8"/>
<polygon points="100,82 125,30 150,82" fill="#c0b0a0" stroke="#8a7a6a" stroke-width="0.8"/><line x1="125" y1="30" x2="125" y2="82" stroke="#8a7a6a" stroke-width="1"/><line x1="105" y1="60" x2="145" y2="60" stroke="#8a7a6a" stroke-width="0.8"/>
<circle cx="125" cy="56" r="3.5" fill="#333"/><circle cx="124" cy="55" r="1.5" fill="#fff"/>
<circle cx="60" cy="45" r="2" fill="rgba(200,180,150,0.2)"/><circle cx="160" cy="50" r="1.5" fill="rgba(200,180,150,0.15)"/>
<rect width="240" height="160" fill="url(#a2_v3_vg)"/>
</svg>`,
    '3_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a3_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8e8d8"/><stop offset="0.3" stop-color="#a8d8c0"/><stop offset="1" stop-color="#6a9a7a"/></linearGradient><linearGradient id="a3_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7a5a"/><stop offset="1" stop-color="#5a4a3a"/></linearGradient><radialGradient id="a3_v0_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.3)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a3_v0_bg)"/>
<rect x="0" y="130" width="240" height="30" fill="url(#a3_v0_sd)" rx="2"/>
<path d="M0 130 Q40 110 80 125 Q120 108 160 122 Q200 112 240 125 L240 160 L0 160Z" fill="#6a5a4a" opacity="0.4"/>
<path d="M10 125 Q20 95 40 120 Q55 90 70 118 Q85 88 100 115 Q120 85 140 118 Q160 88 180 115 L180 130 L10 130Z" fill="#3a8a5a" opacity="0.8"/>
<path d="M60 118 Q70 70 90 115 Q105 65 120 112 Q135 60 150 110 L150 125 L60 125Z" fill="#2a7a4a" opacity="0.8"/>
<path d="M110 108 Q120 40 140 105 Q155 35 170 100 L170 120 L110 120Z" fill="#1a6a3a" opacity="0.8"/>
<path d="M0 125 Q20 80 40 120" stroke="#4a9a6a" stroke-width="2" fill="none"/><path d="M180 125 Q200 75 220 120" stroke="#4a9a6a" stroke-width="2" fill="none"/>
<ellipse cx="50" cy="95" rx="3" ry="1.5" fill="#ff6b35"/><ellipse cx="150" cy="85" rx="3" ry="1.5" fill="#4fc3f7"/>
<circle cx="30" cy="40" r="1.5" fill="rgba(255,255,255,0.3)"/><circle cx="120" cy="50" r="2" fill="rgba(255,255,255,0.25)"/><circle cx="200" cy="45" r="1.5" fill="rgba(255,255,255,0.3)"/>
<rect width="240" height="160" fill="url(#a3_v0_vg)"/>
</svg>`,
    '3_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a3_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8e0c8"/><stop offset="1" stop-color="#5a9a6a"/></linearGradient><radialGradient id="a3_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.25)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a3_v1_bg)"/>
<rect x="0" y="135" width="240" height="25" fill="#7a6a5a" rx="2"/>
<ellipse cx="40" cy="132" rx="30" ry="4" fill="#4a9a5a" opacity="0.9"/><ellipse cx="120" cy="134" rx="40" ry="5" fill="#3a8a4a" opacity="0.9"/><ellipse cx="200" cy="133" rx="35" ry="4" fill="#4a9a5a" opacity="0.9"/>
<circle cx="50" cy="130" r="2" fill="#7aba7a"/><circle cx="80" cy="132" r="1.5" fill="#7aba7a"/><circle cx="110" cy="131" r="2.5" fill="#7aba7a"/><circle cx="150" cy="133" r="2" fill="#7aba7a"/><circle cx="180" cy="130" r="1.8" fill="#7aba7a"/>
<ellipse cx="60" cy="100" rx="3" ry="1.5" fill="#ff6b35"/><ellipse cx="150" cy="90" rx="2.5" ry="1.2" fill="#4fc3f7"/>
<circle cx="30" cy="50" r="2" fill="rgba(255,255,255,0.25)"/><circle cx="120" cy="60" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="55" r="2" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a3_v1_vg)"/>
</svg>`,
    '3_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a3_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0e8d8"/><stop offset="0.3" stop-color="#a0d0b0"/><stop offset="1" stop-color="#5a8a6a"/></linearGradient><radialGradient id="a3_v2_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.3)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a3_v2_bg)"/>
<rect x="0" y="140" width="240" height="20" fill="#6a5a4a" rx="2"/>
<path d="M30 135 Q45 50 55 135" stroke="#3a8a5a" stroke-width="3" fill="none"/><path d="M50 135 Q65 40 75 135" stroke="#2a7a4a" stroke-width="3" fill="none"/>
<path d="M100 135 Q115 30 130 135" stroke="#3a8a5a" stroke-width="3.5" fill="none"/><path d="M120 135 Q135 25 150 135" stroke="#4a9a6a" stroke-width="3" fill="none"/>
<path d="M170 135 Q185 35 200 135" stroke="#2a7a4a" stroke-width="3" fill="none"/><path d="M190 135 Q205 45 215 135" stroke="#3a8a5a" stroke-width="2.5" fill="none"/>
<circle cx="55" cy="35" r="3" fill="#ff6b35" opacity="0.8"/><circle cx="130" cy="25" r="3.5" fill="#e040fb" opacity="0.8"/><circle cx="200" cy="30" r="2.5" fill="#ff6b35" opacity="0.8"/>
<ellipse cx="80" cy="100" rx="3" ry="1.5" fill="#ff6b35"/><ellipse cx="160" cy="90" rx="3" ry="1.5" fill="#4fc3f7"/>
<circle cx="40" cy="50" r="1.5" fill="rgba(255,255,255,0.3)"/><circle cx="160" cy="55" r="2" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a3_v2_vg)"/>
</svg>`,
    '4_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a4_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a5276"/><stop offset="0.5" stop-color="#2471a3"/><stop offset="1" stop-color="#2e86c1"/></linearGradient><linearGradient id="a4_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a88a"/><stop offset="1" stop-color="#8a7a6a"/></linearGradient><radialGradient id="a4_v0_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="a4_v0_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.12)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a4_v0_bg)"/>
<polygon points="30,0 70,0 160,160 90,160" fill="url(#a4_v0_ray)" opacity="0.4"/>
<rect x="0" y="130" width="240" height="30" fill="url(#a4_v0_sd)" rx="2"/>
<path d="M70 125 L40 60 Q50 40 80 55 L100 125Z" fill="#6a5a4a"/><path d="M100 128 L80 50 Q90 30 120 45 L140 128Z" fill="#5a4a3a"/><path d="M140 125 L120 55 Q130 35 160 50 L180 125Z" fill="#6a5a4a"/>
<path d="M30 122 Q40 90 55 118" stroke="#8a7a6a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M180 122 Q195 85 210 118" stroke="#8a7a6a" stroke-width="4" fill="none" stroke-linecap="round"/>
<ellipse cx="85" cy="95" rx="4" ry="3" fill="#ffeb3b"/><ellipse cx="155" cy="90" rx="4" ry="3" fill="#4fc3f7"/><ellipse cx="95" cy="105" rx="3.5" ry="2.5" fill="#ff6b35"/>
<circle cx="40" cy="45" r="2" fill="rgba(255,255,255,0.3)"/><circle cx="140" cy="50" r="1.8" fill="rgba(255,255,255,0.25)"/><circle cx="200" cy="60" r="2" fill="rgba(255,255,255,0.2)"/>
<rect width="240" height="160" fill="url(#a4_v0_vg)"/>
</svg>`,
    '4_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a4_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#154a6e"/><stop offset="0.5" stop-color="#1f6a96"/><stop offset="1" stop-color="#2a86b6"/></linearGradient><radialGradient id="a4_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a4_v1_bg)"/>
<path d="M40 160 L30 50 Q50 30 80 45 L110 160Z" fill="#6a5a4a"/><path d="M100 160 L80 55 Q100 35 130 50 L170 160Z" fill="#5a4a3a"/><path d="M150 160 L140 60 Q160 40 190 55 L210 160Z" fill="#6a5a4a"/>
<path d="M50 60 Q45 45 55 50" fill="none" stroke="#3a2a1a" stroke-width="0.8"/><path d="M95 55 Q90 40 100 45" fill="none" stroke="#3a2a1a" stroke-width="0.8"/>
<ellipse cx="90" cy="90" rx="5" ry="3" fill="#ffeb3b"/><ellipse cx="100" cy="85" rx="4.5" ry="2.5" fill="#4fc3f7"/>
<ellipse cx="160" cy="80" rx="4" ry="3" fill="#4fc3f7"/><ellipse cx="170" cy="75" rx="3.5" ry="2.5" fill="#ffeb3b"/>
<circle cx="50" cy="50" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="130" cy="45" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="190" cy="55" r="1.8" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a4_v1_vg)"/>
</svg>`,
    '4_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a4_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a5a7a"/><stop offset="1" stop-color="#2a86b6"/></linearGradient><radialGradient id="a4_v2_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a4_v2_bg)"/>
<ellipse cx="80" cy="85" rx="40" ry="35" fill="#6a5a4a" opacity="0.7"/><ellipse cx="170" cy="75" rx="35" ry="30" fill="#5a4a3a" opacity="0.7"/>
<ellipse cx="80" cy="85" rx="25" ry="20" fill="#4a3a2a" opacity="0.5"/><ellipse cx="170" cy="75" rx="20" ry="18" fill="#4a3a2a" opacity="0.5"/>
<ellipse cx="80" cy="85" rx="10" ry="8" fill="#1a5276" opacity="0.4"/><ellipse cx="170" cy="75" rx="8" ry="7" fill="#1a5276" opacity="0.4"/>
<ellipse cx="50" cy="50" rx="3" ry="2" fill="#ffeb3b"/><ellipse cx="155" cy="65" rx="3" ry="2" fill="#4fc3f7"/>
<circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="120" cy="40" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="210" cy="35" r="1.5" fill="rgba(255,255,255,0.2)"/>
<rect width="240" height="160" fill="url(#a4_v2_vg)"/>
</svg>`,
    '4_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="a4_v3_bg"><stop offset="0" stop-color="#0a1a2a"/><stop offset="1" stop-color="#050e14"/></radialGradient><radialGradient id="a4_v3_lgt"><stop offset="0" stop-color="rgba(200,220,255,0.12)"/><stop offset="1" stop-color="transparent"/></radialGradient><radialGradient id="a4_v3_vg"><stop offset="0.5" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.6)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a4_v3_bg)"/>
<ellipse cx="60" cy="60" rx="80" ry="90" fill="url(#a4_v3_lgt)"/>
<path d="M0 160 L20 40 Q40 20 60 35 L80 160Z" fill="#3a2a1a" opacity="0.6"/><path d="M70 160 L60 50 Q80 30 100 45 L120 160Z" fill="#2a1e14" opacity="0.6"/>
<ellipse cx="100" cy="90" rx="4" ry="3" fill="#4fc3f7" opacity="0.7"/><ellipse cx="110" cy="95" rx="3.5" ry="2.5" fill="#ffeb3b" opacity="0.7"/>
<circle cx="40" cy="50" r="1.5" fill="rgba(200,220,255,0.15)"/><circle cx="120" cy="70" r="2" fill="rgba(200,220,255,0.1)"/>
<rect width="240" height="160" fill="url(#a4_v3_vg)"/>
</svg>`,
    '5_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a5_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8e0f0"/><stop offset="0.5" stop-color="#d0f0f8"/><stop offset="1" stop-color="#e0f8ff"/></linearGradient><linearGradient id="a5_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a8a7a"/><stop offset="1" stop-color="#5a5a4a"/></linearGradient><radialGradient id="a5_v0_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.25)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a5_v0_bg)"/>
<rect x="0" y="135" width="240" height="25" fill="url(#a5_v0_sd)" rx="2"/>
<ellipse cx="100" cy="125" rx="25" ry="8" fill="#3a7a4a"/><ellipse cx="170" cy="128" rx="15" ry="6" fill="#3a7a4a"/>
<path d="M50 130 Q55 100 65 125" stroke="#4a8a5a" stroke-width="3" fill="none"/><path d="M80 128 Q85 90 95 122" stroke="#3a7a4a" stroke-width="2.5" fill="none"/>
<path d="M120 125 Q130 95 140 120" stroke="#4a8a5a" stroke-width="2.5" fill="none"/>
<ellipse cx="90" cy="100" rx="3" ry="2" fill="#ff6b35"/><ellipse cx="160" cy="95" rx="2.5" ry="1.5" fill="#e040fb"/>
<circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.25)"/><circle cx="130" cy="45" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="190" cy="50" r="1.5" fill="rgba(255,255,255,0.25)"/>
<rect width="240" height="160" fill="url(#a5_v0_vg)"/>
</svg>`,
    '5_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a5_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0d0e0"/><stop offset="1" stop-color="#c0e8f0"/></linearGradient><radialGradient id="a5_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.2)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a5_v1_bg)"/>
<ellipse cx="120" cy="135" rx="80" ry="15" fill="#3a7a4a" opacity="0.8"/>
<path d="M60 120 Q65 90 75 115 Q80 85 90 110 Q95 80 105 108" stroke="#4a8a5a" stroke-width="2.5" fill="none"/><path d="M140 120 Q145 95 155 115 Q160 88 170 110 Q175 82 185 108" stroke="#4a8a5a" stroke-width="2.5" fill="none"/>
<ellipse cx="110" cy="90" rx="6" ry="3" fill="#e53935"/><ellipse cx="118" cy="87" rx="5" ry="2.5" fill="#e53935"/>
<ellipse cx="110" cy="90" rx="2" ry="1.5" fill="#ffcdd2"/><ellipse cx="118" cy="87" rx="2" ry="1.5" fill="#ffcdd2"/>
<ellipse cx="160" cy="95" rx="5" ry="2.5" fill="#e53935"/><ellipse cx="167" cy="92" rx="4" ry="2" fill="#e53935"/>
<circle cx="40" cy="50" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="150" cy="45" r="2" fill="rgba(255,255,255,0.15)"/>
<rect width="240" height="160" fill="url(#a5_v1_vg)"/>
</svg>`,
    '5_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a5_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8e0e8"/><stop offset="1" stop-color="#d0f0f0"/></linearGradient><radialGradient id="a5_v2_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.2)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a5_v2_bg)"/>
<ellipse cx="120" cy="140" rx="100" ry="20" fill="#5a8a5a" opacity="0.6"/>
<path d="M60 100 Q65 60 80 95 Q90 55 100 90 Q110 50 120 85" stroke="#3a7a4a" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M150 105 Q155 70 170 100 Q180 65 190 95 Q200 60 210 90" stroke="#4a8a5a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="80" cy="80" r="2" fill="#7aba7a"/><circle cx="100" cy="75" r="1.5" fill="#7aba7a"/><circle cx="120" cy="70" r="2.5" fill="#7aba7a"/>
<ellipse cx="180" cy="85" rx="2.5" ry="1.5" fill="#ff6b35"/>
<circle cx="50" cy="40" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="160" cy="45" r="2" fill="rgba(255,255,255,0.15)"/>
<rect width="240" height="160" fill="url(#a5_v2_vg)"/>
</svg>`,
    '5_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a5_v3_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0e8f0"/><stop offset="0.5" stop-color="#d8f0f8"/><stop offset="1" stop-color="#e8f8ff"/></linearGradient><radialGradient id="a5_v3_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.2)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a5_v3_bg)"/>
<rect x="0" y="138" width="240" height="22" fill="#7a7a6a" rx="2"/>
<ellipse cx="80" cy="130" rx="20" ry="6" fill="#3a7a4a"/><ellipse cx="160" cy="132" rx="15" ry="5" fill="#4a8a5a"/>
<path d="M50 128 Q55 100 65 124" stroke="#3a7a4a" stroke-width="2" fill="none"/><path d="M130 130 Q135 95 145 125" stroke="#4a8a5a" stroke-width="2" fill="none"/>
<ellipse cx="100" cy="100" rx="3" ry="2" fill="#e53935"/><ellipse cx="155" cy="95" rx="2.5" ry="1.5" fill="#ff6b35"/>
<circle cx="40" cy="45" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="150" cy="40" r="2" fill="rgba(255,255,255,0.15)"/><circle cx="200" cy="50" r="1.5" fill="rgba(255,255,255,0.2)"/>
<rect width="240" height="160" fill="url(#a5_v3_vg)"/>
</svg>`,
    '6_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a6_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a4a6a"/><stop offset="0.4" stop-color="#0d6a8e"/><stop offset="1" stop-color="#1a8aaa"/></linearGradient><linearGradient id="a6_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e0d0"/><stop offset="1" stop-color="#c8c0b0"/></linearGradient><radialGradient id="a6_v0_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient><linearGradient id="a6_v0_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(100,200,255,0.15)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a6_v0_bg)"/>
<polygon points="20,0 60,0 160,160 90,160" fill="url(#a6_v0_ray)" opacity="0.5"/><polygon points="120,0 160,0 220,160 170,160" fill="url(#a6_v0_ray)" opacity="0.35"/>
<rect x="0" y="135" width="240" height="25" fill="url(#a6_v0_sd)" rx="2"/>
<path d="M50 130 L40 70 Q50 50 70 65 L90 130Z" fill="#6a5a4a"/><path d="M130 130 L120 60 Q140 40 160 55 L180 130Z" fill="#5a4a3a"/>
<ellipse cx="100" cy="100" rx="4" ry="2.5" fill="#ffeb3b"/><ellipse cx="160" cy="95" rx="4" ry="2.5" fill="#4fc3f7"/><ellipse cx="110" cy="108" rx="3.5" ry="2" fill="#e040fb"/>
<circle cx="40" cy="50" r="2" fill="rgba(100,200,255,0.25)"/><circle cx="140" cy="55" r="1.8" fill="rgba(100,200,255,0.2)"/><circle cx="200" cy="60" r="2" fill="rgba(100,200,255,0.2)"/>
<rect width="240" height="160" fill="url(#a6_v0_vg)"/>
</svg>`,
    '6_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a6_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a5272"/><stop offset="0.5" stop-color="#107a9a"/><stop offset="1" stop-color="#1a9aba"/></linearGradient><radialGradient id="a6_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a6_v1_bg)"/>
<rect x="0" y="140" width="240" height="20" fill="#e0d8c8" rx="2"/>
<path d="M60 135 L40 65 Q50 45 70 60 L90 135Z" fill="#6a5a4a"/><path d="M100 135 L90 55 Q110 35 130 50 L150 135Z" fill="#5a4a3a"/>
<path d="M140 135 L130 70 Q150 50 170 65 L190 135Z" fill="#6a5a4a"/>
<ellipse cx="80" cy="100" rx="3" ry="2" fill="#ffeb3b"/><ellipse cx="160" cy="95" rx="3" ry="2" fill="#4fc3f7"/>
<circle cx="50" cy="50" r="1.5" fill="rgba(100,200,255,0.2)"/><circle cx="150" cy="45" r="2" fill="rgba(100,200,255,0.15)"/>
<rect width="240" height="160" fill="url(#a6_v1_vg)"/>
</svg>`,
    '6_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a6_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a4a6a"/><stop offset="0.4" stop-color="#0d6a8e"/><stop offset="1" stop-color="#1a8aaa"/></linearGradient><radialGradient id="a6_v2_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a6_v2_bg)"/>
<rect x="0" y="138" width="240" height="22" fill="#e0d8c8" rx="2"/>
<path d="M40 133 L30 80 Q40 65 55 75 L70 133Z" fill="#6a5a4a"/><path d="M160 133 L150 75 Q165 55 180 70 L195 133Z" fill="#5a4a3a"/>
<ellipse cx="80" cy="100" rx="5" ry="3" fill="#ffeb3b"/><ellipse cx="90" cy="95" rx="4.5" ry="2.5" fill="#4fc3f7"/>
<ellipse cx="140" cy="105" rx="5" ry="3" fill="#4fc3f7"/><ellipse cx="150" cy="100" rx="4.5" ry="2.5" fill="#ffeb3b"/>
<ellipse cx="120" cy="90" rx="4" ry="2.5" fill="#e040fb"/>
<circle cx="50" cy="50" r="2" fill="rgba(100,200,255,0.2)"/><circle cx="180" cy="55" r="1.8" fill="rgba(100,200,255,0.2)"/>
<rect width="240" height="160" fill="url(#a6_v2_vg)"/>
</svg>`,
    '7_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a7_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a6a5a"/><stop offset="0.4" stop-color="#4a7a6a"/><stop offset="1" stop-color="#5a8a7a"/></linearGradient><linearGradient id="a7_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a5a4a"/><stop offset="1" stop-color="#4a3a2a"/></linearGradient><radialGradient id="a7_v0_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.3)"/></radialGradient><linearGradient id="a7_v0_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,200,0.12)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a7_v0_bg)"/>
<polygon points="40,0 80,0 170,160 100,160" fill="url(#a7_v0_ray)" opacity="0.4"/>
<rect x="0" y="132" width="240" height="28" fill="url(#a7_v0_sd)" rx="2"/>
<path d="M20 128 Q35 80 55 124 Q70 75 90 120 Q105 70 120 118 Q135 72 150 120 Q165 78 180 124 L180 135 L20 135Z" fill="#4a8a5a" opacity="0.7"/>
<path d="M60 120 Q70 60 90 115 Q105 55 120 110 Q135 50 150 108 L150 125 L60 125Z" fill="#3a7a4a" opacity="0.7"/>
<ellipse cx="100" cy="90" rx="3" ry="1.8" fill="#29b6f6"/><ellipse cx="150" cy="85" rx="3" ry="1.8" fill="#e53935"/>
<circle cx="30" cy="45" r="1.5" fill="rgba(255,255,200,0.25)"/><circle cx="140" cy="50" r="2" fill="rgba(255,255,200,0.2)"/><circle cx="200" cy="55" r="1.5" fill="rgba(255,255,200,0.2)"/>
<rect width="240" height="160" fill="url(#a7_v0_vg)"/>
</svg>`,
    '7_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a7_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3a2a"/><stop offset="0.5" stop-color="#2a4a3a"/><stop offset="1" stop-color="#3a5a4a"/></linearGradient><radialGradient id="a7_v1_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="a7_v1_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(100,200,255,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a7_v1_bg)"/>
<polygon points="30,0 70,0 180,160 100,160" fill="url(#a7_v1_ray)" opacity="0.35"/>
<ellipse cx="90" cy="80" rx="4" ry="2.5" fill="#29b6f6"/><ellipse cx="100" cy="76" rx="4" ry="2.5" fill="#29b6f6"/><ellipse cx="110" cy="82" rx="4" ry="2.5" fill="#29b6f6"/><ellipse cx="80" cy="78" rx="3.5" ry="2" fill="#29b6f6"/><ellipse cx="120" cy="80" rx="3.5" ry="2" fill="#29b6f6"/>
<ellipse cx="95" cy="80" rx="2" ry="1.5" fill="#e53935"/><ellipse cx="105" cy="78" rx="2" ry="1.5" fill="#e53935"/>
<ellipse cx="160" cy="100" rx="3.5" ry="2" fill="#29b6f6"/><ellipse cx="170" cy="96" rx="3.5" ry="2" fill="#29b6f6"/><ellipse cx="150" cy="102" rx="3" ry="1.8" fill="#29b6f6"/>
<circle cx="50" cy="45" r="1.5" fill="rgba(100,200,255,0.2)"/><circle cx="140" cy="55" r="2" fill="rgba(100,200,255,0.15)"/>
<rect width="240" height="160" fill="url(#a7_v1_vg)"/>
</svg>`,
    '7_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a7_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a4a"/><stop offset="0.4" stop-color="#3a6a5a"/><stop offset="1" stop-color="#5a8a7a"/></linearGradient><radialGradient id="a7_v2_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.3)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a7_v2_bg)"/>
<rect x="0" y="140" width="240" height="20" fill="#5a4a3a" rx="2"/>
<path d="M20 135 Q30 30 50 135" stroke="#3a7a4a" stroke-width="4" fill="none"/><path d="M40 135 Q55 25 70 135" stroke="#4a8a5a" stroke-width="3.5" fill="none"/>
<path d="M80 135 Q95 35 110 135" stroke="#3a7a4a" stroke-width="4" fill="none"/><path d="M100 135 Q115 20 130 135" stroke="#2a6a3a" stroke-width="3.5" fill="none"/>
<path d="M140 135 Q155 40 170 135" stroke="#4a8a5a" stroke-width="3.5" fill="none"/><path d="M160 135 Q175 30 190 135" stroke="#3a7a4a" stroke-width="4" fill="none"/><path d="M180 135 Q195 45 210 135" stroke="#2a6a3a" stroke-width="3" fill="none"/>
<ellipse cx="80" cy="95" rx="2.5" ry="1.5" fill="#e53935"/><ellipse cx="150" cy="90" rx="2.5" ry="1.5" fill="#29b6f6"/>
<circle cx="50" cy="50" r="1.5" fill="rgba(255,255,200,0.2)"/><circle cx="180" cy="55" r="2" fill="rgba(255,255,200,0.15)"/>
<rect width="240" height="160" fill="url(#a7_v2_vg)"/>
</svg>`,
    '7_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a7_v3_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a4a"/><stop offset="0.5" stop-color="#4a7a6a"/><stop offset="1" stop-color="#5a8a7a"/></linearGradient><radialGradient id="a7_v3_vg"><stop offset="0.7" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.3)"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#a7_v3_bg)"/>
<rect x="0" y="138" width="240" height="22" fill="#5a4a3a" rx="2"/>
<ellipse cx="60" cy="130" rx="30" ry="10" fill="#3a7a4a"/><ellipse cx="160" cy="132" rx="25" ry="8" fill="#4a8a5a"/>
<path d="M40 125 Q45 85 55 120 Q60 80 70 115" stroke="#4a8a5a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M90 128 Q95 90 105 122 Q110 85 120 118" stroke="#3a7a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="80" cy="105" rx="3" ry="1.8" fill="#29b6f6"/><ellipse cx="130" cy="100" rx="2.5" ry="1.5" fill="#e53935"/>
<circle cx="50" cy="45" r="1.5" fill="rgba(255,255,200,0.2)"/><circle cx="160" cy="50" r="2" fill="rgba(255,255,200,0.15)"/>
<rect width="240" height="160" fill="url(#a7_v3_vg)"/>
</svg>`,
    '8_0': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a8_v0_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#051d33"/><stop offset="0.4" stop-color="#08335c"/><stop offset="1" stop-color="#0f5a8a"/></linearGradient><linearGradient id="a8_v0_sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7a5a"/><stop offset="1" stop-color="#5a4a3a"/></linearGradient><radialGradient id="a8_v0_vg"><stop offset="0.5" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a8_v0_ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a8_v0_bg)"/>
<polygon points="10,0 40,0 130,160 60,160" fill="url(#a8_v0_ray)" opacity="0.4"/><polygon points="100,0 130,0 210,160 160,160" fill="url(#a8_v0_ray)" opacity="0.3"/>
<rect x="0" y="125" width="240" height="35" fill="url(#a8_v0_sd)" rx="3"/>
<path d="M20 125 Q40 100 70 118 Q100 95 130 115 Q160 98 190 118 Q210 102 230 120 L230 160 L20 160Z" fill="#a08555" opacity="0.4"/>
<path d="M50 115 L55 70 L60 70 L55 115Z" fill="#e8735a"/><path d="M65 112 L72 60 L77 60 L70 112Z" fill="#e8735a"/>
<path d="M120 110 L128 65 L133 65 L125 110Z" fill="#d06080"/><path d="M135 108 L142 55 L147 55 L140 108Z" fill="#d06080"/><path d="M130 110 L136 75 L140 75 L134 110Z" fill="#f0a050"/>
<path d="M180 115 L186 75 L190 75 L184 115Z" fill="#e040fb"/><path d="M170 118 L176 85 L180 85 L174 118Z" fill="#4fc3f7"/>
<ellipse cx="100" cy="90" rx="6" ry="3" fill="#4fc3f7"/><ellipse cx="112" cy="85" rx="5" ry="2.5" fill="#ff6b35"/><ellipse cx="90" cy="95" rx="4" ry="2" fill="#e040fb"/>
<ellipse cx="170" cy="85" rx="5" ry="3" fill="#ffeb3b"/><ellipse cx="180" cy="80" rx="4.5" ry="2.5" fill="#ff6b35"/>
<circle cx="45" cy="40" r="2" fill="rgba(255,255,255,0.25)"/><circle cx="140" cy="45" r="2.5" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="50" r="2" fill="rgba(255,255,255,0.2)"/>
<rect width="240" height="160" fill="url(#a8_v0_vg)"/>
</svg>`,
    '8_1': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a8_v1_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041828"/><stop offset="0.5" stop-color="#072a4a"/><stop offset="1" stop-color="#0a3d6b"/></linearGradient><radialGradient id="a8_v1_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a8_v1_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(150,200,255,0.12)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a8_v1_bg)"/>
<polygon points="50,0 90,0 200,160 130,160" fill="url(#a8_v1_ray)" opacity="0.4"/><polygon points="140,0 170,0 230,160 200,160" fill="url(#a8_v1_ray)" opacity="0.25"/>
<path d="M90 60 L140 30 L180 60 L160 65 Q140 50 120 62 Z" fill="#1a2a3a" opacity="0.8"/>
<path d="M140 30 L155 25 L145 38 L130 35Z" fill="#1a2a3a" opacity="0.7"/>
<ellipse cx="140" cy="45" rx="3" ry="2" fill="#3a4a5a"/>
<ellipse cx="160" cy="100" rx="4" ry="2.5" fill="#2a3a4a" opacity="0.6"/>
<circle cx="50" cy="50" r="1.5" fill="rgba(150,200,255,0.2)"/><circle cx="180" cy="55" r="2" fill="rgba(150,200,255,0.15)"/>
<rect width="240" height="160" fill="url(#a8_v1_vg)"/>
</svg>`,
    '8_2': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a8_v2_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2d50"/><stop offset="0.5" stop-color="#0f5080"/><stop offset="1" stop-color="#1a6a9a"/></linearGradient><radialGradient id="a8_v2_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="a8_v2_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a8_v2_bg)"/>
<polygon points="60,0 100,0 190,160 130,160" fill="url(#a8_v2_ray)" opacity="0.35"/>
<rect x="0" y="130" width="240" height="30" fill="#8a7a5a" rx="2"/>
<path d="M40 125 L48 70 L53 70 L45 125Z" fill="#e040fb"/><path d="M55 122 L62 60 L67 60 L60 122Z" fill="#e040fb"/>
<path d="M90 120 L98 65 L103 65 L95 120Z" fill="#4fc3f7"/><path d="M105 118 L112 55 L117 55 L110 118Z" fill="#4fc3f7"/>
<path d="M140 122 L148 70 L153 70 L145 122Z" fill="#f0a050"/><path d="M155 118 L162 58 L167 58 L160 118Z" fill="#f0a050"/>
<path d="M180 125 L188 75 L193 75 L185 125Z" fill="#e8735a"/><path d="M170 128 L176 85 L180 85 L174 128Z" fill="#e8735a"/>
<ellipse cx="80" cy="95" rx="4" ry="2.5" fill="#ff6b35"/><ellipse cx="160" cy="100" rx="4" ry="2.5" fill="#4fc3f7"/>
<circle cx="50" cy="45" r="2" fill="rgba(255,255,255,0.2)"/><circle cx="130" cy="50" r="1.8" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="55" r="2" fill="rgba(255,255,255,0.15)"/>
<rect width="240" height="160" fill="url(#a8_v2_vg)"/>
</svg>`,
    '8_3': `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="a8_v3_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#061d33"/><stop offset="0.4" stop-color="#0a3560"/><stop offset="1" stop-color="#0f5a8a"/></linearGradient><radialGradient id="a8_v3_vg"><stop offset="0.6" stop-color="transparent"/><stop offset="1" stop-color="rgba(0,0,0,0.5)"/></radialGradient><linearGradient id="a8_v3_ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(150,200,255,0.1)"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
<rect width="240" height="160" fill="url(#a8_v3_bg)"/>
<polygon points="30,0 60,0 160,160 90,160" fill="url(#a8_v3_ray)" opacity="0.4"/><polygon points="130,0 160,0 220,160 180,160" fill="url(#a8_v3_ray)" opacity="0.25"/>
<path d="M80 60 Q140 20 180 55 Q200 70 190 85 Q150 95 100 80 Q70 70 80 60Z" fill="#1a2a3a" opacity="0.7"/>
<path d="M120 40 Q180 0 210 30 Q100 120 50 110 Q80 60 120 40Z" fill="#2a3a4a" opacity="0.5"/>
<path d="M130 55 L140 48 L145 52 L135 59Z" fill="#1a2a3a" opacity="0.6"/>
<ellipse cx="160" cy="105" rx="4" ry="2.5" fill="#3a4a5a" opacity="0.5"/>
<circle cx="60" cy="45" r="2" fill="rgba(150,200,255,0.2)"/><circle cx="180" cy="50" r="1.8" fill="rgba(150,200,255,0.15)"/>
<rect width="240" height="160" fill="url(#a8_v3_vg)"/>
</svg>`
  };

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
                ${v.img ? `<img src="${v.img}" alt="${v.label}" class="gallery-slider__img">` : (v.svgKey && aquariumViews[v.svgKey] ? aquariumViews[v.svgKey] : `<span class="gallery-item__icon">${v.emoji}</span>`)}
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
      const emojiEl = document.getElementById('lightboxEmoji');
      if (v.img) {
        emojiEl.innerHTML = `<img src="${v.img}" alt="${v.label}" class="lightbox__img">`;
      } else if (v.svgKey && aquariumViews[v.svgKey]) {
        emojiEl.innerHTML = aquariumViews[v.svgKey];
      } else {
        emojiEl.textContent = v.emoji;
      }
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
