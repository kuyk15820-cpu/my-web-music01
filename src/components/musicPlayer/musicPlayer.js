import React, { useState, useRef, useEffect, useCallback } from "react";
import "./musicPlayer.css";
import "./progressBar.css";
import { IconContext } from "react-icons";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { musicDB } from "../../resources/musicData";

const MusicPlayer = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // แก้จุดที่ 1: ใช้ useCallback ครอบ playNext
  const playNext = useCallback(() => {
    const nextIndex = (currentSongIndex + 1) % musicDB.length;
    setCurrentSongIndex(nextIndex);
    audioRef.current.pause();

    audioRef.current.src = musicDB[nextIndex].src;
    audioRef.current.load();

    audioRef.current.oncanplaythrough = () => {
      audioRef.current.play();
      audioRef.current.oncanplaythrough = null;
      setLoading(false);
    };

    setLoading(true);
  }, [currentSongIndex]);

  const playPrev = () => {
    const prevIndex = (currentSongIndex - 1 + musicDB.length) % musicDB.length;
    setCurrentSongIndex(prevIndex);
    audioRef.current.pause();

    audioRef.current.src = musicDB[prevIndex].src;
    audioRef.current.load();

    audioRef.current.oncanplaythrough = () => {
      audioRef.current.play();
      audioRef.current.oncanplaythrough = null;
      setLoading(false);
    };

    setLoading(true);
  };

  // แก้จุดที่ 2: เพิ่ม currentTime ใน dependencies และส่งข้อมูลตรงตาม state
  useEffect(() => {
    const intervalId = setInterval(() => {
      props.getDataForLyrics({
        trackId: musicDB[currentSongIndex].id,
        currentTime: currentTime,
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, [props, currentSongIndex, currentTime]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // แก้จุดที่ 3: จัดการ ref cleanup ป้องกัน memory leak
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    currentAudio.addEventListener("timeupdate", handleTimeUpdate);
    currentAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
    currentAudio.addEventListener("ended", playNext);

    return () => {
      currentAudio.removeEventListener("timeupdate", handleTimeUpdate);
      currentAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      currentAudio.removeEventListener("ended", playNext);
    };
  }, [playNext]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (newTime) => {
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={musicDB[currentSongIndex].src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      ></audio>
      <div className="component">
        <h2 className="playerTitle">
          {loading && currentSongIndex !== 0
            ? "Loading..."
            : musicDB[currentSongIndex].album}
        </h2>
        <div className="musicCover">
          {/* แก้จุดที่ 4: เพิ่ม alt prop ให้แท็ก img */}
          <img
            className="albumArtImage"
            src={musicDB[currentSongIndex].art}
            alt="album cover"
          />
        </div>
        <div className="progress-container">
          <div
            className="progress"
            onClick={(e) =>
              handleSeek(
                (e.nativeEvent.offsetX / e.target.offsetWidth) * duration
              )
            }
          >
            <div
              className="progress-filled"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="track-info">
          <div className="current-time">{formatTime(currentTime)}</div>
          <div className="duration">{formatTime(duration)}</div>
        </div>
        <div className="musicDetails">
          <h3 className="title">{musicDB[currentSongIndex].title}</h3>
          <p className="subTitle">{musicDB[currentSongIndex].artist}</p>
        </div>
        <div className="musicControls">
          <button className="playButton clickable" onClick={playPrev}>
            <IconContext.Provider value={{ size: "3em", color: "#000000" }}>
              <BiSkipPrevious />
            </IconContext.Provider>
          </button>
          {!isPlaying ? (
            <button className="playButton clickable" onClick={togglePlay}>
              <IconContext.Provider value={{ size: "3em", color: "#000000" }}>
                <AiFillPlayCircle />
              </IconContext.Provider>
            </button>
          ) : (
            <button className="playButton clickable" onClick={togglePlay}>
              <IconContext.Provider value={{ size: "3em", color: "#000000" }}>
                <AiFillPauseCircle />
              </IconContext.Provider>
            </button>
          )}
          <button className="playButton clickable" onClick={playNext}>
            <IconContext.Provider value={{ size: "3em", color: "#000000" }}>
              <BiSkipNext />
            </IconContext.Provider>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
