const SPREADSHEET_ID = "1QQ3pacCHrLiqhtsrheSZ_BopZabrLJ8qGyMZ4btftgs";
const SHEET_TAB_NAME = "Lesson Info (UPDATED)"; 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ADD ALL YOUR MP3 FILENAMES HERE
const playlistFiles = [
  "Yel%20-%20GHOST.mp3",
  "BROCKHAMPTON%20-%20SUMMER.mp3",
  "BROCKHAMPTON%20-%20WASTE.mp3",
  "Dijon%20-%20The%20Dress.mp3",
  "Lauv%20-%20Never%20Not.mp3",
  "MAX%2C%20HUH%20YUNJIN%20-%20STUPID%20IN%20LOVE.mp3",
  "MAX%2C%20keshi%20-%20IT%27S%20YOU%20%28feat.%20keshi%29.mp3",
  "Mk.gee%20-%20I%20Want.mp3",
  "RIIZE%20-%20Love%20119.mp3",
  "XG%20-%20LEFT%20RIGHT.mp3",
  "Yel%20-%20About%20Last%20Night...mp3",
];

// Fallback image if MP3 has no embedded album cover art
const DEFAULT_COVER = "JP%20Logo.png";

let trackMetadataCache = [];

window.onload = function() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 14);
  document.getElementById('date-range-note').innerHTML = `Displaying lessons from <b>${today.getDate()} ${months[today.getMonth()]}</b> to <b>${future.getDate()} ${months[future.getMonth()]}</b>`;
  
  // Load playlist and extract MP3 metadata
  initAudioPlaylist();
};

// --- AUDIO PLAYER & MP3 METADATA SYSTEM ---

function initAudioPlaylist() {
  const selectElem = document.getElementById('audio-track-select');
  if (!selectElem) return;

  selectElem.innerHTML = "";
  trackMetadataCache = [];

  let loadedCount = 0;

  playlistFiles.forEach((fileUrl, index) => {
    // Default fallback object
    const trackInfo = {
      index: index,
      url: fileUrl,
      title: decodeURIComponent(fileUrl).replace(/\.mp3$/i, ''),
      artist: "Unknown Artist",
      album: "Unknown Album",
      coverUrl: DEFAULT_COVER
    };

    trackMetadataCache[index] = trackInfo;

    // Read ID3 metadata using jsmediatags
    if (window.jsmediatags) {
      window.jsmediatags.read(fileUrl, {
        onSuccess: function(tag) {
          const tags = tag.tags;
          if (tags.title) trackInfo.title = tags.title;
          if (tags.artist) trackInfo.artist = tags.artist;
          if (tags.album) trackInfo.album = tags.album;

          // Extract embedded album cover art image data
          if (tags.picture) {
            const picture = tags.picture;
            let base64String = "";
            for (let i = 0; i < picture.data.length; i++) {
              base64String += String.fromCharCode(picture.data[i]);
            }
            const base64 = "data:" + picture.format + ";base64," + window.btoa(base64String);
            trackInfo.coverUrl = base64;
          }

          updateTrackOptionUI(index);
          loadedCount++;
          if (index === 0) loadTrackIntoUI(0);
        },
        onError: function(error) {
          console.warn("Could not read ID3 metadata for:", fileUrl, error);
          updateTrackOptionUI(index);
          loadedCount++;
          if (index === 0) loadTrackIntoUI(0);
        }
      });
    } else {
      updateTrackOptionUI(index);
      if (index === 0) loadTrackIntoUI(0);
    }
  });
}

function updateTrackOptionUI(index) {
  const selectElem = document.getElementById('audio-track-select');
  const info = trackMetadataCache[index];
  
  let opt = selectElem.options[index];
  if (!opt) {
    opt = document.createElement('option');
    opt.value = index;
    selectElem.appendChild(opt);
  }
  opt.text = info.title;
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
  document.getElementById('album-art').src = info.coverUrl;

  selectElem.selectedIndex = index;
  player.src = info.url;

  if (autoPlay) {
    player.play();
    if (playBtn) playBtn.innerText = '⏸';
  }
}

function toggleAudioPlay() {
  const player = document.getElementById('main-audio-player');
  const playBtn = document.getElementById('audio-play-btn');
  const selectElem = document.getElementById('audio-track-select');

  if (!player.src || player.src === "" || player.src.endsWith('/')) {
    loadTrackIntoUI(selectElem.selectedIndex || 0);
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
  const player = document.getElementById('main-audio-player');
  const wasPlaying = !player.paused;

  loadTrackIntoUI(selectedIndex, wasPlaying);
}

function setAudioVolume(val) {
  const player = document.getElementById('main-audio-player');
  player.volume = val;
}

// Automatically play the next song when finished, and stop at the end of the playlist
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('main-audio-player');
  const selectElem = document.getElementById('audio-track-select');
  const playBtn = document.getElementById('audio-play-btn');

  if (player) {
    player.addEventListener('ended', () => {
      let nextIndex = selectElem.selectedIndex + 1;

      if (nextIndex < playlistFiles.length) {
        loadTrackIntoUI(nextIndex, true);
      } else {
        // Stop playback at end of playlist
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
