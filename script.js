const SPREADSHEET_ID = "1QQ3pacCHrLiqhtsrheSZ_BopZabrLJ8qGyMZ4btftgs";
const SHEET_TAB_NAME = "Lesson Info (UPDATED)"; 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// SVG placeholder fallback
const DEFAULT_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%231c1c1e'/><text x='50%' y='50%' fill='%23ffffff' font-size='24' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'>🎵</text></svg>";

// --- PLAYLIST CONFIGURATION ---
const playlistData = [
  {
    file: "Dijon - The Dress.mp3",
    title: "The Dress",
    artist: "Dijon",
    album: "Absolutely"
  },
  {
    file: "Lauv - Never Not.mp3",
    title: "Never Not",
    artist: "Lauv",
    album: "I met you when I was 18."
  },
  {
    file: "MAX, HUH YUNJIN - STUPID IN LOVE (feat. HUH YUNJIN of LE SSERAFIM).mp3",
    title: "STUPID IN LOVE",
    artist: "MAX, HUH YUNJIN",
    album: "LOVE IN STEREO"
  },
  {
    file: "MAX, keshi - IT'S YOU (feat. keshi).mp3",
    title: "IT'S YOU (feat. keshi)",
    artist: "MAX, keshi",
    album: "LOVE IN STEREO"
  },
  {
    file: "Mk.gee - I Want.mp3",
    title: "I Want",
    artist: "Mk.gee",
    album: "Two Star & The Dream Police"
  },
  {
    file: "RIIZE - Love 119.mp3",
    title: "Love 119",
    artist: "RIIZE",
    album: "Love 119 - Single"
  },
  {
    file: "starfall - intentions.mp3",
    title: "intentions",
    artist: "starfall",
    album: "alone tonight - EP"
  },
  {
    file: "XG - LEFT RIGHT.mp3",
    title: "LEFT RIGHT",
    artist: "XG",
    album: "SHOOTING STAR"
  },
  {
    file: "Yel - About Last Night...mp3",
    title: "About Last Night...",
    artist: "Yel",
    album: "About Last Night..."
  },
  {
    file: "Yel - GHOST.mp3",
    title: "GHOST",
    artist: "Yel",
    album: "GHOST"
  },
  {
    file: "DIMO REX - SAY MY NAME.mp3",
    title: "SAY MY NAME",
    artist: "DIMO REX",
    album: "ANTIDOTE"
  },
  {
    file: "Ellie Goulding, Diplo, Red Velvet - Close To Me - Red Velvet Remix.mp3",
    title: "Close To Me (Red Velvet Remix)",
    artist: "Ellie Goulding, Diplo, Red Velvet",
    album: "Close To Me"
  },
  {
    file: "ADÉLA - Ain't In LA.mp3",
    title: "Ain't In LA",
    artist: "ADÉLA",
    album: "PRIMA"
  },
  {
    file: "ADÉLA - Nicole Kidman.mp3",
    title: "Nicole Kidman",
    artist: "ADÉLA",
    album: "PRIMA"
  },
  {
    file: "RAPROJECT SIX - Eyes Can't Lie.mp3",
    title: "Eyes Can't Lie",
    artist: "RAPROJECT SIX",
    album: "Eyes Can't Lie"
  },
  {
    file: "RAPROJECT SIX, MADAM SAUCE - Baby 123.mp3",
    title: "Baby 123",
    artist: "RAPROJECT SIX, MADAM SAUCE",
    album: "Baby 123"
  },
  {
    file: "DENY̆, Just Hush, Third Flo' - Alam Ko Na.mp3",
    title: "Alam Ko Na",
    artist: "DENY̆, Just Hush, Third Flo'",
    album: "Alam Ko Na"
  },
  {
    file: "Mariah Deborah - Na Para Bang.mp3",
    title: "Na Para Bang",
    artist: "Mariah Deborah",
    album: "Na Para Bang"
  }
];

let trackMetadataCache = [];

window.onload = function() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 14);
  
  const noteElem = document.getElementById('date-range-note');
  if (noteElem) {
    noteElem.innerHTML = `Displaying lessons from <b>${today.getDate()}${months[today.getMonth()]}</b> to <b>${future.getDate()}${months[future.getMonth()]}</b>`;
  }
  
  initAudioPlaylist();
};

// --- AUDIO PLAYER SYSTEM ---

function initAudioPlaylist() {
  const selectElem = document.getElementById('audio-track-select');
  if (!selectElem) return;

  selectElem.innerHTML = "";
  trackMetadataCache = [];

  playlistData.forEach((track, index) => {
    const trackInfo = {
      index: index,
      url: encodeURIComponent(track.file).replace(/%2F/g, '/'),
      title: track.title,
      artist: track.artist,
      album: track.album,
      coverUrl: track.coverUrl || DEFAULT_COVER
    };

    trackMetadataCache[index] = trackInfo;

    const opt = document.createElement('option');
    opt.value = index;
    opt.text = trackInfo.title;
    selectElem.appendChild(opt);

    if (!track.coverUrl) {
      fetchMetadataFromAPI(index);
    }
  });

  if (trackMetadataCache.length > 0) {
    loadTrackIntoUI(0, false);
  }
}

function fetchMetadataFromAPI(index) {
  const info = trackMetadataCache[index];
  if (!info) return;

  const term = encodeURIComponent(`${info.artist}${info.title}`);
  const queryUrl = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;

  fetch(queryUrl)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        if (result.artworkUrl100) {
          info.coverUrl = result.artworkUrl100.replace('100x100bb', '600x600bb');
        }
        if (result.collectionName) {
          info.album = result.collectionName;
        }
      }
      updateTrackUIIfActive(index);
    })
    .catch(err => {
      console.warn("iTunes API Fetch failed for index", index, err);
    });
}

function updateTrackUIIfActive(index) {
  const selectElem = document.getElementById('audio-track-select');
  if (selectElem && parseInt(selectElem.value, 10) === index) {
    const info = trackMetadataCache[index];
    document.getElementById('track-title').innerText = info.title;
    document.getElementById('track-artist').innerText = info.artist;
    document.getElementById('track-album').innerText = info.album;
    
    const imgElem = document.getElementById('album-art');
    if (imgElem) {
      imgElem.src = info.coverUrl || DEFAULT_COVER;
    }
  }
}

function loadTrackIntoUI(index, autoPlay = false) {
  const player = document.getElementById('main-audio-player');
  const playBtn = document.getElementById('audio-play-btn');
  const selectElem = document.getElementById('audio-track-select');
  const info = trackMetadataCache[index];

  if (!info) return;

  document.getElementById('track-title').innerText = info.title;
  document.getElementById('track-artist').innerText = info.artist;
  document.getElementById('track-album').innerText = info.album;
  
  const imgElem = document.getElementById('album-art');
  if (imgElem) {
    imgElem.onerror = function() {
      this.onerror = null;
      this.src = DEFAULT_COVER;
    };
    imgElem.src = info.coverUrl || DEFAULT_COVER;
  }

  selectElem.value = index;
  player.src = info.url;

  if (autoPlay) {
    player.play().then(() => {
      if (playBtn) playBtn.innerText = '⏸';
    }).catch(e => {
      console.warn("Autoplay blocked:", e);
    });
  }
}

function toggleAudioPlay() {
  const player = document.getElementById('main-audio-player');
  const playBtn = document.getElementById('audio-play-btn');
  const selectElem = document.getElementById('audio-track-select');

  if (!player.src || player.src === "" || player.src.endsWith('/')) {
    loadTrackIntoUI(selectElem.value || 0, true);
    return;
  }

  if (player.paused) {
    player.play();
    playBtn.innerText = '⏸';
  } else {
    player.pause();
    playBtn.innerText = '▶';
  }
}

function onTrackSelectChange(selectElem) {
  const selectedIndex = parseInt(selectElem.value, 10);
  loadTrackIntoUI(selectedIndex, true);
}

function setAudioVolume(val) {
  const player = document.getElementById('main-audio-player');
  player.volume = val;
}

document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('main-audio-player');
  const selectElem = document.getElementById('audio-track-select');
  const playBtn = document.getElementById('audio-play-btn');

  if (player) {
    player.addEventListener('ended', () => {
      let nextIndex = parseInt(selectElem.value, 10) + 1;

      if (nextIndex < playlistData.length) {
        loadTrackIntoUI(nextIndex, true);
      } else {
        if (playBtn) playBtn.innerText = '▶';
      }
    });
  }
});

// --- GOOGLE SHEETS & LESSON TRACKER FUNCTIONS ---

function confirmMaterial(url, materialName, timeStr, studentName, area) {
  if (!url || url === '#' || url.trim() === '') return;

  Swal.fire({
    title: 'Material Check',
    html: `
      <p style="font-size: 13px; margin-bottom: 8px; color: #1c1c1e; font-weight: 600;">
        You are going to use <b>"${materialName}"</b><br>
        for your <b>${timeStr}</b> lesson with <b>${studentName}</b> (${area}).
      </p>
      <div style="
        background: #f2f2f7; 
        padding: 8px; 
        border-radius: 8px; 
        word-break: break-all; 
        font-family: monospace;
