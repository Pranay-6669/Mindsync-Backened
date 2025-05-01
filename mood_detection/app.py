from flask import Flask, jsonify
import random

app = Flask(__name__)

# List of possible moods
MOODS = ["happy", "sad", "angry", "surprised", "neutral"]

@app.route('/detect-mood', methods=['GET'])
def detect_mood():
    """
    Simulates mood detection by randomly selecting a mood from the predefined list.
    This is a placeholder that will later be replaced with actual webcam-based emotion detection.
    
    Returns:
        JSON response containing the detected mood
    """
    # Randomly select a mood
    detected_mood = random.choice(MOODS)
    
    # Return the mood as JSON response
    return jsonify({"mood": detected_mood})

if __name__ == '__main__':
    # Run the Flask app on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True) 