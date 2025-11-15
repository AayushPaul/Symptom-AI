import React, { useState, useRef } from 'react';
import {
  Activity, Video, Stethoscope, Shield, Globe, FileText, Calendar,
  MessageSquare, AlertCircle, Upload, RotateCcw, X,
  MapPin, Navigation, ExternalLink, CheckCircle, Clock, Languages,
  Volume2, Eye, Loader
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import './App.css';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "hack-ohio-symptom-ai.firebaseapp.com",
  projectId: "hack-ohio-symptom-ai",
  storageBucket: "hack-ohio-symptom-ai.firebasestorage.app",
  messagingSenderId: "1029512619949",
  appId: "1:1029512619949:web:bdf9d6664c7c4c7e42a324"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// API Base URL - change for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/your-project-id/us-central1';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Monitor auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">HealthTriage AI</h1>
                  <p className="text-sm text-gray-500">
                    {userType === 'patient' ? 'Patient Portal' : 'Healthcare Provider Portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        {userType === 'patient' ? (
          <PatientDashboard currentUser={currentUser} apiBaseUrl={API_BASE_URL} />
        ) : (
          <DoctorDashboard currentUser={currentUser} apiBaseUrl={API_BASE_URL} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthTriage AI</h1>
                <p className="text-sm text-gray-500">Intelligent Healthcare Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Health Assessment
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Upload your symptom video, receive instant AI analysis, and get personalized healthcare recommendations.
              </p>
            </div>
            {/* Feature cards remain the same */}
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to access your healthcare portal</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'patient'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Activity className={`w-8 h-8 ${userType === 'patient' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${userType === 'patient' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Patient
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('doctor')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'doctor'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Stethoscope className={`w-8 h-8 ${userType === 'doctor' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${userType === 'doctor' ? 'text-purple-600' : 'text-gray-700'}`}>
                      Healthcare Provider
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium text-white transition ${
                  userType === 'patient'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Patient Dashboard Component
function PatientDashboard({ currentUser, apiBaseUrl }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const fileInputRef = useRef(null);

  const [analysis, setAnalysis] = useState({
    transcription: "",
    symptoms: [],
    visual_signs: [],
    severity: "",
    recommendations: [],
    citations: []
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Upload to Firebase Storage
      await uploadVideoToFirebase(file);
    } else {
      alert('Please select a valid video file (MP4, MOV, AVI, WebM)');
    }
  };

  const uploadVideoToFirebase = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create storage reference
      const fileName = `videos/${currentUser.uid}_${Date.now()}_${file.name}`;
      const videoRef = storageRef(storage, fileName);

      // Upload file
      const uploadTask = uploadBytesResumable(videoRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          alert('Upload failed: ' + error.message);
          setIsUploading(false);
        },
        async () => {
          // Upload complete - get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Video uploaded:', downloadURL);
          
          // Create triage request
          await createTriageRequest(fileName, downloadURL);
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setIsUploading(false);
    }
  };

  const createTriageRequest = async (videoPath, videoUrl) => {
    try {
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${apiBaseUrl}/create_triage_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: currentUser.uid,
          video_storage_path: videoPath,
          video_url: videoUrl,
          symptoms: []
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRequestId(data.request_id);
        console.log('Triage request created:', data.request_id);
        
        // Start polling for results
        startPolling(data.request_id);
      } else {
        alert('Failed to create triage request');
      }
    } catch (error) {
      console.error('Error creating triage request:', error);
      alert('Failed to create triage request');
    }
  };

  const startPolling = (reqId) => {
    const interval = setInterval(async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `${apiBaseUrl}/get_triage_status?request_id=${reqId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        
        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setPollingInterval(null);
          
          // Process and display results
          const result = data.analysis_result;
          setAnalysis({
            transcription: result.transcription_data?.transcription || "",
            symptoms: result.transcription_data?.identified_symptoms || [],
            visual_signs: result.transcription_data?.visual_signs || [],
            severity: result.transcription_data?.initial_severity || "Unknown",
            recommendations: result.advice_report?.report_text?.split('\n') || [],
            citations: result.advice_report?.citations || []
          });
          
          setAnalysisComplete(true);
        } else if (data.status === 'ERROR') {
          clearInterval(interval);
          setPollingInterval(null);
          alert('Analysis failed. Please try again.');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

  const removeFile = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setUploadedFile(null);
    setVideoUrl(null);
    setAnalysisComplete(false);
    setIsUploading(false);
    setUploadProgress(0);
    setRequestId(null);
    setAnalysis({
      transcription: "",
      symptoms: [],
      visual_signs: [],
      severity: "",
      recommendations: [],
      citations: []
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Symptom Video</h2>
        
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-6">
          {!uploadedFile && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No video uploaded</p>
                <p className="text-gray-500 text-sm">Upload an MP4 video to get started</p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Uploading video...</p>
                <p className="text-gray-300 mt-2">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          )}

          {uploadedFile && !isUploading && videoUrl && (
            <video src={videoUrl} controls className="w-full h-full object-contain">
              Your browser does not support the video tag.
            </video>
          )}

          {!analysisComplete && requestId && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-center">
                <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Analyzing video...</p>
                <p className="text-gray-300 mt-2">Please wait while AI processes your video</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          {!uploadedFile && !isUploading && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Video (MP4)</span>
              </button>
            </>
          )}

          {uploadedFile && (
            <button
              onClick={removeFile}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <RotateCcw className="w-5 h-5" />
              <span>New Assessment</span>
            </button>
          )}
        </div>

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="space-y-6 mt-8">
            <h3 className="text-2xl font-bold text-gray-900">AI Analysis Results</h3>
            
            {/* Transcription */}
            {analysis.transcription && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Transcription</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">"{analysis.transcription}"</p>
                </div>
              </div>
            )}

            {/* Symptoms */}
            {analysis.symptoms.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Detected Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.symptoms.map((symptom, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Signs */}
            {analysis.visual_signs && analysis.visual_signs !== "none detected" && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Visual Signs</h4>
                <p className="text-gray-700">{analysis.visual_signs}</p>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations */}
            {analysis.citations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Evidence-Based Sources</h4>
                <div className="space-y-2">
                  {analysis.citations.map((citation, index) => (
                    <a
                      key={index}
                      href={citation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition"
                    >
                      <ExternalLink className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-green-900">{citation}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Doctor Dashboard Component
function DoctorDashboard({ currentUser, apiBaseUrl }) {
  const [patientQueue, setPatientQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadPatientQueue();
  }, []);

  const loadPatientQueue = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${apiBaseUrl}/get_patient_queue?status=COMPLETED`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPatientQueue(data.triage_requests);
      }
    } catch (error) {
      console.error('Error loading patient queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Queue</h2>
      
      <div className="bg-white rounded-lg shadow">
        {patientQueue.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No patients in queue
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {patientQueue.map((patient) => (
              <div key={patient.request_id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Patient ID: {patient.patient_id.substring(0, 8)}...
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        patient.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        patient.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        patient.priority === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patient.priority}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Symptoms:</strong> {patient.symptoms.join(', ')}</p>
                      <p><strong>Severity:</strong> {patient.severity}</p>
                      {patient.visual_signs && (
                        <p><strong>Visual Signs:</strong> {patient.visual_signs}</p>
                      )}
                    </div>

                    <p className="mt-3 text-gray-700">{patient.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
