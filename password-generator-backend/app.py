from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', title='Accueil')

@app.route('/hello')
def hello():
    return '<h1>Bonjour le monde !</h1>'

@app.route('/user/<name>')
def user(name):
    return f'<h1>Bonjour, {name} !</h1>'

if __name__ == '__main__':
    app.run(debug=True)
