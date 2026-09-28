function enhancePerformance() {
  const section = document.querySelector<HTMLElement>('[data-performances]');
  const screen = document.querySelector<HTMLElement>('[data-performance]');
  const play = screen?.querySelector<HTMLButtonElement>('[data-performance-play]');
  const image = screen?.querySelector<HTMLImageElement>('[data-performance-image]');
  const title = section?.querySelector<HTMLElement>('[data-performance-title]');
  const artist = section?.querySelector<HTMLElement>('[data-performance-artist]');
  const detail = section?.querySelector<HTMLElement>('[data-performance-detail]');
  const external = section?.querySelector<HTMLAnchorElement>('[data-performance-external]');
  const position = section?.querySelector<HTMLElement>('[data-performance-position]');
  const controls = section?.querySelector<HTMLElement>('[data-performance-controls]');
  if (!section || !screen || !play || !image || !title || !artist || !detail || !external || !position || !controls) return;
  const selections: { id: string; title: string; artist: string; detail: string }[] = JSON.parse(section.dataset.performances || '[]');
  if (!selections.length) return;
  let current = 0;
  let suppressClickUntil = 0;
  type VideoPlayer = { destroy: () => void };
  type VideoAPI = { Player: new (frame: HTMLIFrameElement, config: { events: { onReady: () => void; onError: (event: { data: number }) => void } }) => VideoPlayer };
  const videoWindow = window as typeof window & { YT?: VideoAPI; onYouTubeIframeAPIReady?: () => void };
  let player: VideoPlayer | null = null;
  let request = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let apiPromise: Promise<VideoAPI> | null = null;
  const errorMessage = section.querySelector<HTMLElement>('[data-performance-error]');
  const loadAPI = () => {
    if (videoWindow.YT?.Player) return Promise.resolve(videoWindow.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise<VideoAPI>((resolve, reject) => {
      const previousReady = videoWindow.onYouTubeIframeAPIReady;
      videoWindow.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (videoWindow.YT?.Player) resolve(videoWindow.YT);
        else reject(new Error('Player unavailable'));
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => reject(new Error('Player could not load'));
      document.head.append(script);
    });
    return apiPromise;
  };
  const stop = () => {
    section.classList.remove('has-video');
    request++;
    clearTimeout(timer);
    const frame = screen.querySelector('iframe');
    const hadFocus = frame === document.activeElement;
    player?.destroy();
    player = null;
    frame?.remove();
    play.hidden = false;
    if (errorMessage) { errorMessage.hidden = true; errorMessage.textContent = ''; }
    if (hadFocus) play.focus({ preventScroll: true });
  };
  const move = (index: number) => {
    stop();
    current = (index + selections.length) % selections.length;
    const item = selections[current];
    image.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
    image.alt = `${item.title} by ${item.artist}`;
    title.textContent = item.title;
    artist.textContent = item.artist;
    detail.textContent = item.detail;
    external.href = `https://www.youtube.com/watch?v=${item.id}`;
    external.setAttribute('aria-label', `Watch ${item.title} on YouTube`);
    play.setAttribute('aria-label', `Play ${item.title} by ${item.artist}`);
    position.textContent = `${current + 1} / ${selections.length}`;
  };
  controls.hidden = false;
  section.querySelector('[data-performance-previous]')?.addEventListener('click', () => move(current - 1));
  section.querySelector('[data-performance-next]')?.addEventListener('click', () => move(current + 1));
  section.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let start: { x: number; y: number } | null = null;
  section.addEventListener('touchstart', event => {
    const touch = event.touches[0];
    start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  }, { passive: true });
  section.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      suppressClickUntil = Date.now() + 500;
      move(current + (dx < 0 ? 1 : -1));
    }
    start = null;
  }, { passive: true });
  section.addEventListener('touchcancel', () => { start = null; });
  play.addEventListener('click', async () => {
    if (Date.now() < suppressClickUntil) return;
    stop();
    const activeRequest = request;
    const item = selections[current];
    const fail = (code?: number) => {
      if (request !== activeRequest) return;
      stop();
      if (!errorMessage) return;
      errorMessage.hidden = false;
      errorMessage.textContent = code === 153
        ? 'YouTube cannot identify this browser for embedded playback (153). Use Watch externally below.'
        : code === 101 || code === 150
          ? 'This upload does not allow embedded playback. Use Watch externally below.'
          : `YouTube could not play this video${code ? ` (${code})` : ' in this browser'}. Try again or use Watch externally below.`;
    };
    document.querySelector<HTMLAudioElement>('[data-station-player] audio')?.pause();
    const frame = document.createElement('iframe');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const embed = new URL(`https://www.youtube.com/embed/${item.id}`);
    embed.search = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0', enablejsapi: '1', origin: window.location.origin }).toString();
    frame.src = embed.href;
    frame.title = `${item.artist} - ${item.title}`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    play.hidden = true;
    screen.append(frame);
    section.classList.add('has-video');
    frame.focus();
    timer = setTimeout(() => fail(), 20000);
    try {
      const api = await loadAPI();
      if (request !== activeRequest) return;
      player = new api.Player(frame, { events: {
        onReady: () => { if (request === activeRequest) clearTimeout(timer); },
        onError: event => fail(event.data),
      } });
    } catch { fail(); }
  });
  document.addEventListener('station-start', stop);
  window.addEventListener('pagehide', stop);
}

function enhanceStation() {
  const player = document.querySelector<HTMLElement>('[data-station-player]');
  const audio = player?.querySelector<HTMLAudioElement>('audio');
  const button = player?.querySelector<HTMLButtonElement>('[data-station-toggle]');
  const message = player?.querySelector<HTMLElement>('[data-station-message]');
  const label = button?.querySelector<HTMLElement>('[data-station-label]');
  if (!player || !audio || !button || !message || !label) return;
  let fallback = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const sync = () => {
    clearTimeout(timeout);
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    button.disabled = false;
    label.textContent = fallback ? 'Open WWOZ' : playing ? 'Pause' : 'Play';
    player.classList.toggle('has-fallback', fallback);
    button.removeAttribute('aria-busy');
    button.setAttribute('aria-label', fallback ? 'Open the WWOZ live player' : `${playing ? 'Pause' : 'Play'} WWOZ 90.7 FM`);
    button.setAttribute('aria-pressed', String(playing));
  };
  const fail = () => {
    fallback = true;
    audio.pause();
    message.textContent = 'Stream unavailable. Listen on WWOZ.';
    sync();
  };
  button.addEventListener('click', async () => {
    if (fallback) { window.open('https://www.wwoz.org/listen/player/', '_blank', 'noopener,noreferrer'); return; }
    if (!audio.paused) { audio.pause(); return; }
    document.dispatchEvent(new Event('station-start'));
    button.disabled = true;
    label.textContent = 'Connecting';
    button.setAttribute('aria-busy', 'true');
    message.textContent = '';
    timeout = setTimeout(fail, 12000);
    try { await audio.play(); } catch { fail(); }
  });
  audio.addEventListener('playing', () => {
    if (fallback) { audio.pause(); return; }
    sync();
  });
  audio.addEventListener('pause', sync);
  audio.addEventListener('waiting', () => player.classList.remove('is-playing'));
  audio.addEventListener('stalled', () => player.classList.remove('is-playing'));
  audio.addEventListener('ended', sync);
  audio.addEventListener('error', fail);
  window.addEventListener('pagehide', () => audio.pause());
}

function enhanceInterestTabs() {
  const navigation = document.querySelector<HTMLElement>('[data-interest-tabs]');
  if (!navigation) return;
  const tabs = Array.from(navigation.querySelectorAll<HTMLButtonElement>('[data-interest-tab]'));
  const panels = tabs.map(tab => document.getElementById(tab.dataset.interestTab || ''));
  if (panels.some(panel => !panel)) return;
  const select = (index: number, updateAddress = false) => {
    document.querySelector<HTMLAudioElement>('[data-station-player] audio')?.pause();
    document.dispatchEvent(new Event('station-start'));
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      const panel = panels[i]!;
      panel.hidden = i !== index;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
    });
    if (updateAddress) history.replaceState(null, '', `#${tabs[index].dataset.interestTab}`);
  };
  const fromAddress = () => {
    const hash = location.hash.slice(1);
    const id = hash === 'performance-title' || hash === 'listening-title' ? 'listening-panel' : hash === 'readings-title' ? 'readings' : hash;
    const index = tabs.findIndex(tab => tab.dataset.interestTab === id);
    select(index < 0 ? 0 : index);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index, true));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next, true);
      tabs[next].focus();
    });
  });
  navigation.hidden = false;
  navigation.closest('.interests-page')?.classList.add('has-interest-tabs');
  fromAddress();
  window.addEventListener('hashchange', fromAddress);
}

function enhance() {
  enhancePerformance();
  enhanceStation();
  enhanceInterestTabs();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
else enhance();
