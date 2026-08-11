import React from "react";
import "./lyrics.css";
import { musicDB } from "../../resources/musicData";

const Lyrics = (props) => {
  const { trackId, currentTime = 0 } = props;

  const currentTrack = musicDB.find((track) => track.id === trackId);
  const lyrics = currentTrack ? currentTrack.lyrics || [] : [];

  // หาบรรทัดเนื้อร้องปัจจุบัน (ใช้ findLastIndex เพื่อหาบรรทัดล่าสุดที่เวลาผ่านไปแล้ว)
  let currentLineIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      currentLineIndex = i;
    } else {
      break;
    }
  }

  return lyrics.length !== 0 ? (
    <div className="lyrics-container">
      {lyrics.map((line, index) => (
        <div
          key={index}
          className={`lyrics-line ${
            index === currentLineIndex ? "highlighted" : ""
          }`}
        >
          {line.text}
        </div>
      ))}
    </div>
  ) : (
    <div className="lyrics-container">Lyrics Not Found</div>
  );
};

export default Lyrics;
