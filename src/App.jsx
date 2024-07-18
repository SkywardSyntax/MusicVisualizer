import React, { useState, useEffect, useRef } from 'react';
import { AudioVisualizer } from 'react-audio-visualize';

function App() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch('/audio.mp3')
      .then(res => res.blob())
      .then(blob => setAudioBlob(blob))
      .catch(error => console.error("Error loading audio:", error));
  }, []);

  useEffect(() => {
    let animationFrameId;

    const updateCurrentTime = () => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      }
    };

    if (isPlaying && audioBlob) {
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, audioBlob]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="App">
      <h1>Music Visualizer</h1>

      <div>
        {audioBlob && (
          <>
            <AudioVisualizer
              blob={audioBlob}
              width={800}
              height={400}
              barColor="#7f8c8d"
              barPlayedColor="#f1c40f"
              currentTime={currentTime} // Control the visualized time
            />
            <button onClick={handlePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </>
        )}
      </div>
      {/* Hidden audio element to control playback */}
      <audio
        ref={audioRef}
        src={audioBlob ? URL.createObjectURL(audioBlob) : ''}
        onEnded={() => setIsPlaying(false)} 
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;