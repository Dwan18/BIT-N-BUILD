export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDay = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

export const timeAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
};

export const formatNumber = (n) => new Intl.NumberFormat().format(n);

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
