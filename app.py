from flask import Flask, render_template, request, redirect, url_for,session, jsonify
from flask_socketio import SocketIO, send
from datetime import datetime, timedelta
from scripts.wordle import plot_key_values
import json
from scripts.log import log_text
from scripts.matching import secret_santa
import os
from dotenv import load_dotenv # Import load_dotenv
from config import Config
from utils.project_loader import get_main_projects, get_ai_projects

load_dotenv() # Load environment variables from .env file

# Validate configuration on startup
Config.validate()

print("Starting app.py...")

messages = []
def get_recent_messages():
    now = datetime.utcnow()
    one_month_ago = now - timedelta(days=30)

    # Filter for messages in the last month
    last_month_msgs = [m for m in messages if m["timestamp"] >= one_month_ago.timestamp() * 1000]

    if len(last_month_msgs) >= 10:
        return last_month_msgs
    else:
        # fallback: last 10 overall
        return messages[-10:]


# Initialize the Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY 

# Initialize SocketIO
socketio = SocketIO(app)

# When a client sends a message
@socketio.on("message")
def handle_message(msg):
    # Ensure timestamp is present
    if "timestamp" not in msg:
        msg["timestamp"] = int(datetime.utcnow().timestamp() * 1000)

    # Store in global messages list
    messages.append(msg)

    print(f"Message: {msg}")
    send(msg, broadcast=True)


@socketio.on("connect")
def on_connect():
    recent = get_recent_messages()
    for msg in recent:
        socketio.emit("message", msg)

@app.route("/project/ai_innovations_portal/chat")
def chatBoard():
    log_text("Navigate to Chat")
    return render_template("ai-generated-chatboard.html", now=datetime.now())

# OpenAI Assistant Integration
import openai
import time

# OpenAI Assistant Helper Functions
def get_or_create_thread(client, session):
    """
    Get existing thread or create new one
    Returns: thread_id (str)
    """
    thread_id = session.get('openai_thread_id')

    if thread_id:
        # Verify thread exists
        try:
            client.beta.threads.retrieve(thread_id)
            return thread_id
        except openai.NotFoundError:
            log_text(f"Thread {thread_id} not found, creating new one")
        except Exception:
            # Thread doesn't exist, create new one
            pass

    # Create new thread
    thread = client.beta.threads.create()
    session['openai_thread_id'] = thread.id
    log_text(f"Created new OpenAI thread: {thread.id}")
    return thread.id

def send_message_to_thread(client, thread_id, message_content):
    """
    Send a message to the thread
    Returns: message object
    """
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message_content
    )
    log_text(f"Added message to thread {thread_id}: {message_content[:50]}...")
    return message

def run_assistant_and_wait(client, thread_id, assistant_id, timeout=30):
    """
    Create a run and poll until completion
    Returns: run object
    Raises: TimeoutError if run doesn't complete in time
    """
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    log_text(f"Created run {run.id} for thread {thread_id}")

    start_time = time.time()

    while run.status != "completed":
        if time.time() - start_time > timeout:
            raise TimeoutError("Assistant run timed out")

        time.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        log_text(f"Run {run.id} status: {run.status}")

        if run.status in ["failed", "cancelled", "expired"]:
            raise Exception(f"Run failed with status: {run.status}")

    return run

def extract_assistant_response(client, thread_id):
    """
    Extract the latest assistant message from thread
    Returns: response text or None
    """
    messages = client.beta.threads.messages.list(thread_id=thread_id, order="desc")

    for msg in messages.data:
        if msg.role == "assistant":
            for content_block in msg.content:
                if content_block.type == 'text':
                    response_text = content_block.text.value
                    log_text(f"Assistant response: {response_text[:50]}...")
                    return response_text

    return None

@app.route('/ask_openai_assistant', methods=['POST'])
def ask_openai_assistant():
    """OpenAI Assistant endpoint - uses helper functions for clean separation"""
    try:
        # 1. Validate request
        data = request.get_json()
        question = data.get('question', '').strip()

        if not question:
            return jsonify({'answer': 'Please provide a question.'}), 400

        # 2. Initialize OpenAI client
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

        # 3. Get or create thread
        thread_id = get_or_create_thread(client, session)

        # 4. Send message
        send_message_to_thread(client, thread_id, question)

        # 5. Run assistant and wait
        run_assistant_and_wait(client, thread_id, Config.OPENAI_ASSISTANT_ID)

        # 6. Extract response
        response_text = extract_assistant_response(client, thread_id)

        if not response_text:
            return jsonify({'answer': 'No response from assistant.'}), 500

        return jsonify({'answer': response_text}), 200

    except TimeoutError:
        return jsonify({'answer': 'Request timed out. Please try again.'}), 504
    except openai.APIStatusError as e:
        log_text(f"OpenAI API error: {e.status_code} - {e.response}")
        return jsonify({'answer': f'An OpenAI API error occurred: {e.status_code}'}), 500
    except Exception as e:
        log_text(f"An unexpected error occurred: {e}")
        return jsonify({'answer': 'An unexpected error occurred. Please try again.'}), 500 

 
# Projects now loaded from data/projects.json via utils.project_loader

# Main route rendering all projects on home page
@app.route('/')
def home():
    log_text("Navigate to Home")
    log_text(f"User IP: {request.remote_addr}")
    log_text(f"User Agent: {request.user_agent}")
    return render_template('home.html', projects=get_main_projects(), now=datetime.now())

# About page route
@app.route('/about')
def about():
    log_text("Navigate to About")
    return render_template('about.html', now=datetime.now())

@app.route('/beyondTheCode')
def beyondTheCode():
    log_text("Navigate to Beyond The Code")
    return render_template('beyondTheCode.html', now=datetime.now())

@app.route('/project/ai_innovations_portal')
def ai_innovations_portal():
    log_text("Navigate to AI Innovations Portal")
    return render_template('ai_innovations_portal.html', ai_projects=get_ai_projects(), now=datetime.now())

@app.route('/api/get_beyond_the_code_photos')
def get_beyond_the_code_photos():
    log_text("Fetching beyondTheCode photos...")
    photo_dir = Config.BEYOND_CODE_PHOTOS_DIR
    photos = []
    if os.path.exists(photo_dir):
        for filename in os.listdir(photo_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                photos.append(url_for('static', filename=f'images/beyondTheCodePhotos/{filename}'))
    return jsonify(photos=photos)



# Wordle project page route
@app.route('/project/wordle', methods=['POST', 'GET'])
def wordle():
    log_text("Navigate to Project.Wordle")
    todaysWord = None
    guesses = []

    if request.method == 'POST':
        # Handling today's word input
        todaysWord = request.form.get('todaysWord').lower()
        log_text(f"Projects.Wordle - Retrieved Word {todaysWord}")

        # Loading Wordle data from JSON file
        log_text("Projects.Wordle - load wordleGuesses.json")
        with open(Config.WORDLE_GUESSES_FILE) as f:
            wordSolutions = json.load(f)

        if todaysWord in wordSolutions:
            guesses = wordSolutions[todaysWord].split(",")
            log_text(f"Projects.Wordle - Guesses: {guesses}")
            plot_key_values(todaysWord)

    return render_template('wordle.html', todaysWord=todaysWord, guesses=guesses, now=datetime.now())

# Other project routes
@app.route('/project/budget')
def budget():
    log_text("navigate to Projects/budget")
    return render_template("budget.html", now=datetime.now())

@app.route('/project/basketball')
def basketball():
    log_text("Navigate to Projects/Basketball")
    return render_template("basketball.html", now=datetime.now())

@app.route('/project/matching', methods=['GET', 'POST'])
def matching():
    log_text("Navigate to Matching")
    error = None
    names = session.get('names', [])
    results = session.get('results', {})
    # Ensure results is always a JSON-serializable dictionary
    if not isinstance(results, dict):
        results = {}

    if request.method == 'POST':
        try:
            names_input = request.form.get('names', '')
            if names_input:
                names = [name.strip() for name in names_input.split(',')]
                log_text(f"Projects.Matching - got names input {names}")
                if len(names) < 2:
                    error = "Please enter at least 2 names"
                elif len(set(names)) != len(names):
                    error = "Please ensure all names are unique"
                else:
                    log_text("Calling secret_santa function...")
                    results = secret_santa(names)
                    log_text(f"secret_santa returned: {results}")
                    # Store in session
                    session['names'] = names
                    session['results'] = results
            log_text("Attempting to jsonify response...")
            response = jsonify(results=results, names=names, error=error)
            log_text("jsonify call completed. Returning response.")
            return response
        except Exception as e:
            import traceback
            error_message = str(e)
            if app.debug:
                error_message += "\n" + traceback.format_exc()
            app.logger.error(f"Error processing matching request: {e}")
            return jsonify(error=error_message), 500

    # For GET requests or if POST request was not AJAX and fell through
    return render_template(
        "matching.html",
        names=names,
        results=results,
        error=error,
        now=datetime.now()
    )



@app.route('/project/matching/clear', methods=['POST'])
def clear_results():
    log_text("Clearing matching session data...")
    # Clear the session
    session.clear()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(success=True)
    return redirect(url_for('matching'))



@app.route('/project/superbowl')
def superbowl():
    log_text("Navigate to Projects/Superbowl")
    return render_template("superbowl.html", now=datetime.now())

@app.route('/project/nebula')
def nebula():
    log_text("Navigate to Projects/Nebula")
    return render_template("nebula.html", now=datetime.now())

@app.route('/project/ai_innovations_portal/htmlGems')
def htmlGems():
    log_text("Navigate to Projects/AI Innovations Portal/HTML Gems")
    return render_template("ai-generated-htmlGems.html", now=datetime.now())

@app.route('/project/redditStories')
def redditStories():
    log_text("Navigate to Projects/Reddit Stories")
    return redirect("https://jackvanzeeland.github.io/redditStoriesApp/index.html")

@app.route('/project/lyricAnimator')
def lyricAnimator():
    log_text("Navigate to lyric animator")
    return render_template('lyricAnimator.html', now=datetime.now())

@app.route('/analyticsViewer')
def analyticsViewer():
    log_text("Navigate to analytics viewer")
    return render_template('analyticsViewer.html', now=datetime.now())

# Start Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')