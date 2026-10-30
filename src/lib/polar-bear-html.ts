import 'server-only';

const characterStyles = `
  .polar-character-image { display:block; max-width:100%; object-fit:contain!important; }
  .polar-inline-bear { display:inline-block; width:1.4em; height:1.4em; object-fit:contain; vertical-align:middle; }
  .banner .bear { width:112px; height:112px; font-size:0; }
  .banner .bear>.polar-character-image { width:100%; height:100%; }
  .growbear { position:relative; display:flex; align-items:center; justify-content:center; height:260px; font-size:0; line-height:1; }
  .growbear>.polar-character-image { width:var(--polar-size,230px); height:var(--polar-size,230px); }
  .growbear[data-polar-level]::after { content:'Lv. ' attr(data-polar-level); position:absolute; right:8px; bottom:8px; padding:6px 10px; border-radius:99px; background:#fff; color:#08784c; font-size:12px; font-weight:800; }
  .growbear[data-polar-level='6']::before { content:'👑'; position:absolute; top:0; left:calc(50% - 18px); font-size:34px; z-index:1; }
  .polar-level-avatar { position:relative; display:flex; align-items:center; justify-content:center; width:62px; height:62px; flex:none; border-radius:17px; background:var(--polar-level-color,#e0f2fe); }
  .polar-level-avatar>.polar-character-image { width:58px; height:58px; }
  .polar-level-avatar[data-polar-locked='true']>.polar-character-image { opacity:.55; }
  .polar-level-avatar[data-polar-locked='true']::after { content:'🔒'; position:absolute; right:-2px; bottom:-2px; font-size:13px; line-height:1; }
  .avatar img { object-fit:contain!important; padding:3px; }
  .visual-hero,.home-hero,.analysis-art,.quiz-scene {
    background-image:url('/polar-bear/wave.png'),linear-gradient(120deg,#f1fbff,#d3f0ff)!important;
    background-position:right 4px center,center!important;
    background-size:auto 96%,cover!important;
    background-repeat:no-repeat!important;
  }
  .home-hero { background-image:url('/polar-bear/cheer.png'),linear-gradient(120deg,#f1fbff,#d3f0ff)!important; }
  .home-hero-copy,.hero-copy { max-width:59%; }
  .analysis-art { background-size:auto 95%,cover!important; }
  .detail-art img { height:105px!important; object-fit:contain!important; }
  .mission-picture img,.quiz-scene-full img { height:100px!important; object-fit:contain!important; }
  .bear-reaction { width:100px; min-width:100px; font-size:0!important; }
  .bear-reaction>.polar-character-image { width:100px; height:100px; }
  .micon>.polar-character-image { width:42px; height:42px; }
`;

export function withPolarBearAssets(html: string) {
  return html
    .replace(
      /data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+/g,
      '/polar-bear/idle.png',
    )
    .replace('</head>', `<style>${characterStyles}</style></head>`)
    .replace(
      '</body>',
      '<script src="/polar-bear/runtime.js"></script></body>',
    );
}
