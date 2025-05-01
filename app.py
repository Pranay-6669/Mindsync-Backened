from flask import Flask, jsonify, request, send_file, Response, render_template
import cv2
import numpy as np
import random
import requests
import os

app = Flask(__name__)

# Initialize webcam
cap = cv2.VideoCapture(0)

# Set webcam resolution
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# Load multiple face detection classifiers for better accuracy
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

# List of possible moods
MOODS = ["happy", "sad", "angry", "surprised", "neutral"]

# Node.js backend URL
NODE_BACKEND_URL = "http://localhost:5000/api/journals"

def generate_frames():
    """
    Generator function to stream video frames
    """
    while True:
        success, frame = cap.read()
        if not success:
            print("Error: Could not read frame from webcam")
            break
        else:
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Try multiple face detection parameters
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            # Draw rectangles around detected faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                # Add text showing face coordinates
                cv2.putText(frame, f"Face: {x},{y}", (x, y-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            
            # Add debug information to the frame
            cv2.putText(frame, f"Faces detected: {len(faces)}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Frame size: {frame.shape[1]}x{frame.shape[0]}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video-feed')
def video_feed():
    """
    Streams live video feed from webcam
    """
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

def detect_face():
    """
    Captures image from webcam and detects if a face is present using multiple classifiers
    Returns status and result
    """
    try:
        # Capture frame
        ret, frame = cap.read()
        if not ret:
            return "error", "Could not capture image from webcam"

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Try multiple classifiers
        faces_frontal = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(30, 30)
        )
        
        faces_profile = profile_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(30, 30)
        )
        
        # Combine results
        faces = list(faces_frontal) + list(faces_profile)
        
        if len(faces) > 0:
            # Draw rectangles around detected faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Save the frame with detected faces
            debug_path = 'debug_frame.jpg'
            cv2.imwrite(debug_path, frame)
            
            # For now, return a random mood when face is detected
            return "success", random.choice(MOODS)
        else:
            # Save the original frame for debugging
            debug_path = 'debug_frame.jpg'
            cv2.imwrite(debug_path, frame)
            
            return "error", {
                "message": "No face detected. Please ensure:",
                "tips": [
                    "You are in a well-lit area",
                    "Your face is clearly visible",
                    "You are looking directly at the camera",
                    "You are not too far from the camera"
                ],
                "debug": {
                    "frame_saved": debug_path,
                    "image_size": f"{frame.shape[1]}x{frame.shape[0]}",
                    "suggestion": "Try moving closer to the camera or adjusting the lighting"
                }
            }

    except Exception as e:
        return "error", f"Error detecting face: {str(e)}"

def send_mood_to_nodejs(mood, entry, token):
    """
    Sends mood data to Node.js backend
    """
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'mood': mood,
            'entry': entry
        }
        
        response = requests.post(NODE_BACKEND_URL, json=data, headers=headers)
        return response.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/detect-mood', methods=['GET'])
def detect_mood():
    """
    Detects mood from webcam feed using face detection
    """
    status, result = detect_face()
    
    if status == "error":
        return jsonify({
            "status": "error",
            "message": result
        }), 500
    
    return jsonify({
        "status": "success",
        "mood": result
    })

@app.route('/create-journal-entry', methods=['POST'])
def create_journal_entry():
    """
    Creates a journal entry with detected mood and sends to Node.js
    """
    try:
        data = request.json
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({
                "status": "error",
                "message": "Authorization token required"
            }), 401
            
        # Remove 'Bearer ' prefix if present
        token = token.replace('Bearer ', '')
        
        # Detect mood
        status, mood = detect_face()
        if status == "error":
            return jsonify({
                "status": "error",
                "message": mood
            }), 500
            
        # Send to Node.js
        result = send_mood_to_nodejs(mood, data.get('entry', ''), token)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/test')
def test_webcam():
    """
    Test endpoint to check webcam status
    """
    if not cap.isOpened():
        return jsonify({
            "status": "error",
            "message": "Webcam not accessible",
            "webcam": {
                "is_opened": False,
                "width": 0,
                "height": 0
            }
        })
    
    # Try to capture a test frame
    ret, frame = cap.read()
    if not ret:
        return jsonify({
            "status": "error",
            "message": "Could not capture frame from webcam",
            "webcam": {
                "is_opened": True,
                "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            }
        })
    
    # Convert to grayscale and try face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)
    
    return jsonify({
        "status": "success",
        "message": "Webcam is working",
        "webcam": {
            "is_opened": True,
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "faces_detected": len(faces),
            "frame_size": f"{frame.shape[1]}x{frame.shape[0]}"
        }
    })

@app.route('/debug-image', methods=['GET'])
def get_debug_image():
    """
    Returns the last captured debug image
    """
    try:
        return send_file('debug_frame.jpg', mimetype='image/jpeg')
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 404

@app.route('/')
def index():
    """
    Serve the webcam preview page
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Test webcam
    if not cap.isOpened():
        print("Error: Could not open webcam")
        exit()
    
    # Run the Flask app on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
    
    # Release the webcam when the app is closed
    cap.release()