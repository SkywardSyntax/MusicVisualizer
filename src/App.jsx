import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { CSSTransition } from 'react-transition-group';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const gainNode = audioContext.createGain();
const pitchNode = audioContext.createBiquadFilter();
pitchNode.type = 'allpass';

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [selectedSongTitle, setSelectedSongTitle] = useState('');
  const [sensitivity, setSensitivity] = useState(1);
  const [prevDataArray, setPrevDataArray] = useState(null);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);

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

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLengthRef.current) * 2.5;
      let barHeight;
      let x = 0;

      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'green');
      gradient.addColorStop(1, 'red');

      for (let i = 0; i < bufferLengthRef.current; i++) {
        barHeight = dataArrayRef.current[i] * sensitivity;

        if (prevDataArray && Math.abs(barHeight - prevDataArray[i]) < 5) {
          continue;
        }

        // Adjust bar height based on pitch
        if (pitch > 1) {
          barHeight *= (i / bufferLengthRef.current) * (pitch - 1) + 1;
        } else {
          barHeight *= 1 - (i / bufferLengthRef.current) * (1 - pitch);
        }

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }

      setPrevDataArray([...dataArrayRef.current]);
    };

    draw();

    return () => {
      // You might stop the source here if needed
      // source.stop(); 
    };
  }, [audioSrc, sensitivity, pitch]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);
      setSelectedSongTitle(file.name);

      const audio = audioRef.current;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(gainNode);
      gainNode.connect(pitchNode);
      pitchNode.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  };

  const handlePlay = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleRestart = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleKeyDown = (event) => {
    const audio = audioRef.current;
    switch (event.key) {
      case 'ArrowRight':
        audio.currentTime += 5;
        break;
      case 'l':
        audio.currentTime += 10;
        break;
      case 'ArrowLeft':
        audio.currentTime -= 5;
        break;
      case 'j':
        audio.currentTime -= 10;
        break;
      default:
        break;
    }
  };

  const handleSensitivityChange = (event) => {
    setSensitivity(event.target.value);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    gainNode.gain.value = newVolume;
  };

  const handlePitchChange = (event) => {
    const newPitch = event.target.value;
    setPitch(newPitch);
    audioRef.current.playbackRate = newPitch;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
            <label className="file-input-label">
              Choose File
              <input type="file" accept="audio/*" onChange={handleFileChange} />
            </label>
          </div>
        </CSSTransition>
        {selectedSongTitle && (
          <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
            <div className="chip selected-song-chip">
              {selectedSongTitle}
            </div>
          </CSSTransition>
        )}
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <canvas ref={canvasRef} width="800" height="400"></canvas>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip audio-controls">
            <button onClick={handlePlay} disabled={isPlaying}>Play</button>
            <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
            <button onClick={handleRestart}>Restart</button>
            <audio ref={audioRef} src={audioSrc}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <label>
              Sensitivity:
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={sensitivity}
                onChange={handleSensitivityChange}
              />
            </label>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <label>
              Volume:
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </label>
          </div>
        </CSSTransition>
        <CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
          <div className="chip">
            <label>
              Pitch:
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={pitch}
                onChange={handlePitchChange}
              />
            </label>
          </div>
        </CSSTransition>
      </header>
    </div>
  );
}

export default App;
