"""
Генератор постов для товара через нейросеть
=============================================
Запуск:  python app.py
Открой:  http://localhost:5000

Как работает:
1. Вводишь ссылку на товар
2. Сервер получает информацию о товаре со страницы
3. Нейросеть (через proxy API) генерирует оригинальный пост
4. Копируешь готовый текст
"""

from flask import Flask, request, render_template_string
import requests
from bs4 import BeautifulSoup
import json

# ===================================================================
# НАСТРОЙКИ PROXY API — заполни перед запуском
# ===================================================================

# Адрес proxy API (OpenAI-совместимый)
# Примеры:
#   https://api.openai.com/v1          — официальный OpenAI
#   https://api.proxyapi.ru/v1           — пример proxy
API_URL = 'https://api.proxyapi.ru/openai/v1'

# Название модели
#   gpt-5.4-mini — быстро и дёшево (230/1 370 ₽ за 1M токенов)
#   gpt-5.4-nano — ещё дешевле (61/380 ₽)
#   gpt-5.4      — баланс цены и качества (760/4 550 ₽)
#   gpt-5.5      — самая мощная (1 520/9 100 ₽)
MODEL = 'gpt-5.4-mini'

# Модель для генерации изображений (через тот же API)
# Доступные модели:
#   gpt-image-2                — OpenAI, до 3840px (1 520/9 100 ₽)
#   gpt-image-1-mini           — OpenAI, бюджетная (610/2 430 ₽)
#   gemini-3.1-flash-image-preview — Google, дёшево (76/18 200 ₽)
#   gemini-3-pro-image-preview — Google, pro (632/36 843 ₽)
IMAGE_MODEL = 'gpt-image-2'

# Размер изображения по умолчанию
# Для gpt-image-2: '1024x1024', '1024x1792', '1792x1024' и любые до 3840px
# Для gemini: '512x512', '1024x1024', '2048x2048', '4096x4096'
IMAGE_SIZE = '1024x1024'

# Качество изображения: 'low', 'medium', 'high'
IMAGE_QUALITY = 'medium'

# API-ключ (можно оставить пустым и вводить на сайте)
# Если заполнишь — ключ будет использоваться по умолчанию
API_KEY = 'sk-Na5mi5ofjU5XYCdiRtxx8ig1O4NWrcEC'

# ===================================================================
# НАСТРОЙКИ ГЕНЕРАЦИИ
# ===================================================================

# Максимальное количество символов для текста с сайта
MAX_PAGE_TEXT = 4000

# Язык поста: 'ru' или 'en'
LANGUAGE = 'ru'

# ===================================================================
# ОПИСАНИЯ НАСТРОЕНИЙ ДЛЯ НЕЙРОСЕТИ
# ===================================================================

MOOD_PROMPTS = {
    'уверенный': (
        'Тон: уверенный, деловой, убедительный. '
        'Пост звучит как рекомендация эксперта. '
        'Убеди читателя, что этот товар — лучший выбор.'
    ),
    'заботливый': (
        'Тон: тёплый, заботливый, дружелюбный. '
        'Пост звучит как совет близкого друга. '
        'Покажи, как товар решит проблему или сделает жизнь лучше.'
    ),
    'дерзкий': (
        'Тон: дерзкий, смелый, энергичный. '
        'Пост с характером и драйвом. '
        'Используй короткие фразы, восклицания, зацепи внимание.'
    ),
    'вдохновляющий': (
        'Тон: вдохновляющий, мечтательный, мотивирующий. '
        'Пост рисует картину лучшей жизни с этим товаром. '
        'Вдохнови читателя на перемены.'
    ),
    'информационный': (
        'Тон: информационный, полезный, экспертный. '
        'Пост содержит факты, характеристики, пользу. '
        'Расскажи о товаре подробно и полезно.'
    ),
    'ироничный': (
        'Тон: ироничный, с юмором, самоирония. '
        'Пост с лёгкой усмешкой, но без злобы. '
        'Подшути над ситуацией ДО и ПОСЛЕ покупки.'
    ),
    'эмоциональный': (
        'Тон: эмоциональный, яркий, чувственный. '
        'Пост вызывают сильные эмоции: восторг, удивление, радость. '
        'Используй яркие эпитеты и живые описания.'
    ),
}

# ===================================================================
# ЗАПРОС К НЕЙРОСЕТИ (SYSTEM PROMPT)
# ===================================================================

SYSTEM_PROMPT = '''
Ты — профессиональный копирайтер. Твоя задача: написать оригинальный,
интересный пост для соцсетей о товаре.

Правила:
1. Пиши на русском языке.
2. Пост должен быть уникальным — никаких шаблонов и клише.
3. Длина: 3–7 предложений (не считая заголовка и хештегов).
4. Обязательно придумай яркий заголовок.
5. Используй 2–4 эмодзи в теле поста.
6. Добавь 3–5 релевантных хештегов.
7. Заверши пост призывом к действию (CTA).
8. Тон поста должен строго соответствовать настроению,
   которое указано в запросе.

Формат вывода (строго):
Заголовок

Текст поста с эмодзи

Призыв к действию

#хештег1 #хештег2 #хештег3
'''

# ===================================================================
# ФУНКЦИЯ: ПОЛУЧИТЬ ИНФОРМАЦИЮ О ТОВАРЕ С САЙТА
# ===================================================================

def fetch_product_info(url):
    """
    Открыть страницу товара и извлечь:
    - заголовок страницы
    - мета-описание
    - текст из параграфов
    """
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/131.0.0.0 Safari/537.36'
        ),
        'Accept': (
            'text/html,application/xhtml+xml,application/xml;'
            'q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        ),
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
    }
    session = requests.Session()
    session.headers.update(headers)
    try:
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            raise RuntimeError(
                'Сайт (например, Ozon, Wildberries) заблокировал '
                'автоматический запрос.\n\n'
                '👉 Скопируй название и описание товара вручную '
                'и вставь в поле «Описание товара» ниже.'
            )
        raise RuntimeError(f'Не удалось загрузить страницу: {e}')
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f'Не удалось загрузить страницу: {e}')

    soup = BeautifulSoup(resp.text, 'html.parser')

    # Заголовок страницы
    title = ''
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # Мета-описание
    meta_desc = ''
    meta_tag = soup.find('meta', attrs={'name': 'description'})
    if meta_tag and meta_tag.get('content'):
        meta_desc = meta_tag['content'].strip()

    # Текст из параграфов
    paragraphs = []
    for p in soup.find_all('p'):
        text = p.get_text(strip=True)
        if len(text) > 20:  # Отбрасываем короткие/мусорные строки
            paragraphs.append(text)

    page_text = ' '.join(paragraphs)

    # Собираем всё вместе, ограничиваем длину
    info_parts = []
    if title:
        info_parts.append(f'Заголовок: {title}')
    if meta_desc:
        info_parts.append(f'Описание: {meta_desc}')
    if page_text:
        info_parts.append(f'Текст страницы: {page_text[:MAX_PAGE_TEXT]}')

    result = '\n\n'.join(info_parts)

    if not result:
        raise RuntimeError(
            'Не удалось извлечь информацию о товаре со страницы. '
            'Проверь ссылку.'
        )

    return result

# ===================================================================
# ФУНКЦИЯ: ВЫЗВАТЬ НЕЙРОСЕТЬ ЧЕРЕЗ PROXY API
# ===================================================================

def call_llm(api_key, api_url, model, mood, product_info):
    """
    Отправить запрос к OpenAI-совместимому API и получить сгенерированный пост.
    """
    mood_instruction = MOOD_PROMPTS.get(mood, MOOD_PROMPTS['уверенный'])

    user_prompt = (
        f'Напиши пост о товаре по следующей информации:\n\n'
        f'{product_info}\n\n'
        f'Настроение поста: {mood}\n'
        f'{mood_instruction}'
    )

    # Формируем запрос к API в формате OpenAI Chat Completions
    payload = {
        'model': model,
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT.strip()},
            {'role': 'user', 'content': user_prompt},
        ],
        'temperature': 0.85,    # Выше — креативнее
        # Для старых моделей (gpt-4 и раньше) используй 'max_tokens'
        # Для новых моделей (gpt-5 и выше) используй 'max_completion_tokens'
        'max_completion_tokens': 600,
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    # Убираем завершающий слеш, добавляем /chat/completions
    base_url = api_url.rstrip('/')
    url = f'{base_url}/chat/completions'

    try:
        resp = requests.post(
            url, headers=headers, json=payload, timeout=60
        )
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        status = ''
        detail = ''
        if hasattr(e, 'response') and e.response is not None:
            status = f' (код: {e.response.status_code})'
            try:
                detail = e.response.json()
                detail = detail.get('error', {}).get('message', str(detail))
            except Exception:
                detail = e.response.text[:200]
        raise RuntimeError(
            f'Ошибка при запросе к API{status}.\n{detail or e}'
        )

    data = resp.json()
    try:
        post_text = data['choices'][0]['message']['content'].strip()
    except (KeyError, IndexError):
        raise RuntimeError(
            f'Неожиданный ответ от API: {json.dumps(data, ensure_ascii=False)[:300]}'
        )

    return post_text


# ===================================================================
# ФУНКЦИЯ: СГЕНЕРИРОВАТЬ ИЗОБРАЖЕНИЕ
# ===================================================================

def generate_image(api_key, api_url, prompt, model=None, size=None):
    """
    Сгенерировать изображение по промпту через DALL-E / gpt-image.
    Возвращает URL изображения или None при ошибке.
    """
    model = model or IMAGE_MODEL
    size = size or IMAGE_SIZE

    base_url = api_url.rstrip('/')
    # Строим URL для эндпоинта генерации изображений
    if '/chat/completions' in base_url:
        url = base_url.replace('/chat/completions', '/images/generations')
    elif base_url.endswith('/v1'):
        url = base_url + '/images/generations'
    else:
        url = base_url.rstrip('/') + '/images/generations'

    payload = {
        'model': model,
        'prompt': prompt,
        'n': 1,
        'size': size,
        'quality': IMAGE_QUALITY,
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        return None

    data = resp.json()
    try:
        # Некоторые API возвращают URL
        if 'url' in data['data'][0]:
            return data['data'][0]['url']
        # gpt-image-2 возвращает base64
        if 'b64_json' in data['data'][0]:
            b64 = data['data'][0]['b64_json']
            return f'data:image/png;base64,{b64}'
    except (KeyError, IndexError):
        return None
    return None


# ===================================================================
# ПРИЛОЖЕНИЕ FLASK
# ===================================================================

app = Flask(__name__)
app.secret_key = 'post-generator-secret-key-change-me'

# HTML-шаблон
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Генератор постов — нейросеть</title>
    <style>
        {{ STYLES|safe }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🤖 Генератор постов</h1>
            <p class="header__sub">
                Вставь ссылку на товар — нейросеть напишет пост
            </p>
        </header>

        <main class="main">
            <!-- ===== ФОРМА ===== -->
            <form class="card form" id="postForm" method="POST" action="/generate">
                <h2 class="card__title">Ссылка на товар</h2>

                <div class="form__group" id="urlGroup">
                    <label class="form__label" for="product_url">
                        URL товара <span class="form__required">*</span>
                    </label>
                    <input type="url" id="product_url" name="product_url"
                           class="form__input"
                           placeholder="https://market.ru/product/123"
                           value="{{ product_url }}">
                    <span class="form__hint">
                        Нейросеть проанализирует страницу и создаст пост
                    </span>
                    <button type="button" class="form__toggle-manual" id="toggleManual">
                        ✏️ Или ввести описание вручную
                    </button>
                </div>

                <div class="form__group" id="manualGroup" style="display:none">
                    <div class="form__group">
                        <label class="form__label" for="manual_name">Название товара</label>
                        <input type="text" id="manual_name" name="manual_name"
                               class="form__input"
                               placeholder="Например: Робот для мойки окон W13 Flybot"
                               value="{{ manual_name }}">
                    </div>

                    <div class="form__group">
                        <label class="form__label" for="manual_description">
                            Описание товара <span class="form__required">*</span>
                        </label>
                        <textarea id="manual_description" name="manual_description"
                                  class="form__input form__textarea"
                                  placeholder="Опиши товар: особенности, преимущества, комплектация...">{{ manual_description }}</textarea>
                    </div>

                    <div class="form__group">
                        <label class="form__label" for="manual_price">Цена или выгода</label>
                        <input type="text" id="manual_price" name="manual_price"
                               class="form__input"
                               placeholder="Например: 5 990 ₽ или -30%"
                               value="{{ manual_price }}">
                    </div>

                    <button type="button" class="form__toggle-manual" id="toggleUrl">
                        🔗 Или ввести ссылку
                    </button>
                </div>

                <div class="form__group">
                    <label class="form__label" for="mood">Настроение поста</label>
                    <select id="mood" name="mood" class="form__input form__select">
                        <option value="уверенный" {{ 'selected' if mood == 'уверенный' else '' }}>🔥 Уверенный</option>
                        <option value="заботливый" {{ 'selected' if mood == 'заботливый' else '' }}>💛 Заботливый</option>
                        <option value="дерзкий" {{ 'selected' if mood == 'дерзкий' else '' }}>💥 Дерзкий</option>
                        <option value="вдохновляющий" {{ 'selected' if mood == 'вдохновляющий' else '' }}>✨ Вдохновляющий</option>
                        <option value="информационный" {{ 'selected' if mood == 'информационный' else '' }}>📚 Информационный</option>
                        <option value="ироничный" {{ 'selected' if mood == 'ироничный' else '' }}>😏 Ироничный</option>
                        <option value="эмоциональный" {{ 'selected' if mood == 'эмоциональный' else '' }}>🌟 Эмоциональный</option>
                    </select>
                </div>

                <details class="form__details" {{ 'open' if image_prompt else '' }}>
                    <summary class="form__details-summary">🖼️ Сгенерировать изображение (необязательно)</summary>
                    <div class="form__details-body">
                        <div class="form__group">
                            <label class="form__label" for="image_prompt">
                                Промпт для изображения
                            </label>
                            <textarea id="image_prompt" name="image_prompt"
                                      class="form__input form__textarea form__textarea--small"
                                      placeholder="Опиши, что должно быть на картинке. Например: фото товара на белом фоне, продукт в интерьере...">{{ image_prompt }}</textarea>
                            <span class="form__hint">
                                Если не заполнить — изображение не будет генерироваться
                            </span>
                        </div>

                        <div class="form__row">
                            <div class="form__group form__group--half">
                                <label class="form__label" for="image_model">Модель</label>
                                <select id="image_model" name="image_model" class="form__input form__select">
                                    <option value="gpt-image-2" {{ 'selected' if image_model == 'gpt-image-2' else '' }}>gpt-image-2 (OpenAI)</option>
                                    <option value="gpt-image-1-mini" {{ 'selected' if image_model == 'gpt-image-1-mini' else '' }}>gpt-image-1-mini (OpenAI, бюджетная)</option>
                                </select>
                            </div>

                            <div class="form__group form__group--half">
                                <label class="form__label" for="image_size">Размер</label>
                                <select id="image_size" name="image_size" class="form__input form__select">
                                    <option value="1024x1024" {{ 'selected' if image_size == '1024x1024' else '' }}>1024×1024</option>
                                    <option value="1024x1792" {{ 'selected' if image_size == '1024x1792' else '' }}>1024×1792</option>
                                    <option value="1792x1024" {{ 'selected' if image_size == '1792x1024' else '' }}>1792×1024</option>
                                    <option value="2048x2048" {{ 'selected' if image_size == '2048x2048' else '' }}>2048×2048</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </details>

                <div class="form__group">
                    <label class="form__label" for="api_key">
                        API-ключ
                        <span class="form__hint-inline">(если не указан в настройках)</span>
                    </label>
                    <input type="password" id="api_key" name="api_key"
                           class="form__input"
                           placeholder="sk-..." value="{{ api_key_value }}">
                </div>

                <button type="submit" class="btn btn--primary" id="generateBtn">
                    ✨ Сформировать пост
                </button>

                <div class="form__loading" id="loadingIndicator" style="display:none">
                    <span class="spinner"></span>
                    <span id="loadingText">Анализирую товар и генерирую пост...</span>
                </div>
            </form>

            <!-- ===== РЕЗУЛЬТАТ ===== -->
            <div class="card result" id="resultBlock"
                 style="display: {{ 'block' if generated else 'none' }}">
                <h2 class="card__title">Готовый пост</h2>

                {% if image_url %}
                <div class="result__image-wrap">
                    <img src="{{ image_url }}" alt="Изображение товара"
                         class="result__image" loading="lazy">
                </div>
                {% endif %}

                <div class="result__text" id="postText">{{ post_text }}</div>

                <div class="result__actions">
                    <button class="btn btn--copy" id="copyBtn">
                        📋 Скопировать пост
                    </button>
                    <button type="button" class="btn btn--secondary" id="resetBtn">
                        🔄 Новый пост
                    </button>
                </div>
                <div class="result__toast" id="toast">Пост скопирован</div>
            </div>

            <!-- ===== ОШИБКА ===== -->
            {% if error %}
            <div class="card card--error" id="errorBlock">
                <span class="error__icon">⚠️</span>
                <span>{{ error }}</span>
            </div>
            {% endif %}
        </main>

        <footer class="footer">
            <p>Генератор постов через нейросеть &copy; 2026</p>
        </footer>
    </div>

    <script>
        {{ SCRIPT|safe }}
    </script>
</body>
</html>
'''

STYLES = '''
/* ===== СБРОС И БАЗА ===== */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                 Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    min-height: 100vh;
    color: #1a1a2e;
    line-height: 1.6;
    padding: 20px;
}

.container {
    max-width: 680px;
    margin: 0 auto;
}

/* ===== ШАПКА ===== */
.header {
    text-align: center;
    color: white;
    padding: 40px 20px 30px;
}

.header h1 {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.5px;
}

.header__sub {
    font-size: 1rem;
    opacity: 0.85;
    margin-top: 8px;
}

/* ===== КАРТОЧКИ ===== */
.card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.card__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f5;
}

.card--error {
    background: #fff0f0;
    border-left: 4px solid #e74c3c;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #c0392b;
    word-break: break-word;
}

/* ===== СВЁРТЫВАЕМЫЙ БЛОК (DETAILS) ===== */
.form__details {
    margin-bottom: 20px;
    border: 2px solid #e8e8f0;
    border-radius: 12px;
    overflow: hidden;
}

.form__details-summary {
    padding: 14px 16px;
    font-weight: 600;
    font-size: 0.925rem;
    color: #2d2d44;
    cursor: pointer;
    user-select: none;
    background: #f8f8fe;
    transition: background 0.15s;
}

.form__details-summary:hover {
    background: #f0f0fa;
}

.form__details-body {
    padding: 16px 16px 4px;
    border-top: 1px solid #e8e8f0;
}

.form__textarea--small {
    min-height: 70px;
}

.form__row {
    display: flex;
    gap: 12px;
}

.form__group--half {
    flex: 1;
    min-width: 0;
}

@media (max-width: 500px) {
    .form__row {
        flex-direction: column;
        gap: 0;
    }
}

.error__icon {
    font-size: 1.3rem;
    flex-shrink: 0;
}

/* ===== ФОРМА ===== */
.form__group {
    margin-bottom: 20px;
}

.form__label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-weight: 600;
    font-size: 0.925rem;
    margin-bottom: 6px;
    color: #2d2d44;
}

.form__required {
    color: #e74c3c;
}

.form__hint {
    display: block;
    font-size: 0.8rem;
    color: #999;
    margin-top: 4px;
}

.form__hint-inline {
    font-weight: 400;
    font-size: 0.8rem;
    color: #999;
}

.form__input {
    width: 100%;
    padding: 12px 16px;
    font-size: 1rem;
    border: 2px solid #e0e0ea;
    border-radius: 10px;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
    background: #fafafe;
}

.form__input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    background: white;
}

.form__select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='2' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
    cursor: pointer;
}

/* ===== КНОПКА ПЕРЕКЛЮЧЕНИЯ URL / ВРУЧНУЮ ===== */
.form__toggle-manual {
    display: inline-block;
    margin-top: 8px;
    padding: 0;
    border: none;
    background: none;
    color: #667eea;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    font-family: inherit;
}

.form__toggle-manual:hover {
    color: #764ba2;
}

/* ===== ИНДИКАТОР ЗАГРУЗКИ ===== */
.form__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
    padding: 14px;
    background: #f0f4ff;
    border-radius: 12px;
    color: #4a4a8a;
    font-weight: 500;
    font-size: 0.95rem;
}

.spinner {
    width: 22px;
    height: 22px;
    border: 3px solid #e0e0ea;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ===== КНОПКИ ===== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    font-family: inherit;
    width: 100%;
}

.btn:active {
    transform: scale(0.97);
}

.btn--primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn--primary:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.55);
}

.btn--primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn--copy {
    background: #27ae60;
    color: white;
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.35);
    flex: 1;
}

.btn--copy:hover {
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.5);
}

.btn--secondary {
    background: #f0f0f5;
    color: #444;
}

.btn--secondary:hover {
    background: #e5e5ee;
}

/* ===== РЕЗУЛЬТАТ ===== */
.result__image-wrap {
    margin-bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
    background: #f0f0f5;
}

.result__image {
    display: block;
    width: 100%;
    max-height: 480px;
    object-fit: contain;
    background: #f8f9ff;
}

.result__text {
    background: #f8f9ff;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    white-space: pre-wrap;
    font-size: 0.95rem;
    line-height: 1.7;
    border: 1px solid #eee;
    min-height: 100px;
    word-break: break-word;
}

.result__actions {
    display: flex;
    gap: 12px;
}

/* ===== TOAST-УВЕДОМЛЕНИЕ ===== */
.result__toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: #2d2d44;
    color: white;
    padding: 12px 28px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.result__toast--visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* ===== ФУТЕР ===== */
.footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 20px;
    font-size: 0.85rem;
}

/* ===== АДАПТИВ ===== */
@media (max-width: 500px) {
    body { padding: 12px; }
    .card { padding: 20px; }
    .header h1 { font-size: 1.5rem; }
    .result__actions { flex-direction: column; }
}
'''

SCRIPT = '''
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('postForm');
    var resultBlock = document.getElementById('resultBlock');
    var copyBtn = document.getElementById('copyBtn');
    var resetBtn = document.getElementById('resetBtn');
    var toast = document.getElementById('toast');
    var generateBtn = document.getElementById('generateBtn');
    var loadingIndicator = document.getElementById('loadingIndicator');
    var urlGroup = document.getElementById('urlGroup');
    var manualGroup = document.getElementById('manualGroup');
    var toggleManual = document.getElementById('toggleManual');
    var toggleUrl = document.getElementById('toggleUrl');

    // Показать результат, если он есть (после генерации)
    if (resultBlock && resultBlock.style.display === 'block') {
        resultBlock.style.display = 'block';
    }

    // Показать manual, если передан manual_description
    var manualDesc = document.getElementById('manual_description');
    if (manualDesc && manualDesc.value.trim()) {
        if (urlGroup) urlGroup.style.display = 'none';
        if (manualGroup) manualGroup.style.display = 'block';
    }

    // ===== ПЕРЕКЛЮЧЕНИЕ URL / ВРУЧНУЮ =====
    if (toggleManual) {
        toggleManual.addEventListener('click', function () {
            urlGroup.style.display = 'none';
            manualGroup.style.display = 'block';
            manualDesc.focus();
        });
    }
    if (toggleUrl) {
        toggleUrl.addEventListener('click', function () {
            manualGroup.style.display = 'none';
            urlGroup.style.display = 'block';
            document.getElementById('product_url').focus();
        });
    }

    // ===== КОПИРОВАНИЕ =====
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            var postText = document.getElementById('postText');
            var text = postText.textContent;
            navigator.clipboard.writeText(text).then(function () {
                toast.classList.add('result__toast--visible');
                setTimeout(function () {
                    toast.classList.remove('result__toast--visible');
                }, 2000);
            }).catch(function () {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                toast.classList.add('result__toast--visible');
                setTimeout(function () {
                    toast.classList.remove('result__toast--visible');
                }, 2000);
            });
        });
    }

    // ===== СБРОС =====
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.reset();
            resultBlock.style.display = 'none';
            var errorBlock = document.getElementById('errorBlock');
            if (errorBlock) errorBlock.remove();
            // Показываем URL-режим
            if (urlGroup) urlGroup.style.display = 'block';
            if (manualGroup) manualGroup.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== ОТПРАВКА ФОРМЫ =====
    if (form) {
        form.addEventListener('submit', function (e) {
            var urlInput = document.getElementById('product_url');
            var manualInput = document.getElementById('manual_description');
            var hasUrl = urlInput && urlInput.value.trim();
            var hasManual = manualInput && manualInput.value.trim();

            if (!hasUrl && !hasManual) {
                e.preventDefault();
                if (urlGroup && urlGroup.style.display !== 'none') {
                    urlInput.style.borderColor = '#e74c3c';
                    urlInput.focus();
                } else {
                    manualInput.style.borderColor = '#e74c3c';
                    manualInput.focus();
                }
                alert('Пожалуйста, введите ссылку на товар или описание вручную');
                return;
            }
            if (urlInput) urlInput.style.borderColor = '';
            if (manualInput) manualInput.style.borderColor = '';

            // Показываем индикатор загрузки
            if (generateBtn) generateBtn.disabled = true;
            if (loadingIndicator) loadingIndicator.style.display = 'flex';
            var loadingText = document.getElementById('loadingText');
            var imagePrompt = document.getElementById('image_prompt');
            if (loadingText && imagePrompt && imagePrompt.value.trim()) {
                loadingText.textContent = 'Генерирую пост и изображение...';
            }
        });
    }
});
'''


def build_manual_info(name, description, price):
    """Собрать информацию о товаре из полей ручного ввода"""
    parts = []
    if name:
        parts.append(f'Название товара: {name}')
    if description:
        parts.append(f'Описание товара: {description}')
    if price:
        parts.append(f'Цена/выгода: {price}')
    return '\n\n'.join(parts)


@app.route('/', methods=['GET'])
def index():
    """Главная страница"""
    return render_template_string(
        HTML_TEMPLATE,
        STYLES=STYLES,
        SCRIPT=SCRIPT,
        generated=False,
        post_text='',
        product_url='',
        manual_name='',
        manual_description='',
        manual_price='',
        image_prompt='',
        image_model=IMAGE_MODEL,
        image_size=IMAGE_SIZE,
        image_url='',
        mood='уверенный',
        api_key_value='',
        error=None,
    )


@app.route('/generate', methods=['POST'])
def generate():
    """Обработка формы: URL или manual + нейросеть + опционально изображение"""
    product_url = request.form.get('product_url', '').strip()
    manual_name = request.form.get('manual_name', '').strip()
    manual_description = request.form.get('manual_description', '').strip()
    manual_price = request.form.get('manual_price', '').strip()
    image_prompt = request.form.get('image_prompt', '').strip()
    image_model = request.form.get('image_model', IMAGE_MODEL).strip()
    image_size = request.form.get('image_size', IMAGE_SIZE).strip()
    mood = request.form.get('mood', 'уверенный')
    api_key = request.form.get('api_key', '').strip() or API_KEY

    manual_info = build_manual_info(manual_name, manual_description, manual_price)

    def render_with_error(error_text):
        return render_template_string(
            HTML_TEMPLATE,
            STYLES=STYLES,
            SCRIPT=SCRIPT,
            generated=False,
            post_text='',
            product_url=product_url,
            manual_name=manual_name,
            manual_description=manual_description,
            manual_price=manual_price,
            image_prompt=image_prompt,
            image_model=image_model,
            image_size=image_size,
            image_url='',
            mood=mood,
            api_key_value=api_key,
            error=error_text,
        )

    if not product_url and not manual_info:
        return render_with_error(
            'Заполни ссылку на товар или описание вручную.'
        )

    if not api_key:
        return render_with_error(
            'Не указан API-ключ. Вставьте его в поле "API-ключ" '
            'или пропишите в настройках сервера (API_KEY в app.py).'
        )

    # Шаг 1: получаем информацию о товаре
    if product_url:
        try:
            product_info = fetch_product_info(product_url)
        except RuntimeError as e:
            if manual_info:
                product_info = manual_info
            else:
                return render_with_error(str(e))
    else:
        product_info = manual_info

    # Шаг 2: генерируем пост через нейросеть
    try:
        post_text = call_llm(api_key, API_URL, MODEL, mood, product_info)
    except RuntimeError as e:
        return render_with_error(str(e))

    # Шаг 3: если указан промпт — генерируем изображение
    image_url = ''
    if image_prompt:
        try:
            image_url = generate_image(api_key, API_URL, image_prompt, image_model, image_size)
        except Exception:
            image_url = ''

    return render_template_string(
        HTML_TEMPLATE,
        STYLES=STYLES,
        SCRIPT=SCRIPT,
        generated=True,
        post_text=post_text,
        product_url=product_url,
        manual_name=manual_name,
        manual_description=manual_description,
        manual_price=manual_price,
        image_prompt=image_prompt,
        image_model=image_model,
        image_size=image_size,
        image_url=image_url or '',
        mood=mood,
        api_key_value=api_key,
        error=None,
    )


if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print('Запуск генератора постов через нейросеть')
    print('URL:  http://localhost:5000')
    print('API:  ' + API_URL)
    print('Модель: ' + MODEL)
    if API_KEY:
        print('Ключ: задан в настройках')
    else:
        print('Ключ: вводи на сайте')
    app.run(host='0.0.0.0', port=5000, debug=True)
