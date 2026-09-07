const SPREADSHEET_ID = "1QQ3pacCHrLiqhtsrheSZ_BopZabrLJ8qGyMZ4btftgs";
const SHEET_TAB_NAME = "Lesson Info (UPDATED)"; 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

window.onload = function() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 14);
  document.getElementById('date-range-note').innerHTML = `Displaying lessons from <b>${today.getDate()} ${months[today.getMonth()]}</b> to <b>${future.getDate()} ${months[future.getMonth()]}</b>`;
};

// Confirmation modal for materials
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

// Confirmation modal for meeting links (Zoom/Teams/Portals)
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

// Generic link confirmation for generic or raw links
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

// Helper to parse date text like "07/September(Mon)" into a JavaScript Date object
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

async function doSearch() {
  const q = document.getElementById('q').value.trim();
  if (!q) return;

  Swal.fire({ title: 'Searching...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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

    // Retrieve Teacher Login URL from Cell B1 (Row index 0, Col B)
    let cloudLink = "";
    if (allRows[0] && allRows[0].c && allRows[0].c[1]) {
      cloudLink = allRows[0].c[1].v || allRows[0].c[1].f || "";
    }

    const search = q.trim().toLowerCase();
    const matchedRows = [];

    // Define 2-week date range boundary (Today at 00:00 to Today + 14 Days at 23:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const twoWeeksEnd = new Date();
    twoWeeksEnd.setDate(todayStart.getDate() + 14);
    twoWeeksEnd.setHours(23, 59, 59, 999);

    allRows.forEach(r => {
      if (!r.c) return;
      const rowVals = r.c.map(cell => (cell ? (cell.f || cell.v || "") : ""));
      
      // Column M is index 12 (Teacher's name)
      const teacher = String(rowVals[12] || "").trim().toLowerCase();

      if (teacher === search) {
        const lessonDate = parseSheetDate(rowVals[0]);

        // Filter: Only include row if date is valid AND falls within the 2-week range
        if (lessonDate && lessonDate >= todayStart && lessonDate <= twoWeeksEnd) {
          matchedRows.push([
            rowVals[0],  // DATE (Col A) -> Index 0
            rowVals[1],  // ACCESS (Col B) -> Index 1
            rowVals[2],  // START (Col C) -> Index 2
            rowVals[3],  // END (Col D) -> Index 3
            rowVals[4],  // LESSON TYPE (Col E) -> Index 4
            rowVals[5],  // Area (BoE) (Col F) -> Index 5
            rowVals[6],  // SCHOOL (Col G) -> Index 6
            rowVals[7],  // GRADE (Col H) -> Index 7
            rowVals[8],  // CLASS (Col I) -> Index 8
            rowVals[9],  // STUDENT'S NAME / MEETING GROUP (Col J) -> Index 9
            rowVals[10], // USER ID (Col K) -> Index 10
            rowVals[11], // PASSWORD (Col L) -> Index 11
            rowVals[12], // TEACHER'S NAME (Col M) -> Index 12
            cloudLink,   // TEACHER'S CLOUD LINK (From Cell B1) -> Index 13
            rowVals[13], // MATERIAL (Col N) -> Index 14
            rowVals[14], // MATERIAL URL (Col O) -> Index 15
            rowVals[15]  // FEEDBACK LINK (Col P) -> Index 16
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
  
  // 18 Headers aligned to match indexed data
  const headers = [
    "STATUS", "DATE", "ACCESS", "START", "END", "LESSON TYPE", 
    "Area (BoE)", "SCHOOL", "GRADE", "CLASS", "STUDENT'S NAME / MEETING GROUP", 
    "USER ID", "PASSWORD", "TEACHER'S NAME", "TEACHER'S CLOUD LINK", 
    "MATERIAL", "MATERIAL URL", "FEEDBACK LINK"
  ];

  let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

  rows.forEach(r => {
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

    // 1. Render STATUS badge first
    html += `<tr ${rowClass}><td>${badge}</td>`;

    // 2. Render remaining data cells matching strict header indices
    r.forEach((cell, i) => {
      let content = String(cell || "-").trim();
      const boldClass = (i >= 0 && i <= 3) ? 'class="bold-col"' : '';

      if (i === 13) { // TEACHER'S CLOUD LINK (Index 13 - Pulled from Cell B1)
        html += content.startsWith('http')
          ? `<td><button class="btn-link" onclick="confirmMeeting('${content}', '${fullTimeStr}', '${r[9]}', '${r[5]}')">LINK</button></td>`
          : `<td>-</td>`;
      } else if (i === 15) { // MATERIAL URL (Index 15)
        html += isFinished 
          ? `<td><span class="btn-link btn-disabled">CLOSED</span></td>` 
          : content.startsWith('http')
            ? `<td><button class="btn-link" onclick="confirmMaterial('${content}', '${r[14]}', '${fullTimeStr}', '${r[9]}', '${r[5]}')">OPEN</button></td>`
            : `<td>-</td>`;
      } else if (i === 16) { // FEEDBACK LINK (Index 16)
        html += content.startsWith('http')
          ? `<td><button class="btn-link" onclick="confirmGenericLink('${content}', 'Feedback Link')">OPEN</button></td>`
          : `<td>No Feedback</td>`;
      } else if (content.startsWith('http')) { // Catch-all for any other raw URLs
        html += `<td><button class="btn-link" onclick="confirmMeeting('${content}', '${fullTimeStr}', '${r[9]}', '${r[5]}')">LINK</button></td>`;
      } else { 
        html += `<td ${boldClass}>${content}</td>`; 
      }
    });
    html += '</tr>';
  });
  document.getElementById('results').innerHTML = html + '</tbody></table>';
}
