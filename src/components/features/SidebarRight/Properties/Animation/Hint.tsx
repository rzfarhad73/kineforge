export function AnimationHint({ isAdvanced }: { isAdvanced: boolean }) {
  return (
    <div
      className={`p-3 rounded-xl mb-4 text-xs leading-relaxed ${
        isAdvanced
          ? 'bg-accent/10 border border-accent/20 text-accent-faint'
          : 'bg-surface/50 border border-surface-raised/50 text-fg-secondary'
      }`}
    >
      {isAdvanced ? (
        <div className="space-y-1.5">
          <p>
            <strong className="text-accent-lighter font-semibold">Keyframes:</strong> Commas define
            steps. E.g., <code className="bg-accent/20 px-1 py-0.5 rounded">0, 50, 0</code> means:
            Start at 0 &rarr; Go to 50 &rarr; Back to 0.
          </p>
          <p>
            <strong className="text-accent-lighter font-semibold">Duration:</strong> "Global Dur"
            sets the base time. Type in "Dur (s)" to override speed for a specific row.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p>
            <strong className="text-fg font-semibold">Simple Mode:</strong> Adjust sliders to
            animate the element continuously.
          </p>
          <p>
            <strong className="text-fg font-semibold">Duration:</strong> "Global Dur" sets the base
            time. Type in "Dur (s)" to override speed for a specific row.
          </p>
        </div>
      )}
    </div>
  )
}
