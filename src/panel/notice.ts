import { ref } from 'vue';

/** Short status message, announced to screen readers through an aria-live region. */
export const notice = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;

export function notify(message: string): void {
  notice.value = '';
  clearTimeout(timer);
  // Re-set on the next tick so repeated identical messages are announced again.
  setTimeout(() => {
    notice.value = message;
    timer = setTimeout(() => (notice.value = ''), 6000);
  }, 50);
}
