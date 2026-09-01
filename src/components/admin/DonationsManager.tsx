'use client'
// ─── Admin Donations Manager Component ─────────────────────────────────────────
// Full-featured CMS for reviewing, searching, filtering, and managing donations.
// Includes real aggregation KPIs, detail modal, CSV export, and receipt resend.

import { useState, useEffect, useCallback } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import StatCard from '@/components/admin/StatCard'
import type { DonationRecord, DonationSummaryStats } from '@/types'

interface DonationsManagerProps {
  initialDonations: DonationRecord[]
  initialStats: DonationSummaryStats
}

export default function DonationsManager({ initialDonations, initialStats }: DonationsManagerProps) {
  const [donations, setDonations] = useState<DonationRecord[]>(initialDonations)
  const [stats, setStats] = useState<DonationSummaryStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalFiltered, setTotalFiltered] = useState(initialDonations.length)
  
  // Detail Modal State
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null)
  const [resendingReceipt, setResendingReceipt] = useState(false)
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Fetch donations with search & filter
  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      params.set('page', String(page))
      params.set('limit', '25')

      const res = await fetch(`/api/admin/donations?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch donations')

      const data = await res.json()
      setDonations(data.donations || [])
      setTotalFiltered(data.total || 0)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('[DonationsManager] Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, page])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  // Handle Receipt Resend
  const handleResendReceipt = async (id: string) => {
    setResendingReceipt(true)
    setResendStatus(null)

    try {
      const res = await fetch(`/api/admin/donations/${id}/resend-receipt`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setResendStatus({
          type: 'error',
          message: data.error || 'Failed to dispatch receipt email.',
        })
      } else {
        setResendStatus({
          type: 'success',
          message: data.message || 'Receipt sent successfully.',
        })
        // Update local record
        setDonations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, receiptSent: true, receiptSentAt: data.receiptSentAt } : d))
        )
        if (selectedDonation && selectedDonation.id === id) {
          setSelectedDonation({
            ...selectedDonation,
            receiptSent: true,
            receiptSentAt: data.receiptSentAt,
          })
        }
      }
    } catch (err) {
      console.error('[Resend Receipt] Error:', err)
      setResendStatus({
        type: 'error',
        message: 'Network error while attempting to resend receipt.',
      })
    } finally {
      setResendingReceipt(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    window.open(`/api/admin/donations/export?${params.toString()}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Confirmed Raised"
          value={`$${stats.totalRaised.toFixed(2)}`}
          icon="💰"
          subLabel="CAD (completed only)"
          subValue=""
          color="green"
        />
        <StatCard
          label="Completed Gifts"
          value={stats.completedCount}
          icon="✅"
          subLabel="successful"
          subValue={stats.completedCount}
          color="cyan"
        />
        <StatCard
          label="In-Flight Orders"
          value={stats.pendingCount}
          icon="⏳"
          subLabel="pending capture"
          subValue={stats.pendingCount}
          color="orange"
        />
        <StatCard
          label="Refunded / Failed"
          value={stats.refundedCount + stats.failedCount}
          icon="🔄"
          subLabel="refunds/fails"
          subValue={`${stats.refundedCount} ref / ${stats.failedCount} fail`}
          color="purple"
        />
      </div>

      {/* Action Toolbar */}
      <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by donor, email, PayPal ID…"
            aria-label="Search donations"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border-soft bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPage(1)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-brand-navy"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter & CSV Export */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {['ALL', 'COMPLETED', 'PENDING', 'INTENT', 'REFUNDED', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-white border border-border-soft text-text-secondary hover:text-brand-navy hover:bg-brand-cream/30'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-border-soft text-brand-navy hover:bg-brand-cream/40 transition-colors shadow-xs"
            title="Download CSV"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Donations Data Table */}
      <div className="bg-brand-warm-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-text-secondary text-sm">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full mb-2" />
            <p>Loading donations…</p>
          </div>
        ) : donations.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No donations found"
            message={
              searchQuery || statusFilter !== 'ALL'
                ? 'No donation records match the current filter or search criteria.'
                : 'No donation records have been registered in the database yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF6] text-text-secondary text-xs uppercase font-semibold border-b border-border-soft">
                <tr>
                  <th className="px-5 py-3.5">Donor</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">PayPal Ref</th>
                  <th className="px-5 py-3.5">Receipt</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-brand-cream/20 transition-colors">
                    {/* Donor Column */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-brand-navy text-sm">
                        {d.isAnonymous ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-text-secondary font-normal">👤</span> Anonymous
                          </span>
                        ) : (
                          d.donorName || 'Supporter'
                        )}
                      </div>
                      <div className="text-xs text-text-secondary truncate max-w-[200px]">
                        {d.donorEmail || 'No email recorded'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 font-bold text-brand-navy text-sm">
                      {d.currency} ${Number(d.amount).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={d.status} />
                    </td>

                    {/* PayPal Reference */}
                    <td className="px-5 py-3.5 text-xs text-text-secondary font-mono">
                      {d.paypalCaptureId || d.paypalOrderId || d.paymentRef || '—'}
                    </td>

                    {/* Receipt Status */}
                    <td className="px-5 py-3.5">
                      {d.receiptSent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Sent
                        </span>
                      ) : d.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ⏳ Pending
                        </span>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDonation(d)
                          setResendStatus(null)
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-warm-white border border-border-soft text-brand-navy hover:bg-brand-cream/50 transition-all shadow-xs"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Count */}
        <div className="px-5 py-3.5 bg-[#F8FAF6] border-t border-border-soft flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {donations.length} of {totalFiltered} records</span>
          <span>Payment Provider: <strong>PayPal Sandbox/Live</strong></span>
        </div>
      </div>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-brand-warm-white rounded-3xl shadow-2xl border border-border-soft max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-brand-cream/60 flex items-center justify-center text-text-secondary hover:text-brand-navy hover:bg-brand-cream transition-colors text-sm"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center text-2xl font-bold">
                🌱
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy">Donation Record</h3>
                <p className="text-xs text-text-secondary font-mono">ID: {selectedDonation.id}</p>
              </div>
            </div>

            {/* Resend Status Alert */}
            {resendStatus && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs font-medium border ${
                  resendStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
                role="alert"
              >
                {resendStatus.message}
              </div>
            )}

            {/* Detail Grid */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Amount & Status Banner */}
              <div className="flex items-center justify-between p-4 bg-[#F8FAF6] border border-border-soft rounded-2xl">
                <div>
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Amount</span>
                  <p className="text-2xl font-extrabold text-brand-navy">
                    {selectedDonation.currency} ${Number(selectedDonation.amount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-wider block mb-1">Status</span>
                  <StatusBadge status={selectedDonation.status} />
                </div>
              </div>

              {/* Donor Information */}
              <div className="border border-border-soft rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider text-text-secondary">Donor Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-secondary">Donor Name:</span>
                    <p className="font-semibold text-brand-navy">
                      {selectedDonation.isAnonymous ? (
                        <span className="text-text-secondary font-normal italic">Anonymous Supporter</span>
                      ) : (
                        selectedDonation.donorName || 'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Donor Email:</span>
                    <p className="font-semibold text-brand-navy break-all">{selectedDonation.donorEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Public Recognition:</span>
                    <p className="font-semibold text-brand-navy">
                      {selectedDonation.isAnonymous ? '🔒 Anonymous' : 'Public / Recognized'}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Frequency:</span>
                    <p className="font-semibold text-brand-navy">One-Time Gift</p>
                  </div>
                </div>

                {selectedDonation.message && (
                  <div className="pt-2 border-t border-border-soft mt-2">
                    <span className="text-text-secondary">Donor Message / Dedication:</span>
                    <p className="italic text-brand-navy mt-1 bg-white p-2.5 rounded-lg border border-border-soft">
                      &ldquo;{selectedDonation.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* PayPal Technical Details */}
              <div className="border border-border-soft rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider text-text-secondary">PayPal Gateway Identifiers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-text-secondary font-sans">PayPal Order ID:</span>
                    <p className="text-brand-navy truncate">{selectedDonation.paypalOrderId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary font-sans">PayPal Capture ID:</span>
                    <p className="text-brand-navy truncate">{selectedDonation.paypalCaptureId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary font-sans">Payer ID:</span>
                    <p className="text-brand-navy truncate">{selectedDonation.paypalPayerId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary font-sans">Payer PayPal Email:</span>
                    <p className="text-brand-navy truncate">{selectedDonation.paypalPayerEmail || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Receipt Status & Action */}
              <div className="border border-border-soft rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider text-text-secondary">Receipt Delivery</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {selectedDonation.receiptSent
                      ? `Receipt sent on ${new Date(selectedDonation.receiptSentAt || selectedDonation.createdAt).toLocaleDateString('en-CA')}`
                      : 'Receipt has not yet been accepted by the email provider.'}
                  </p>
                </div>

                {selectedDonation.status === 'COMPLETED' && selectedDonation.donorEmail && (
                  <button
                    onClick={() => handleResendReceipt(selectedDonation.id)}
                    disabled={resendingReceipt}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand-green text-brand-warm-white hover:bg-brand-green/90 disabled:opacity-50 transition-all shadow-xs shrink-0"
                  >
                    {resendingReceipt ? 'Sending…' : 'Resend Receipt'}
                  </button>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-border-soft text-brand-navy hover:bg-brand-cream/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
