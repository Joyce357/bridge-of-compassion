// ─── Admin Stat Card ──────────────────────────────────────────────────────

interface StatCardProps {
  label:    string
  value:    string | number
  icon:     React.ReactNode | string
  subLabel?: string
  subValue?: string | number
  color?:   'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'blue' | 'amber'
}

const colorMap = {
  cyan:   { bg: 'bg-brand-sky',       text: 'text-brand-cyan',      line: 'bg-brand-cyan' },
  green:  { bg: 'bg-green-50',        text: 'text-brand-green',     line: 'bg-brand-green' },
  orange: { bg: 'bg-amber-50',        text: 'text-accent-orange',   line: 'bg-accent-orange' },
  pink:   { bg: 'bg-pink-50',         text: 'text-accent-pink',     line: 'bg-accent-pink' },
  purple: { bg: 'bg-purple-50',       text: 'text-accent-purple',   line: 'bg-accent-purple' },
  blue:   { bg: 'bg-brand-sky',       text: 'text-brand-navy',      line: 'bg-brand-navy' },
  amber:  { bg: 'bg-amber-50',        text: 'text-amber-600',       line: 'bg-amber-500' },
}

export default function StatCard({
  label,
  value,
  icon,
  subLabel,
  subValue,
  color = 'green',
}: StatCardProps) {
  const theme = colorMap[color] ?? colorMap.green

  return (
    <div className="bg-brand-warm-white rounded-2xl p-5 sm:p-6 shadow-card border border-border-soft hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${theme.bg} ${theme.text} mb-3`}>
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
          <p className="text-3xl font-extrabold text-brand-navy tracking-tight">{value}</p>
          <p className="text-text-secondary text-xs sm:text-sm font-medium mt-1 truncate">{label}</p>
          {subLabel && subValue !== undefined && (
            <p className="text-text-secondary text-xs mt-1">
              <span className="font-semibold text-brand-green">{subValue}</span>
              {' '}{subLabel}
            </p>
          )}
        </div>
      </div>
      {/* Subtle bottom indicator accent line */}
      <div className={`h-1 w-12 rounded-full ${theme.line} mt-4 opacity-75`} />
    </div>
  )
}
