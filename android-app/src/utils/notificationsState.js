export const activeChatIdRef = { current: null };

export const syncActiveChatId = (id) => {
  activeChatIdRef.current = id ?? null;
};
