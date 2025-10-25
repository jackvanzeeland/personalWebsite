/**
 * Analytics Viewer Logic
 * Handles CSV processing, filtering, and chart generation
 */

let videos=[], filteredVideos=[], charts={}, sortOrder={};

document.getElementById('csvFile').addEventListener('change', (event)=>{
  const file=event.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){ processCSV(e.target.result); };
  reader.readAsText(file);
});

function processCSV(text){
  document.getElementById('error').textContent='';
  const parsed = Papa.parse(text.trim(), {header:true, skipEmptyLines:true});
  const expectedHeaders = ['video_url','likes','comments','bookmarks','shares'];
  const headers = parsed.meta.fields.map(h=>h.trim());
  if(headers.join(',')!==expectedHeaders.join(',')){
    document.getElementById('error').textContent='Invalid file format. Use provided analytics file.';
    return;
  }
  videos = parsed.data.map(r=>({
    video_url:r.video_url,
    likes:parseFloat(r.likes)||0,
    comments:parseFloat(r.comments)||0,
    bookmarks:parseFloat(r.bookmarks)||0,
    shares:parseFloat(r.shares)||0
  }));
  filteredVideos=[...videos];
  showDashboard();
  renderTable(filteredVideos);
  createHistograms(filteredVideos);
  document.getElementById('summaryCards-sum').style.display='grid';
  document.getElementById('summaryCards-average').style.display='grid';
  document.getElementById('totalsHeading').style.display='block';
  document.getElementById('averagesHeading').style.display='block';
  document.getElementById('videoTable').style.display='table';
}

// Make functions global
window.applyFilters = function(){
  const minLikes=parseFloat(document.getElementById('minLikes').value)||0;
  const maxLikes=parseFloat(document.getElementById('maxLikes').value)||Infinity;
  const minComments=parseFloat(document.getElementById('minComments').value)||0;
  const maxComments=parseFloat(document.getElementById('maxComments').value)||Infinity;
  const minBookmarks=parseFloat(document.getElementById('minBookmarks').value)||0;
  const maxBookmarks=parseFloat(document.getElementById('maxBookmarks').value)||Infinity;
  const minShares=parseFloat(document.getElementById('minShares').value)||0;
  const maxShares=parseFloat(document.getElementById('maxShares').value)||Infinity;

  filteredVideos=videos.filter(v=>v.likes>=minLikes&&v.likes<=maxLikes&&
                                    v.comments>=minComments&&v.comments<=maxComments&&
                                    v.bookmarks>=minBookmarks&&v.bookmarks<=maxBookmarks&&
                                    v.shares>=minShares&&v.shares<=maxShares);
  renderTable(filteredVideos);
  showDashboard();
  createHistograms(filteredVideos);
}

window.resetFilters = function(){
  document.getElementById('minLikes').value=0;
  document.getElementById('maxLikes').value=1000000000;
  document.getElementById('minComments').value=0;
  document.getElementById('maxComments').value=1000000000;
  document.getElementById('minBookmarks').value=0;
  document.getElementById('maxBookmarks').value=1000000000;
  document.getElementById('minShares').value=0;
  document.getElementById('maxShares').value=1000000000;
  applyFilters();
}

window.sortTable = function(key){
  sortOrder[key]=!sortOrder[key];
  filteredVideos.sort((a,b)=>
    typeof a[key]==='string'? (sortOrder[key]?b[key].localeCompare(a[key]):a[key].localeCompare(b[key]))
    : (sortOrder[key]?b[key]-a[key]:a[key]-b[key])
  );
  renderTable(filteredVideos);
}

function showDashboard(){
  const sum=filteredVideos.reduce((acc,v)=>({
    totalVideos:acc.totalVideos+1,
    totalLikes:acc.totalLikes+v.likes,
    totalComments:acc.totalComments+v.comments,
    totalBookmarks:acc.totalBookmarks+v.bookmarks,
    totalShares:acc.totalShares+v.shares
  }),{totalVideos:0,totalLikes:0,totalComments:0,totalBookmarks:0,totalShares:0});

  document.getElementById('totalVideos').textContent = Number(sum.totalVideos).toLocaleString();
document.getElementById('totalLikes').textContent = Number(sum.totalLikes).toLocaleString();
document.getElementById('totalComments').textContent = Number(sum.totalComments).toLocaleString();
document.getElementById('totalBookmarks').textContent = Number(sum.totalBookmarks).toLocaleString();
document.getElementById('totalShares').textContent = Number(sum.totalShares).toLocaleString();

document.getElementById('averageLikes').textContent =
  Number((sum.totalLikes / sum.totalVideos).toFixed(2)).toLocaleString();
document.getElementById('averageComments').textContent =
  Number((sum.totalComments / sum.totalVideos).toFixed(2)).toLocaleString();
document.getElementById('averageBookmarks').textContent =
  Number((sum.totalBookmarks / sum.totalVideos).toFixed(2)).toLocaleString();
document.getElementById('averageShares').textContent =
  Number((sum.totalShares / sum.totalVideos).toFixed(2)).toLocaleString();

}

function renderTable(data){
  const tbody=document.getElementById('tableBody'); tbody.innerHTML='';
  data.forEach(v=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><a href="${v.video_url}" target="_blank">${v.video_url}</a></td>
                  <td>${v.likes}</td>
                  <td>${v.comments}</td>
                  <td>${v.bookmarks}</td>
                  <td>${v.shares}</td>`;
    tbody.appendChild(tr);
  });
}

function createHistograms(data) {
  const metrics = ['likes', 'comments', 'bookmarks', 'shares'];
  const colors = ['#ff6b6b', '#54a0ff', '#feca57', '#1dd1a1'];
  const fixedBins = 7;

  metrics.forEach((metric, i) => {
    if (charts[metric]) charts[metric].destroy();

    const values = data.map(v => v[metric]).filter(v => v > 0);
    if (values.length === 0) return;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binWidth = range / fixedBins || 1;

    // Count values in bins
    const counts = Array(fixedBins).fill(0);
    values.forEach(v => {
      let idx = Math.floor((v - min) / binWidth);
      if (idx >= fixedBins) idx = fixedBins - 1;
      counts[idx]++;
    });

    // X-axis labels: lower bound of each bin
    const labels = Array.from({ length: fixedBins }, (_, idx) => Math.round(min + idx * binWidth));

    // Bin ranges for tooltips
    const binRanges = counts.map((_, idx) => {
      const start = Math.round(min + idx * binWidth);
      const end = Math.round(min + (idx + 1) * binWidth);
      return `${start} - ${end}`;
    });

    const ctx = document.getElementById(metric + 'Chart').getContext('2d');
    charts[metric] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // show lower bounds
        datasets: [{
          label: metric,
          data: counts,
          backgroundColor: colors[i],
          borderColor: '#333',
          borderWidth: 1,
          barPercentage: 1,
          categoryPercentage: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 20, left: 10, right: 10 } },
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Distribution of ${metric}`, padding: { bottom: 10 } },
          tooltip: {
            callbacks: {
              label: function(context) {
                const count = context.dataset.data[context.dataIndex];
                return `Range: ${binRanges[context.dataIndex]}, Count: ${count}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: Math.ceil(Math.max(...counts) / 5) }
          },
          x: {
            display: true,
            type: 'linear',
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              font: { size: 12 },
              align: 'end'
            },
            grid: { drawTicks: false }
          }
        }
      }
    });
  });
}
