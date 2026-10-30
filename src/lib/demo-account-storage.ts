export function demoAccountStorageKey(base: string, email: string) {
  return `${base}:account:${encodeURIComponent(email.trim().toLowerCase())}`;
}

export function scopeDemoAccountHtml(html: string, email: string) {
  let result = html;
  for (const base of [
    'polarHomeV2',
    'mg-dashboard-v1',
    'polarCoins',
    'polarUnlocked',
    'polarCompleted',
  ]) {
    result = result.replaceAll(
      `'${base}'`,
      JSON.stringify(demoAccountStorageKey(base, email)),
    );
  }
  return result.replace(
    '<head>',
    `<head><script>window.polarMissionStoreKey=${JSON.stringify(demoAccountStorageKey('polarHomeV2', email))};</script>`,
  );
}

export function subscribeDemoGoal(callback: () => void) {
  window.addEventListener('polar-demo-goal-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('polar-demo-goal-change', callback);
    window.removeEventListener('storage', callback);
  };
}
