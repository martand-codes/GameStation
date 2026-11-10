import GameModerationDeck from './components/GameModerationDeck';

export default function GameCatalogPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
          Game Catalog &amp; DMCA Moderation
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Platform-wide distribution overrides, force-delisting, and intellectual property enforcement
        </p>
      </div>

      <GameModerationDeck />
    </div>
  );
}
