
import React, { useState, useRef, useEffect } from 'react';
import { AudioTrack, Playlist } from '../types';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize2, Heart, ListMusic, Search, Plus,
  Music, Headphones, CloudRain, Flame, Wind, Keyboard, Coffee,
  ListPlus, Trash2, X, Check, AlertTriangle, Repeat
} from 'lucide-react';

// --- TRACK LIBRARY (Verified Sources - Internet Archive CDN, confirmed HTTP 200) ---
const TRACK_LIBRARY: AudioTrack[] = [
  // NATURE
  { id: 'n1', title: 'Heavy Rain', category: 'NATURE', url: 'https://archive.org/download/heavy-rain-in-the-rainforest-torrential-rain-sounds-for-sleeping-relaxing-at-nig/Heavy%20Rain%20in%20the%20Rainforest%20-%20Torrential%20Rain%20Sounds%20for%20Sleeping%20_%20Relaxing%20at%20Night%20%28No%20Thunder%29%28MP3_160K%29.mp3' },
  { id: 'n2', title: 'Ocean Waves', category: 'NATURE', url: 'https://archive.org/download/Freesound-263995/Crashing_Ocean_Waves_3_hours_To_Relax_Sleep_or_Meditate-263995.mp3' },
  { id: 'n3', title: 'Night Crickets', category: 'NATURE', url: 'https://archive.org/download/relaxingcricketsoundsforsleep/Crickets%20Chirping%20in%20Forest%20Grass.mp3' },
  { id: 'n4', title: 'Windy Storm', category: 'NATURE', url: 'https://archive.org/download/WindSounds/storm.mp3' },

  // LOFI / CHILL
  { id: 'l1', title: 'Dreamy Beat', category: 'LOFI', url: 'https://archive.org/download/kalaido-hanging-lanterns_202101/Kalaido%20-%20Hanging%20Lanterns.mp3' },

  // PIANO
  { id: 'p1', title: 'Melancholic Piano', category: 'PIANO', url: 'https://archive.org/download/sad-cinematic-piano-ashamaluevmusic/03.%20Sad%20Cinematic%20Piano%20-%20AShamaluevMusic.mp3' },
  { id: 'p2', title: 'Inspiring Keys', category: 'PIANO', url: 'https://archive.org/download/soundcloud-164243240/Inspiring_Piano_and_Strings_-_No_Copyright_Background_Music_For_Videos_FREE_DOWNLOAD-164243240.mp3' },
  { id: 'p3', title: 'Soft Classical', category: 'PIANO', url: 'https://archive.org/download/SoftPianoMusicSleepingMusic/Classical%20Piano%20Playlist.mp3' },

  // NOISE
  { id: 'no1', title: 'White Noise', category: 'NOISE', url: 'https://archive.org/download/TenMinutesOfWhiteNoisePinkNoiseAndBrownianNoise/WhiteNoise.mp3' },
  { id: 'no2', title: 'Pink Noise', category: 'NOISE', url: 'https://archive.org/download/hour-of-pink-noise/01-pink_noise.mp3' },

  // AMBIENCE
  { id: 'a1', title: 'Fireplace', category: 'AMBIENCE', url: 'https://archive.org/download/FireplaceSoundeffectWithCracklingLogs/Fireplace%20Soundeffect%20with%20Crackling%20Logs.mp3' },
  { id: 'a2', title: 'Coffee Shop', category: 'AMBIENCE', url: 'https://archive.org/download/coffee-shop-sounds-12/Coffee%20Shop%20Sounds%2011.mp3' },
  { id: 'a3', title: 'Library', category: 'AMBIENCE', url: 'https://archive.org/download/VictorianStoneStreetAmbientSounds/Evening%20Study%20in%20a%20Cathedral%20Library.mp3' },
  { id: 'a4', title: 'Keyboard Typing', category: 'AMBIENCE', url: 'https://archive.org/download/SoundsOfTyping/typing.mp3' }
];

interface MusicPlayerProps {
  onExpandChange?: (expanded: boolean) => void;
  onPlayingChange?: (playing: boolean) => void;
  isOpen?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onExpandChange, onPlayingChange, isOpen = false }) => {
  // --- STATE ---
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [playQueue, setPlayQueue] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  // Sync with external isOpen prop
  useEffect(() => {
    if (isOpen && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isOpen]);

  // Notify parent when expand state changes
  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  // Notify parent when playing state changes
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // Organization
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'FAVORITES' | 'PLAYLISTS'>('EXPLORE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals & Selection
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [trackToAdd, setTrackToAdd] = useState<AudioTrack | null>(null);

  // Confirmation Modal
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const isSeeking = useRef(false);

  // Use requestAnimationFrame for smooth progress updates without excessive re-renders
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && isPlaying && !isSeeking.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    };
    if (isPlaying) {
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (progressAnimRef.current) {
        cancelAnimationFrame(progressAnimRef.current);
      }
    };
  }, [isPlaying]);

  // Load new track when currentTrack changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Play failed:', err));
      }
    }
  }, [currentTrack?.id]);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedFavs = localStorage.getItem('music_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedLists = localStorage.getItem('music_playlists');
    if (savedLists) setPlaylists(JSON.parse(savedLists));
  }, []);

  useEffect(() => { localStorage.setItem('music_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('music_playlists', JSON.stringify(playlists)); }, [playlists]);

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Play failed:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Updated playTrack to handle Queues
  const playTrack = (track: AudioTrack, newQueue?: AudioTrack[]) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      if (newQueue) {
        setPlayQueue(newQueue);
      } else {
        const currentViewTracks = getFilteredTracks();
        setPlayQueue(currentViewTracks);
      }
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (!currentTrack || playQueue.length === 0) return;

    const currentIndex = playQueue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) {
      setCurrentTrack(playQueue[0]);
      setIsPlaying(true);
      return;
    }

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % playQueue.length;
    } else {
      nextIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    }

    setCurrentTrack(playQueue[nextIndex]);
    setIsPlaying(true);
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (favorites.includes(trackId)) {
      setFavorites(prev => prev.filter(id => id !== trackId));
    } else {
      setFavorites(prev => [...prev, trackId]);
    }
  };

  // --- PLAYLIST MANAGEMENT ---
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newList: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      trackIds: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists(prev => [...prev, newList]);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const promptDeletePlaylist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaylistToDelete(id);
  };

  const confirmDeletePlaylist = () => {
    if (playlistToDelete) {
      setPlaylists(prev => prev.filter(pl => pl.id !== playlistToDelete));
      setPlaylistToDelete(null);
    }
  };

  const confirmAddToPlaylist = (playlistId: string) => {
    if (!trackToAdd) return;
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.trackIds.includes(trackToAdd.id)) return pl;
        return { ...pl, trackIds: [...pl.trackIds, trackToAdd.id] };
      }
      return pl;
    }));
    setTrackToAdd(null);
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, trackIds: pl.trackIds.filter(id => id !== trackId) };
      }
      return pl;
    }));
  };

  // --- FILTERING ---
  const getFilteredTracks = () => {
    let tracks = TRACK_LIBRARY;

    if (activeTab === 'FAVORITES') {
      tracks = tracks.filter(t => favorites.includes(t.id));
    } else if (activeTab === 'PLAYLISTS') {
      return [];
    }

    if (selectedCategory !== 'ALL') {
      tracks = tracks.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      tracks = tracks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return tracks;
  };

  const getPlaylistTracks = (playlist: Playlist) => {
    return playlist.trackIds.map(id => TRACK_LIBRARY.find(t => t.id === id)).filter((t): t is AudioTrack => !!t);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'NATURE': return <CloudRain size={16} />;
      case 'AMBIENCE': return <Coffee size={16} />;
      case 'LOFI': return <Headphones size={16} />;
      case 'PIANO': return <Music size={16} />;
      case 'NOISE': return <Wind size={16} />;
      default: return <Music size={16} />;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !duration) return;
    isSeeking.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={() => {
          if (isLooping && audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            audioRef.current.play().catch(() => { });
          } else {
            skipTrack('next');
          }
        }}
        onCanPlay={(e) => { e.currentTarget.volume = volume; }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (!isSeeking.current) setCurrentTime(0);
        }}
        onSeeked={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          isSeeking.current = false;
        }}
        onError={(e) => console.error('Audio Load Error', e)}
      />

      {isExpanded && (
        <div className="fixed inset-0 z-[70] bg-slate-950 flex flex-col animate-fade-in">

          {/* Header */}
          <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                <Minimize2 size={24} />
              </button>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Headphones className="text-primary-500" /> Focus Audio
              </h2>
            </div>
            <div className="hidden md:flex relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search sounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs (Horizontal scroll on mobile) */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900 flex flex-row md:flex-col py-2 md:py-6 gap-2 overflow-x-auto">
              <button onClick={() => setActiveTab('EXPLORE')} className={`flex items-center gap-3 px-6 py-3 border-b-4 md:border-b-0 md:border-l-4 transition-all shrink-0 ${activeTab === 'EXPLORE' ? 'border-primary-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                <Search size={20} /> <span className="font-medium">Explore</span>
              </button>
              <button onClick={() => setActiveTab('FAVORITES')} className={`flex items-center gap-3 px-6 py-3 border-b-4 md:border-b-0 md:border-l-4 transition-all shrink-0 ${activeTab === 'FAVORITES' ? 'border-primary-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                <Heart size={20} /> <span className="font-medium">Favorites</span>
              </button>
              <button onClick={() => setActiveTab('PLAYLISTS')} className={`flex items-center gap-3 px-6 py-3 border-b-4 md:border-b-0 md:border-l-4 transition-all shrink-0 ${activeTab === 'PLAYLISTS' ? 'border-primary-500 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                <ListMusic size={20} /> <span className="font-medium">Playlists</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">

              {activeTab === 'EXPLORE' && (
                <div className="p-6 pb-2 flex gap-3 overflow-x-auto custom-scrollbar">
                  {['ALL', 'NATURE', 'LOFI', 'PIANO', 'NOISE', 'AMBIENCE'].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'PLAYLISTS' ? (
                  <div className="space-y-8 pb-32">
                    <div onClick={() => setShowPlaylistModal(true)} className="w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-all">
                      <Plus size={32} className="mb-2" />
                      <span className="font-bold">Create New Playlist</span>
                    </div>

                    {playlists.map(pl => {
                      const tracks = getPlaylistTracks(pl);
                      return (
                        <div key={pl.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <ListMusic size={20} className="text-purple-400" /> {pl.name}
                            </h3>
                            <button
                              onClick={(e) => promptDeletePlaylist(e, pl.id)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors relative z-10"
                              title="Delete Playlist"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tracks.length === 0 && <p className="text-slate-500 text-sm italic col-span-full">No tracks yet.</p>}
                            {tracks.map(track => {
                              const isCurrent = currentTrack?.id === track.id;
                              return (
                                <div
                                  key={track.id}
                                  onClick={() => playTrack(track, tracks)}
                                  className={`group relative bg-slate-800 border ${isCurrent ? 'border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-700 hover:border-slate-600'} rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-lg ${isCurrent ? 'bg-primary-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
                                      {getCategoryIcon(track.category)}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeTrackFromPlaylist(pl.id, track.id); }}
                                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove from playlist"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                  <div>
                                    <h4 className={`font-bold truncate ${isCurrent ? 'text-primary-400' : 'text-white'}`}>{track.title}</h4>
                                    <p className="text-xs text-slate-500">{track.category}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-32">
                    {getFilteredTracks().map(track => {
                      const isCurrent = currentTrack?.id === track.id;
                      const isFav = favorites.includes(track.id);
                      const currentList = getFilteredTracks();

                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, currentList)}
                          className={`group relative bg-slate-800 border ${isCurrent ? 'border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-700 hover:border-slate-600'} rounded-xl p-4 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-1`}
                        >
                          <div className="flex justify-between items-start relative z-10">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-primary-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
                              {isCurrent && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setTrackToAdd(track); }} title="Add to Playlist">
                                <ListPlus size={20} />
                              </button>
                              <button onClick={(e) => toggleFavorite(e, track.id)} className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${isFav ? 'text-red-500' : 'text-slate-500'}`}>
                                <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg truncate ${isCurrent ? 'text-primary-400' : 'text-white'}`}>{track.title}</h4>
                            <p className="text-xs text-slate-500 font-bold tracking-wider mb-2">{track.category}</p>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden cursor-pointer" onClick={(e) => { e.stopPropagation(); if (isCurrent) handleSeek(e); }}>
                              <div className="h-full bg-primary-500 rounded-full transition-none" style={{ width: isCurrent ? `${progressPercent}%` : '0%' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {currentTrack && (
                <div className="h-auto md:h-24 bg-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between z-20 gap-4 md:gap-0 absolute bottom-0 w-full md:relative">
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-primary-500 shadow-inner shrink-0">
                      <Music size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate">{currentTrack.title}</h3>
                      <p className="text-slate-500 text-sm">{currentTrack.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-full md:w-1/3">
                    <div className="flex items-center gap-6">
                      <button onClick={() => skipTrack('prev')} className="text-slate-400 hover:text-white"><SkipBack size={24} /></button>
                      <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                      </button>
                      <button onClick={() => skipTrack('next')} className="text-slate-400 hover:text-white"><SkipForward size={24} /></button>
                      <button
                        onClick={() => setIsLooping(!isLooping)}
                        className={`p-1.5 rounded-full transition-colors ${isLooping ? 'text-primary-400 bg-primary-500/20' : 'text-slate-400 hover:text-white'}`}
                        title={isLooping ? 'Loop On' : 'Loop Off'}
                      >
                        <Repeat size={18} />
                      </button>
                    </div>
                    {/* Progress bar in bottom player */}
                    <div className="w-full flex items-center gap-2 px-2">
                      <span className="text-xs text-slate-500 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer group" onClick={handleSeek}>
                        <div className="h-full bg-primary-500 rounded-full transition-none" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-10 tabular-nums">{formatTime(duration)}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
                    {volume === 0 ? <VolumeX size={20} className="text-slate-400" /> : <Volume2 size={20} className="text-slate-400" />}
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-32 accent-primary-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Playlist Modal */}
          {showPlaylistModal && (
            <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-4">New Playlist</h3>
                <input type="text" placeholder="Playlist Name" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 mb-6" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} autoFocus />
                <div className="flex gap-3">
                  <button onClick={() => setShowPlaylistModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={createPlaylist} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold">Create</button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE Playlist Confirmation Modal */}
          {playlistToDelete && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                  <AlertTriangle size={32} />
                  <h3 className="text-xl font-bold text-white">Delete Playlist?</h3>
                </div>
                <p className="text-slate-400 mb-6">Are you sure you want to delete this playlist? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setPlaylistToDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700">Cancel</button>
                  <button onClick={confirmDeletePlaylist} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white font-bold border border-red-500/50">Delete</button>
                </div>
              </div>
            </div>
          )}

          {trackToAdd && (
            <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Add to Playlist</h3>
                <p className="text-slate-400 text-sm mb-4">Select a playlist for <span className="text-white font-medium">"{trackToAdd.title}"</span></p>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar mb-6">
                  {playlists.length === 0 && <div className="text-center py-4 text-slate-500 bg-slate-950 rounded-lg">No playlists found. Create one!</div>}
                  {playlists.map(pl => {
                    const isAdded = pl.trackIds.includes(trackToAdd.id);
                    return (
                      <button key={pl.id} onClick={() => confirmAddToPlaylist(pl.id)} className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex justify-between items-center group border border-transparent hover:border-primary-500/50 transition-all">
                        <span className="font-medium flex items-center gap-2"><ListMusic size={16} className="text-slate-400" /> {pl.name}</span>
                        {isAdded && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1"><Check size={12} /> Added</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTrackToAdd(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={() => { setTrackToAdd(null); setShowPlaylistModal(true); }} className="flex-1 py-2.5 bg-primary-600/10 text-primary-400 border border-primary-600/30 hover:bg-primary-600 hover:text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2">
                    <Plus size={16} /> New Playlist
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};
