const SPREADSHEET_ID = "1QQ3pacCHrLiqhtsrheSZ_BopZabrLJ8qGyMZ4btftgs";
const SHEET_TAB_NAME = "Lesson Info (UPDATED)"; 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// SVG placeholder fallback
const DEFAULT_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%231c1c1e'/><text x='50%' y='50%' fill='%23ffffff' font-size='24' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'>🎵</text></svg>";

// --- PLAYLIST CONFIGURATION ---
const playlistData = [
  {
    file: "BROCKHAMPTON - SUMMER.mp3",
    title: "SUMMER",
    artist: "BROCKHAMPTON",
    album: "SATURATION II",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/23/Saturation_II.jpg"
  },
  {
    file: "BROCKHAMPTON - WASTE.mp3",
    title: "WASTE",
    artist: "BROCKHAMPTON",
    album: "SATURATION",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/7/70/Saturation_-_Brockhampton.jpg"
  },
  {
    file: "Dijon - The Dress.mp3",
    title: "The Dress",
    artist: "Dijon",
    album: "Absolutely",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4a/1b/9d/4a1b9d4e-b83c-15ba-87a4-a9578dd35f52/054391942074.jpg/600x600bb.jpg"
  },
  {
    file: "Lauv - Never Not.mp3",
    title: "Never Not",
    artist: "Lauv",
    album: "I met you when I was 18.",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e0/f8/f3/e0f8f30d-271d-5a9a-7622-6b957e849ea2/191773950227.jpg/600x600bb.jpg"
  },
  {
    file: "MAX, HUH YUNJIN - STUPID IN LOVE.mp3",
    title: "STUPID IN LOVE",
    artist: "MAX, HUH YUNJIN",
    album: "LOVE IN STEREO",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/79/f9/c279f911-3837-1d6f-7067-175a02e621f8/5054197945033.jpg/600x600bb.jpg"
  },
  {
    file: "MAX, keshi - IT'S YOU (feat. keshi).mp3",
    title: "IT'S YOU (feat. keshi)",
    artist: "MAX, keshi",
    album: "LOVE IN STEREO",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/79/f9/c279f911-3837-1d6f-7067-175a02e621f8/5054197945033.jpg/600x600bb.jpg"
  },
  {
    file: "Mk.gee - I Want.mp3",
    title: "I Want",
    artist: "Mk.gee",
    album: "Two Star & The Dream Police",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4e/d8/56/4ed856b3-96cb-8457-30e7-9d76c9efbc99/5054197920801.jpg/600x600bb.jpg"
  },
  {
    file: "RIIZE - Love 119.mp3",
    title: "Love 119",
    artist: "RIIZE",
    album: "Love 119 - Single",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/66/be/e0/64bee0fa-5a8a-e991-b3b3-294b63ff5cb2/198391307137.jpg/600x600bb.jpg"
  },
  {
    file: "starfall - intentions.mp3",
    title: "intentions",
    artist: "starfall",
    album: "alone tonight - EP",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ef33a38a7c1dd30ef65e1d3e"
  },
  {
    file: "XG - LEFT RIGHT.mp3",
    title: "LEFT RIGHT",
    artist: "XG",
    album: "SHOOTING STAR",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/e6/5d/21/e65d210d-2b47-66a9-4b62-11ef8d70bdce/197188177579.jpg/600x600bb.jpg"
  },
  {
    file: "Yel - About Last Night...mp3",
    title: "About Last Night...",
    artist: "Yel",
    album: "About Last Night...",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b27393d258dd61f0efcb6c9a3d46"
  },
  {
    file: "Yel - GHOST.mp3",
    title: "GHOST",
    artist: "Yel",
    album: "GHOST",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273efbc6b8bf5bc73a118e69d7b"
  }
];

let trackMetadataCache = [];

window.onload = function() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 14);
  
  const noteElem = document.getElementById('date-range-note');
  if (noteElem) {
    noteElem.innerHTML = `Displaying lessons from <b>${today.getDate()} ${months[today.getMonth()]}</b> to <b>${future.getDate()} ${months[future.getMonth()]}</b>`;
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
  });

  if (trackMetadataCache.length > 0) {
    loadTrackIntoUI(0, false);
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
  
  imgElem.referrerPolicy = "no-referrer";
  
  imgElem.onerror = function() {
    this.onerror = null;
    this.src = DEFAULT_COVER;
  };
  
  imgElem.src = info.coverUrl;

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
        font-size: 11px; 
        color: #0056b3; 
        border: 1px solid #c7c7cc;
        text-align: left;
        font-weight: 700;
        margin-top: 10px;
      ">
        ${url}
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#fbbc04',
    confirmButtonText: '<span style="color:#000; font-weight:700;">OK, Open it</span>',
    cancelButtonText: 'Cancel'
  }).then((result) => { 
    if (result.isConfirmed) window.open(url, '_blank'); 
  });
}

function confirmMeeting(url, timeStr, studentName, area) {
  if (!url || url === '#' || url.trim() === '') return;

  Swal.fire({
    title: 'Meeting Link Check',
    html: `
      <p style="font-size: 13px; margin-bottom: 8px; color: #1c1c1e; font-weight: 600;">
        Please double check the destination URL before entering your <b>${timeStr}</b> lesson with <b>${studentName}</b> (${area}):
      </p>
      <div style="
        background: #f2f2f7; 
        padding: 10px; 
        border-radius: 8px; 
        word-break: break-all; 
        font-family: monospace; 
        font-size: 11px; 
        color: #0056b3; 
        border: 1px solid #c7c7cc;
        text-align: left;
        font-weight: 700;
        margin-top: 10px;
      ">
        ${url}
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#34c759',
    cancelButtonColor: '#8e8e93',
    confirmButtonText: 'Join Meeting',
    cancelButtonText: 'Cancel'
  }).then((result) => { 
    if (result.isConfirmed) window.open(url, '_blank'); 
  });
}

function confirmGenericLink(url, label) {
  if (!url || url === '#' || url.trim() === '') return;

  Swal.fire({
    title: 'Link Check',
    html: `
      <p style="font-size: 13px; margin-bottom: 8px; color: #1c1c1e; font-weight: 600;">
        Opening destination for <b>${label}</b>:
      </p>
      <div style="
        background: #f2f2f7; 
        padding: 8px; 
        border-radius: 8px; 
        word-break: break-all; 
        font-family: monospace; 
        font-size: 11px; 
        color: #0056b3; 
        border: 1px solid #c7c7cc;
        text-align: left;
        font-weight: 700;
        margin-top: 10px;
      ">
        ${url}
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#007aff',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Proceed'
  }).then((result) => { 
    if (result.isConfirmed) window.open(url, '_blank'); 
  });
}

function parseSheetDate(rawDateStr) {
  if (!rawDateStr) return null;
  const match = String(rawDateStr).match(/^(\d{1,2})\/([A-Za-z]+)/);
  if (match) {
    const day = parseInt(match[1]);
    const monthName = match[2];
    const monthIdx = months.findIndex(m => m.toLowerCase().startsWith(monthName.toLowerCase()));
    if (monthIdx !== -1) {
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, monthIdx, day);
    }
  }
  return null;
}

async function fetchCellB1Url() {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TAB_NAME)}&tqx=out:csv&range=B1:F1`;
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    const match = text.match(/https?:\/\/[^\s"',\)\n]+/i);
    return match ? match[0] : "";
  } catch (e) {
    console.error("Failed to fetch B1 URL:", e);
    return "";
  }
}

async function doSearch() {
  const q = document.getElementById('q').value.trim();
  if (!q) return;

  Swal.fire({ title: 'Searching...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  const cloudLink = await fetchCellB1Url();
  const testUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_TAB_NAME)}&tqx=out:json`;

  try {
    const response = await fetch(testUrl);
    const text = await response.text();
    
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
    
    if (!jsonMatch) {
      Swal.fire({ icon: 'error', title: 'Connection Blocked', text: 'Google Sheets returned an unreadable response.' });
      return;
    }

    const gvizData = JSON.parse(jsonMatch[1]);
    
    if (gvizData.status === "error") {
      Swal.fire({ icon: 'error', title: 'Google Sheet Error', text: gvizData.errors[0].detailed_message });
      return;
    }

    const allRows = gvizData.table.rows;

    if (!allRows || allRows.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sheet Tab is Empty', text: `No rows were found on tab "${SHEET_TAB_NAME}".` });
      return;
    }

    const search = q.trim().toLowerCase();
    const matchedRows = [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const twoWeeksEnd = new Date();
    twoWeeksEnd.setDate(todayStart.getDate() + 14);
    twoWeeksEnd.setHours(23, 59, 59, 999);

    allRows.forEach(r => {
      if (!r.c) return;

      const rowVals = r.c.map(cell => (cell ? (cell.f || cell.v || "") : ""));
      const teacher = String(rowVals[12] || "").trim().toLowerCase();

      if (teacher === search) {
        const lessonDate = parseSheetDate(rowVals[0]);

        if (lessonDate && lessonDate >= todayStart && lessonDate <= twoWeeksEnd) {
          const studentGroup = String(rowVals[9] || "").trim();
          const userId = String(rowVals[10] || "").trim();
          const password = String(rowVals[11] || "").trim();
          
          const isJpBackup = studentGroup.toLowerCase().includes("jp back up");
          
          let finalCloudLink = cloudLink;
          if (isJpBackup || !userId || !password) {
            finalCloudLink = "-";
          }

          matchedRows.push([
            rowVals[0],     // 0: DATE
            rowVals[1],     // 1: ACCESS
            rowVals[2],     // 2: START
            rowVals[3],     // 3: END
            rowVals[4],     // 4: LESSON TYPE
            rowVals[5],     // 5: Area (BoE)
            rowVals[6],     // 6: SCHOOL
            rowVals[7],     // 7: GRADE
            rowVals[8],     // 8: CLASS
            rowVals[9],     // 9: STUDENT'S NAME
            rowVals[10],    // 10: USER ID
            rowVals[11],    // 11: PASSWORD
            rowVals[12],    // 12: TEACHER'S NAME
            finalCloudLink, // 13: TEACHER'S CLOUD LINK
            rowVals[13],    // 14: MATERIAL
            rowVals[14],    // 15: MATERIAL URL
            rowVals[15],    // 16: FEEDBACK LINK
            rowVals[16]     // 17: MEETING LINK
          ]);
        }
      }
    });

    if (matchedRows.length === 0) {
      Swal.fire({ 
        icon: 'info', 
        title: 'No Lessons Found', 
        text: `No lessons found for "${q}" within the next 2 weeks on tab "${SHEET_TAB_NAME}".` 
      });
      document.getElementById('results').innerHTML = "";
      return;
    }

    Swal.close();
    render(matchedRows);

  } catch (err) {
    console.error("Fetch Error:", err);
    Swal.fire({ 
      icon: 'error', 
      title: 'Access Denied / Network Error', 
      text: 'Make sure your Google Sheet access is set to "Anyone with the link can view".' 
    });
  }
}

function render(rows) {
  const now = new Date();
  
  const headers = [
    "STATUS", "DATE", "ACCESS", "START", "END", "LESSON TYPE", 
    "Area (BoE)", "SCHOOL", "GRADE", "CLASS", "STUDENT'S NAME / MEETING GROUP", 
    "USER ID", "PASSWORD", "TEACHER'S NAME", "TEACHER'S CLOUD LINK", 
    "MATERIAL", "MATERIAL URL", "FEEDBACK LINK", "MEETING LINK"
  ];

  let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

  rows.forEach((r, rowIndex) => {
    const rawDateStr = String(r[0]); 
    let lessonEnd = new Date();

    const lessonDateObj = parseSheetDate(rawDateStr);
    if (lessonDateObj) {
      const endHour = r[3] ? parseInt(String(r[3]).split(':')[0]) : 0;
      const endMin = r[3] ? parseInt(String(r[3]).split(':')[1]) : 0;
      lessonEnd = new Date(lessonDateObj.getFullYear(), lessonDateObj.getMonth(), lessonDateObj.getDate(), endHour, endMin);
    }

    const fullTimeStr = `${r[1]} ${r[2]}~${r[3]}`;
    const isFinished = lessonEnd < now;
    const rowClass = isFinished ? 'class="finished-row"' : '';
    const badge = isFinished ? '<span class="badge badge-finished">FINISHED</span>' : '<span class="badge badge-upcoming">UPCOMING</span>';

    html += `<tr ${rowClass}><td>${badge}</td>`;

    r.forEach((cell, i) => {
      let content = String(cell || "").trim();
      const boldClass = (i >= 0 && i <= 3) ? 'class="bold-col"' : '';

      if (i === 13) { 
        if (content.startsWith('http')) {
          const btnId = `cloud-btn-${rowIndex}`;
          html += `<td><button id="${btnId}" class="btn-link">LINK</button></td>`;
          setTimeout(() => {
            const btn = document.getElementById(btnId);
            if (btn) btn.onclick = () => confirmMeeting(content, fullTimeStr, r[9], r[5]);
          }, 0);
        } else {
          html += `<td>-</td>`;
        }
      } else if (i === 15) { 
        if (isFinished) {
          html += `<td><span class="btn-link btn-disabled">CLOSED</span></td>`;
        } else if (content) {
          const urls = content.match(/https?:\/\/[^\s]+/g);
          if (urls && urls.length > 0) {
            let cellId = `material-cell-${rowIndex}`;
            html += `<td id="${cellId}"></td>`;
            setTimeout(() => {
              const cellTd = document.getElementById(cellId);
              if (cellTd) {
                cellTd.innerHTML = '';
                urls.forEach((u, idx) => {
                  const cleanUrl = u.trim().replace(/['"]/g, '');
                  const btn = document.createElement('button');
                  btn.className = 'btn-link';
                  btn.style.cssText = 'margin: 3px 0; display: block;';
                  btn.innerText = `OPEN ${idx + 1}`;
                  btn.onclick = () => confirmMaterial(cleanUrl, r[14] || 'Material', fullTimeStr, r[9], r[5]);
                  cellTd.appendChild(btn);
                });
              }
            }, 0);
          } else {
            html += `<td>-</td>`;
          }
        } else {
          html += `<td>-</td>`;
        }
      } else if (i === 16) { 
        if (content.startsWith('http')) {
          const btnId = `feedback-btn-${rowIndex}`;
          html += `<td><button id="${btnId}" class="btn-link">OPEN</button></td>`;
          setTimeout(() => {
            const btn = document.getElementById(btnId);
            if (btn) btn.onclick = () => confirmGenericLink(content, 'Feedback Link');
          }, 0);
        } else {
          html += `<td>No Feedback</td>`;
        }
      } else if (i === 17) { 
        if (content.startsWith('http')) {
          const btnId = `urllink-btn-${rowIndex}`;
          html += `<td><button id="${btnId}" class="btn-link">OPEN</button></td>`;
          setTimeout(() => {
            const btn = document.getElementById(btnId);
            if (btn) btn.onclick = () => confirmGenericLink(content, 'Meeting Link');
          }, 0);
        } else {
          html += `<td>-</td>`;
        }
      } else if (content.startsWith('http')) { 
        const btnId = `generic-btn-${rowIndex}-${i}`;
        html += `<td><button id="${btnId}" class="btn-link">LINK</button></td>`;
        setTimeout(() => {
          const btn = document.getElementById(btnId);
          if (btn) btn.onclick = () => confirmMeeting(content, fullTimeStr, r[9], r[5]);
        }, 0);
      } else { 
        html += `<td ${boldClass}>${content || "-"}</td>`; 
      }
    });
    html += '</tr>';
  });
  document.getElementById('results').innerHTML = html + '</tbody></table>';
}
