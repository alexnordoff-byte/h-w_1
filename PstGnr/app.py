#!/usr/bin/env python
from flask import Flask, render_template, request, redirect, url_for
import markdown  # Для чтения файла voice.md

app = Flask(__name__)

def read_voice_md():
    with open('voice.md', 'r') as f:
        return markdown.markdown(f.read())

@app.route('/')
def index():
    settings = read_voice_md()
    return render_template('index.html', settings=settings)

@app.route('/generate_post', methods=['POST'])
def generate_post():
    product_name = request.form['product_name']
    description = request.form.get('description')
    
    # Проверка на обязательное поле "описание"
    if not description:
        return redirect(url_for('index', error='Пожалуйста, заполните описание товара'))

    price_or_benefit = request.form.get('price_or_benefit')
    mood = request.form['mood']
    post = f'🔥 **{product_name}**\n\n{description}\n\n💰 {price_or_benefit} 💰'
    
    return render_template('index.html', post=post, settings=settings)

if __name__ == '__main__':
    app.run(debug=True)