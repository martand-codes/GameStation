import UserModerationDeck from './components/UserModerationDeck';

export default function UserRegistryPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
          Citizen Registry &amp; User Moderation
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Account suspensions, role clearance promotion, and wallet inspection
        </p>
      </div>

      <UserModerationDeck />
    </div>
  );
}
