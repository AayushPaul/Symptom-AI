import React, { useState, useRef } from 'react';
import { 
  Activity, Video, Stethoscope, Shield, Globe, FileText, Calendar, 
  MessageSquare, AlertCircle, Upload, RotateCcw, X, 
  MapPin, Navigation, ExternalLink, CheckCircle, Clock, Languages,
  Volume2, Eye, Loader
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log('Login successful:', { email, userType });
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
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
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        {userType === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
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
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Health Assessment
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Upload your symptom video, receive instant AI analysis, and get personalized healthcare recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureCard
                icon={<Video className="w-6 h-6 text-blue-600" />}
                title="Video-Based Analysis"
                description="Upload your symptom video and let AI analyze audio for accurate assessment"
              />
              <FeatureCard
                icon={<Stethoscope className="w-6 h-6 text-purple-600" />}
                title="Smart Triage System"
                description="Get recommendations for home care, doctor visits, or emergency care based on severity"
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 text-green-600" />}
                title="Evidence-Based Citations"
                description="All recommendations backed by trusted sources: CDC, NIH, Mayo Clinic, Johns Hopkins"
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6 text-orange-600" />}
                title="Multilingual Support"
                description="Access healthcare guidance in multiple languages with ASL support"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to access your healthcare portal</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
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
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
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

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up now
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Your data is encrypted and protected. We comply with HIPAA regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600">Always Available</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">5+ Sources</div>
            <p className="text-gray-600">Trusted Medical References</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">Multilingual</div>
            <p className="text-gray-600">Accessible to All</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function PatientDashboard() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const fileInputRef = useRef(null);

  const [analysis, setAnalysis] = useState({
    transcription: "",
    keywords: [],
    severity: "",
    confidence: 0,
    symptoms: [],
    diagnosis: "",
    recommendations: [],
    citations: []
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Start transcription automatically
      transcribeVideo(file);
    } else {
      alert('Please select a valid video file (MP4, MOV, AVI, WebM)');
    }
  };

  const transcribeVideo = async (file) => {
    setIsTranscribing(true);
    
    // Simulated transcription (in production, this would call a real API like Google Speech-to-Text)
    setTimeout(() => {
      const mockTranscription = "I've been having a persistent headache for the past 3 days, along with a mild fever of around 100 degrees Fahrenheit. I also feel very tired and have some body aches. The headache gets worse in bright light and I feel nauseous sometimes.";
      
      setAnalysis(prev => ({
        ...prev,
        transcription: mockTranscription
      }));
      
      setIsTranscribing(false);
      
      // Automatically start analysis after transcription
      analyzeTranscription(mockTranscription);
    }, 3000);
  };

  const analyzeTranscription = async (transcription) => {
    setIsAnalyzing(true);
    
    // Simulated AI analysis with keyword extraction and symptom detection
    setTimeout(() => {
      // Extract keywords from transcription
      const keywords = extractKeywords(transcription);
      
      // Detect symptoms
      const symptoms = detectSymptoms(transcription);
      
      // Determine severity based on symptoms
      const severity = determineSeverity(symptoms);
      
      // Generate diagnosis
      const diagnosis = generateDiagnosis(symptoms, severity);
      
      // Generate recommendations
      const { recommendations, citations } = generateRecommendations(severity);
      
      setAnalysis({
        transcription,
        keywords,
        severity,
        confidence: 87,
        symptoms,
        diagnosis,
        recommendations,
        citations
      });
      
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const extractKeywords = (text) => {
    // Simple keyword extraction (in production, use NLP library)
    const medicalKeywords = [
      'headache', 'fever', 'tired', 'fatigue', 'body aches', 
      'light sensitivity', 'nausea', 'persistent', 'pain'
    ];
    
    const found = medicalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    return found;
  };

  const detectSymptoms = (text) => {
    const symptoms = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('headache')) symptoms.push('Headache');
    if (lowerText.includes('fever') || lowerText.includes('100')) symptoms.push('Fever (100°F)');
    if (lowerText.includes('tired') || lowerText.includes('fatigue')) symptoms.push('Fatigue');
    if (lowerText.includes('body aches') || lowerText.includes('aches')) symptoms.push('Body aches');
    if (lowerText.includes('light') && lowerText.includes('bright')) symptoms.push('Photophobia (Light sensitivity)');
    if (lowerText.includes('nausea') || lowerText.includes('nauseous')) symptoms.push('Nausea');
    
    return symptoms;
  };

  const determineSeverity = (symptoms) => {
    // Logic to determine severity based on symptoms
    const severeSymptoms = ['chest pain', 'difficulty breathing', 'confusion', 'severe headache'];
    const moderateSymptoms = ['fever', 'persistent', 'body aches'];
    
    const text = symptoms.join(' ').toLowerCase();
    
    if (severeSymptoms.some(s => text.includes(s))) {
      return 'severe';
    } else if (moderateSymptoms.some(s => text.includes(s)) || symptoms.length >= 3) {
      return 'moderate';
    } else {
      return 'mild';
    }
  };

  const generateDiagnosis = (symptoms, severity) => {
    if (symptoms.some(s => s.includes('Fever')) && symptoms.some(s => s.includes('Headache'))) {
      return 'Possible viral infection or flu-like illness';
    } else if (symptoms.some(s => s.includes('Cough'))) {
      return 'Possible upper respiratory infection';
    } else {
      return 'Symptoms require medical evaluation';
    }
  };

  const generateRecommendations = (severity) => {
    if (severity === 'mild') {
      return {
        recommendations: [
          "Get plenty of rest and stay hydrated",
          "Take over-the-counter pain relievers like acetaminophen or ibuprofen",
          "Use a cool compress on your forehead",
          "Stay in a dark, quiet room to reduce light sensitivity",
          "Monitor symptoms for 2-3 days; if they worsen, seek medical care"
        ],
        citations: [
          { source: "Mayo Clinic", title: "Headache: Diagnosis and treatment", url: "https://www.mayoclinic.org/diseases-conditions/headache/diagnosis-treatment/drc-20351832" },
          { source: "CDC", title: "Flu Symptoms & Complications", url: "https://www.cdc.gov/flu/symptoms/symptoms.htm" },
          { source: "NIH MedlinePlus", title: "Fever", url: "https://medlineplus.gov/fever.html" }
        ]
      };
    } else if (severity === 'moderate') {
      return {
        recommendations: [
          "Schedule an appointment with your primary care physician within 2-3 days",
          "Continue monitoring your temperature regularly",
          "Rest and stay hydrated with plenty of fluids",
          "Take over-the-counter medication for symptom relief as directed",
          "Seek immediate care if symptoms worsen or new symptoms develop"
        ],
        citations: [
          { source: "Johns Hopkins Medicine", title: "When to See a Doctor for a Fever", url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/fever" },
          { source: "CDC", title: "Flu Symptoms & Complications", url: "https://www.cdc.gov/flu/symptoms/symptoms.htm" },
          { source: "Mayo Clinic", title: "Fever: When to see a doctor", url: "https://www.mayoclinic.org/diseases-conditions/fever/symptoms-causes/syc-20352759" },
          { source: "NIH", title: "Fever in Adults", url: "https://www.nih.gov/news-events" }
        ]
      };
    } else {
      return {
        recommendations: [
          "⚠️ SEEK IMMEDIATE MEDICAL ATTENTION - Go to the nearest Emergency Room",
          "Call 911 if symptoms include severe headache, confusion, difficulty breathing, or chest pain",
          "Do not drive yourself - have someone take you or call an ambulance",
          "Bring a list of your current medications and medical history",
          "These symptoms require urgent evaluation by a healthcare professional"
        ],
        citations: [
          { source: "CDC", title: "Warning Signs of Medical Emergency", url: "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" },
          { source: "WHO", title: "When to Seek Medical Care", url: "https://www.who.int/emergencies" },
          { source: "Mayo Clinic", title: "Emergency symptoms", url: "https://www.mayoclinic.org/first-aid" }
        ]
      };
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setVideoUrl(null);
    setAnalysisComplete(false);
    setIsTranscribing(false);
    setIsAnalyzing(false);
    setAnalysis({
      transcription: "",
      keywords: [],
      severity: "",
      confidence: 0,
      symptoms: [],
      diagnosis: "",
      recommendations: [],
      citations: []
    });
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'mild': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      default: return 
