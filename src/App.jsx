import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const audio = audioRef.current;

    if (!dataArrayRef.current) {
      analyser.fftSize = 512;
      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
    }

    const draw = () => {
      if (isPlaying) {
        analyser.getByteFrequencyData(dataArrayRef.current);

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

    const drawInterval = setInterval(draw, 1000 / 30); // Update canvas 30 times per second

    return () => {
      clearInterval(drawInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isPlaying]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);

      const audio = audioRef.current;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  };

  const handlePlay = async () => {
    try {
      if (audioRef.current.paused) {
        await audioContext.resume();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming audio context:', error);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Visualizer</h1>
        <div className="file-input">
          <input type="file" accept="audio/*" onChange={handleFileChange} />
        </div>
        <canvas ref={canvasRef} width="800" height="400"></canvas>
        <div className="audio-controls">
          <audio
            ref={audioRef}
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            src={audioSrc}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </header>
    </div>
  );
}

export default App;
