# Mood Detection API

A simple Flask API that simulates mood detection. This is a placeholder implementation that will later be replaced with actual webcam-based emotion detection.

## Setup Instructions

1. Create a virtual environment (recommended):
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

1. Make sure you're in the project directory
2. Run the Flask application:
```bash
python app.py
```

3. The server will start on `http://localhost:5001`

## API Endpoint

- **GET /detect-mood**
  - Returns a random mood from: ["happy", "sad", "angry", "surprised", "neutral"]
  - Response format: `{"mood": "happy"}`

## Testing

You can test the API using:
- Web browser: Visit `http://localhost:5001/detect-mood`
- curl: `curl http://localhost:5001/detect-mood`
- Postman: Send GET request to `http://localhost:5001/detect-mood`

## Future Implementation

This is a placeholder implementation. The next steps will include:
1. Webcam integration
2. Face detection
3. Emotion analysis
4. Real-time mood detection 