/**
 * TikTok Promo Manager - Campaign Analytics
 * Enhanced analytics viewer with drag-and-drop, sample data, and premium UX
 */

let videos = [];
let filteredVideos = [];
let charts = {};
let sortOrder = {};

// Chart color scheme for TikTok theme
const CHART_COLORS = {
    likes: '#00f2ea',      // Cyan
    comments: '#8c52ff',   // Purple
    bookmarks: '#ff0050',  // Pink
    shares: '#00d4ff'      // Blue
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeUpload();
});

/**
 * Initialize file upload with drag-and-drop support
 */
function initializeUpload() {
    const dropzone = document.getElementById('dropzone');
    const uploadCard = document.getElementById('uploadCard');
    const fileInput = document.getElementById('csvFile');

    // File input change handler
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFile(file);
            // Reset file input to allow re-uploading the same file
            event.target.value = '';
        }
    });

    // Drag and drop handlers - click anywhere on dropzone except buttons
    dropzone.addEventListener('click', (e) => {
        // Don't trigger if clicking a button
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadCard.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadCard.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadCard.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleFile(file);
        } else {
            showError('Please upload a valid CSV file.');
        }
    });
}

/**
 * Handle file upload
 */
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
}

/**
 * Process CSV data
 */
function processCSV(text) {
    document.getElementById('error').textContent = '';

    const parsed = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
    const expectedHeaders = ['video_url', 'likes', 'comments', 'bookmarks', 'shares'];
    const headers = parsed.meta.fields.map(h => h.trim());

    // Validate headers
    if (headers.join(',') !== expectedHeaders.join(',')) {
        showError('Invalid file format. Expected columns: video_url, likes, comments, bookmarks, shares');
        return;
    }

    // Parse and validate data
    videos = parsed.data.map(r => ({
        video_url: r.video_url,
        likes: parseFloat(r.likes) || 0,
        comments: parseFloat(r.comments) || 0,
        bookmarks: parseFloat(r.bookmarks) || 0,
        shares: parseFloat(r.shares) || 0
    }));

    if (videos.length === 0) {
        showError('No valid data found in CSV file.');
        return;
    }

    filteredVideos = [...videos];
    showDashboard();
}

/**
 * Load sample data for demo purposes
 */
window.loadSampleData = function() {
    // Generate sample campaign data
    const sampleData = [];
    const videoIds = [
        '7234567890123456789',
        '7234567890123456790',
        '7234567890123456791',
        '7234567890123456792',
        '7234567890123456793',
        '7234567890123456794',
        '7234567890123456795',
        '7234567890123456796',
        '7234567890123456797',
        '7234567890123456798',
        '7234567890123456799',
        '7234567890123456800',
        '7234567890123456801',
        '7234567890123456802',
        '7234567890123456803'
    ];

    videoIds.forEach(id => {
        sampleData.push({
            video_url: `https://www.tiktok.com/@influencer/video/${id}`,
            likes: Math.floor(Math.random() * 50000) + 10000,
            comments: Math.floor(Math.random() * 2000) + 500,
            bookmarks: Math.floor(Math.random() * 5000) + 1000,
            shares: Math.floor(Math.random() * 3000) + 500
        });
    });

    videos = sampleData;
    filteredVideos = [...videos];
    showDashboard();
};

/**
 * Display dashboard with all data
 */
function showDashboard() {
    // Show dashboard content
    document.getElementById('dashboardContent').style.display = 'block';

    // Scroll to dashboard
    document.getElementById('dashboardContent').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    // Update all displays
    updateMetrics();
    renderTable(filteredVideos);
    createHistograms(filteredVideos);
}

/**
 * Update metric cards
 */
function updateMetrics() {
    const sum = filteredVideos.reduce((acc, v) => ({
        totalVideos: acc.totalVideos + 1,
        totalLikes: acc.totalLikes + v.likes,
        totalComments: acc.totalComments + v.comments,
        totalBookmarks: acc.totalBookmarks + v.bookmarks,
        totalShares: acc.totalShares + v.shares
    }), { totalVideos: 0, totalLikes: 0, totalComments: 0, totalBookmarks: 0, totalShares: 0 });

    // Calculate total views estimate (likes * engagement rate multiplier)

    // Update total metrics
    document.getElementById('totalVideos').textContent = formatNumber(sum.totalVideos);
    document.getElementById('totalLikes').textContent = formatNumber(sum.totalLikes);
    document.getElementById('totalComments').textContent = formatNumber(sum.totalComments);
    document.getElementById('totalBookmarks').textContent = formatNumber(sum.totalBookmarks);
    document.getElementById('totalShares').textContent = formatNumber(sum.totalShares);

    // Update averages
    const count = sum.totalVideos || 1;
    document.getElementById('averageLikes').textContent = formatNumber(Math.round(sum.totalLikes / count));
    document.getElementById('averageComments').textContent = formatNumber(Math.round(sum.totalComments / count));
    document.getElementById('averageBookmarks').textContent = formatNumber(Math.round(sum.totalBookmarks / count));
    document.getElementById('averageShares').textContent = formatNumber(Math.round(sum.totalShares / count));
}

/**
 * Format numbers with commas
 */
function formatNumber(num) {
    return Number(num).toLocaleString();
}

/**
 * Render data table
 */
function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Video URL"><a href="${v.video_url}" target="_blank">${v.video_url}</a></td>
            <td data-label="Likes">${formatNumber(v.likes)}</td>
            <td data-label="Comments">${formatNumber(v.comments)}</td>
            <td data-label="Bookmarks">${formatNumber(v.bookmarks)}</td>
            <td data-label="Shares">${formatNumber(v.shares)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Create histogram charts
 */
function createHistograms(data) {
    const metrics = ['likes', 'comments', 'bookmarks', 'shares'];
    const fixedBins = 7;

    metrics.forEach((metric) => {
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

        // X-axis labels
        const labels = Array.from({ length: fixedBins }, (_, idx) =>
            formatNumber(Math.round(min + idx * binWidth))
        );

        // Bin ranges for tooltips
        const binRanges = counts.map((_, idx) => {
            const start = Math.round(min + idx * binWidth);
            const end = Math.round(min + (idx + 1) * binWidth);
            return `${formatNumber(start)} - ${formatNumber(end)}`;
        });

        const ctx = document.getElementById(metric + 'Chart').getContext('2d');
        charts[metric] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: metric,
                    data: counts,
                    backgroundColor: CHART_COLORS[metric],
                    borderColor: CHART_COLORS[metric],
                    borderWidth: 0,
                    barPercentage: 0.9,
                    categoryPercentage: 0.95
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#00f2ea',
                        bodyColor: '#ffffff',
                        borderColor: '#00f2ea',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `Range: ${binRanges[context[0].dataIndex]}`;
                            },
                            label: function(context) {
                                return `Videos: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    });
}

/**
 * Apply filters
 */
window.applyFilters = function() {
    const minLikes = parseFloat(document.getElementById('minLikes').value) || 0;
    const maxLikes = parseFloat(document.getElementById('maxLikes').value) || Infinity;
    const minComments = parseFloat(document.getElementById('minComments').value) || 0;
    const maxComments = parseFloat(document.getElementById('maxComments').value) || Infinity;
    const minBookmarks = parseFloat(document.getElementById('minBookmarks').value) || 0;
    const maxBookmarks = parseFloat(document.getElementById('maxBookmarks').value) || Infinity;
    const minShares = parseFloat(document.getElementById('minShares').value) || 0;
    const maxShares = parseFloat(document.getElementById('maxShares').value) || Infinity;

    filteredVideos = videos.filter(v =>
        v.likes >= minLikes && v.likes <= maxLikes &&
        v.comments >= minComments && v.comments <= maxComments &&
        v.bookmarks >= minBookmarks && v.bookmarks <= maxBookmarks &&
        v.shares >= minShares && v.shares <= maxShares
    );

    renderTable(filteredVideos);
    updateMetrics();
    createHistograms(filteredVideos);
};

/**
 * Reset filters
 */
window.resetFilters = function() {
    document.getElementById('minLikes').value = 0;
    document.getElementById('maxLikes').value = 1000000000;
    document.getElementById('minComments').value = 0;
    document.getElementById('maxComments').value = 1000000000;
    document.getElementById('minBookmarks').value = 0;
    document.getElementById('maxBookmarks').value = 1000000000;
    document.getElementById('minShares').value = 0;
    document.getElementById('maxShares').value = 1000000000;
    applyFilters();
};

/**
 * Sort table by column
 */
window.sortTable = function(key) {
    sortOrder[key] = !sortOrder[key];

    filteredVideos.sort((a, b) => {
        if (typeof a[key] === 'string') {
            return sortOrder[key] ?
                b[key].localeCompare(a[key]) :
                a[key].localeCompare(b[key]);
        } else {
            return sortOrder[key] ? b[key] - a[key] : a[key] - b[key];
        }
    });

    renderTable(filteredVideos);
};

/**
 * Toggle filters visibility
 */
window.toggleFilters = function() {
    const content = document.getElementById('filtersContent');
    const toggleText = document.getElementById('filterToggleText');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleText.textContent = 'Hide Filters';
    } else {
        content.style.display = 'none';
        toggleText.textContent = 'Show Filters';
    }
};

/**
 * Toggle table visibility
 */
window.toggleTable = function() {
    const wrapper = document.getElementById('tableWrapper');
    const toggleText = document.getElementById('tableToggleText');

    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        toggleText.textContent = 'Hide Table';
    } else {
        wrapper.style.display = 'none';
        toggleText.textContent = 'Show Table';
    }
};

/**
 * Show error message
 */
function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.textContent = '';
    }, 5000);
}
