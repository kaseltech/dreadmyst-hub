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
              className="w-8 h-8 rounded-full transition-all"
              style={index < value
                ? {
                    border: '2px solid #f59e0b',
                    background: 'rgba(245,158,11,0.2)',
                    boxShadow: '0 0 10px rgba(245,158,11,0.3)'
                  }
                : {
                    border: '2px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.02)'
                  }
              }
              onMouseEnter={(e) => {
                if (index >= value) {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (index >= value) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }
              }}
              aria-label={`${index + 1} socket${index + 1 > 1 ? 's' : ''}`}
            >
              {index < value && (
                <span className="block w-full h-full rounded-full" style={{ background: 'linear-gradient(to bottom right, rgba(245,158,11,0.5), rgba(245,158,11,0.2))' }} />
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
