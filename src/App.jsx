import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { CSSTransition } from 'react-transition-group';

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
      analyser.fftSize = 256;
      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
    }

    const draw = () => {
      requestAnimationFrame(draw);

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
    };

    draw();

    return () => {
      // You might stop the source here if needed
      // source.stop(); 
    };
  }, [audioSrc]);

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

  return (
    <div className="App">
      <header className="App-header">
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <h1>Music Visualizer</h1>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip file-input">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <canvas ref={canvasRef} width="800" height="400"></canvas>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip audio-controls">
            <audio
              ref={audioRef}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              src={audioSrc}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </CSSTransition>
      </header>
    </div>
  );
}

export default App;
