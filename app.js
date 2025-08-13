// Helper: basic heuristic AI to choose chart type
function pickChartType(headers, sampleRows) {
  // If first column looks like dates, make line chart for first vs second column
  const dateRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/;
  if (dateRegex.test(sampleRows[0][0])) {
    return { type: 'line', x: headers[0], y: headers[1] || headers[0] };
  }
  // If second column numeric, bar chart of first column categories vs second
  if (!isNaN(sampleRows[0][1])) {
    return { type: 'bar', x: headers[0], y: headers[1] };
  }
  // fallback: pie chart of first column counts
  return { type: 'pie', category: headers[0] };
}

// Render charts in container
function renderCharts(data, config) {
  const container = document.getElementById('charts-container');
  container.innerHTML = '';

  if (config.type === 'line' || config.type === 'bar') {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const labels = data.map(row => row[0]);
    const values = data.map(row => Number(row[1]) || 0);
    new Chart(canvas, {
      type: config.type,
      data: {
        labels,
        datasets: [{
          label: `${config.y} vs ${config.x}`,
          data: values,
          backgroundColor: config.type === 'bar' ? 'rgba(0,123,255,0.6)' : 'transparent',
          borderColor: 'rgba(0,123,255,1)',
          borderWidth: 2,
          fill: config.type === 'line'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  } else if (config.type === 'pie') {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const counts = {};
    data.forEach(row => {
      counts[row[0]] = (counts[row[0]] || 0) + 1;
    });
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: [
            '#007bff','#dc3545','#ffc107','#28a745','#17a2b8','#6f42c1'
          ]
        }]
      },
      options: { responsive: true }
    });
  }
}

// Parse CSV and generate charts
function handleFile(file) {
  Papa.parse(file, {
    complete: function(results) {
      if (!results.data || results.data.length < 2) {
        alert('CSV is empty or invalid.');
        return;
      }
      const headers = results.data[0];
      const rows = results.data.slice(1).filter(row => row.length === headers.length);
      const chartConfig = pickChartType(headers, rows);
      renderCharts(rows, chartConfig);
    },
    error: function(err) {
      alert('Error parsing CSV: ' + err.message);
    }
  });
}

// Drag & drop + file input handlers
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', e => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});
