import { initials } from '../../utils/format';

export default function Avatar({ name, size = 'md' }) {
  const dim = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm';
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-ink-600 font-semibold text-signal-300 ${dim}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
