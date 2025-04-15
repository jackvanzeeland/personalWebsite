# IMPORTS
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scripts.log import log_text



def plot_key_values(key):
    # Load the JSON data from the file
    log_text("Projects.Wordle - load remaining.json")
    with open("static/files/wordleRemaining.json", "r") as file:
        data = json.load(file)

    log_text(f"Projects.Wordle - Creating plot for {key}")
    if key in data:
        values = list(data[key].values())  # Extract values
        x = list(range(1, len(values) + 1))  # Ensure x-axis starts from 1

        # Create the figure with a modern, clean style
        plt.figure(figsize=(9, 5), facecolor="#f9f9f9")  
        plt.plot(x, values, marker='o', linestyle='-', color='red', linewidth=2.5, alpha=0.85)  # Red line with transparency

        # Annotate each point with a boxed label
        for i, value in enumerate(values):
            plt.text(x[i], values[i] + (0.03 * max(values)), str(value),
                     fontsize=11, color='blue', ha='center', va='bottom',
                     bbox=dict(facecolor="white", edgecolor="blue", boxstyle="round,pad=0.3", alpha=0.75))

        # Title and labels with enhanced styling
        plt.xlabel("Guess #", fontsize=12, fontweight="bold", color="#333")
        plt.ylabel("Options Remaining", fontsize=12, fontweight="bold", color="#333")
        plt.title(f"Remaining Options Breakdown: {key}", fontsize=14, fontweight="bold", color="#222", pad=15)

        # Grid with a modern, subtle dashed style
        plt.grid(True, linestyle="dashed", linewidth=0.7, alpha=0.5)

        # Customize the ticks
        plt.xticks(x, fontsize=10)
        plt.yticks(fontsize=10)

        # Save and close the figure
        plt.savefig("static/images/remaining.png", dpi=300, bbox_inches="tight")  # High-resolution save
        plt.close()  
        log_text(f"Projects.Wordle - Plot saved as static/images/remaining.png")
    else:
        log_text(f"Projects.Wordle - Key '{key}' not found in data.")
