// Helpers DOM selon les règles .cursorrules

// Fonctions utilitaires pour la manipulation DOM
export const createDomHelper = () => {
  const getElementById = (id: string): HTMLElement | null => {
    return document.getElementById(id);
  };

  const updateTextContent = (elementId: string, content: string): void => {
    const element = getElementById(elementId);
    if (element) element.textContent = content;
  };

  const updateImageSrc = (elementId: string, src: string): void => {
    const element = getElementById(elementId) as HTMLImageElement;
    if (element) element.src = src;
  };

  const addClass = (elementId: string, className: string): void => {
    getElementById(elementId)?.classList.add(className);
  };

  const removeClass = (elementId: string, className: string): void => {
    getElementById(elementId)?.classList.remove(className);
  };

  const toggleClass = (elementId: string, className: string): void => {
    getElementById(elementId)?.classList.toggle(className);
  };

  const hasClass = (elementId: string, className: string): boolean => {
    return getElementById(elementId)?.classList.contains(className) ?? false;
  };

  const addEventListener = (
    elementId: string,
    event: string,
    handler: EventListener
  ): void => {
    getElementById(elementId)?.addEventListener(event, handler);
  };

  const removeEventListener = (
    elementId: string,
    event: string,
    handler: EventListener
  ): void => {
    getElementById(elementId)?.removeEventListener(event, handler);
  };

  const setInnerHTML = (elementId: string, html: string): void => {
    const element = getElementById(elementId);
    if (element) element.innerHTML = html;
  };

  const clearInnerHTML = (elementId: string): void => {
    setInnerHTML(elementId, "");
  };

  const createButton = (
    className: string,
    innerHTML: string,
    clickHandler: () => void
  ): HTMLButtonElement => {
    const button = document.createElement("button");
    button.className = className;
    button.innerHTML = innerHTML;
    button.addEventListener("click", clickHandler);
    return button;
  };

  return {
    getElementById,
    updateTextContent,
    updateImageSrc,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    addEventListener,
    removeEventListener,
    setInnerHTML,
    clearInnerHTML,
    createButton,
  };
};
