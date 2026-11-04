type Props = {
  label: string;
  value: number;
  max: number;
  color?: string;
  unit?: string;
};

export function Meter({ label, value, max, color = "#f97316", unit = "" }: Props) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mono text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-200">
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-slag-700">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
