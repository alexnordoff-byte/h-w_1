"""
Telegram-бот: Генератор постов для товара
==========================================
Запуск:  python bot.py
"""

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler, CallbackQueryHandler,
    filters, ConversationHandler,
)

from app import (
    fetch_product_info, call_llm, generate_image, build_manual_info,
    API_KEY, API_URL, MODEL, IMAGE_MODEL, IMAGE_SIZE,
)

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = '8022862245:AAE0kHAhQRTISN9fujvDRQIeHCJdLWuFDDU'

# Состояния диалога
WAITING_URL, WAITING_MANUAL_NAME, WAITING_MANUAL_DESC, WAITING_MANUAL_PRICE, WAITING_MOOD, WAITING_IMAGE_PROMPT = range(6)

user_data_store = {}

MOODS = {
    'уверенный': '🔥', 'заботливый': '💛', 'дерзкий': '💥',
    'вдохновляющий': '✨', 'информационный': '📚', 'ироничный': '😏', 'эмоциональный': '🌟',
}


def get_data(user_id):
    if user_id not in user_data_store:
        user_data_store[user_id] = {}
    return user_data_store[user_id]


def build_reply_keyboard():
    """Постоянная клавиатура внизу — не нужно вводить /start"""
    return ReplyKeyboardMarkup(
        [[KeyboardButton('🚀 Создать пост')]],
        resize_keyboard=True,
        is_persistent=True,
    )


def build_menu_keyboard():
    """Главное меню: способ ввода + настроение + изображение"""
    keyboard = [
        [InlineKeyboardButton('🔗 По ссылке', callback_data='input_url'),
         InlineKeyboardButton('✏️ Вручную', callback_data='input_manual')],
    ]
    row = []
    for i, (mood, emoji) in enumerate(MOODS.items()):
        row.append(InlineKeyboardButton(f'{emoji} {mood}', callback_data=f'mood_{mood}'))
        if (i + 1) % 3 == 0:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
    keyboard.append([
        InlineKeyboardButton('🖼️ С картинкой', callback_data='image_yes'),
        InlineKeyboardButton('❌ Без картинки', callback_data='image_no'),
    ])
    return InlineKeyboardMarkup(keyboard)


def build_yesno(text_yes, text_no, data_yes, data_no):
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(text_yes, callback_data=data_yes),
         InlineKeyboardButton(text_no, callback_data=data_no)],
    ])


# ===================================================================
# /start
# ===================================================================

async def start(update: Update, context):
    user = update.effective_user
    data = get_data(update.effective_user.id)
    data.clear()

    # Устанавливаем меню команд для этого чата
    await context.bot.set_chat_menu_button(
        chat_id=update.effective_chat.id,
        menu_button=None,  # стандартная кнопка с командами
    )

    await update.message.reply_text(
        f'👋 Привет, {user.first_name}!\n\n'
        '🤖 Я — генератор постов для товаров.\n'
        'Напишу пост для соцсетей — по ссылке или по твоему описанию.\n'
        'Могу даже картинку сгенерировать!\n\n'
        '👇 Нажми «🚀 Создать пост» чтобы начать:',
        reply_markup=build_reply_keyboard(),
    )

    # Сразу же показываем меню выбора
    await update.message.reply_text(
        '🚀 Создаём пост!\n\n'
        '1️⃣ Информация о товаре ↓\n'
        '2️⃣ Настроение\n'
        '3️⃣ Изображение\n\n'
        '👇 Выбирай по порядку:',
        reply_markup=build_menu_keyboard(),
    )
    return ConversationHandler.END


async def fallback_start(update: Update, context):
    """Любой текст вне диалога → показать меню (как /start)"""
    user = update.effective_user
    data = get_data(update.effective_user.id)
    data.clear()

    await update.message.reply_text(
        f'👋 Привет, {user.first_name}!',
        reply_markup=build_reply_keyboard(),
    )
    await update.message.reply_text(
        '🚀 Создаём пост!\n\n'
        '1️⃣ Информация о товаре ↓\n'
        '2️⃣ Настроение\n'
        '3️⃣ Изображение\n\n'
        '👇 Выбирай по порядку:',
        reply_markup=build_menu_keyboard(),
    )
    return ConversationHandler.END


async def start_from_button(update: Update, context):
    """Обработка нажатия на кнопку «🚀 Создать пост» в reply-клавиатуре"""
    user_id = update.effective_user.id
    data = get_data(user_id)
    data.clear()

    await update.message.reply_text(
        '🚀 Создаём пост!\n\n'
        '1️⃣ Информация о товаре ↓\n'
        '2️⃣ Настроение\n'
        '3️⃣ Изображение\n\n'
        '👇 Выбирай по порядку:',
        reply_markup=build_menu_keyboard(),
    )
    return ConversationHandler.END


# ===================================================================
# Старт диалога — показываем все кнопки
# ===================================================================

async def start_dialog(update: Update, context):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    data.clear()

    await query.edit_message_text(
        '🚀 Создаём пост!\n\n'
        '1️⃣ Сначала нужна информация о товаре.\n'
        '   Выбери способ: ссылка или ручной ввод ↓\n\n'
        '2️⃣ Потом выбери настроение.\n\n'
        '3️⃣ Реши, нужно ли изображение.\n\n'
        '👇 Нажимай по порядку:',
        reply_markup=build_menu_keyboard(),
    )

    # Сохраняем ID сообщения с меню, чтобы потом редактировать его
    data['menu_msg_id'] = query.message.message_id
    return WAITING_URL


# ===================================================================
# УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК КНОПОК — работает из любого состояния
# Каждая кнопка проверяет, все ли данные введены, иначе перенаправляет
# ===================================================================

async def universal_callback(update: Update, context):
    """Единый обработчик для всех кнопок меню, независимо от состояния"""
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    cb = query.data

    # ⬅️ НАЗАД В МЕНЮ
    if cb == 'back_to_menu':
        data.clear()
        await query.edit_message_text(
            '🚀 Создаём пост!\n\n'
            '1️⃣ Информация о товаре ↓\n'
            '2️⃣ Настроение\n'
            '3️⃣ Изображение\n\n'
            '👇 Выбирай по порядку:',
            reply_markup=build_menu_keyboard(),
        )
        return WAITING_URL

    # 🔗 / ✏️ СПОСОБ ВВОДА
    if cb == 'input_url':
        await query.edit_message_text(
            '🔗 Отправь ссылку на товар.\n\n'
            'Например:\n'
            'https://market.ru/product/123\n\n'
            'Или нажми кнопку, чтобы вернуться:',
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton('⬅️ Назад в меню', callback_data='back_to_menu')],
            ]),
        )
        return WAITING_URL

    if cb == 'input_manual':
        await query.edit_message_text('✏️ Введи НАЗВАНИЕ товара:')
        return WAITING_MANUAL_NAME

    # 🎭 ВЫБОР НАСТРОЕНИЯ
    if cb.startswith('mood_'):
        if 'product_info' not in data:
            await query.edit_message_text(
                '⚠️ Сначала введи информацию о товаре!\n\n'
                'Выбери способ ↓',
                reply_markup=build_menu_keyboard(),
            )
            return WAITING_URL
        data['mood'] = cb.replace('mood_', '')
        await query.edit_message_text(
            f'✅ Настроение выбрано!\n\n🖼️ Добавить изображение?',
            reply_markup=build_yesno('🖼️ Да', '❌ Нет', 'image_yes', 'image_no'),
        )
        return WAITING_IMAGE_PROMPT

    # 🖼️ ИЗОБРАЖЕНИЕ
    if cb == 'image_yes':
        if 'mood' not in data:
            await query.edit_message_text(
                '⚠️ Сначала выбери настроение!',
                reply_markup=build_menu_keyboard(),
            )
            return WAITING_URL
        data['generate_image'] = True
        await query.edit_message_text(
            '🖼️ Напиши промпт для изображения.\n\n'
            'Пример: «товар на белом фоне, 3D-рендер»\n\n'
            '⬇️ Отправь текст:',
        )
        return WAITING_IMAGE_PROMPT

    if cb == 'image_no':
        if 'mood' not in data:
            await query.edit_message_text(
                '⚠️ Сначала выбери настроение!',
                reply_markup=build_menu_keyboard(),
            )
            return WAITING_URL
        data['generate_image'] = False
        data['image_prompt'] = ''
        return await generate_and_send(query, context)

    return ConversationHandler.END


# ===================================================================
# ОБРАБОТКА URL
# ===================================================================

async def handle_url(update: Update, context):
    user_id = update.effective_user.id
    data = get_data(user_id)
    url = update.message.text.strip()
    data['url'] = url

    status_msg = await update.message.reply_text('🔄 Загружаю страницу товара...')

    try:
        product_info = fetch_product_info(url)
        data['product_info'] = product_info
        await status_msg.edit_text('✅ Информация получена! Теперь выбери настроение 👇')
        # Отправляем mood клавиатуру
        keyboard = []
        row = []
        for i, (mood, emoji) in enumerate(MOODS.items()):
            row.append(InlineKeyboardButton(f'{emoji} {mood}', callback_data=f'mood_{mood}'))
            if (i + 1) % 3 == 0:
                keyboard.append(row)
                row = []
        if row:
            keyboard.append(row)
        keyboard.append([InlineKeyboardButton('⬅️ Назад', callback_data='back_to_menu')])
        await update.message.reply_text('🎭 Выбери настроение:', reply_markup=InlineKeyboardMarkup(keyboard))
        return WAITING_MOOD
    except RuntimeError as e:
        error_text = str(e)
        if 'заблокировал' in error_text or '403' in error_text:
            await status_msg.edit_text(
                '⚠️ Сайт не дал загрузить страницу.\n\n'
                'Давай введём данные вручную.\n\n'
                'Введи НАЗВАНИЕ товара:',
            )
            return WAITING_MANUAL_NAME
        else:
            await status_msg.edit_text(f'❌ Ошибка: {error_text}')
            return ConversationHandler.END


# ===================================================================
# РУЧНОЙ ВВОД
# ===================================================================

async def handle_manual_name(update: Update, context):
    user_id = update.effective_user.id
    data = get_data(user_id)
    data['manual_name'] = update.message.text.strip()
    await update.message.reply_text('✏️ Теперь введи ОПИСАНИЕ товара:')
    return WAITING_MANUAL_DESC


async def handle_manual_desc(update: Update, context):
    user_id = update.effective_user.id
    data = get_data(user_id)
    data['manual_desc'] = update.message.text.strip()
    await update.message.reply_text('✏️ Укажи ЦЕНУ или выгоду (или отправь "-"):')
    return WAITING_MANUAL_PRICE


async def handle_manual_price(update: Update, context):
    user_id = update.effective_user.id
    data = get_data(user_id)
    price = update.message.text.strip()
    if price in ('нет', '-', ''):
        price = ''

    data['product_info'] = build_manual_info(
        data.get('manual_name', ''),
        data.get('manual_desc', ''),
        price,
    )

    keyboard = []
    row = []
    for i, (mood, emoji) in enumerate(MOODS.items()):
        row.append(InlineKeyboardButton(f'{emoji} {mood}', callback_data=f'mood_{mood}'))
        if (i + 1) % 3 == 0:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)

    await update.message.reply_text(
        '✅ Данные получены!\n\n🎭 Теперь выбери настроение:',
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    return WAITING_MOOD


# ===================================================================
# ВЫБОР НАСТРОЕНИЯ
# ===================================================================

async def handle_mood(update: Update, context):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    data['mood'] = query.data.replace('mood_', '')

    await query.edit_message_text(
        f'✅ Настроение выбрано!\n\n'
        f'🖼️ Добавить изображение к посту?',
        reply_markup=build_yesno('🖼️ Да', '❌ Нет', 'image_yes', 'image_no'),
    )
    return WAITING_IMAGE_PROMPT


# ===================================================================
# ИЗОБРАЖЕНИЕ
# ===================================================================

async def image_yes_callback(update: Update, context):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    data['generate_image'] = True

    await query.edit_message_text(
        '🖼️ Напиши, что должно быть на картинке.\n\n'
        'Например:\n'
        '• товар на белом фоне\n'
        '• продукт в интерьере\n'
        '• 3D-рендер устройства\n\n'
        '⬇️ Отправь промпт:',
    )
    return WAITING_IMAGE_PROMPT


async def image_no_callback(update: Update, context):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    data['generate_image'] = False
    data['image_prompt'] = ''
    return await generate_and_send(query, context)


async def handle_image_prompt(update: Update, context):
    user_id = update.effective_user.id
    data = get_data(user_id)
    prompt = update.message.text.strip()
    if prompt.lower() in ('нет', '-', ''):
        data['generate_image'] = False
    else:
        data['generate_image'] = True
        data['image_prompt'] = prompt

    status_msg = await update.message.reply_text('⏳ Генерирую пост...')
    return await do_generate(status_msg, update, context)


async def generate_and_send(query, context):
    """Запустить генерацию из callback"""
    user_id = query.from_user.id
    data = get_data(user_id)
    status_msg = await query.edit_message_text('⏳ Генерирую пост...')
    return await do_generate(status_msg, query, context)


async def do_generate(status_msg, source, context):
    """Общая генерация"""
    user_id = source.effective_user.id
    data = get_data(user_id)

    try:
        post_text = call_llm(API_KEY, API_URL, MODEL, data.get('mood', 'уверенный'), data['product_info'])
    except RuntimeError as e:
        await status_msg.edit_text(f'❌ Ошибка:\n{e}')
        return ConversationHandler.END

    image_url = ''
    if data.get('generate_image') and data.get('image_prompt'):
        try:
            await status_msg.edit_text('⏳ Генерирую пост и изображение...')
            image_url = generate_image(API_KEY, API_URL, data['image_prompt'], IMAGE_MODEL, IMAGE_SIZE)
        except Exception:
            pass

    if hasattr(source, 'message') and source.message:
        chat_id = source.effective_chat.id
    else:
        chat_id = user_id

    if image_url:
        await status_msg.delete()
        await context.bot.send_photo(
            chat_id=chat_id,
            photo=image_url,
            caption=post_text,
            reply_markup=build_reply_keyboard(),
        )
    else:
        await status_msg.edit_text(
            f'✅ Готово!\n\n{post_text}',
            reply_markup=build_reply_keyboard(),
        )

    return ConversationHandler.END


# ===================================================================
# НАЗАД В МЕНЮ
# ===================================================================

async def back_to_menu(update: Update, context):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    data = get_data(user_id)
    data.clear()

    await query.edit_message_text(
        '🚀 Создаём пост!\n\n'
        '1️⃣ Информация о товаре ↓\n'
        '2️⃣ Настроение\n'
        '3️⃣ Изображение\n\n'
        '👇 Выбирай по порядку:',
        reply_markup=build_menu_keyboard(),
    )
    return WAITING_URL


# ===================================================================
# ЗАПУСК
# ===================================================================

def main():
    if API_KEY:
        logger.info(f'Ключ: есть | Модель: {MODEL} | Изображения: {IMAGE_MODEL}')
    else:
        logger.warning('API-ключ не задан!')

    app = Application.builder().token(BOT_TOKEN).build()

    # Регистрируем команды — они появятся в меню Telegram
    app.bot.set_my_commands([
        BotCommand('start', '🚀 Начать / Главное меню'),
    ])

    # Обработчик кнопки «🚀 Создать пост» в reply-клавиатуре
    app.add_handler(MessageHandler(
        filters.Text('🚀 Создать пост') & ~filters.COMMAND,
        start_from_button,
    ))

    # Любой другой текст вне диалога → показать меню
    app.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND,
        fallback_start,
    ))

    conv_handler = ConversationHandler(
        entry_points=[
            CallbackQueryHandler(start_dialog, pattern='^start_dialog$'),
        ],
        states={
            WAITING_URL: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_url),
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
            ],
            WAITING_MANUAL_NAME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_manual_name),
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
            ],
            WAITING_MANUAL_DESC: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_manual_desc),
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
            ],
            WAITING_MANUAL_PRICE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_manual_price),
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
            ],
            WAITING_MOOD: [
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
            ],
            WAITING_IMAGE_PROMPT: [
                CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_image_prompt),
            ],
        },
        fallbacks=[
            CommandHandler('start', start),
            CallbackQueryHandler(universal_callback, pattern='^(input_|back_to_menu|mood_|image_)'),
        ],
    )

    app.add_handler(CommandHandler('start', start))
    app.add_handler(conv_handler)

    logger.info('Бот запущен! Ищи в Telegram: @genyasist_bot')
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
