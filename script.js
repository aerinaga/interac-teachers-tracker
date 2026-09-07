const SPREADSHEET_ID = "1qd8ivmSZ_FlepT5woZTTwzSvB_0PTfb0gh4ozWOQu10";
const SHEET_TAB_NAME = "Lesson Info for Interact"; 
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

function formatCellDate(val) {
  if (!val) return "";
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const parts = val.match(/\d+/g);
    if (parts) {
      const year = parts[0];
      const month = String(parseInt(parts[1]) + 1).padStart(2, '0');
      const day = String(parts[2]).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  }
  return String(val);
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

    const search = q.trim().toLowerCase();
    const matchedRows = [];

    allRows.forEach(r => {
      if (!r.c) return;
      const rowVals = r.c.map(cell => (cell ? (cell.f || cell.v || "") : ""));
      
      // Column P is index 15 (0-based: A=0... P=15)
      const teacher = String(rowVals[15] || "").trim().toLowerCase();

      if (teacher === search) {
        matchedRows.push([
          formatCellDate(rowVals[2]),  // Date (Col C)
          rowVals[3],                  // Access (Col D)
          rowVals[4],                  // Start (Col E)
          rowVals[5],                  // End (Col F)
          rowVals[19],                 // Material Name (Col T)
          rowVals[20],                 // Material URL (Col U)
          rowVals[18],                 // Meeting URL (Col S)
          rowVals[15],                 // Teacher (Col P)
          rowVals[13],                 // Student (Col N)
          rowVals[14],                 // Password (Col O)
          rowVals[21],                 // FB Form (Col V)
          rowVals[6],                  // Type (Col G)
          rowVals[7],                  // Area (Col H)
          rowVals[8],                  // School (Col I)
          rowVals[9],                  // Grade (Col J)
          rowVals[10],                 // Class (Col K)
          rowVals[11]                  // Period (Col L)
        ]);
      }
    });

    if (matchedRows.length === 0) {
      Swal.fire({ 
        icon: 'info', 
        title: 'No Lessons Found', 
        text: `No exact matches found for "${q}" on tab "${SHEET_TAB_NAME}".` 
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
  const headers = ["Status", "Date", "Access", "Start", "END", "Material", "Material URL", "Meeting URL", "Teacher", "Student/Group Name (User ID)", "Password", "FB Form", "Type", "Area", "School", "Grade", "Class", "Lesson Period"];
  let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

  rows.forEach(r => {
    const dateParts = String(r[0]).split('/');
    let dateDisplay = r[0];
    let lessonEnd = new Date();

    if (dateParts.length === 3) {
      const day = parseInt(dateParts[2]);
      const monthIdx = parseInt(dateParts[1]) - 1;
      const monthName = months[monthIdx] || "";
      dateDisplay = `${day}/${monthName}`;

      const endHour = r[3] ? parseInt(String(r[3]).split(':')[0]) : 0;
      const endMin = r[3] ? parseInt(String(r[3]).split(':')[1]) : 0;
      lessonEnd = new Date(dateParts[0], monthIdx, day, endHour, endMin);
    }

    const fullTimeStr = `${r[1]} ${r[2]}~${r[3]}`;
    const isFinished = lessonEnd < now;
    const rowClass = isFinished ? 'class="finished-row"' : '';
    const badge = isFinished ? '<span class="badge badge-finished">FINISHED</span>' : '<span class="badge badge-upcoming">UPCOMING</span>';

    html += `<tr ${rowClass}><td>${badge}</td>`;

    r.forEach((cell, i) => {
      let content = cell || "-";
      if (i === 0) content = dateDisplay;
      const boldClass = (i >= 0 && i <= 3) ? 'class="bold-col"' : '';

      if (String(content).includes('http')) {
        if (i === 5) { // Material URL
          html += isFinished ? `<td><span class="btn-link btn-disabled">Closed</span></td>` : `<td><button class="btn-link" onclick="confirmMaterial('${content}', '${r[4]}', '${fullTimeStr}', '${r[8]}', '${r[12]}')">Open</button></td>`;
        } else if (i === 6) { // Meeting URL
          html += isFinished ? `<td><span style="color:#999">Ended</span></td>` : `<td><button class="raw-link" onclick="confirmMeeting('${content}', '${fullTimeStr}', '${r[8]}', '${r[12]}')">Link</button></td>`;
        } else if (i === 10) { // FB Form
          html += `<td><a class="btn-link" href="${content}" target="_blank">Open</a></td>`;
        } else { 
          html += `<td>${content}</td>`; 
        }
      } else { 
        html += `<td ${boldClass}>${content}</td>`; 
      }
    });
    html += '</tr>';
  });
  document.getElementById('results').innerHTML = html + '</tbody></table>';
}
