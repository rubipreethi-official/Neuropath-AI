import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Upload, CheckCircle, Sparkles, Smartphone, Hand } from 'lucide-react';

export function MagicTransfer() {
  const [searchParams] = useSearchParams();
  const urlRoomId = searchParams.get('roomID');
  const roomId = urlRoomId || localStorage.getItem('magic_grab_room_id');

  useEffect(() => {
    if (urlRoomId) {
      localStorage.setItem('magic_grab_room_id', urlRoomId);
    }
  }, [urlRoomId]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setStatus('Invalid Room ID');
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const newSocket = io(backendUrl); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-room', roomId);
      setStatus('Connected! Select a file & Pinch to Grab.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setHandLandmarker(landmarker);
      } catch (err) {
        console.error("MediaPipe initialization failed:", err);
        setStatus("Camera tracking failed to load.");
      }
    };
    initializeMediaPipe();
  }, []);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
          setStatus("Camera access denied.");
        });
    }
  }, []);

  const detectHand = useCallback(() => {
    if (!handLandmarker || !videoRef.current || !file || grabbed || !socket) {
      if (!grabbed) requestAnimationFrame(detectHand);
      return;
    }

    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];

      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2) +
        Math.pow(thumbTip.z - indexTip.z, 2)
      );

      if (distance < 0.05) {
        setIsGrabbing(true);
        setGrabbed(true);
        setStatus("File Grabbed! Sending to laptop...");
        
        socket.emit('file-pick-up', {
          roomId,
          fileName: file.name,
          fileType: file.type,
          fileData: fileData // Uses pre-read data
        });
        setStatus("Sent! Drop it on your laptop.");
        return; 
      } else {
        setIsGrabbing(false);
      }
    }

    if (!grabbed) {
      requestAnimationFrame(detectHand);
    }
  }, [handLandmarker, file, fileData, grabbed, socket, roomId]);

  useEffect(() => {
    if (handLandmarker && file && fileData && !grabbed) {
      detectHand();
    }
  }, [handLandmarker, file, fileData, detectHand, grabbed]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus("Reading file...");
      
      try {
        const buffer = await selectedFile.arrayBuffer();
        
        // Convert to Base64 in chunks to avoid stack overflow on large files
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunkSize)));
        }
        
        const base64 = btoa(binary);
        const dataUrl = `data:${selectedFile.type};base64,${base64}`;
        
        setFileData(dataUrl);
        setStatus("Ready! Pinch fingers to grab the file.");
      } catch (err: any) {
        console.error("File read error:", err);
        setStatus(`Failed to read file. Please ensure it is saved locally to your device (not iCloud/Drive). Error: ${err.name || 'Unknown'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-full max-w-md bg-purple-900/50 rounded-3xl p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-300" />
          Magic Grab
        </h1>
        <p className="text-purple-200 mb-6">{status}</p>

        {!file ? (
          <div className="mb-6">
            <label className="cursor-pointer bg-purple-800 hover:bg-purple-700 transition-colors rounded-xl p-8 flex flex-col items-center gap-3 border border-dashed border-purple-500/50">
              <Upload size={32} className="text-purple-400" />
              <span className="font-medium">Select Resume (PDF/DOCX)</span>
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-purple-800/50 rounded-xl border border-purple-500/30 flex items-center justify-center gap-3">
            <CheckCircle className="text-green-400" />
            <span className="font-medium truncate">{file.name}</span>
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black border border-purple-500/50">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          {file && !grabbed && (
            <div className="absolute inset-x-0 bottom-8 flex flex-col items-center animate-pulse">
              <Hand size={40} className={`mb-2 transition-colors ${isGrabbing ? 'text-green-400' : 'text-white'}`} />
              <p className="bg-black/50 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Pinch fingers to grab file
              </p>
            </div>
          )}
          {grabbed && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex flex-col items-center justify-center">
              <Smartphone size={64} className="text-green-400 mb-4 animate-bounce" />
              <p className="text-xl font-bold text-white drop-shadow-md">Moved to Hand!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
