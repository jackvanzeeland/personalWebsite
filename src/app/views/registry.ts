/**
 * Route → lazily loaded view module. Shared by the client shell (main.ts)
 * and the build-time prerender (scripts/prerender.ts) so both mount the
 * exact same views.
 */

import type { RouteName } from '../routeMeta';
import type { View } from './types';

export const viewLoaders: Record<Exclude<RouteName, 'notFound'>, () => Promise<{ default: View }>> = {
    home: () => import('./home'),
    work: () => import('./projects'),
    workDetail: () => import('./workDetail'),
    journey: () => import('./journey'),
    beyond: () => import('./beyond'),
    contact: () => import('./contact')
};
