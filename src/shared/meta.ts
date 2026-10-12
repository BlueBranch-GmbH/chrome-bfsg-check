/** Public repository, linked from the panel footer. */
export const REPO_URL = 'https://github.com/BlueBranch-GmbH/chrome-bfsg-check';

/** Developer of the extension, credited in the panel and in exported reports. */
export const AUTHOR_NAME = 'BlueBranch';
export const AUTHOR_URL = 'https://www.bluebranch.de/';

/**
 * Link from inside the extension UI. The UTM parameters only show up in
 * bluebranch's own analytics when someone clicks; the extension itself
 * sends nothing.
 */
export function authorLink(content: string): string {
  const url = new URL(AUTHOR_URL);
  url.searchParams.set('utm_source', 'bfsg-check');
  url.searchParams.set('utm_medium', 'extension');
  url.searchParams.set('utm_content', content);
  return url.toString();
}
