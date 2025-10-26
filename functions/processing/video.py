import os
import json
import openai
import cv2
import tempfile
import base64
import re

openai.api_key = os.getenv("OPENAI_API_KEY")

def clean_json_text(text):
    """Remove unwanted characters"""
    return re.sub(r"```(?:json)?\s*|\s*```", "", text.strip())

def extract_key_frames(video_path, frame_interval=2, max_frames=5):
    """Extract frames"""
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

def analyze_video_and_generate_report(file_path: str, request_id: str) -> dict:
    """
    Analyze both audio(what is being described?) and visuals (symptoms/rashes).
    Return JSON with transcription, visual signs, and triage advice.
    """
    print(f"[{request_id}] Transcribing video: {file_path}")
    
    # Transcribe audio
    with open(file_path, "rb") as video_file:
        transcript = openai.audio.transcriptions.create(
            model="whisper-1",  
            file=video_file
        )
    transcription_text = transcript.text
    print(f"[{request_id}] Transcription: {transcription_text[:200]}...")
    
    # visual frame analysis
    print(f"[{request_id}] Extracting frames for inspection...")
    frames = extract_key_frames(file_path, frame_interval=2, max_frames=5)
    
    if not frames:
        print("No frames extracted!")
        return {
            "request_id": request_id,
            "error": "No frames could be extracted from video",
            "transcription_data": {"transcription": transcription_text}
        }
    
    # resize img
    frame_contents = []
    for idx, path in enumerate(frames):
        # Optionally resize image to reduce size
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
    
    # --- Step 3: Combined analysis (symptoms + visuals) ---
    print(f"[{request_id}] Analyzing frames with vision model...")
    
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
    
    # Add all frame images
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
    
    try:
        extract_response = openai.chat.completions.create(
            model="gpt-4o",  
            messages=messages,
            max_tokens=1500
        )
        raw_text = extract_response.choices[0].message.content
        print(f"[{request_id}] Raw vision response: {raw_text[:300]}...")
        
        try:
            extracted_data = json.loads(clean_json_text(raw_text))
        except json.JSONDecodeError:
            # error handling
            extracted_data = {
                "error": "Failed to parse JSON from vision model",
                "raw": raw_text,
                "transcription": transcription_text
            }
    except Exception as e:
        print(f"[{request_id}] Error during vision analysis: {str(e)}")
        extracted_data = {
            "error": f"Vision analysis failed: {str(e)}",
            "transcription": transcription_text
        }
    
    # advice with citations 
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
    
    try:
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
    except Exception as e:
        print(f"[{request_id}] Error generating report: {str(e)}")
        report_json = {"error": f"Report generation failed: {str(e)}"}
    
    # temp frame file clean up 
    for frame_path in frames:
        try:
            os.unlink(frame_path)
        except:
            pass
    
    result = {
        "request_id": request_id,
        "transcription_data": extracted_data,
        "advice_report": report_json
    }
    
    print(f"[{request_id}] Analysis complete.")
    return result

if __name__ == "__main__":
    # edit file path(*should be mp4)
    test_file = "C:\\Users\\srdbh\\Downloads\\videoplayback.mp4"
    test_id = "req_openai"
    
    result = analyze_video_and_generate_report(test_file, test_id)
    print("\n" + "="*80)
    print("FINAL RESULT:")
    print("="*80)
    print(json.dumps(result, indent=2))