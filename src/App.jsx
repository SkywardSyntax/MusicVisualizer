import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const audio = audioRef.current;

    // Initialize audio context outside to prevent re-creation
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
    }

    // Connect source only once
    const source = audioContextRef.current.createMediaElementSource(audio);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    analyserRef.current.fftSize = 256;
    bufferLengthRef.current = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

    const draw = () => {
      requestAnimationFrame(draw);

      if (isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLengthRef.current) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLengthRef.current; i++) {
          barHeight = dataArrayRef.current[i];

          canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
          canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

          x += barWidth + 1;
        }
      }
    };

    draw();

    // IMPORTANT: Remove the audioContext.close() from here! 
    // It should not be closed in this useEffect
    return () => {
      // You might stop the source here if needed
      // source.stop(); 
    };
  }, [isPlaying]); // Run this effect only once on mount

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Visualizer</h1>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <canvas ref={canvasRef} width="800" height="400"></canvas>
        <audio
          ref={audioRef}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          src={audioSrc}
        >
          Your browser does not support the audio element.
        </audio>
      </header>
    </div>
  );
}

export default App;