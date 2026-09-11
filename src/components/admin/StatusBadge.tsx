// ─── Admin Status Badge ───────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  // Contact
  NEW:          'bg-brand-sky dark:bg-brand-cyan/20 text-brand-navy dark:text-brand-cyan font-semibold border border-brand-cyan/20',
  READ:         'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-transparent dark:border-dark-border',
  REPLIED:      'bg-brand-sage/60 dark:bg-emerald-950/40 text-brand-green dark:text-emerald-400 font-semibold border border-transparent dark:border-emerald-800',
  ARCHIVED:     'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 border border-transparent dark:border-dark-border',
  // Volunteer
  REVIEWING:    'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800',
  CONTACTED:    'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800',
  ACTIVE:       'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800',
  INACTIVE:     'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-dark-border',
  // Newsletter
  UNSUBSCRIBED: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800',
  // Donation
  INTENT:       'bg-brand-sky dark:bg-brand-cyan/20 text-brand-navy dark:text-brand-cyan border border-transparent dark:border-dark-border',
  PENDING:      'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800',
  COMPLETED:    'bg-brand-sage/60 dark:bg-emerald-950/40 text-brand-green dark:text-emerald-400 font-semibold border border-brand-green/20 dark:border-emerald-800',
  FAILED:       'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-semibold border border-red-200 dark:border-red-800',
  CANCELLED:    'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 border border-transparent dark:border-dark-border',
  REFUNDED:     'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800',
  // Published / Draft
  PUBLISHED:    'bg-emerald-50 dark:bg-emerald-950/40 text-brand-green dark:text-emerald-400 font-semibold border border-brand-green/20 dark:border-emerald-800',
  DRAFT:        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase()
  const style = statusStyles[normalized] ?? 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 border border-transparent dark:border-dark-border'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
    </span>
  )
}
