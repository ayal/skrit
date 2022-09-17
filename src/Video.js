export const Video = ({ videoRef, currentTime, setScrollSynced, setCurrentTime, videoUrl }) => {
    return <div style={{ display: 'flex', background: 'black', color: 'white', overflow: 'hidden' }}>
      <video ref={videoRef} onTimeUpdate={(e) => {
        const delta = Math.abs(e.target.currentTime - currentTime);
        if (delta > 3) { // manual seek in video
          setScrollSynced(true);
        }
        console.log('current time', e.target.currentTime);
        setCurrentTime(e.target.currentTime)
      }} controls='on' playsInline={true} style={{ width: '100%' }} src={videoUrl} />
    </div>
  }