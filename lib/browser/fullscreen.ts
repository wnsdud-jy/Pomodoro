type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

export async function requestBrowserFullscreen(target: HTMLElement) {
  const fullscreenTarget = target as FullscreenElement;

  try {
    if (typeof fullscreenTarget.requestFullscreen === "function") {
      await fullscreenTarget.requestFullscreen();
      return true;
    }

    if (typeof fullscreenTarget.webkitRequestFullscreen === "function") {
      await fullscreenTarget.webkitRequestFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function exitBrowserFullscreen() {
  const fullscreenDocument = document as FullscreenDocument;

  try {
    if (typeof fullscreenDocument.exitFullscreen === "function") {
      await fullscreenDocument.exitFullscreen();
      return true;
    }

    if (typeof fullscreenDocument.webkitExitFullscreen === "function") {
      await fullscreenDocument.webkitExitFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function isBrowserFullscreenActive() {
  const fullscreenDocument = document as FullscreenDocument;

  return Boolean(
    document.fullscreenElement
    || fullscreenDocument.webkitFullscreenElement,
  );
}
