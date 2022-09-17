import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Split from 'react-split-grid'
import './App.css';
import { fromTS, mobileCheck } from './utils';
import { Script } from './Script';
import { Video } from './Video';

function Main({ videoUrl, textMap }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isScrollSynced, setScrollSynced] = useState(true);
  const [direction, setDirection] = useState(mobileCheck() ? 'vertical' : 'horizontal');
  const horizontal = direction === 'horizontal';
  const videoRef = useRef();

  const getCurrent = (_currentTime) => {
    let _current;
    for (let index = 0; index < textMap.length; index++) {
      const tm = textMap[index];
      if (_currentTime >= tm.start && _currentTime < tm.end) {
        _current = tm;
        break;
      }
    }
    if (!_current) {
      for (let index2 = 0; index2 < textMap.length; index2++) {
        const tm = textMap[index2];
        if (_currentTime < tm.end) {
          _current = textMap[index2 - 1];
          break;
        }
      }
    }
    return _current;
  }

  const current = useMemo(() => {
    const newCurrent = getCurrent(currentTime);
    return newCurrent;
  }, [currentTime]);

  const percentage = current ? (currentTime - current.start) / (current?.realEnd - current?.start) : 1;
  const scrollState = useRef({})

  const syncScroll = useCallback(() => {
    const doScroll = async () => {
      if (current) {
        const element = document.querySelector(`#text-part-${current.id}`);
        scrollState.current.auto = Date.now();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    doScroll();
  }, [current])

  useEffect(() => {
    if (!isScrollSynced) {
      return;
    }
    syncScroll()
  }, [isScrollSynced, syncScroll])

  const videoProps = { videoRef, currentTime, isScrollSynced, setCurrentTime, videoUrl };

  return (
    <div className="App" style={{ display: 'flex', width: '100%', height: '100vh', flexDirection: 'row', overflow: 'hidden' }}>

      <Split direction={direction} render={({ getGridProps, getGutterProps }) => {
        const props = getGridProps();
        const gutterProps = getGutterProps(horizontal ? 'column' : 'row', 1);
        const initial = horizontal ? { gridTemplateColumns: '2fr 16px 1fr' } : { gridTemplateRows: '1fr 16px 2fr' }
        const overrides = !horizontal ? { gridTemplateColumns: '' } : { gridTemplateRows: '' }
        return (
          <div {...props} style={{ width: '100%', display: 'grid', ...initial, ...props.style, ...overrides }}>
            <Video {...videoProps} />
            <div {...gutterProps} className="gutter" style={{ ...gutterProps.style, cursor: horizontal ? 'col-resize' : 'row-resize' }} />
            <Script
              horizontal={horizontal}
              percentage={percentage}
              scrollState={scrollState}
              direction={direction}
              setDirection={setDirection}
              textMap={textMap}
              syncScroll={syncScroll}
              setScrollSynced={setScrollSynced}
              isScrollSynced={isScrollSynced}
              current={current}
              videoRef={videoRef} setCurrentTime={setCurrentTime} />
          </div>
        )
      }} />
    </div>

  );
}

const Colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

function App() {
  const [textMap, setTextMap] = useState([]);
  const url = new URL(window.location.href);

  const videoUrl = url.searchParams.get('videoUrl');
  const textUrl = url.searchParams.get('textUrl');

  useEffect(() => {
    const run = async () => {
      const text = await (await fetch(textUrl)).text();
      const textMap = text.split('\r\n\r\n').map(t => {
        const parts = t.split('\r\n');
        if (parts.length !== 3) {
          return null;
        }
        const [id, time, fullText] = parts;
        const [name, text] = fullText.match(':') ? fullText.split(':') : ['', fullText]
        const [startTs, endTs] = time.split(' --> ');
        return {
          id,
          name,
          text,
          startTs,
          endTs,
          start: fromTS(startTs),
          end: fromTS(endTs),
        }
      }).filter(Boolean);
      textMap.map((t, i) => {
        const next = textMap[i + 1];
        if (next) {
          t.realEnd = next.start - 0.001;
        }
        return t;
      })
      const names = Object.keys(textMap.reduce((acc, t) => {
        if (t.name) {
          acc[t.name] = 1;
        }
        return acc;
      }, {}))
      // console.log(names);
      const withColors = textMap.map(t => {
        return {
          color: Colors[names.indexOf(t.name)],
          ...t
        }
      })
      setTextMap(withColors);
    }
    run();

  }, [])

  return <Main videoUrl={videoUrl} textMap={textMap} />
}

export default App;