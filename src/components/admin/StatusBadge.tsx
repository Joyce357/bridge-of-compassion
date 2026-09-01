// ─── Admin Status Badge ───────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  // Contact
  NEW:          'bg-brand-sky text-brand-navy font-semibold border border-brand-cyan/20',
  READ:         'bg-gray-100 text-gray-700',
  REPLIED:      'bg-brand-sage/60 text-brand-green font-semibold',
  ARCHIVED:     'bg-gray-100 text-gray-500',
  // Volunteer
  REVIEWING:    'bg-amber-100 text-amber-800 font-semibold border border-amber-200',
  CONTACTED:    'bg-sky-100 text-sky-800 font-semibold border border-sky-200',
  ACTIVE:       'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200',
  INACTIVE:     'bg-gray-100 text-gray-600 font-medium border border-gray-200',
  // Newsletter
  UNSUBSCRIBED: 'bg-red-50 text-red-600 border border-red-200',
  // Donation
  INTENT:       'bg-brand-sky text-brand-navy',
  PENDING:      'bg-amber-100 text-amber-800 font-semibold',
  COMPLETED:    'bg-brand-sage/60 text-brand-green font-semibold',
  FAILED:       'bg-red-100 text-red-800 font-semibold',
  CANCELLED:    'bg-gray-100 text-gray-500',
  REFUNDED:     'bg-purple-100 text-purple-800 font-semibold border border-purple-200',
  // Published / Draft
  PUBLISHED:    'bg-emerald-50 text-brand-green font-semibold border border-brand-green/20',
  DRAFT:        'bg-amber-50 text-amber-700 font-semibold border border-amber-200',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase()
  const style = statusStyles[normalized] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
    </span>
  )
}
