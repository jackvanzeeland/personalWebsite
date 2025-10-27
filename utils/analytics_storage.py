"""
Analytics Storage Module
Handles storage and retrieval of analytics events
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict, Counter

# Directory for analytics data
ANALYTICS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'analytics')

# Ensure analytics directory exists
os.makedirs(ANALYTICS_DIR, exist_ok=True)


def get_daily_file_path(date=None):
    """Get file path for daily analytics data"""
    if date is None:
        date = datetime.now()
    filename = f"analytics_{date.strftime('%Y-%m-%d')}.json"
    return os.path.join(ANALYTICS_DIR, filename)


def load_daily_data(date=None):
    """Load analytics data for a specific day"""
    filepath = get_daily_file_path(date)

    if not os.path.exists(filepath):
        return []

    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_daily_data(events, date=None):
    """Save analytics data for a specific day"""
    filepath = get_daily_file_path(date)

    try:
        with open(filepath, 'w') as f:
            json.dump(events, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving analytics data: {e}")
        return False


def store_events(events):
    """
    Store new analytics events
    Appends to today's file
    """
    today_data = load_daily_data()
    today_data.extend(events)
    return save_daily_data(today_data)


def get_events_in_range(start_date, end_date):
    """Get all events within a date range"""
    all_events = []
    current_date = start_date

    while current_date <= end_date:
        daily_events = load_daily_data(current_date)
        all_events.extend(daily_events)
        current_date += timedelta(days=1)

    return all_events


def get_analytics_summary(days=7):
    """
    Get aggregated analytics summary for the last N days
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days - 1)

    events = get_events_in_range(start_date, end_date)

    # Initialize summary
    summary = {
        'total_events': len(events),
        'unique_sessions': len(set(e.get('session_id') for e in events if e.get('session_id'))),
        'page_views': 0,
        'popular_pages': Counter(),
        'popular_projects': Counter(),
        'filter_usage': Counter(),
        'theme_switches': {'light': 0, 'dark': 0},
        'achievements_unlocked': Counter(),
        'avg_time_spent': 0,
        'avg_scroll_depth': 0,
        'daily_breakdown': defaultdict(lambda: {
            'page_views': 0,
            'unique_sessions': set()
        })
    }

    time_spent_values = []
    scroll_depth_values = []

    for event in events:
        event_type = event.get('event_type')
        event_data = event.get('event_data', {})
        page = event.get('page', '')

        # Parse timestamp for daily breakdown
        try:
            timestamp = datetime.fromisoformat(event.get('timestamp', '').replace('Z', '+00:00'))
            date_key = timestamp.strftime('%Y-%m-%d')
        except:
            date_key = 'unknown'

        # Count page views
        if event_type == 'page_view':
            summary['page_views'] += 1
            summary['popular_pages'][page] += 1
            summary['daily_breakdown'][date_key]['page_views'] += 1
            summary['daily_breakdown'][date_key]['unique_sessions'].add(event.get('session_id'))

        # Track project interactions
        elif event_type == 'project_interaction':
            project = event_data.get('project', '')
            if project:
                summary['popular_projects'][project] += 1

        # Track filter usage
        elif event_type == 'filter_used':
            tag = event_data.get('tag', '')
            if tag:
                summary['filter_usage'][tag] += 1

        # Track theme switches
        elif event_type == 'theme_switched':
            theme = event_data.get('theme', '')
            if theme in summary['theme_switches']:
                summary['theme_switches'][theme] += 1

        # Track achievement unlocks
        elif event_type == 'achievement_unlocked':
            achievement = event_data.get('achievement', '')
            if achievement:
                summary['achievements_unlocked'][achievement] += 1

        # Collect time spent data
        elif event_type == 'page_exit':
            time_spent = event_data.get('time_spent', 0)
            if time_spent > 0:
                time_spent_values.append(time_spent)

        # Collect scroll depth data
        elif event_type == 'scroll_depth':
            depth = event_data.get('depth', 0)
            if depth > 0:
                scroll_depth_values.append(depth)

    # Calculate averages
    if time_spent_values:
        summary['avg_time_spent'] = sum(time_spent_values) / len(time_spent_values)

    if scroll_depth_values:
        summary['avg_scroll_depth'] = sum(scroll_depth_values) / len(scroll_depth_values)

    # Convert Counters to sorted lists for JSON serialization
    summary['popular_pages'] = summary['popular_pages'].most_common(10)
    summary['popular_projects'] = summary['popular_projects'].most_common(10)
    summary['filter_usage'] = summary['filter_usage'].most_common(10)
    summary['achievements_unlocked'] = summary['achievements_unlocked'].most_common(10)

    # Convert daily breakdown sets to counts
    daily_data = []
    for date_key in sorted(summary['daily_breakdown'].keys()):
        data = summary['daily_breakdown'][date_key]
        daily_data.append({
            'date': date_key,
            'page_views': data['page_views'],
            'unique_sessions': len(data['unique_sessions'])
        })
    summary['daily_breakdown'] = daily_data

    return summary


def get_available_date_range():
    """Get the range of dates for which we have analytics data"""
    files = [f for f in os.listdir(ANALYTICS_DIR) if f.startswith('analytics_') and f.endswith('.json')]

    if not files:
        return None, None

    dates = []
    for filename in files:
        try:
            date_str = filename.replace('analytics_', '').replace('.json', '')
            dates.append(datetime.strptime(date_str, '%Y-%m-%d'))
        except ValueError:
            continue

    if not dates:
        return None, None

    return min(dates), max(dates)
