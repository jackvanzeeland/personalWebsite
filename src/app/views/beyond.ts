/**
 * /beyond — life outside the terminal: sports, media picks, photos.
 * DOM comes from beyondContent.ts; the legacy gallery/accordion classes
 * are instantiated after it mounts.
 */

import type { View } from './types';
import { requestFormation } from '../../scene/stage';
import { nebulaBuilder } from '../../scene/formations/nebula';
import { buildBeyondContent } from './beyondContent';
import { PhotoGallery } from '../../components/PhotoGallery';
import { MediaAccordion } from '../../components/MediaAccordion';
import '../../styles/redesign/beyond.css';

let gallery: PhotoGallery | null = null;

const view: View = {
    mount(root) {
        requestFormation(nebulaBuilder);

        const section = document.createElement('section');
        section.className = 'beyond container-x';
        section.appendChild(buildBeyondContent());
        section.querySelectorAll('.sport-card, .media-accordion, .photo-gallery')
            .forEach((el) => el.setAttribute('data-reveal', ''));
        root.appendChild(section);

        gallery = new PhotoGallery();
        new MediaAccordion();
    },

    unmount() {
        // The gallery's arrow-key listener lives on document, not the view
        gallery?.destroy();
        gallery = null;
    }
};

export default view;
