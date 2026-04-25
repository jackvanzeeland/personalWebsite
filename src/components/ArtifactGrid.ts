import { Artifact } from '../types';
import { ARTIFACTS } from '../data/artifacts';
import AOS from 'aos';

export function renderArtifacts(): void {
    const grid = document.getElementById('artifacts-grid');
    if (!grid) return;

    grid.innerHTML = '';

    ARTIFACTS.forEach((artifact, index) => {
        const card = createArtifactCard(artifact, index);
        grid.appendChild(card);
    });

    AOS.refresh();
}

function createArtifactCard(artifact: Artifact, index: number): HTMLDivElement {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', (index * 100).toString());

    const card = document.createElement('div');
    card.className = 'project-card h-100';

    // Image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'project-image';

    const img = document.createElement('img');
    img.src = `/assets/images/${artifact.image}`;
    img.alt = `Screenshot of ${artifact.title}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
        img.src = '/assets/images/placeholder.svg';
    });
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // Content
    const content = document.createElement('div');
    content.className = 'project-content';

    const title = document.createElement('h5');
    title.className = 'project-title';
    title.textContent = artifact.title;
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'project-description';
    desc.textContent = artifact.description;
    content.appendChild(desc);

    // Technologies
    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';
    artifact.technologies.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techContainer.appendChild(tag);
    });
    content.appendChild(techContainer);

    // Link
    const linksContainer = document.createElement('div');
    linksContainer.className = 'project-links';

    const viewLink = document.createElement('a');
    viewLink.href = `/pages/artifacts/${artifact.page}`;
    viewLink.className = 'btn btn-primary btn-sm';
    viewLink.textContent = 'View Artifact';
    linksContainer.appendChild(viewLink);

    content.appendChild(linksContainer);
    card.appendChild(content);
    col.appendChild(card);

    return col;
}
