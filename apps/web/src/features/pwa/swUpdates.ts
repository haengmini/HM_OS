export type UpdateAvailableListener = (applyUpdate: () => void) => void;

let listener: UpdateAvailableListener | null = null;

export function onUpdateAvailable(fn: UpdateAvailableListener) {
  listener = fn;
}

export function notifyUpdateAvailable(applyUpdate: () => void) {
  listener?.(applyUpdate);
}
