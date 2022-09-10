import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import Split from 'react-split-grid'
import './App.css';

function toTS(given_seconds) {
  const hours = Math.floor(given_seconds / 3600);
  const minutes = Math.floor((given_seconds - (hours * 3600)) / 60);
  const seconds = given_seconds - (hours * 3600) - (minutes * 60);

  const timeString = hours.toString().padStart(2, '0') + ':' +
    minutes.toString().padStart(2, '0') + ':' +
    seconds.toString().padStart(2, '0');

  return timeString;
}

const fromTS = (ts) => {
  const [hours, minutes, seconds, ms] = ts.split(':');
  return (parseFloat(hours) * 3600) + (parseFloat(minutes) * 60) + parseFloat(seconds);
}

class ScrollPromise {
  p;
  r;
  scrolling = false;
  auto = false;
  init() {
    this.p = new Promise(resolve => {
      this.r = resolve;
    })
  }
  constructor() {
    this.init();
  }
}

const mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};



const Script = ({ textMap, syncScroll, setSyncScroll, shouldSyncScroll, current, videoRef, setCurrentTime, setDirection }) => {
  const debouncedScroll = useMemo(() => debounce(() => {
    console.log('finished scrolling debounce', Date.now());
  }, 1000), []);
  const scrollHandler = useCallback(() => {
    debouncedScroll()
  }, [debouncedScroll])

  return <div style={{ display:'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <div style={{ display: 'flex', height: '30px' }}>
      <button onClick={() => {
        console.log('asked to sync scroll');
        syncScroll();
        setSyncScroll(true);
      }}>Sync</button>
      <button onClick={() => {
        setDirection('vertical');
      }}>Vertical</button>
      <button onClick={() => {
        setDirection('horizontal');
      }}>Horizontal</button>
    </div>
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', overflow: 'auto' }} onScroll={() => {
      //setSyncScroll(false);
      console.log('scrolling...');
      scrollHandler()
    }}>
      {
        textMap.map((tm, i) => {
          const isCurrent = current?.id === tm.id;
          return <div onClick={() => {
            videoRef.current.currentTime = tm.start;
            setSyncScroll(true);
            setCurrentTime(tm.start);
          }} key={`text-part-${tm.id}`} className="text-part" id={`text-part-${tm.id}`} style={{ background: isCurrent ? 'orange' : 'white', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px' }}>{`${tm.startTs.split('.')[0]}`}</div>
            <div style={{ color: tm.color, fontWeight: 'bold' }}>{tm.name}</div>
            <div>{tm.text}</div>
          </div>
        })
      }
    </div>
  </div>
}

function Comp({ videoUrl, textMap }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shouldSyncScroll, setSyncScroll] = useState(true);
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
      //console.log('couldnt find exact current');
      for (let index2 = 0; index2 < textMap.length; index2++) {
        const tm = textMap[index2];
        //console.log('comparing', _currentTime, tm.end);
        if (_currentTime < tm.end) {
          //console.log('found!');
          _current = textMap[index2 - 1];
          break;
        }
        //console.log('continue!');
      }
    }
    //console.log('current', current);
    return _current;
  }

  const current = useMemo(() => {
    const newCurrent = getCurrent(currentTime);
    return newCurrent;
  }, [currentTime]);


  const syncScroll = useCallback(() => {
    const doScroll = async () => {
      if (current) {
        const element = document.querySelector(`#text-part-${current.id}`);
        console.log('actually scrolling to view');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    doScroll();
  }, [current])

  useEffect(() => {
    if (!shouldSyncScroll) {
      console.log('not syncing');
      return;
    }
    syncScroll()
  }, [shouldSyncScroll, syncScroll])



  return (
    <div className="App" style={{ display: 'flex', width: '100%', height: '100vh', flexDirection: 'row', overflow: 'hidden' }}>

      <Split direction={direction} render={({ getGridProps, getGutterProps }) => {
        const props = getGridProps();
        const gutterProps = getGutterProps(horizontal ? 'column' : 'row', 1);
        const initial = horizontal ?  { gridTemplateColumns: '2fr 16px 1fr' } : { gridTemplateRows: '1fr 16px 2fr' }
        const overrides = !horizontal ?  { gridTemplateColumns: '' } : { gridTemplateRows: '' }
        return (
          <div {...props} style={{ display: 'grid',...initial, ...props.style, ...overrides }}>
            <div style={{ display:'flex', background: 'black', color: 'white', overflow: 'hidden' }}>
              <video ref={videoRef} onTimeUpdate={(e) => {
                const delta = Math.abs(e.target.currentTime - currentTime);
                if (delta > 3) { // manual seek in video
                  setSyncScroll(true);
                }
                setCurrentTime(e.target.currentTime)
              }} controls='on' playsInline={true} style={{ width: '100%' }} onLoad={() => setVideoLoaded(true)} src={videoUrl} />
            </div>
            <div {...gutterProps} className="gutter" style={{...gutterProps.style, cursor: horizontal ? 'col-resize' : 'row-resize'}} />
            <Script
              direction={direction}
              setDirection={setDirection}
              textMap={textMap}
              syncScroll={syncScroll}
              setSyncScroll={setSyncScroll}
              shouldSyncScroll={shouldSyncScroll}
              current={current}
              videoRef={videoRef} setCurrentTime={setCurrentTime} />
          </div>
        )
      }} />
    </div>

  );
}

const Colors = ['#cd1939', '#1954cd']

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
      const names = Object.keys(textMap.reduce((acc, t) => {
        if (t.name) {
          acc[t.name] = 1;
        }
        return acc;
      }, {}))
      console.log(names);
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

  return <Comp videoUrl={videoUrl} textMap={textMap} />
}

export default App;

// https://drive.google.com/file/d/1fHnDbZbVOTN5bb_82440K4s-BSr9i5vx/edit
// https://ayal.github.io/skrit/?textUrl=trans.txt&videoUrl=https%3A%2F%2Frr4---sn-4g5e6nzs.c.drive.google.com%2Fvideoplayback%3Fexpire%3D1662739728%26ei%3DzywbY8DnNfyN_9EPsfiR4AE%26ip%3D85.250.2.53%26cp%3DQVRLVEhfWFdQSVhPOmd5aDE0azJaQlkyRlR5UTBFbnhRRWx3ZjZhTS1GTTlIOFpzdWd5WlVoR1g%26id%3Da8c91a15fb2e995d%26itag%3D22%26source%3Dwebdrive%26requiressl%3Dyes%26ttl%3Dtransient%26susc%3Ddr%26driveid%3D1fHnDbZbVOTN5bb_82440K4s-BSr9i5vx%26app%3Dexplorer%26mime%3Dvideo%2Fmp4%26vprv%3D1%26prv%3D1%26dur%3D4464.686%26lmt%3D1657076801725960%26subapp%3DDRIVE_WEB_FILE_VIEWER%26txp%3D0011224%26sparams%3Dexpire%2Cei%2Cip%2Ccp%2Cid%2Citag%2Csource%2Crequiressl%2Cttl%2Csusc%2Cdriveid%2Capp%2Cmime%2Cvprv%2Cprv%2Cdur%2Clmt%26sig%3DAOq0QJ8wRAIgcjSJkSXs9WTPpsW_al4ubLW4LjwemM4BVKF3XKSl5eQCIHQdI6opysACXiYzJpuPP-0fTYw47GtPUAq4V6_hx1zM%26cpn%3DQA39fYhaC97sGles%26c%3DWEB_EMBEDDED_PLAYER%26cver%3D1.20220907.01.00%26redirect_counter%3D1%26cm2rm%3Dsn-4g5eds76%26req_id%3D795b876124b7a3ee%26cms_redirect%3Dyes%26cmsv%3De%26mh%3DNz%26mm%3D34%26mn%3Dsn-4g5e6nzs%26ms%3Dltu%26mt%3D1662725321%26mv%3Dm%26mvi%3D4%26pl%3D22%26lsparams%3Dmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%26lsig%3DAG3C_xAwRgIhAPSnEKjK-YcuB6zIsXl2pjCj3-bxIC-NDIyY-AkaKD4vAiEA7QZ3bEmTaR8Uj4sf1h90SFUgPWVyg58FKKO9pFNqWiI%253D
// https://ayal.github.io/skrit/?textUrl=trans.txt&videoUrl=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Dview%26id%3D1fHnDbZbVOTN5bb_82440K4s-BSr9i5vx
// https://drive.google.com/uc?export=view&id=1fHnDbZbVOTN5bb_82440K4s-BSr9i5vx
// https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F1fHnDbZbVOTN5bb_82440K4s-BSr9i5vx%2Fpreview

