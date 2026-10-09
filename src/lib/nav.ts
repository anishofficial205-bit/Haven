import { router, type Href } from 'expo-router';

/**
 * Where "back" leads when there is no earlier screen to return to, which
 * happens after a reload or when a screen is opened directly. The first
 * matching prefix wins, so list the more specific ones first.
 */
const PARENTS: [prefix: string, parent: Href][] = [
  ['/settings/', '/settings'],
  ['/about/', '/settings'],
  ['/settings', '/profile'],
  ['/mod', '/profile'],
  ['/help/requests/', '/help/requests'],
  ['/help/', '/help'],
  ['/scenario/', '/scenarios'],
  ['/space/', '/spaces'],
  ['/question/', '/spaces'],
  ['/post/', '/confess'],
  ['/compose', '/confess'],
];

/** Go back if possible; otherwise go to the screen this one belongs under. */
export function goBack(pathname: string) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  const parent = PARENTS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? '/';
  router.replace(parent);
}
