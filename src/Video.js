import { useState } from "react";
import { isDarkMode } from "./utils";

const VIDEO_ERRORS = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
}

export const Video = ({ videoRef, currentTime, setScrollSynced, setCurrentTime, setVideoReady, videoUrl, title }) => {
  const [error, setError] = useState(false);
  return <div style={{ display: 'flex', background: 'black', color: 'white', overflow: 'hidden', flexDirection: 'column' }}>
    <div style={{ display: 'flex', padding: '20px', boxSizing: 'border-box' }}>{title}</div>
    {
      error ?
        <div style={{ flex: 1, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {`Error Loading Video: ${error?.target?.error?.message} (${VIDEO_ERRORS[error.target.error.code] || error.target.error.code})`}
        </div>
        :
        <div style={{ margin: 'auto', flex: 1, overflow: 'hidden' }}>
          <video 
          onCanPlay={()=>{
            setVideoReady(true)
            //console.log('>>> video ready');
          }}
          onError={(e) => {
            console.error('>>> error', error?.target?.error?.message);
            setError(e);
          }} ref={videoRef} onTimeUpdate={(e) => {
            const delta = Math.abs(e.target.currentTime - currentTime);
            if (delta > 3) { // manual seek in video
              setScrollSynced(true);
            }
            //console.log('current time', e.target.currentTime);
            setCurrentTime(e.target.currentTime)
          }} controls='on' playsInline={true} style={{ width: '100%', height: '100%' }} src={videoUrl} />
        </div>
    }
  </div>
}