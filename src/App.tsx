import { useEffect, useRef, useState } from 'react';
import { adventure, choices, complete, groupKey, initialProgress, lessonWords, newSession, parseProgress, readyWords, sessionReducer, STORAGE_KEY, type Action, type LessonSize, type Progress, type Session, type Word } from './lesson';
import { playAudio, stopAudio } from './audio';
import { assetUrl } from './assets';

function Icon({ name, size = 22 }: { name: 'sound' | 'arrow' | 'lock' | 'star' | 'leaf' | 'close' | 'home'; size?: number }) {
  const paths = {
    sound: <><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
    arrow: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
    leaf: <><path d="M20 4C8 2 2 8 6 15c7 5 14-1 14-11ZM4 21 15 10" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Bunny({ small = false }: { small?: boolean }) {
  return <img className={small ? 'bunny small' : 'bunny'} src={assetUrl('/images/bunny.png')} alt={small ? '' : 'Little Bunny waving hello'} />;
}
function WordPicture({ word }: { word: Word }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="picture-error">{word.word}<small>Picture unavailable. Ask a grown-up to reconnect.</small></span> : <img src={assetUrl(word.image)} alt={word.word} onError={() => setFailed(true)} draggable="false" />;
}
function ParentDialog({ progress, onSize, onClose, onReplay, onHome }: { progress: Progress; onSize: (size: LessonSize) => void; onClose: () => void; onReplay: () => void; onHome: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="parent-title">
    <button className="icon-button modal-close" aria-label="Close Parent Corner" onClick={onClose}><Icon name="close" /></button>
    <p className="eyebrow">FOR THE GROWN-UPS</p><h2 id="parent-title">Parent Corner</h2>
    {!unlocked ? <form onSubmit={(event) => { event.preventDefault(); if (answer.trim() === '9') { setUnlocked(true); } else { setGateError(true); } }}>
      <p>A little pause for a grown-up. What is 6 + 3?</p>
      <label htmlFor="grownup-answer">Your answer / Câu trả lời</label>
      <input autoFocus id="grownup-answer" inputMode="numeric" autoComplete="off" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      {gateError && <p role="alert">Please try again.</p>}
      <button className="primary">Open Parent Corner <Icon name="arrow" /></button>
    </form> : <div className="parent-content">
      <p lang="vi">Cùng con học một chút mỗi ngày. Không cần đúng hết để nhận sticker.</p>
      <fieldset><legend>Words per adventure / Số từ mỗi bài</legend><div className="size-options">{([2, 3, 5] as const).map(size => <button key={size} aria-pressed={progress.size === size} disabled={size > readyWords.length} onClick={() => onSize(size)}>{size}<small>{size > readyWords.length ? 'Coming soon' : size === 3 ? 'Default' : 'A little less'}</small></button>)}</div></fieldset>
      <p className="muted" lang="vi">Stage 1 có Spoon, Fork, Bowl. Bài 5 từ sẽ mở khi có đủ nội dung được duyệt. Thay đổi áp dụng cho lần bắt đầu tiếp theo.</p>
      <h3>Learning moments</h3>
      <div className="parent-stats"><span><strong>{progress.completedGroups.length}</strong> completed groups</span><span><strong>{progress.stickers.length}</strong> sticker</span></div>
      <ul className="word-progress">{readyWords.map(w => { const p = progress.encounters[w.id]; return <li key={w.id}><span>{w.word}</span><span>{p?.independent ?? 0} without guidance · {p?.assisted ?? 0} guided</span></li>; })}</ul>
      <p className="muted" lang="vi">Đây là số lượt trong bài, không phải đánh giá thành thạo. Lưu trên trình duyệt này; không đồng bộ giữa các thiết bị. Không thu âm hay gửi tiến độ đến server.</p>
      <h3>Choose today's adventure</h3><p>Kitchen & Dining · Spoon, Fork{progress.size !== 2 ? ', Bowl' : ''}</p>
      <div className="parent-actions"><button className="primary" onClick={onReplay}>Start this adventure <Icon name="arrow" /></button><button className="text-button" onClick={onHome}>End adventure & go home</button></div>
      <p className="muted" lang="vi">Khi đủ bài, app sẽ gợi ý bài tiếp theo. Hiện bài đầu có thể học lại. Người lớn giám sát; dùng đồ vật an toàn. Câu hỏi mở Parent Corner chỉ giúp tránh chạm nhầm, không phải khóa bảo mật.</p>
    </div>}
  </dialog>;
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const actionTime = useRef(0);
  const [parents, setParents] = useState(false);
  const [shelf, setShelf] = useState(false);
  const [vietnamese, setVietnamese] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [mediaState, setMediaState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [offlineReady, setOfflineReady] = useState(false);
  const [offlineFailed, setOfflineFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try { setProgress(parseProgress(localStorage.getItem(STORAGE_KEY))); } catch { setStorageError(true); }
    setStorageReady(true);
    return stopAudio;
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { setStorageError(true); }
  }, [progress, storageReady]);
  const loadImages = () => {
    setMediaState('loading');
    Promise.all([...readyWords.map(w => w.image), '/images/bunny.png'].map(src => new Promise<void>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(); img.onerror = () => reject(); img.src = assetUrl(src);
    }))).then(() => setMediaState('ready')).catch(() => setMediaState('error'));
  };
  useEffect(loadImages, []);
  useEffect(() => {
    const failure = () => setOfflineFailed(true);
    const message = (e: MessageEvent) => { if (e.data?.type === 'OFFLINE_READY') setOfflineReady(true); };
    window.addEventListener('offline-unavailable', failure);
    navigator.serviceWorker?.addEventListener('message', message);
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => registration.active?.postMessage({ type: 'STATUS' }));
    }
    return () => { window.removeEventListener('offline-unavailable', failure); navigator.serviceWorker?.removeEventListener('message', message); };
  }, []);
  useEffect(() => { setVietnamese(false); heading.current?.focus(); }, [session?.phase, session?.index, shelf]);

  async function speak(path: string) { setAudioError(!(await playAudio(path))); }
  function start() {
    if (mediaState !== 'ready' || !storageReady) return;
    const next = newSession(lessonWords(progress.size));
    sessionRef.current = next; setSession(next); setShelf(false); setParents(false); setAudioError(false); actionTime.current = 0;
    void speak('/audio/welcome.wav');
  }
  function act(action: Action) {
    if (Date.now() - actionTime.current < 450) return;
    actionTime.current = Date.now();
    const old = sessionRef.current;
    if (!old) return;
    const next = sessionReducer(old, action);
    if (next === old) return;
    sessionRef.current = next; setSession(next); setVietnamese(false);
    if (next.phase === 'sticker' && old.phase !== 'sticker') setProgress(p => complete(p, next));
    if (next.phase === 'explore') void speak(next.words[next.index].audio);
    else if (next.phase === 'choose') {
      if (action.type === 'answer') void speak(`/audio/${next.result === 'correct' ? 'correct' : next.result === 'assist' ? `assist-${next.words[next.index].id}` : 'retry'}.wav`);
      else void speak(`/audio/choose-${next.words[next.index].id}.wav`);
    } else if (next.phase === 'celebrate') void speak('/audio/celebrate.wav');
    else if (next.phase === 'sticker') void speak('/audio/sticker.wav');
  }
  function home() { stopAudio(); sessionRef.current = null; setSession(null); setShelf(false); setAudioError(false); }
  const words = lessonWords(progress.size);
  const finished = progress.completedGroups.includes(groupKey(words));
  const target = session?.words[session.index];
  const stage = session ? ['welcome', 'explore', 'choose', 'celebrate', 'sticker'].indexOf(session.phase) : -1;

  return <div className="app-shell">
    <header className="header">
      <button className="brand" onClick={() => { if (!session) home(); else setParents(true); }} aria-label="Little English World home"><span className="brand-flower" aria-hidden="true">✿</span><span>little english<strong>world<span className="brand-dot">.</span></strong></span></button>
      <nav aria-label="Main navigation"><button aria-label={`My stickers, ${progress.stickers.length} collected`} className={`nav-stickers ${shelf ? 'active' : ''}`} onClick={() => { if (session) setParents(true); else setShelf(!shelf); }}><Icon name="star" size={19} /><span>My stickers</span><span className="badge">{progress.stickers.length}</span></button><button aria-label="Parents" className="parent-link" onClick={() => { stopAudio(); setParents(true); }}><Icon name="lock" size={17} /><span>Parents</span></button></nav>
    </header>
    <main>
      {!session && !shelf && <>
        <section className="home-hero">
          <div className="hero-copy"><p className="eyebrow"><span className="tiny-dot" /> LITTLE WORDS. LOVELY DISCOVERIES.</p><h1 ref={heading} tabIndex={-1}>A little English.<br /><em>A world of wonder.</em></h1><p className="hero-description">Big discoveries begin with little words.<br />Come explore with Little Bunny.</p><div className="hero-note"><Icon name="leaf" size={18} /> A gentle adventure, at your little one's pace.</div></div>
          <div className="bunny-world"><span className="sparkle sparkle-one" aria-hidden="true">✧</span><span className="sparkle sparkle-two" aria-hidden="true">✦</span><div className="hello-bubble">Hello, little explorer!<span aria-hidden="true">♡</span></div><Bunny /><span className="bunny-label">YOUR LITTLE LEARNING FRIEND</span></div>
        </section>
        <section className="adventure-section" aria-labelledby="adventure-title">
          <div className="section-heading"><div><p className="eyebrow">LET'S DISCOVER TOGETHER</p><h2 id="adventure-title">Your next little adventure</h2></div><span className="session-tag">{words.length} words · a few happy minutes</span></div>
          <div className="adventure-card"><div className="adventure-art" aria-hidden="true"><span className="art-ring" /><img className="hero-spoon" src={assetUrl('/images/spoon.png')} alt="" /><img className="hero-bowl" src={assetUrl('/images/bowl.png')} alt="" /><span className="art-star">✧</span></div><div className="adventure-copy"><span className="topic-tag">ADVENTURE 01 · KITCHEN & DINING</span><h3>Little things.<br />Everyday magic.</h3><p>Meet {words.map(w => w.word.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' & $1')}.<br />Look, listen, and give it a little try.</p><button className="primary start-button" disabled={mediaState !== 'ready' || !storageReady} onClick={start}>{mediaState === 'loading' ? 'Getting ready…' : mediaState === 'error' ? 'Pictures need a moment' : finished ? 'Explore again' : "Let's explore"}<Icon name="arrow" /></button>{mediaState === 'error' && <button className="text-button" onClick={loadImages}>Try loading pictures again</button>}</div><div className="adventure-side"><div className="mini-sticker"><Icon name="star" size={31} /></div><strong>A little adventure.<br />A lovely little sticker.</strong><span>Every try is worth celebrating.</span></div></div>
        </section>
        <section className="journey" aria-label="Adventure steps">{[['01', 'Explore', 'One little word at a time.'], ['02', 'Listen & choose', 'A playful little discovery.'], ['03', 'Celebrate', 'A sticker for every adventure.']].map(([number, title, text]) => <div key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</section>
      </>}

      {!session && shelf && <section className="center-screen"><p className="eyebrow">LITTLE MOMENTS, LOVELY MEMORIES</p><h1 ref={heading} tabIndex={-1}>My sticker garden</h1>{progress.stickers.includes(adventure.stickerId) ? <><div className="sticker-medal"><Bunny small /><Icon name="star" size={38} /></div><h2>Little Chef</h2><p>A happy little kitchen discovery.</p></> : <><div className="empty-sticker"><Icon name="star" size={70} /></div><p>Your first sticker is waiting.<br />Every completed adventure earns one.</p></>}<button className="primary" onClick={() => setShelf(false)}>Let's explore <Icon name="arrow" /></button></section>}

      {session && <>
        <div className="adventure-topbar"><button className="text-button" onClick={() => setParents(true)}><Icon name="home" size={18} /> Grown-up help</button><div className="stage-dots" aria-label={`Adventure stage ${stage + 1} of 5`}>{[0, 1, 2, 3, 4].map(n => <span className={n <= stage ? 'filled' : ''} key={n} />)}</div><span className="topic-name">KITCHEN & DINING</span></div>
        {session.phase === 'welcome' && <section className="center-screen welcome"><p className="eyebrow">A LITTLE ADVENTURE WITH BUNNY</p><Bunny /><h1 ref={heading} tabIndex={-1}>Hello, little explorer!</h1><p>Let's find some kitchen treasures.</p><button className="primary" onClick={() => act({ type: 'continue' })}>Let's go <Icon name="arrow" /></button><button className="text-button" onClick={() => void speak('/audio/welcome.wav')}><Icon name="sound" /> Listen again</button></section>}
        {session.phase === 'explore' && target && <section className="learn-screen"><p className="eyebrow">LOOK, LISTEN, DISCOVER</p><h1 className="screen-title" ref={heading} tabIndex={-1}>Say hello to…</h1><button className="word-card" aria-label={`Hear ${target.word}`} onClick={() => void speak(target.audio)}><WordPicture key={target.id} word={target} /><span className="word-name">{target.word}</span><span className="listen-chip"><Icon name="sound" /> Listen</span></button><div className="word-dots" aria-label={`Word ${session.index + 1} of ${session.words.length}`}>{session.words.map((w, i) => <span key={w.id} className={i === session.index ? 'current' : ''} />)}</div><button className="translation" aria-expanded={vietnamese} onClick={() => setVietnamese(!vietnamese)}>{vietnamese ? <span lang="vi">{target.meaningVi}</span> : 'Tiếng Việt?'}</button><button className="primary continue" onClick={() => act({ type: 'continue' })}>{session.index === session.words.length - 1 ? "Let's play" : 'Keep exploring'}<Icon name="arrow" /></button></section>}
        {session.phase === 'choose' && target && <section className="choose-screen"><p className="eyebrow">LISTEN & CHOOSE · {session.index + 1} OF {session.words.length}</p><h1 ref={heading} tabIndex={-1}>What can you hear?</h1><button className="primary listen-prompt" onClick={() => void speak(`/audio/choose-${target.id}.wav`)}><Icon name="sound" size={26} /> Listen again</button><div className={`choices count-${choices(session).length}`}>{choices(session).map(word => <button key={word.id} className={`choice ${session.result === 'assist' && word.id === target.id ? 'assisted' : ''} ${session.result === 'correct' && word.id === target.id ? 'correct' : ''}`} aria-label={`Choose ${word.word}`} disabled={session.result === 'correct' || (session.result === 'assist' && word.id !== target.id)} onClick={() => act({ type: 'answer', id: word.id })}><WordPicture word={word} />{session.result === 'correct' && word.id === target.id && <span className="correct-check" aria-hidden="true">✓</span>}</button>)}</div><div className="feedback" role="status" aria-live="polite">{session.result !== 'none' && <Bunny small />}<span>{session.result === 'retry' ? "A lovely try. Let's listen again." : session.result === 'assist' ? `Let's do it together. Tap the glowing picture.` : session.result === 'correct' ? 'You found it! Lovely exploring.' : 'Tap a picture.'}</span></div>{session.result === 'correct' ? <button className="primary continue" onClick={() => act({ type: 'continue' })}>Continue <Icon name="arrow" /></button> : <><button className="translation" aria-expanded={vietnamese} onClick={() => setVietnamese(!vietnamese)}>{vietnamese ? <span lang="vi">Tìm {target.meaningVi.toLowerCase()}.</span> : 'Tiếng Việt?'}</button>{session.result === 'assist' && <button className="text-button" onClick={() => void speak(`/audio/assist-${target.id}.wav`)}><Icon name="sound" /> Hear Bunny's help</button>}</>}</section>}
        {session.phase === 'celebrate' && <section className="center-screen celebration"><p className="eyebrow">LITTLE STEPS, BIG DISCOVERIES</p><div className="celebration-art"><span aria-hidden="true">✦</span><Bunny /><span aria-hidden="true">✧</span></div><h1 ref={heading} tabIndex={-1}>You did it!</h1><p>You explored {session.words.length} lovely little words.<br />Bunny loved learning with you.</p><button className="primary" onClick={() => act({ type: 'continue' })}>My sticker <Icon name="star" /></button></section>}
        {session.phase === 'sticker' && <section className="center-screen"><p className="eyebrow">A LITTLE SOMETHING FOR YOUR GARDEN</p><div className="sticker-medal"><Bunny small /><Icon name="star" size={38} /></div><h1 ref={heading} tabIndex={-1}>Little Chef</h1><p>A sticker for your adventure.<br />Every little try helped you grow.</p><p className="saved-note"><Icon name="leaf" size={17} /> {storageError ? 'Sticker earned for this visit' : 'Added to your sticker garden'}</p><button className="primary" onClick={home}>All done <Icon name="home" /></button><span className="rest-note">Time for a happy little break.</span></section>}
      </>}
      {audioError && <p className="notice" role="alert">The sound couldn't play. Tap Listen again, or ask a grown-up to check the volume and connection.</p>}
      {storageError && <p className="notice" role="status">This browser can't save progress. You can still play; progress may be lost when you leave.</p>}
      {offlineFailed && <p className="notice" role="status">Offline setup isn't available yet. Keep this page online.</p>}
    </main>
    <footer><span><span className="footer-flower" aria-hidden="true">✿</span> Made for little curious minds.</span><span>{offlineReady ? 'Ready for offline adventures' : 'Learn together. Grow gently.'}</span></footer>
    {parents && <ParentDialog progress={progress} onSize={size => setProgress(p => ({ ...p, size }))} onClose={() => setParents(false)} onReplay={start} onHome={() => { home(); setParents(false); }} />}
  </div>;
}
