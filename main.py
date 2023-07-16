from flask import Flask, render_template, request, session, redirect, url_for, flash, jsonify
from datetime import timedelta
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
import os
import time

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Generate a secure secret key

client = MongoClient('mongodb://localhost:27017/')  # Connect to MongoDB
db = client['Website_db']  # Select the database

UPLOAD_FOLDER = 'C:\\Users\\nadav\\OneDrive\\Desktop\\DevOps22\\GIT\\TestWebsite\\static\\uploads\\'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Specify the allowed file extensions

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Set the upload folder configuration


from flask import jsonify

@app.route('/delete_task', methods=['DELETE'])
def delete_task():
    task_id = request.json['taskId']

    try:
        db.tasks.delete_one({'_id': ObjectId(task_id)})
        return jsonify({'message': 'Task deleted successfully'})
    except:
        return jsonify({'message': 'Error deleting task'})


class Task:
    def __init__(self, name, date, stime, ftime, category, comment=""):
        self.comment = comment
        self.category = category
        self.startTime = stime
        self.finishTime = ftime
        self.date = date
        self.name = name

def SaveTask(task):
    # Save the task to the jQuery database
    # Your existing code here...

    # Save the task to MongoDB
    collection = db['tasks']
    collection.insert_one({
        'name': task.name,
        'date': task.date,
        'startTime': task.startTime,
        'finishTime': task.finishTime,
        'category': task.category,
        'comment': task.comment
    })

@app.route("/")
@app.route("/home")
def home():
    if 'username' in session:
        return redirect(url_for('tasks'))

    # Retrieve tasks from MongoDB
    collection = db['tasks']
    tasks = list(collection.find())
    return render_template('index.html', css_file='css/main.css')


@app.route('/about')
def about():
    return render_template('about.html', css_file='css/main.css')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Get the submitted username and password
        username = request.form['username']
        password = request.form['password']

        # Connect to the 'users' collection in MongoDB
        collection = db['users']

        # Check if the user exists in the collection
        user = collection.find_one({'username': username, 'password': password})
        if user:
            # User is authenticated, set session variables
            session['username'] = username
            session.permanent = True
            app.permanent_session_lifetime = timedelta(seconds=300)

            # Flash a success message
            flash('Login successful. Redirecting to your account page...', 'success')

            # Redirect to the login_success page
            return redirect(url_for('login_success'))

        # Invalid credentials, show an error message
        flash('Invalid username or password. Please try again.', 'error')

    # Render the login page template
    return render_template('login.html', css_file='css/main.css')

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if 'username' not in session:
        return render_template('login_required.html', css_file='css/main.css')

    # Retrieve tasks from MongoDB
    tasks = db.tasks.find()

    return render_template('tasks.html', tasks=tasks, css_file='main.css', delay=2.5)


@app.route('/login_success')
def login_success():
    return render_template('login_success.html', css_file='css/main.css', delay=2.5)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

@app.route('/my_account', methods=['GET', 'POST'])
def my_account():
    if 'username' not in session:
        return redirect('/login')

    # Check if the session has expired
    if 'ttl' in session and time.time() > session['ttl']:
        session.clear()
        flash('Session expired. Please log in again.', 'info')
        return redirect('/login')

    # Update the session TTL to 45 seconds from the current time
    session['ttl'] = time.time() + 300

    # Get the user's current information from the database
    collection = db['users']
    user = collection.find_one({'username': session['username']})

    if request.method == 'POST':
        # Get the submitted form data
        nickname = request.form['nickname']
        last_name = request.form['last_name']

        # Update the user's account information in the database
        collection.update_one(
            {'username': session['username']},
            {'$set': {'nickname': nickname, 'last_name': last_name}}
        )

        # Save the profile picture using appropriate logic
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file.filename != '':
                filename = secure_filename(file.filename)
                if '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    # Save the file path or perform any other necessary actions
                    collection.update_one(
                        {'username': session['username']},
                        {'$set': {'profile_picture': filename}}
                    )

        flash('Changes saved successfully.', 'success')
        return redirect(url_for('my_account'))

    # Render the account page template
    return render_template('my_account.html', username=session['username'],
                           nickname=user.get('nickname', ''), last_name=user.get('last_name', ''),
                           profile_picture=user.get('profile_picture', ''))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get the submitted username and password
        username = request.form['username']
        password = request.form['password']

        # Connect to the 'users' collection in MongoDB
        collection = db['users']

        # Check if the user already exists in the collection
        existing_user = collection.find_one({'username': username})
        if existing_user:
            # User already exists, show an error message
            return render_template('register.html', css_file='css/main.css', error='Username already taken')

        # Insert the new user into the collection
        collection.insert_one({'username': username, 'password': password})

        # Redirect to a new page after successful registration
        return render_template('register_success.html', username=username)

    # Render the registration page template
    return render_template('register.html', css_file='css/main.css')


@app.route('/save_task', methods=['POST'])
def save_task():
    task_data = request.get_json()
    new_task = Task(
        task_data['name'],
        task_data['date'],
        task_data['startTime'],
        task_data['finishTime'],
        task_data['category'],
        task_data['comment']
    )
    SaveTask(new_task)
    return jsonify({'message': 'Task saved successfully'})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
