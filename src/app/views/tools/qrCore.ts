/**
 * QR Code Generator logic — ported from the retired standalone page.
 * Bilingual EN/ES, url/text/vCard sources, debounced live preview,
 * PNG download and clipboard copy. All listeners take { signal } so
 * the detail view can abort everything on unmount.
 */

import QRious from 'qrious';

type Lang = 'en' | 'es';

const translations: Record<Lang, Record<string, string>> = {
    en: {
        subtitle: 'Generate QR codes for URLs, text, or contact cards.',
        tabUrl: 'URL', tabText: 'Text', tabContact: 'Contact',
        urlLabel: 'Website URL', textLabel: 'Text Content',
        sectionPersonal: 'Personal', sectionContact: 'Contact',
        sectionProfessional: 'Professional', sectionLocation: 'Location',
        sectionSocial: 'Social & Web', sectionOther: 'Other',
        firstName: 'First Name', lastName: 'Last Name',
        phone: 'Phone Number', personalEmail: 'Personal Email',
        workEmail: 'Work Email', jobTitle: 'Job Title',
        organization: 'Organization', city: 'City', state: 'State',
        instagram: 'Instagram @', linkedin: 'LinkedIn URL',
        website: 'Website', birthday: 'Birthday', notes: 'Notes / Bio',
        generate: 'Generate QR Code', clear: 'Clear',
        download: 'Download PNG', copy: 'Copy to Clipboard',
        copied: 'Copied!', noData: 'Please enter some data first.',
        downloadReady: 'Download started!', cleared: 'Form cleared.'
    },
    es: {
        subtitle: 'Genera codigos QR para URLs, texto o tarjetas de contacto.',
        tabUrl: 'URL', tabText: 'Texto', tabContact: 'Contacto',
        urlLabel: 'URL del sitio web', textLabel: 'Contenido de texto',
        sectionPersonal: 'Personal', sectionContact: 'Contacto',
        sectionProfessional: 'Profesional', sectionLocation: 'Ubicacion',
        sectionSocial: 'Redes y Web', sectionOther: 'Otro',
        firstName: 'Nombre', lastName: 'Apellido',
        phone: 'Numero de telefono', personalEmail: 'Correo personal',
        workEmail: 'Correo de trabajo', jobTitle: 'Cargo',
        organization: 'Organizacion', city: 'Ciudad', state: 'Estado',
        instagram: 'Instagram @', linkedin: 'URL de LinkedIn',
        website: 'Sitio web', birthday: 'Cumpleanos', notes: 'Notas / Bio',
        generate: 'Generar codigo QR', clear: 'Limpiar',
        download: 'Descargar PNG', copy: 'Copiar al portapapeles',
        copied: 'Copiado!', noData: 'Por favor ingresa algunos datos primero.',
        downloadReady: 'Descarga iniciada!', cleared: 'Formulario limpio.'
    }
};

interface ContactFields {
    first: string; last: string; phone: string; email: string;
    workEmail: string; title: string; org: string; city: string;
    state: string; instagram: string; linkedin: string; website: string;
    birthday: string; notes: string;
}

function buildVCard(c: ContactFields): string {
    if (!c.first && !c.last && !c.phone && !c.email) return '';

    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    if (c.first || c.last) {
        lines.push(`N:${c.last};${c.first};;;`);
        lines.push(`FN:${`${c.first} ${c.last}`.trim()}`);
    }
    if (c.org) lines.push(`ORG:${c.org}`);
    if (c.title) lines.push(`TITLE:${c.title}`);
    if (c.phone) lines.push(`TEL;TYPE=CELL:${c.phone}`);
    if (c.email) lines.push(`EMAIL;TYPE=HOME:${c.email}`);
    if (c.workEmail) lines.push(`EMAIL;TYPE=WORK:${c.workEmail}`);
    if (c.city || c.state) lines.push(`ADR;TYPE=HOME:;;${c.city};${c.state};;;`);
    if (c.birthday) lines.push(`BDAY:${c.birthday.replace(/-/g, '')}`);
    if (c.website) lines.push(`URL:${c.website}`);
    if (c.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${c.instagram}`);
    if (c.linkedin) lines.push(`URL;TYPE=LinkedIn:${c.linkedin}`);
    if (c.notes) lines.push(`NOTE:${c.notes}`);
    lines.push('END:VCARD');
    return lines.join('\n');
}

export function initQrGenerator(root: HTMLElement, signal: AbortSignal): void {
    const byId = <T extends HTMLElement>(id: string): T => root.querySelector(`#${id}`) as T;

    let currentLang: Lang = 'en';
    let activeTab = 'url';
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    signal.addEventListener('abort', () => clearTimeout(debounceTimer));

    const statusMsg = byId<HTMLDivElement>('status-msg');
    const output = byId<HTMLDivElement>('qr-output');
    const canvas = byId<HTMLCanvasElement>('qr-canvas');

    const setStatus = (text: string, kind?: 'success' | 'error' | 'info'): void => {
        statusMsg.textContent = text;
        statusMsg.className = `qr-status${kind ? ` ${kind}` : ''}`;
    };

    function applyLanguage(lang: Lang): void {
        currentLang = lang;
        root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((node) => {
            const key = node.getAttribute('data-i18n');
            if (key && translations[lang][key]) node.textContent = translations[lang][key];
        });
        root.querySelectorAll<HTMLButtonElement>('.qr-lang-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    root.querySelectorAll<HTMLButtonElement>('.qr-lang-btn').forEach((btn) => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang as Lang), { signal });
    });

    root.querySelectorAll<HTMLButtonElement>('.qr-tab-btn').forEach((btn) => {
        btn.addEventListener(
            'click',
            () => {
                activeTab = btn.dataset.tab ?? 'url';
                root.querySelectorAll('.qr-tab-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                root.querySelectorAll('.qr-panel-tab').forEach((p) => p.classList.remove('active'));
                byId(`tab-${activeTab}`).classList.add('active');
                byId('clear-btn').style.display = activeTab === 'contact' ? '' : 'none';
            },
            { signal }
        );
    });

    function getContactFields(): ContactFields {
        const val = (id: string): string => byId<HTMLInputElement>(id).value.trim();
        return {
            first: val('contact-first'), last: val('contact-last'),
            phone: val('contact-phone'), email: val('contact-email'),
            workEmail: val('contact-work-email'), title: val('contact-title'),
            org: val('contact-org'), city: val('contact-city'),
            state: val('contact-state'), instagram: val('contact-instagram'),
            linkedin: val('contact-linkedin'), website: val('contact-website'),
            birthday: byId<HTMLInputElement>('contact-birthday').value,
            notes: val('contact-notes')
        };
    }

    function getQRData(): string {
        if (activeTab === 'url') return byId<HTMLInputElement>('url-input').value.trim();
        if (activeTab === 'text') return byId<HTMLTextAreaElement>('text-input').value.trim();
        return buildVCard(getContactFields());
    }

    function generateQR(): void {
        const data = getQRData();
        if (!data) {
            output.style.display = 'none';
            return;
        }
        setStatus('');
        new QRious({
            element: canvas,
            value: data,
            size: 256,
            backgroundAlpha: 1,
            foreground: '#000000',
            background: '#ffffff',
            level: 'M'
        });
        output.style.display = '';
        output.classList.remove('animate-in');
        void output.offsetWidth; // restart the scale-in animation
        output.classList.add('animate-in');
    }

    function debouncedGenerate(): void {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQR, 500);
    }

    root.querySelectorAll<HTMLElement>(
        '#tab-url input, #tab-text textarea, #tab-contact input, #tab-contact textarea'
    ).forEach((input) => input.addEventListener('input', debouncedGenerate, { signal }));

    byId('generate-btn').addEventListener(
        'click',
        () => {
            if (!getQRData()) {
                setStatus(translations[currentLang].noData, 'error');
                return;
            }
            generateQR();
        },
        { signal }
    );

    byId('clear-btn').addEventListener(
        'click',
        () => {
            root.querySelectorAll<HTMLInputElement>('#tab-contact input, #tab-contact textarea').forEach(
                (input) => (input.value = '')
            );
            output.style.display = 'none';
            setStatus(translations[currentLang].cleared, 'info');
        },
        { signal }
    );

    byId('download-btn').addEventListener(
        'click',
        () => {
            const link = document.createElement('a');
            link.download = 'qr-code.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            setStatus(`✅ ${translations[currentLang].downloadReady}`, 'success');
        },
        { signal }
    );

    byId('copy-btn').addEventListener(
        'click',
        () => {
            canvas.toBlob((blob) => {
                if (!blob) return;
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    setStatus(`✅ ${translations[currentLang].copied}`, 'success');
                });
            });
        },
        { signal }
    );
}
