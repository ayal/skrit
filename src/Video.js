import { useCallback, useEffect, useState } from "react";
import { isDarkMode } from "./utils";

const VIDEO_ERRORS = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
}

/*
    <button onClick={() => {
      console.log('setting fake error', currentTime);
      setError({ currentTime: currentTime, target: { error: { message: 'kuku' } } });
    }}>xx</button>
*/

export const Video = ({ videoRef, videoReady, ts, currentTime, setScrollSynced, setCurrentTime, setVideoReady, videoUrl, title }) => {
  const [error, setError] = useState(false);
  useEffect(() => {
    if (videoReady && ts && parseFloat(ts)) {
      const fts = parseFloat(ts);
      console.log('>>> checking ts', ts, videoReady);
      setCurrentTime(parseFloat(fts));
      videoRef.current.currentTime = parseFloat(fts);
    }
  }, [videoReady, videoRef])

  return <div style={{ display: 'flex', background: 'black', color: 'white', overflow: 'hidden', flexDirection: 'column', position: 'relative' }}>
    <div style={{ display: 'flex', padding: '20px', boxSizing: 'border-box' }}>{title}</div>
    {
      error ?
        <div style={{ width: '100%', height: '30px', flex: 1, display: 'flex', alignItems: 'center', background: 'black', zIndex: 1, position: 'absolute', justifyContent: 'center', overflow: 'hidden', opacity: 0.6 }}>
          {`Error Loading Video: ${error?.target?.error?.message || 'Unknown'} (${VIDEO_ERRORS[error?.target?.error?.code] || error?.target?.error?.code || '0'})`}
          {/* <button onClick={() => {
            console.log('>>> reload', videoRef.current.on)
            videoRef.current.load();
          }}>Reload</button> */}
        </div> : null
    }
    <div style={{ margin: 'auto', flex: 1, overflow: 'hidden' }}>
      <video
        onCanPlay={() => {
          setVideoReady(true)
          if (error) {
            console.log('trying to recover time after error', error, videoRef.current, currentTime);
            if (error.currentTime) {
              videoRef.current.currentTime = error.currentTime;
            }
            setError(false);
          }
          console.log('>>> video ready');
        }}
        onError={(e) => {
          console.error('>>> error', error?.target?.error?.message);
          e.currentTime = currentTime;
          setError(e);
          console.log('>>> reloading video');
          videoRef.current.load();
        }} ref={videoRef}
        onTimeUpdate={(e) => {
          const delta = Math.abs(e.target.currentTime - currentTime);
          if (delta > 3) { // manual seek in video
            setScrollSynced(true);
          }
          //console.log('current time', e.target.currentTime);
          setCurrentTime(e.target.currentTime)
        }} controls='on' playsInline={true} style={{ width: '100%', height: '100%' }} src={videoUrl} />
    </div>

  </div>
}