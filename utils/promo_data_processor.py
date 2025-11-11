"""
Promo Data Processor - TikTok Lead Qualification System
Analyzes TikTok account data using keyword matching to identify qualified leads
"""

import pandas as pd
from typing import List, Dict, Tuple


# Qualification keywords for TikTok accounts
QUALIFICATION_KEYWORDS = {
    'high_value': ['automation', 'python', 'developer', 'engineer', 'tech', 'startup', 'founder', 'ceo'],
    'medium_value': ['business', 'entrepreneur', 'marketing', 'designer', 'creator', 'content'],
    'low_value': ['influencer', 'lifestyle', 'fashion', 'travel', 'food']
}


def qualify_lead(account_name: str, bio: str, follower_count: int) -> Tuple[str, int]:
    """
    Qualify a lead based on TikTok account data

    Args:
        account_name: TikTok username
        bio: Account bio/description
        follower_count: Number of followers

    Returns:
        Tuple of (qualification_level, score)
        - qualification_level: 'high', 'medium', 'low', or 'unqualified'
        - score: Numeric score (0-100)
    """
    score = 0
    text_to_analyze = f"{account_name} {bio}".lower()

    # Check for high-value keywords
    high_value_matches = sum(1 for keyword in QUALIFICATION_KEYWORDS['high_value'] if keyword in text_to_analyze)
    medium_value_matches = sum(1 for keyword in QUALIFICATION_KEYWORDS['medium_value'] if keyword in text_to_analyze)
    low_value_matches = sum(1 for keyword in QUALIFICATION_KEYWORDS['low_value'] if keyword in text_to_analyze)

    # Calculate score
    score += high_value_matches * 30
    score += medium_value_matches * 15
    score += low_value_matches * 5

    # Follower count bonus
    if follower_count >= 10000:
        score += 20
    elif follower_count >= 5000:
        score += 10
    elif follower_count >= 1000:
        score += 5

    # Determine qualification level
    if score >= 60:
        return 'high', score
    elif score >= 30:
        return 'medium', score
    elif score >= 10:
        return 'low', score
    else:
        return 'unqualified', score


def process_tiktok_leads(csv_path: str) -> pd.DataFrame:
    """
    Process TikTok leads from CSV file

    Args:
        csv_path: Path to CSV file with columns: account_name, bio, follower_count

    Returns:
        DataFrame with added columns: qualification_level, score, qualified (bool)
    """
    # Load CSV
    df = pd.read_csv(csv_path)

    # Ensure required columns exist
    required_columns = ['account_name', 'bio', 'follower_count']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Apply qualification
    df[['qualification_level', 'score']] = df.apply(
        lambda row: pd.Series(qualify_lead(
            row['account_name'],
            str(row['bio']),
            row['follower_count']
        )),
        axis=1
    )

    # Add qualified flag
    df['qualified'] = df['qualification_level'].isin(['high', 'medium'])

    return df


def get_qualified_leads(csv_path: str, min_level: str = 'medium') -> pd.DataFrame:
    """
    Get only qualified leads from CSV

    Args:
        csv_path: Path to CSV file
        min_level: Minimum qualification level ('high' or 'medium')

    Returns:
        DataFrame with only qualified leads, sorted by score descending
    """
    df = process_tiktok_leads(csv_path)

    # Filter by qualification level
    if min_level == 'high':
        qualified = df[df['qualification_level'] == 'high']
    else:
        qualified = df[df['qualification_level'].isin(['high', 'medium'])]

    # Sort by score
    qualified = qualified.sort_values('score', ascending=False)

    return qualified


def get_lead_statistics(csv_path: str) -> Dict[str, any]:
    """
    Get statistics about leads in CSV

    Args:
        csv_path: Path to CSV file

    Returns:
        Dictionary with lead statistics
    """
    df = process_tiktok_leads(csv_path)

    return {
        'total_accounts': len(df),
        'qualified_leads': len(df[df['qualified']]),
        'high_value': len(df[df['qualification_level'] == 'high']),
        'medium_value': len(df[df['qualification_level'] == 'medium']),
        'low_value': len(df[df['qualification_level'] == 'low']),
        'unqualified': len(df[df['qualification_level'] == 'unqualified']),
        'average_score': df['score'].mean(),
        'max_score': df['score'].max()
    }
