import { getOpenState } from '../../utils/openingHours';

interface Props {
  openingHours?: string;
  size?: 'sm' | 'md';
}

/**
 * 依 opening_hours 顯示「現在開放中／已打烊」。
 * 無法可靠解析時不顯示任何內容（不誤導使用者）。
 */
export default function OpenNowBadge({ openingHours, size = 'sm' }: Props) {
  const state = getOpenState(openingHours);
  if (state.status === 'unknown') return null;

  const pad = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  if (state.status === 'open') {
    return (
      <span
        className={`${pad} font-bold rounded-full bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1`}
        title={state.always ? '24 小時開放' : `${state.closesAt} 打烊`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
        {state.always ? '24H 開放' : `開放中${state.closesAt ? ` · ${state.closesAt} 打烊` : ''}`}
      </span>
    );
  }

  return (
    <span
      className={`${pad} font-bold rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200 inline-flex items-center gap-1`}
      title={state.opensAt ? `${state.opensAt} 開放` : '目前已打烊'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" aria-hidden />
      已打烊{state.opensAt ? ` · ${state.opensAt} 開` : ''}
    </span>
  );
}
