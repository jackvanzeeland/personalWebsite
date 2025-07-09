from flask import Flask, render_template, request, redirect, url_for,session, jsonify
from datetime import datetime
from scripts.wordle import plot_key_values
import json
from scripts.log import log_text
from scripts.matching import secret_santa


# Initialize the Flask app
app = Flask(__name__)
app.secret_key = '5c4e3a2b1d0f9e8d7c6b5a4d3e2f1a0c' 

# Sample project data
projects = [
    {
        'title': 'Wordle Algorithm Solver',
        'description': 'Built an algorithm that recommends the optimal next guess in Wordle based on previous outcomes, competing against my manual attempts. The algorithm outperformed or tied with me in 87% of games (46/53), showcasing its strategic efficiency.',
        'technologies': ['Python', 'Regex'],
        'github_link': None,
        'image': 'wordleMain.png',
        'page': 'wordle',
        'is_interactive': True
    },
    {
        'title': 'Budgeting Automation',
        'description': 'Developed an automation bot that scans an email account for bank statements, downloads the statement, and parses the data into an Excel sheet stored in Office 365. This tool streamlines budgeting across multiple bank accounts by tracking dates, purchase descriptions, and amounts in one central location.',
        'technologies': ['UiPath', 'Automation', 'Data Manipulation'],
        'github_link': None,
        'image': 'budgetingMain.jpeg',
        'page': 'budget',
        'is_interactive': False
    },
    {
        'title': 'Basketball Linup Optimization',
        'description': 'Developed a process for a friend that is a basketball coach that analyzes basketball game data by tracking points scored and allowed for each lineup throughout the game. The tool then groups combinations of size 2, 3, 4, and 5 to identify the most effective lineups, helping optimize team performance.',
        'technologies': ['R Programming', 'Problem Solving', 'Data Manipulation'],
        'github_link': None,
        'image': 'basketballMain.jpeg',
        'page': 'basketball',
        'is_interactive': False
    },
    {
        'title': 'Secret Santa Matching',
        'description': 'Developed a Secret Santa partner-matching program in Python that ensures no one selects themselves and provides a private interface for users to view their match. This streamlined the process for holiday gift exchanges while maintaining confidentiality.',
        'technologies': ['Python', 'Problem Solving'],
        'github_link': None, 
        'image': 'partnerMatchingMain.jpeg',
        'page': 'matching',
        'is_interactive': True
    },
    {
        'title': 'Super Bowl Competition',
        'description': 'Created a system for a Super Bowl prop bet competition, where participants ranked their confidence in 20 prop outcomes. The tool validated confidence values compared predictions to real results and calculated each participant\'s score to determine the winner.',
        'technologies': ['Python', 'Creative'],
        'github_link': None,
        'image': 'superBowlMain.jpeg',
        'page': 'superbowl',
        'is_interactive': False
    },
    {
        'title': 'Reddit Stories',
        'description': 'Developed an automated social media bot in Python that retrieved top daily Reddit stories, converted them to speech, and paired the audio with engaging Minecraft speed-run footage. The system generated subtitles from the audio, compiled both full-length and short-form videos, and uploaded them automatically. The project gained over 20 subscribers and 50,000 views before decommissioning.',
        'technologies': ['Python', 'YouTube', 'TikTok'],
        'youtube_link': 'https://www.youtube.com/@redditStories_JVZ',
        'tiktok_link': 'https://www.tiktok.com/@redditstories_jvz',
        'image': 'redditStories.jpeg',
        'page': 'redditStories',
        'is_interactive': False
    },
    {
        'title': 'Nebula - Personal Assistant',
        'description': 'IN PROGRESS',
        'technologies': ['Python', 'Generative AI'],
        'github_link': None,
        'image': 'nebulaMain.jpg',
        'page': None,
        'is_interactive': False
    },
    {
        'title': 'Run Genius',
        'description': 'IN PROGRESS',
        'technologies': ['Gemini CLI', 'SwiftUI', 'XCode'],
        'github_link': None,
        'image': 'runGenius.png',
        'page': None,
        'is_interactive': False
    }
]

# Main route rendering all projects on home page
@app.route('/')
def home():
    log_text("Navigate to Home")
    return render_template('home.html', projects=projects, now=datetime.now())

# About page route
@app.route('/about')
def about():
    log_text("Navigate to About")
    return render_template('about.html', now=datetime.now())



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
        with open("static/files/wordleGuesses.json") as f:
            wordSolutions = json.load(f)

        if todaysWord in wordSolutions:
            guesses = wordSolutions[todaysWord].split(",")
            log_text(f"Projects.Wordle - Guesses: {guesses}")
            plot_key_values(todaysWord)

    return render_template('wordle.html', todaysWord=todaysWord, guesses=guesses, now=datetime.now())

# Other project routes
@app.route('/project/budget')
def budget():
    return render_template("budget.html", now=datetime.now())

@app.route('/project/basketball')
def basketball():
    return render_template("basketball.html", now=datetime.now)

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
        now=datetime.now
    )



@app.route('/project/matching/clear', methods=['POST'])
def clear_results():
    log_text("Navigate to Matching-Clear")
    # Clear the session
    session.clear()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(success=True)
    return redirect(url_for('matching'))



@app.route('/project/superbowl')
def superbowl():
    return render_template("superbowl.html", now=datetime.now)

@app.route('/project/nebula')
def nebula():
    return render_template("nebula.html", now=datetime.now())

@app.route('/project/redditStories')
def redditStories():
    return redirect("https://jackvanzeeland.github.io/redditStoriesApp/index.html")

# Start Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')