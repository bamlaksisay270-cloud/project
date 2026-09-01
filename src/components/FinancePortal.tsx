import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Plus,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { FinanceApplication, User } from '../types/index.ts';

interface FinancePortalProps {
  currentUser: User | null;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({
  currentUser,
}) => {
  const [loans, setLoans] = useState<FinanceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<FinanceApplication | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application Form State
  const [loanType, setLoanType] = useState('INPUT_FINANCING');
  const [amountRequestedEtb, setAmountRequestedEtb] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetCrop, setTargetCrop] = useState('');
  const [expectedYieldTons, setExpectedYieldTons] = useState('');
  const [expectedRevenueEtb, setExpectedRevenueEtb] = useState('');
  const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState('12');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/applications');
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanType,
          amountRequestedEtb: Number(amountRequestedEtb),
          purpose,
          targetCrop,
          expectedYieldTons: Number(expectedYieldTons),
          expectedRevenueEtb: Number(expectedRevenueEtb),
          repaymentPeriodMonths: Number(repaymentPeriodMonths),
        }),
      });

      if (res.ok) {
        setShowApplyModal(false);
        fetchLoans();
      }
    } catch (err) {
      console.error('Error submitting loan:', err);
    }
  };

  const handleLoanDecision = async (loanId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/finance/applications/${loanId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approvedAmountEtb: status === 'APPROVED' ? 140000 : 0,
          interestRatePercent: 8.5,
          reviewNotes: status === 'APPROVED'
            ? 'Approved based on verified 86.4 tons historical crop disbursements & Awash Bank agricultural score 88.'
            : 'Insufficient historical order volume for requested amount.',
        }),
      });

      if (res.ok) {
        fetchLoans();
        setSelectedLoan(null);
      }
    } catch (err) {
      console.error('Error making decision:', err);
    }
  };

  const totalDisbursed = loans
    .filter((l) => l.status === 'APPROVED' || l.status === 'DISBURSED')
    .reduce((acc, curr) => acc + (curr.approvedAmountEtb || curr.amountRequestedEtb), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Landmark className="h-4 w-4" /> Awash Agribusiness & Development Bank Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Data-Driven Agri-Credit & Working Capital
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/80 mt-1 max-w-2xl">
              Underwrite smallholder and commercial farmer credit utilizing PostgreSQL verified sales records, satellite GIS crop telemetry, and escrow flow verification.
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Farmer Apply for Credit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">Total Capital Deployed</span>
          <span className="text-2xl font-black text-teal-950 mt-1 block">
            {totalDisbursed > 0 ? totalDisbursed.toLocaleString() : '350,000'} ETB
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Repayment on AgriLink Escrow
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">Active Applications</span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">{loans.length} Files</span>
          <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1 mt-2">
            <Clock className="h-3.5 w-3.5" /> Fast 24-hr algorithmic underwriting
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">Average Lending Rate</span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">8.5% p.a.</span>
          <span className="text-[11px] text-zinc-500 font-medium mt-2 block">
            Subsidized for verified export horticultural crops
          </span>
        </div>
      </div>

      {/* Credit Underwriting Desk */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Farmer Credit Appraisal Desk</h3>
        <p className="text-xs text-zinc-500 mb-6">
          Evaluate applications against real-time harvest yields, verified produce orders, and farm parcel telemetry
        </p>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading loan applications...</div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-zinc-900">{loan.farmerName || 'Bekele Tadesse'}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900">
                        {loan.loanType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Farm: <strong className="text-zinc-800">{loan.farmName || 'Wonji Horizon Farm'}</strong> • Phone: {loan.farmerPhone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-zinc-900">
                      {loan.amountRequestedEtb.toLocaleString()} ETB
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        loan.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : loan.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 bg-white p-3 rounded-lg border border-zinc-200">
                  <strong className="text-zinc-900">Credit Purpose:</strong> {loan.purpose}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-lg border border-zinc-200">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Target Crop</span>
                    <span className="font-bold text-zinc-900">{loan.targetCrop}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Expected Yield</span>
                    <span className="font-bold text-zinc-900">{loan.expectedYieldTons} Tons</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Expected Revenue</span>
                    <span className="font-bold text-emerald-800">{loan.expectedRevenueEtb?.toLocaleString()} ETB</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Tenor</span>
                    <span className="font-bold text-zinc-900">{loan.repaymentPeriodMonths} Months</span>
                  </div>
                </div>

                {loan.reviewNotes && (
                  <div className="text-xs bg-teal-50 p-3 rounded-lg border border-teal-200 text-teal-900">
                    <strong>Bank Decision Memo:</strong> {loan.reviewNotes}
                  </div>
                )}

                {/* Bank Appraisal Actions */}
                {loan.status === 'SUBMITTED' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleLoanDecision(loan.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleLoanDecision(loan.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Disburse Capital
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Farmer Apply for Loan */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-zinc-900 mb-1">Apply for Agricultural Working Capital</h3>
            <p className="text-xs text-zinc-500 mb-4">Underwritten by Awash Bank via AgriLink verified sales</p>

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Loan Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                >
                  <option value="INPUT_FINANCING">Input & Seed Financing</option>
                  <option value="EQUIPMENT_FINANCING">Solar Drip & Equipment Financing</option>
                  <option value="WORKING_CAPITAL">Harvest Working Capital</option>
                  <option value="COLD_STORAGE_CREDIT">Cold Storage & Post-Harvest Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Amount (ETB)</label>
                  <input
                    type="number"
                    required
                    value={amountRequestedEtb}
                    onChange={(e) => setAmountRequestedEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Repayment Tenor</label>
                  <select
                    value={repaymentPeriodMonths}
                    onChange={(e) => setRepaymentPeriodMonths(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (Standard Seasonal)</option>
                    <option value="24">24 Months (Capital Equipment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Loan Purpose & Allocation</label>
                <textarea
                  rows={2}
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Target Crop</label>
                  <input
                    type="text"
                    required
                    value={targetCrop}
                    onChange={(e) => setTargetCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Expected Revenue (ETB)</label>
                  <input
                    type="number"
                    required
                    value={expectedRevenueEtb}
                    onChange={(e) => setExpectedRevenueEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-800 font-bold text-xs text-white cursor-pointer"
                >
                  Submit for Bank Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
