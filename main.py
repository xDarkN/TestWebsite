from flask import Flask, render_template, request, session, redirect, url_for, flash
from datetime import timedelta
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os
import time

client = MongoClient('mongodb://localhost:27017/')  # Connect to MongoDB
db = client['Website_db']  # Select the database

UPLOAD_FOLDER = 'C:\\Users\\nadav\\OneDrive\\Desktop\\DevOps22\\GIT\\TestWebsite\\static\\uploads\\'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Specify the allowed file extensions

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Generate a secure secret key
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Set the upload folder configuration

@app.route("/")
@app.route("/home")
def home():
    if 'username' in session:
        return redirect(url_for('tasks'))
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
    if request.method == 'POST':
        # Get the task details from the form
        task_name = request.form['task_name']
        task_priority = request.form['task_priority']
        task_subtasks = request.form.getlist('task_subtasks')

        # Connect to the 'tasks' collection in MongoDB
        collection = db['tasks']

        # Create a new task document
        task = {
            'user_id': session['username'],
            'task_name': task_name,
            'task_priority': task_priority,
            'task_subtasks': task_subtasks
        }

        # Insert the new task into the collection
        collection.insert_one(task)

        # Flash a success message
        flash('Task added successfully.', 'success')

    # Get the tasks for the current user from the database
    collection = db['tasks']
    tasks = collection.find({'user_id': session['username']})

    return render_template('tasks.html', css_file='main.css', tasks=tasks, delay=2.5)

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

if __name__ == '__main__':
    app.run(debug=True)