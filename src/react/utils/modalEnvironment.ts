/** Shared by React dialogs and the Header drawer. Recompute isolation when modals overlap or close out of order. */
interface ModalEntry {
  root: HTMLElement;
  container: HTMLElement;
  lockScroll: boolean;
  companions: HTMLElement[];
}
function createEnvironment() {
  const entries: ModalEntry[] = [];
  const isolated = new Map<HTMLElement, boolean>();
  let lockedBody: HTMLElement | undefined;
  let savedOverflow = '';
  let savedPaddingRight = '';

  function synchronize() {
    for (const [element, inert] of isolated) element.inert = inert;
    isolated.clear();
    const top = entries.at(-1);
    if (top) {
      const isolate = (element: HTMLElement) => {
        // Never isolate the active modal's ancestor path or its backdrop.
        if (element.contains(top.root) || top.companions.includes(element)) return;
        if (!isolated.has(element)) isolated.set(element, element.inert);
        element.inert = true;
      };
      for (const entry of entries) {
        // Preserve outer isolation when the top modal is contained inside a lower dialog.
        let branch = entry.root;
        while (branch !== entry.container && branch.parentElement) {
          const parent = branch.parentElement;
          for (const sibling of parent.children) {
            if (sibling !== branch && 'inert' in sibling) isolate(sibling as HTMLElement);
          }
          branch = parent;
        }
        if (entry !== top) isolate(entry.root);
      }
    }
    const body = entries.find((entry) => entry.lockScroll)?.root.ownerDocument.body;
    if (lockedBody && lockedBody !== body) {
      lockedBody.style.overflow = savedOverflow;
      lockedBody.style.paddingRight = savedPaddingRight;
      lockedBody = undefined;
    }
    if (body && !lockedBody) {
      savedOverflow = body.style.overflow;
      savedPaddingRight = body.style.paddingRight;
      const view = body.ownerDocument.defaultView;
      const bar = view ? view.innerWidth - body.ownerDocument.documentElement.clientWidth : 0;
      if (view && bar > 0) body.style.paddingRight = `${bar + (parseFloat(view.getComputedStyle(body).paddingRight) || 0)}px`;
      body.style.overflow = 'hidden';
      lockedBody = body;
    }
  }

  function enter(root: HTMLElement, container: HTMLElement, lockScroll: boolean, companions: HTMLElement[] = []) {
    const entry = { root, container, lockScroll, companions };
    entries.push(entry);
    synchronize();
    // Also isolate siblings inserted while a modal is open (including portals).
    const Observer = root.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer ? new Observer(synchronize) : undefined;
    observer?.observe(container, { childList: true, subtree: true });
    let disposed = false;
    return {
      isTop: () => entries.at(-1) === entry,
      dispose() {
        if (disposed) return false;
        disposed = true;
        const wasTop = entries.at(-1) === entry;
        observer?.disconnect();
        entries.splice(entries.indexOf(entry), 1);
        synchronize();
        return wasTop;
      },
    };
  }

  return { enter };
}

// Storybook previews and embedded consumers can live in separate documents.
const environments = new WeakMap<Document, ReturnType<typeof createEnvironment>>();
export function enterModal(root: HTMLElement, container: HTMLElement, lockScroll: boolean, companions: HTMLElement[] = []) {
  const doc = root.ownerDocument;
  let environment = environments.get(doc);
  if (!environment) {
    environment = createEnvironment();
    environments.set(doc, environment);
  }
  return environment.enter(root, container, lockScroll, companions);
}

/** Keep Tab within the visible enabled controls, including when focus was moved outside programmatically. */
export function trapModalTab(event: KeyboardEvent, dialog: HTMLElement) {
  if (event.key !== 'Tab' || event.defaultPrevented) return;
  const controls = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.tabIndex >= 0 && !element.closest('[inert]') && element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  const active = dialog.ownerDocument.activeElement;
  if (!first || !dialog.contains(active) || (event.shiftKey && (active === first || active === dialog)) || (!event.shiftKey && active === last)) {
    event.preventDefault();
    (event.shiftKey ? last ?? dialog : first ?? dialog).focus({ preventScroll: true });
  }
}
