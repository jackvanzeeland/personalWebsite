# Personal Portfolio Website

This is a personal portfolio website built with Flask to showcase various projects.

## Projects

The portfolio features the following projects:

*   **Wordle Algorithm Solver**: An algorithm that suggests the optimal Wordle guess.
*   **Budgeting Automation**: A bot that automates budget tracking from bank statements.
*   **Basketball Lineup Optimization**: A tool to analyze and optimize basketball lineups.
*   **Secret Santa Matching**: A program to facilitate Secret Santa gift exchanges.
*   **Super Bowl Competition**: A system to manage a Super Bowl prop bet competition.
*   **Reddit Stories**: An automated bot that creates social media content from Reddit stories.
*   **Nebula - Personal Assistant**: A personal assistant application (in progress).
*   **Run Genius**: A mobile application for runners (in progress).

## Project Structure

The project is organized as follows:

```
/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── setup.sh               # Setup script
├── Procfile               # For Heroku deployment
├── .gitignore
├── README.md
├── scripts/               # Python scripts for backend logic
│   ├── matching.py
│   ├── wordle.py
│   └── log.py
├── static/                # Static assets
│   ├── css/
│   │   └── style.css
│   ├── images/            # Project images and logos
│   └── js/                # JavaScript files
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── home.html          # Home page
│   ├── about.html         # About page
│   ├── beyondTheCode.html      # Meet Jack page
│   ├── basketball.html    # Project pages
│   ├── budget.html
│   ├── matching.html
│   ├── nebula.html
│   ├── superbowl.html
│   └── wordle.html
└── venv/                  # Virtual environment
```

## Running the Project

1.  **Set up the environment:**

    ```bash
    ./setup.sh
    ```

2.  **Run the Flask application:**

    ```bash
    flask run
    ```
