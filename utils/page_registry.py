"""
Page Registry - Single Source of Truth for Trackable Pages
Manages the list of all pages that should be tracked in user journey
"""

from utils.project_loader import get_main_projects


# Project icon mapping with emojis
PROJECT_ICONS = {
    'wordle': '🔤',
    'matching': '🎅',  # Secret Santa
    'basketball': '🏀',
    'lyricAnimator': '🎵',
    'redditStories': '📖',
    'nebula': '🌌',
    'budget': '💰',
    'superbowl': '🏈',
    'htmlGems': '💎',
    'promoManagerAnalytics': '📊',
}


def get_project_icon(project):
    """Get icon for a project, fallback to default"""
    page_name = project.get('page', '')
    return PROJECT_ICONS.get(page_name, '📄')


def get_all_trackable_pages():
    """
    Returns list of ALL pages that should be tracked in user journey.

    Returns:
        list: [{'path': '/project/wordle', 'name': 'Wordle Solver', 'icon': 'W'}, ...]

    Note:
        - Automatically syncs with projects.json
        - Excludes projects with page: null
        - Excludes /journey itself (meta page)
    """
    pages = []

    # Main pages (hardcoded - these are always present)
    pages.extend([
        {'path': '/', 'name': 'Home', 'icon': '🏠'},
        {'path': '/about', 'name': 'About', 'icon': '👤'},
        {'path': '/beyondTheCode', 'name': 'Beyond the Code', 'icon': '🌟'},
    ])

    # Project pages from projects.json (dynamic)
    projects = get_main_projects()
    for project in projects:
        page_name = project.get('page')
        if page_name:  # Only include if page exists (not null)
            pages.append({
                'path': f"/project/{page_name}",
                'name': project['title'],
                'icon': get_project_icon(project)
            })

    # Case study pages (hardcoded - these are always present)
    pages.extend([
        {'path': '/case-study/wordle', 'name': 'Wordle Case Study', 'icon': '📝'},
        {'path': '/case-study/secret-santa', 'name': 'Secret Santa Case Study', 'icon': '📝'},
        {'path': '/case-study/basketball', 'name': 'Basketball Case Study', 'icon': '📝'},
    ])

    return pages


def get_total_pages():
    """
    Returns total count of trackable pages.

    Returns:
        int: Number of pages (e.g., 13)
    """
    return len(get_all_trackable_pages())


def is_trackable_page(path):
    """
    Check if a given path should be tracked.

    Args:
        path (str): URL path (e.g., '/project/wordle')

    Returns:
        bool: True if page should be tracked
    """
    trackable_paths = [page['path'] for page in get_all_trackable_pages()]
    return path in trackable_paths
