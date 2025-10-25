"""
Project Data Loader
Loads project data from external JSON file
"""

import json
import os
from pathlib import Path


def get_projects_file_path():
    """
    Get the path to the projects.json file
    Returns: Path object
    """
    # Get the project root directory (parent of utils/)
    root_dir = Path(__file__).parent.parent
    return root_dir / 'data' / 'projects.json'


def load_projects_data():
    """
    Load all project data from JSON file
    Returns: dict with 'main_projects' and 'ai_projects' keys
    Raises: FileNotFoundError if projects.json doesn't exist
    Raises: JSONDecodeError if JSON is invalid
    """
    projects_file = get_projects_file_path()

    if not projects_file.exists():
        raise FileNotFoundError(f"Projects file not found: {projects_file}")

    with open(projects_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    return data


def get_main_projects():
    """
    Get list of main projects
    Returns: list of project dicts
    """
    data = load_projects_data()
    return data.get('main_projects', [])


def get_ai_projects():
    """
    Get list of AI projects
    Returns: list of project dicts
    """
    data = load_projects_data()
    return data.get('ai_projects', [])


def get_project_by_page(page_name):
    """
    Get a specific project by its page name
    Args:
        page_name: str - The 'page' field value
    Returns: project dict or None
    """
    all_projects = get_main_projects() + get_ai_projects()

    for project in all_projects:
        if project.get('page') == page_name:
            return project

    return None
