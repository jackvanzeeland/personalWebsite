/**
 * Career timeline for /journey, in two tiers:
 *   - the path: work + education on the year/dot timeline (#timeline-container)
 *   - certifications: a compact index of rows (#cert-index), so a burst of
 *     short courses doesn't bury the actual roles.
 *
 * Emits 'timeline:rendered' on document after both are built.
 */

import { TimelineItem } from '../types';
import { parseLocalDate } from '../utils/dates';
import { escapeHtml } from '../utils/escapeHtml';

export async function initializeTimeline(): Promise<void> {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    try {
        const response = await fetch('/data/timeline.json');
        const data = await response.json();

        if (!data.timelineItems || !Array.isArray(data.timelineItems)) {
            throw new Error('Invalid timeline data structure');
        }

        const validItems = (data.timelineItems as TimelineItem[]).filter((item) => {
            const isValid = item.id && item.title && item.organization &&
                item.type && item.startDate && item.endDate !== undefined;
            if (!isValid) console.warn('Invalid timeline item:', item);
            return isValid;
        });

        if (validItems.length === 0) {
            throw new Error('No valid timeline items found');
        }

        const certs = validItems.filter((item) => item.type === 'certification');
        renderTemporalTimeline(validItems.filter((item) => item.type !== 'certification'), container);

        const certIndex = document.getElementById('cert-index');
        if (certIndex) renderCertIndex(certs, certIndex);
        const certCount = document.getElementById('cert-count');
        if (certCount) certCount.textContent = `${certs.length} COURSES`;

        document.dispatchEvent(new CustomEvent('timeline:rendered'));
    } catch (error) {
        console.error('Error loading timeline:', error);
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Unable to load timeline.</strong><br>
                <small>Error: ${escapeHtml(message)}</small><br>
                <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

/** Newest first: one row per course — title, issuer, month. */
function renderCertIndex(certs: TimelineItem[], target: HTMLElement): void {
    const sorted = [...certs].sort(
        (a, b) => parseLocalDate(b.startDate).getTime() - parseLocalDate(a.startDate).getTime()
    );
    target.innerHTML = sorted
        .map(
            (item) => `
            <li class="cert-row" data-event-id="${escapeHtml(item.id)}" title="${escapeHtml(item.description)}">
                <span class="cert-row-title">${escapeHtml(item.title)}</span>
                <span class="cert-row-org">${escapeHtml(item.organization)}</span>
                <time class="cert-row-date" datetime="${escapeHtml(item.startDate.substring(0, 7))}">${formatMonthYear(item.startDate.substring(0, 7))}</time>
            </li>`
        )
        .join('');
}

function renderTemporalTimeline(items: TimelineItem[], container: HTMLElement): void {
    const today = new Date();

    const sortedItems = [...items].sort(
        (a, b) => parseLocalDate(b.startDate).getTime() - parseLocalDate(a.startDate).getTime()
    );

    const itemsByYear: Record<string, TimelineItem[]> = {};
    sortedItems.forEach((item) => {
        const year = String(parseLocalDate(item.startDate).getFullYear());
        (itemsByYear[year] ??= []).push(item);
    });

    const years = Object.keys(itemsByYear).sort((a, b) => Number(b) - Number(a));

    let timelineHTML = '<div class="temporal-timeline-wrapper">';
    years.forEach((year) => {
        const yearItems = itemsByYear[year];

        timelineHTML += `
            <div class="year-section mb-5" data-year="${year}">
                <div class="year-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="mb-0 h4 fw-bold">${year}</h3>
                        <div class="text-end">
                            <small>${yearItems.length} event${yearItems.length !== 1 ? 's' : ''}</small>
                        </div>
                    </div>
                </div>

                <div class="year-events ps-3 ps-md-4 border-start border-3 border-secondary">
                    ${renderYearEvents(yearItems, today)}
                </div>
            </div>
        `;
    });
    timelineHTML += '</div>';
    container.innerHTML = timelineHTML;
}

function renderYearEvents(items: TimelineItem[], today: Date): string {
    const itemsByMonth: Record<string, TimelineItem[]> = {};
    items.forEach((item) => {
        const monthKey = item.startDate.substring(0, 7); // YYYY-MM
        (itemsByMonth[monthKey] ??= []).push(item);
    });

    let html = '';
    Object.keys(itemsByMonth)
        .sort()
        .reverse()
        .forEach((monthKey) => {
            const monthItems = itemsByMonth[monthKey];
            const hasOverlap = monthItems.length > 1;

            html += `
                <div class="month-group mb-4 position-relative">
                    <div class="timeline-dot position-absolute start-0 translate-middle ${getTypeColor(monthItems[0].type)} ${monthItems[0].isPresent ? 'dot-pulse' : ''}"
                         style="width: 16px; height: 16px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 1px #dee2e6;"></div>

                    <div class="d-flex gap-3 gap-md-4">
                        <div class="date-column" style="min-width: 100px;">
                            <time class="d-block fw-bold small">${formatMonthYear(monthKey)}</time>
                            ${hasOverlap ? `<small class="month-count">${monthItems.length} items</small>` : ''}
                        </div>

                        <div class="flex-grow-1 ${hasOverlap ? 'overlap-container' : ''}">
                            ${renderMonthCards(monthItems, today)}
                        </div>
                    </div>
                </div>
            `;
        });

    return html;
}

function renderMonthCards(items: TimelineItem[], today: Date): string {
    return items.map((item) => renderEventCard(item, today)).join('');
}

function renderEventCard(item: TimelineItem, today: Date): string {
    const duration = calculateDuration(item.startDate, item.endDate, item.isPresent, today);
    const typeInfo = getTypeInfo(item.type);
    const isOngoing = item.isPresent;

    return `
        <div class="timeline-event-card card border-2 border-${typeInfo.colorClass} mb-3 shadow-sm hover-lift"
             data-type="${escapeHtml(item.type)}"
             data-event-id="${escapeHtml(item.id)}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge bg-${typeInfo.colorClass} ${isOngoing ? 'pulse-badge' : ''}">
                        ${typeInfo.label}${isOngoing ? ' • ONGOING' : ''}
                    </span>
                    <small class="text-muted fw-semibold">${escapeHtml(duration)}</small>
                </div>

                <h5 class="card-title mb-2 fw-bold">${escapeHtml(item.title)}</h5>
                <p class="card-text text-${typeInfo.colorClass} fw-semibold mb-2">${escapeHtml(item.organization)}</p>

                ${item.description !== 'TBD'
                    ? `<p class="card-text small text-muted">${escapeHtml(item.description)}</p>`
                    : ''}

                <small class="text-muted d-block mt-2">
                    ${formatDate(item.startDate)} → ${item.isPresent ? 'Present' : formatDate(item.endDate)}
                </small>
            </div>
        </div>
    `;
}

function calculateDuration(startDate: string, endDate: string, isPresent: boolean, today: Date): string {
    const start = parseLocalDate(startDate);
    const end = isPresent ? today : parseLocalDate(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn(`Invalid dates: start=${startDate}, end=${endDate}`);
        return 'Invalid dates';
    }
    if (end < start) {
        console.warn(`End date before start: ${startDate} -> ${endDate}`);
        return 'Invalid date range';
    }

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    if (end.getDate() < start.getDate()) months--;
    if (months < 0) months = 0;

    if (months < 1) return 'Less than 1 month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return years === 1 ? '1 year' : `${years} years`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

function getTypeInfo(type: TimelineItem['type']): { label: string; colorClass: string } {
    const types = {
        education: { label: 'EDUCATION', colorClass: 'primary' },
        work: { label: 'WORK', colorClass: 'success' },
        certification: { label: 'CERTIFICATION', colorClass: 'warning' }
    };
    return types[type] || types.work;
}

function getTypeColor(type: TimelineItem['type']): string {
    const colors = {
        education: 'bg-primary',
        work: 'bg-success',
        certification: 'bg-warning'
    };
    return colors[type] || 'bg-secondary';
}

function formatMonthYear(dateString: string): string {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}`);
        return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDate(dateString: string): string {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}`);
        return 'Invalid date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
