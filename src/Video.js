import { useState } from "react";
import { isDarkMode } from "./utils";

export const Video = ({ videoRef, currentTime, setScrollSynced, setCurrentTime, videoUrl }) => {
  const [error, setError] = useState(false);

  return <div style={{ display: 'flex', background: 'black', color: isDarkMode() ? 'white' : 'black', overflow: 'hidden' }}>
    {
      error ? <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{`Error Loading Video: ${error?.target?.error?.message}`}</div>
        : <video onError={(e) => {
          console.log('>>>>>', e.target.error.message);
          setError(e);
        }} ref={videoRef} onTimeUpdate={(e) => {
          const delta = Math.abs(e.target.currentTime - currentTime);
          if (delta > 3) { // manual seek in video
            setScrollSynced(true);
          }
          console.log('current time', e.target.currentTime);
          setCurrentTime(e.target.currentTime)
        }} controls='on' playsInline={true} style={{ width: '100%' }} src={videoUrl} />
    }
  </div>
}