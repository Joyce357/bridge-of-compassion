// ─── Admin Empty State ────────────────────────────────────────────────────

interface EmptyStateProps {
  icon:     string
  title:    string
  message:  string
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-brand-navy mb-1">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm">{message}</p>

    </div>
  )
}
