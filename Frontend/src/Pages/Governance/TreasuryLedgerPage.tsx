import TreasuryLedger from './components/TreasuryLedger';

export default function TreasuryLedgerPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
          Sovereign Treasury &amp; Financial Ledger
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Dynamic sovereign take-rate cut, creator payout reconciliation, and gateway capture logs
        </p>
      </div>

      <TreasuryLedger />
    </div>
  );
}
