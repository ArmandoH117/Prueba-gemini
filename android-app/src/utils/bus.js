const listeners = {};
export const bus = {
  on(evt, cb) { (listeners[evt] ||= new Set()).add(cb); return () => bus.off(evt, cb); },
  off(evt, cb) { listeners[evt]?.delete(cb); },
  emit(evt, payload) { listeners[evt]?.forEach(cb => cb(payload)); },
};