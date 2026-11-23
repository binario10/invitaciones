import { Volume2, VolumeX } from 'lucide-react';
import './MusicPlayer.css';

export default function MusicPlayer({ isPlaying, onToggle }) {
  return (
    <button
      className={`music-floating-btn ${isPlaying ? 'music-pulse' : ''}`}
      onClick={onToggle}
      aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
      title={isPlaying ? 'Pausar música' : 'Reproducir música'}
    >
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}
