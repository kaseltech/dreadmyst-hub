'use client';

interface SocketSelectorProps {
  value: number;
  onChange: (count: number) => void;
  max?: number;
}

export default function SocketSelector({ value, onChange, max = 3 }: SocketSelectorProps) {
  return (
    <div>
      <label className="block text-sm text-muted mb-2">Empty Sockets</label>
      <div className="flex items-center gap-3">
        {/* Socket visual display */}
        <div className="flex gap-2">
          {Array.from({ length: max }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(index + 1 === value ? 0 : index + 1)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                index < value
                  ? 'border-accent bg-accent/30 shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                  : 'border-card-border bg-background hover:border-accent/50'
              }`}
              aria-label={`${index + 1} socket${index + 1 > 1 ? 's' : ''}`}
            >
              {index < value && (
                <span className="block w-full h-full rounded-full bg-gradient-to-br from-accent/50 to-accent/20" />
              )}
            </button>
          ))}
        </div>

        {/* Count display */}
        <span className="text-sm text-muted">
          {value === 0 ? 'No sockets' : `${value} socket${value > 1 ? 's' : ''}`}
        </span>

        {/* Reset button */}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
