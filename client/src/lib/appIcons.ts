
import { apps } from './apps';

export const appIcons = Object.entries(apps).reduce((acc, [key, app]) => {
  acc[app.component] = app.icon;
  return acc;
}, {} as Record<string, any>);

export const getAppIcon = (component: string) => appIcons[component];
