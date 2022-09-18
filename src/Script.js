import { isDarkMode } from "./utils";

export const Script = ({ percentage, scrollState, textMap, syncScroll, setScrollSynced, isScrollSynced, current, videoRef, setCurrentTime, setDirection, horizontal }) => {
  const selectedColor = isDarkMode() ? '#252336' : '#ffb200b3';
  return <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', padding: '10px', gap: '10px' }}>
    {horizontal ? <button onClick={() => {
        setDirection('vertical');
      }}>Vertical</button> :
        <button onClick={() => {
          setDirection('horizontal');
        }}>Horizontal</button>}
      {!isScrollSynced && current ? <button onClick={() => {
        syncScroll();
        setScrollSynced(true);
      }}>Sync</button> : null}
    </div>
    <div id="text-container" style={{ display: 'flex', flex: '1', flexDirection: 'column', overflow: 'auto' }} onScroll={() => {
      const isAutoScrolling = Date.now() - scrollState.current.auto < 1000;
      if (!isAutoScrolling) {
        console.log('>>> MANUAL SCROLL - UNSYNCHING');
        setScrollSynced(false);
      }
    }}>
      {
        textMap.map((tm, i) => {
          const isCurrent = current?.id === tm.id;
          isCurrent && console.log('is current', current.id);
          return <div onClick={() => {
            console.log('> clicked', tm, tm.start);
            videoRef.current.currentTime = tm.start;
            setScrollSynced(true);
            setCurrentTime(tm.start);
          }} key={`text-part-${tm.id}`} className="text-part" id={`text-part-${tm.id}`} style={{ background: isCurrent ? selectedColor : 'none', flexDirection: 'column', position: 'relative' }}>
            <div style={{ height: '2px', width: '100%', position: 'absolute', top: '0', left: '0' }}>
              {isCurrent ? <div style={{ height: '2px', width: isCurrent ? `${percentage * 100}%` : '100%', transition: 'width 0.5s', background: 'red' }}></div> : null}
            </div>
            <div style={{ fontSize: '12px' }}>{`${tm.startTs.split('.')[0]}`}</div>
            <div style={{ color: tm.color, fontWeight: 'bold' }}>{tm.name}</div>
            <div>{tm.text}</div>
          </div>
        })
      }
    </div>
  </div>
}