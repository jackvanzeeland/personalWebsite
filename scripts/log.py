import os
from datetime import datetime

# FUNCTION - PRINTS OUT LOGS & STORES IN LOGS FOLDER
def log_text(input_text):
    """
    Logs the input text to a file named with the current date inside a 'logs' folder.
    If the folder or file doesn't exist, it creates them.
    
    Args:
        input_text (str): The text to log.
    """
    #
    current_date = datetime.now().strftime("%Y-%m-%d")
    # Get the current time in HH:mm:ss:ms format
    current_time = datetime.now().strftime("%H:%M:%S:%f")[:-3]

    # Define the logs directory and today's log file path
    logs_dir = os.path.join(os.getcwd(), "logs")
    log_file_path = os.path.join(logs_dir, f"{current_date}.log")

    # Ensure the logs directory exists
    os.makedirs(logs_dir, exist_ok=True)

    # Append the formatted input text to the log file
    with open(log_file_path, "a") as log_file:
        log_file.write(f"{current_time} - {input_text}\n")

    # Print the input text
    print(input_text)