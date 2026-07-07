/**
 * /beyond — life outside the terminal: sports, media picks, photos, Instagram.
 * Markup extracted verbatim from the old page; the three gallery components
 * are the original classes, instantiated after the DOM mounts.
 */

import type { View } from './types';
import { requestFormation } from '../../scene/stage';
import { nebulaBuilder } from '../../scene/formations/nebula';
import { BEYOND_MARKUP } from './beyondMarkup';
import { PhotoGallery } from '../../components/PhotoGallery';
import { InstagramGallery } from '../../components/InstagramGallery';
import { MediaAccordion } from '../../components/MediaAccordion';
import '../../styles/redesign/beyond.css';

const view: View = {
    mount(root) {
        requestFormation(nebulaBuilder);

        const section = document.createElement('section');
        section.className = 'beyond container-x';
        // Trusted compile-time constant extracted from our own repo markup
        section.innerHTML = BEYOND_MARKUP;
        section.querySelectorAll('.sport-card, .media-accordion, .photo-container')
            .forEach((el) => el.setAttribute('data-reveal', ''));
        root.appendChild(section);

        new PhotoGallery();
        new InstagramGallery();
        new MediaAccordion();
    },

    unmount() {
        /* component listeners live on removed nodes */
    }
};

export default view;
