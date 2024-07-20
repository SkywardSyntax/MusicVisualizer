import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { CSSTransition } from 'react-transition-group';
import WebGLVisualizer from './WebGLVisualizer';

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
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const webGLVisualizerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (!dataArrayRef.current) {
      analyser.fftSize = 256;
      bufferLengthRef.current = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
    }

    if (!webGLVisualizerRef.current) {
      webGLVisualizerRef.current = new WebGLVisualizer(canvas);
    }

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArrayRef.current);

      webGLVisualizerRef.current.drawScene(dataArrayRef.current, sensitivity);
    };

    draw();

    return () => {
      // You might stop the source here if needed
      // source.stop(); 
    };
  }, [audioSrc, sensitivity]);

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
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    }
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

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isPlaying) {
      handlePlay();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
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
            <div className="duration-display">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)} / {Math.floor(duration / 60)}:{Math.floor(duration % 60)}
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
          </div>
        </CSSTransition>
      </header>
    </div>
  );
}

export default App;
