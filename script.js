const SPREADSHEET_ID = "1QQ3pacCHrLiqhtsrheSZ_BopZabrLJ8qGyMZ4btftgs";
const SHEET_TAB_NAME = "Lesson Info (UPDATED)"; 
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

window.onload = function() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 14);
  document.getElementById('date-range-note').innerHTML = `Displaying lessons from <b>${today.getDate()} ${months[today.getMonth()]}</b> to <b>${future.getDate()} ${months[future.getMonth()]}</b>`;
};

function confirmMaterial(url, materialName, timeStr, studentName, area) {
  Swal.fire({
    title: 'Material Check',
    html: `You are going to use <b>"${materialName}"</b><br>for your <b>${timeStr}</b> lesson with <b>${studentName}</b> on <b>${area}</b>.<br><br><small style="color:#888">Material: ${materialName}</small>`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#fbbc04',
    confirmButtonText: '<span style="color:#000">OK, Open it</span>',
    cancelButtonText: 'Cancel'
  }).then((result) => { if (result.isConfirmed) window.open(url, '_blank'); });
}

function confirmMeeting(url, timeStr, studentName, area) {
  Swal.fire({
    title: 'Meeting Link Check',
    html: `You are entering the meeting for your <b>${timeStr}</b> lesson<br>with <b>${studentName}</b> (${area}).<br><br><small style="color:#666"><b>Meeting URL:</b></small><span class="url-display">${url}</span>`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#1a73e8',
    confirmButtonText: 'Join Meeting',
    cancelButtonText: 'Cancel'
  }).then((result) => { if (result.isConfirmed) window.open(url, '_blank'); });
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

    // Retrieve Teacher Cloud Link from cell B1 (Row index 0, Col B)
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
            rowVals[0],  // DATE (Col A)
            rowVals[1],  // ACCESS (Col B)
            rowVals[2],  // START (Col C)
            rowVals[3],  // END (Col D)
            rowVals[4],  // LESSON TYPE (Col E)
            rowVals[5],  // Area (BoE) (Col F)
            rowVals[6],  // SCHOOL (Col G)
            rowVals[7],  // GRADE (Col H)
            rowVals[8],  // CLASS (Col I)
            rowVals[9],  // STUDENT'S NAME / MEETING GROUP (Col J)
            rowVals[10], // USER ID (Col K)
            rowVals[11], // PASSWORD (Col L)
            rowVals[12], // TEACHER'S NAME (Col M)
            cloudLink,   // TEACHER'S CLOUD LINK (Pulled from Cell B1)
            rowVals[13], // MATERIAL (Col N)
            rowVals[14], // MATERIAL URL (Col O)
            rowVals[15]  // FEEDBACK LINK (Col P)
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
  
  // Exact 18 Headers in sequence
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

    // 2. Render remaining 17 data cells
    r.forEach((cell, i) => {
      let content = cell || "-";
      const boldClass = (i >= 0 && i <= 3) ? 'class="bold-col"' : '';

      if (String(content).includes('http')) {
        if (i === 13) { // TEACHER'S CLOUD LINK (Index 13 in data array)
          html += `<td><a class="btn-link" href="${content}" target="_blank">Login Portal</a></td>`;
        } else if (i === 15) { // MATERIAL URL (Index 15 in data array)
          html += isFinished 
            ? `<td><span class="btn-link btn-disabled">Closed</span></td>` 
            : `<td><button class="btn-link" onclick="confirmMaterial('${content}', '${r[14]}', '${fullTimeStr}', '${r[9]}', '${r[5]}')">Open</button></td>`;
        } else if (i === 16) { // FEEDBACK LINK (Index 16 in data array)
          html += `<td><a class="btn-link" href="${content}" target="_blank">Open</a></td>`;
        } else { 
          html += `<td><a class="raw-link" href="${content}" target="_blank">Link</a></td>`; 
        }
      } else { 
        html += `<td ${boldClass}>${content}</td>`; 
      }
    });
    html += '</tr>';
  });
  document.getElementById('results').innerHTML = html + '</tbody></table>';
}
