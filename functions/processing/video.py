from firebase_functions import firestore_fn
from firebase_admin import firestore, storage
from google.cloud import firestore as gcs_firestore
import openai
import cv2
import tempfile
import base64
import re
import os
import requests

openai.api_key = os.getenv("OPENAI_API_KEY")

def clean_json_text(text):
    """Remove unwanted characters"""
    return re.sub(r"```(?:json)?\s*|\s*```", "", text.strip())

def download_video_from_url(video_url):
    """Download video from Firebase Storage URL to temporary file."""
    try:
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        
        # Create temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        
        # video content
        for chunk in response.iter_content(chunk_size=8192):
            temp_file.write(chunk)
        
        temp_file.close()
        return temp_file.name
    except Exception as e:
        print(f"Error downloading video: {e}")
        return None

def extract_key_frames(video_path, frame_interval=2, max_frames=5):
    """Extract frames every N seconds."""
    frames = []
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    if fps == 0:
        print("Warning: Could not determine FPS")
        fps = 30  # default
    
    success, image = cap.read()
    count = 0
    
    while success and len(frames) < max_frames:
        if int(count / fps) % frame_interval == 0:
            temp_path = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False).name
            cv2.imwrite(temp_path, image)
            frames.append(temp_path)
            print(f"Extracted frame {len(frames)} at {count/fps:.1f}s")
        success, image = cap.read()
        count += 1
    
    cap.release()
    print(f"Total frames extracted: {len(frames)}")
    return frames

def analyze_video_and_generate_report(video_url: str, request_id: str) -> dict:
    """
     Analyze both audio(what is being described?) and visuals (symptoms/rashes).
     Return JSON with transcription, visual signs, and triage advice.
    """
    print(f"[{request_id}] Starting analysis for video: {video_url}")
    
    # Download video
    video_path = download_video_from_url(video_url)
    if not video_path:
        return {
            "request_id": request_id,
            "error": "Failed to download video",
            "status": "ERROR"
        }
    
    try:
        # transcribe audio 
        print(f"[{request_id}] Transcribing video...")
        with open(video_path, "rb") as video_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=video_file
            )
        transcription_text = transcript.text
        print(f"[{request_id}] Transcription: {transcription_text[:200]}...")
        
        # visual frame analysis
        print(f"[{request_id}] Extracting frames...")
        frames = extract_key_frames(video_path, frame_interval=2, max_frames=5)
        
        if not frames:
            print("WARNING: No frames extracted!")
            return {
                "request_id": request_id,
                "transcription_data": {"transcription": transcription_text},
                "error": "No frames could be extracted from video"
            }
        
        # frames
        frame_contents = []
        for idx, path in enumerate(frames):
            img = cv2.imread(path)
            img_resized = cv2.resize(img, (512, 384))
            _, buffer = cv2.imencode('.jpg', img_resized, [cv2.IMWRITE_JPEG_QUALITY, 85])
            b64 = base64.b64encode(buffer).decode("utf-8")
            
            frame_contents.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                    "detail": "high"
                }
            })
            print(f"Prepared frame {idx+1} for analysis")
        
        # (symptoms + visuals) 
        print(f"[{request_id}] Analyzing...")
        
        content_parts = [
            {
                "type": "text", 
                "text": f"""Patient video transcription:
{transcription_text}

Please analyze the video frames and transcription to identify:
1. Reported symptoms (based on audio transcription)
2. Visible signs in the frames (rashes, redness, swelling, lesions, skin discoloration, etc.)
3. Estimated severity (Mild/Moderate/Severe)

Return analysis as JSON with these exact information:
- transcription: the original transcription text
- identified_symptoms: list of symptoms mentioned in audio
- visual_signs: list of visible signs observed in frames (or "none detected" if nothing visible)
- initial_severity: severity estimate (Mild/Moderate/Severe)

Important: Even if frames don't show obvious medical signs, still analyze them to provide a reasonable explanation."""
            }
        ]
        
        content_parts.extend(frame_contents)
        
        messages = [
            {
                "role": "system",
                "content": "As a medical triage assistant with vision capabilities, analyze both audio transcriptions and video frames to identify symptoms and visible signs."
            },
            {
                "role": "user",
                "content": content_parts
            }
        ]
        
        extract_response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1500
        )
        raw_text = extract_response.choices[0].message.content
        print(f"[{request_id}] Raw vision response: {raw_text[:300]}...")
        
        try:
            import json
            extracted_data = json.loads(clean_json_text(raw_text))
        except json.JSONDecodeError:
            extracted_data = {
                "error": "Failed to parse JSON from vision model",
                "raw": raw_text,
                "transcription": transcription_text
            }
        
        # --- Step 4: Generate triage advice with citations ---
        print(f"[{request_id}] Generating triage report...")
        
        report_prompt = f"""
Based on this medical analysis:
{json.dumps(extracted_data, indent=2)}

Write a concise triage advice report that:
1. Summarizes the key symptoms and visual findings
2. Provides appropriate medical guidance
3. Includes citations from credible sources (CDC, NIH, Mayo Clinic, MedlinePlus, Johns Hopkins, WHO, etc)

Return as JSON with:
- report_text: (string) the triage advice
- citations: (list) URLs to credible medical sources
"""
        
        report_response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": report_prompt}],
            max_tokens=1000
        )
        raw_report = report_response.choices[0].message.content
        
        try:
            report_json = json.loads(clean_json_text(raw_report))
        except json.JSONDecodeError:
            report_json = {
                "error": "Failed to parse report JSON",
                "raw": raw_report
            }
        
        # Clean up temporary files
        for frame_path in frames:
            try:
                os.unlink(frame_path)
            except:
                pass
        
        try:
            os.unlink(video_path)
        except:
            pass
        
        result = {
            "request_id": request_id,
            "transcription_data": extracted_data,
            "advice_report": report_json,
            "status": "COMPLETED"
        }
        
        print(f"[{request_id}] Analysis complete.")
        return result
        
    except Exception as e:
        print(f"[{request_id}] Error during analysis: {str(e)}")
        
        # Clean up files 
        try:
            if video_path:
                os.unlink(video_path)
        except:
            pass
        
        return {
            "request_id": request_id,
            "error": str(e),
            "status": "ERROR"
        }


@firestore_fn.on_document_created(document="triage_requests/{requestId}")
def on_triage_request_created(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]):
    """
    Triggered when a new triage request is created in Firestore.
    Analyzes the video and updates the document with results.
    """
    # Get the document data
    data = event.data.to_dict()
    request_id = event.params["requestId"]
    
    print(f"New request created: {request_id}")
    
    # Extract necessary fields
    video_url = data.get("video_url")
    patient_id = data.get("patient_id")
    
    if not video_url:
        print(f"No video URL found for request {request_id}")
        return
    
    # Update status to PROCESSING
    db = firestore.client()
    doc_ref = db.collection("triage_requests").document(request_id)
    doc_ref.update({
        "status": "PROCESSING",
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    # Analyze the video
    result = analyze_video_and_generate_report(video_url, request_id)
    
    # Determine priority based on severity
    severity = result.get("transcription_data", {}).get("initial_severity", "moderate").lower()
    priority_map = {
        "severe": "critical",
        "moderate": "moderate",
        "mild": "low"
    }
    priority = priority_map.get(severity, "moderate")
    
    # Update the document with results
    doc_ref.update({
        "status": result.get("status", "COMPLETED"),
        "analysis_result": result,
        "priority": priority,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    print(f"Updated triage request {request_id} with analysis results")