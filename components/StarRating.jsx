'use client';

/** Estrellas de solo lectura (promedio) o interactivas (onRate) */
export default function StarRating({ value = 0, count = null, myRating = null, onRate = null }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            disabled={!onRate}
            onClick={() => onRate && onRate(s)}
            className={`text-lg leading-none ${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
              (onRate ? (myRating || 0) : value) >= s ? 'text-amber-400' : 'text-slate-300'
            }`}
            title={onRate ? `Calificar con ${s} estrella${s > 1 ? 's' : ''}` : undefined}
          >
            ★
          </button>
        ))}
      </span>
      {!onRate && (
        <span className="text-xs text-slate-400">
          {value ? value.toFixed(1) : '—'}{count !== null ? ` (${count})` : ''}
        </span>
      )}
    </span>
  );
}
