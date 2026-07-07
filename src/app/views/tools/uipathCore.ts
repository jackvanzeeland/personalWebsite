/**
 * UiPath Queue Processor logic — ported from the retired standalone page.
 * Parses queue CSV exports client-side with Papa Parse, flattens
 * DynamicProperties/SpecificContent JSON columns into DP_-prefixed
 * columns, and re-exports the selected columns as a clean CSV.
 * The original page's alert() error paths render inline instead
 * (modal dialogs don't belong inside the SPA detail view).
 */

import Papa from 'papaparse';

type Row = Record<string, string>;

function isDynamicPropertiesColumn(key: string, val: unknown): boolean {
    const lower = key.toLowerCase();
    if (
        lower.includes('dynamicproperties') ||
        lower.includes('specificcontent') ||
        lower.includes('specific_content')
    ) {
        return true;
    }
    return typeof val === 'string' && val.trim().startsWith('{') && val.trim().endsWith('}');
}

function flattenObject(obj: Record<string, unknown>, prefix: string, result: Row): void {
    Object.keys(obj).forEach((k) => {
        const val = obj[k];
        const newKey = prefix + k;
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            flattenObject(val as Record<string, unknown>, `${newKey}_`, result);
        } else {
            result[newKey] = val === null || val === undefined ? '' : String(val);
        }
    });
}

function flattenData(data: Row[]): Row[] {
    return data.map((row) => {
        const flat: Row = {};
        Object.keys(row).forEach((key) => {
            const val = row[key];
            if (isDynamicPropertiesColumn(key, val)) {
                try {
                    const parsed: unknown = JSON.parse(val);
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        flattenObject(parsed as Record<string, unknown>, 'DP_', flat);
                        return;
                    }
                } catch {
                    // Not valid JSON, keep as-is
                }
            }
            flat[key] = val;
        });
        return flat;
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function initUipathProcessor(root: HTMLElement, signal: AbortSignal): void {
    const byId = <T extends HTMLElement>(id: string): T => root.querySelector(`#${id}`) as T;

    let flatData: Row[] = [];
    let allColumns: string[] = [];
    let selectedColumns = new Set<string>();
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    signal.addEventListener('abort', () => clearTimeout(toastTimer));

    const uploadZone = byId<HTMLDivElement>('upload-zone');
    const fileInput = byId<HTMLInputElement>('file-input');
    const fileInfo = byId<HTMLDivElement>('file-info');
    const fileInfoText = byId<HTMLSpanElement>('file-info-text');
    const columnSelector = byId<HTMLDivElement>('column-selector');
    const columnsGrid = byId<HTMLDivElement>('columns-grid');
    const previewSection = byId<HTMLDivElement>('preview-section');
    const previewTable = byId<HTMLTableElement>('preview-table');
    const downloadSection = byId<HTMLDivElement>('download-section');
    const columnSearch = byId<HTMLInputElement>('column-search');
    const columnCount = byId<HTMLDivElement>('column-count');

    function showInfo(text: string, success = false): void {
        fileInfo.classList.add('visible');
        fileInfo.classList.toggle('success', success);
        fileInfoText.textContent = text;
    }

    function setStep(num: number): void {
        for (let i = 1; i <= 3; i++) {
            const step = byId(`step${i}`);
            step.className = 'uip-step';
            if (i < num) step.classList.add('completed');
            else if (i === num) step.classList.add('active');
        }
        byId('connector1-2').classList.toggle('filled', num >= 2);
        byId('connector2-3').classList.toggle('filled', num >= 3);
    }

    function updateColumnCount(): void {
        columnCount.textContent = `${selectedColumns.size} of ${allColumns.length} selected`;
    }

    function renderColumnSelector(): void {
        columnSelector.style.display = '';
        columnsGrid.innerHTML = '';
        selectedColumns = new Set(allColumns);
        columnSearch.value = '';
        updateColumnCount();

        allColumns.forEach((col) => {
            const label = document.createElement('label');
            label.className = 'uip-column-checkbox selected';
            label.setAttribute('data-col', col.toLowerCase());

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.value = col;
            checkbox.addEventListener(
                'change',
                () => {
                    if (checkbox.checked) {
                        selectedColumns.add(col);
                        label.classList.add('selected');
                    } else {
                        selectedColumns.delete(col);
                        label.classList.remove('selected');
                    }
                    updateColumnCount();
                },
                { signal }
            );

            const span = document.createElement('span');
            span.textContent = col;

            label.append(checkbox, span);
            columnsGrid.appendChild(label);
        });
    }

    function handleFile(file: File): void {
        if (!file.name.endsWith('.csv')) {
            showInfo('Please upload a CSV file.');
            return;
        }

        showInfo(`Parsing: ${file.name} (${formatBytes(file.size)})...`);

        Papa.parse<Row>(file, {
            header: true,
            skipEmptyLines: true,
            complete(results) {
                if (signal.aborted) return;
                flatData = flattenData(results.data);
                allColumns = flatData.length > 0 ? Object.keys(flatData[0]) : [];

                if (allColumns.length === 0) {
                    showInfo(`${file.name} — No data found`);
                    return;
                }

                showInfo(`${file.name} — ${results.data.length} rows, ${allColumns.length} columns`, true);
                uploadZone.classList.add('file-loaded');
                setStep(2);
                renderColumnSelector();
            },
            error(err) {
                if (!signal.aborted) showInfo(`Error: ${err.message}`);
            }
        });
    }

    uploadZone.addEventListener('click', () => fileInput.click(), { signal });
    uploadZone.addEventListener(
        'dragover',
        (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        },
        { signal }
    );
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'), { signal });
    uploadZone.addEventListener(
        'drop',
        (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer?.files.length) handleFile(e.dataTransfer.files[0]);
        },
        { signal }
    );
    fileInput.addEventListener(
        'change',
        () => {
            if (fileInput.files?.length) handleFile(fileInput.files[0]);
        },
        { signal }
    );

    columnSearch.addEventListener(
        'input',
        () => {
            const query = columnSearch.value.toLowerCase();
            columnsGrid.querySelectorAll<HTMLElement>('.uip-column-checkbox').forEach((label) => {
                const colName = label.getAttribute('data-col') ?? '';
                label.classList.toggle('hidden', Boolean(query) && !colName.includes(query));
            });
        },
        { signal }
    );

    const setAllVisible = (checked: boolean): void => {
        columnsGrid
            .querySelectorAll<HTMLInputElement>('.uip-column-checkbox:not(.hidden) input')
            .forEach((cb) => {
                cb.checked = checked;
                cb.parentElement?.classList.toggle('selected', checked);
                if (checked) selectedColumns.add(cb.value);
                else selectedColumns.delete(cb.value);
            });
        updateColumnCount();
    };
    byId('select-all-btn').addEventListener('click', () => setAllVisible(true), { signal });
    byId('deselect-all-btn').addEventListener('click', () => setAllVisible(false), { signal });

    function renderPreview(): void {
        previewSection.style.display = '';
        previewTable.innerHTML = '';

        const cols = allColumns.filter((c) => selectedColumns.has(c));
        if (cols.length === 0 || flatData.length === 0) {
            previewTable.innerHTML =
                '<tbody><tr><td class="uip-empty-state">No data to preview</td></tr></tbody>';
            return;
        }

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        cols.forEach((col) => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        previewTable.appendChild(thead);

        const tbody = document.createElement('tbody');
        flatData.slice(0, 10).forEach((row) => {
            const tr = document.createElement('tr');
            cols.forEach((col) => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                td.title = row[col] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        previewTable.appendChild(tbody);
    }

    byId('process-btn').addEventListener(
        'click',
        () => {
            if (selectedColumns.size === 0) {
                columnCount.textContent = 'Please select at least one column.';
                return;
            }
            setStep(3);
            renderPreview();
            downloadSection.style.display = '';
            byId('row-count').textContent =
                `${flatData.length} rows with ${selectedColumns.size} columns selected`;
        },
        { signal }
    );

    byId('download-btn').addEventListener(
        'click',
        () => {
            const cols = allColumns.filter((c) => selectedColumns.has(c));
            const output = flatData.map((row) => {
                const filtered: Row = {};
                cols.forEach((col) => (filtered[col] = row[col] || ''));
                return filtered;
            });

            const csv = Papa.unparse(output);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'processed_queue_data.csv';
            link.click();
            URL.revokeObjectURL(url);

            const toast = byId('success-toast');
            toast.classList.add('visible');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
        },
        { signal }
    );

    byId('start-over-btn').addEventListener(
        'click',
        () => {
            flatData = [];
            allColumns = [];
            selectedColumns = new Set();

            fileInput.value = '';
            fileInfo.classList.remove('visible', 'success');
            fileInfoText.textContent = '';
            uploadZone.classList.remove('file-loaded');
            columnSelector.style.display = 'none';
            columnsGrid.innerHTML = '';
            columnSearch.value = '';
            previewSection.style.display = 'none';
            previewTable.innerHTML = '';
            downloadSection.style.display = 'none';
            byId('success-toast').classList.remove('visible');
            setStep(1);
        },
        { signal }
    );
}
