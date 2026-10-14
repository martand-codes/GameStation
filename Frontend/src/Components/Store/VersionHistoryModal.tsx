import { History, X, Download, Calendar, Tag, HardDrive } from 'lucide-react';
import type { LibraryItem } from '../../Services/Library.service';

interface VersionHistoryModalProps {
  item: LibraryItem | null;
  onClose: () => void;
}

export default function VersionHistoryModal({ item, onClose }: VersionHistoryModalProps) {
  if (!item) return null;

  const versions = item.game.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0C1017] border border-purple-500/40 rounded-lg max-w-2xl w-full overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#121422] border-b border-[#24263D] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                BUILD & VERSION REPOSITORY
              </h2>
              <p className="text-xs text-[#8B949E]">{item.game.title} // Client Binaries</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-[#8B949E]">
              <HardDrive className="w-10 h-10 mx-auto mb-3 text-[#556772]" />
              <p className="text-sm text-white font-bold">No Version Artifacts Published Yet</p>
              <p className="text-xs text-[#556772] mt-1">
                The developer has not uploaded standalone downloadable binaries for this title yet.
              </p>
            </div>
          ) : (
            versions.map((ver, idx) => (
              <div
                key={ver.id || idx}
                className={`bg-[#0F121C] border ${
                  idx === 0 ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-[#222538]'
                } p-4 rounded-md space-y-3 transition-all`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white tracking-wide">
                        {ver.version}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-bold uppercase">
                          LATEST_RELEASE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8B949E] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {ver.downloadUrl ? (
                    <a
                      href={ver.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded text-xs font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Package
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#556772] px-2 py-1 bg-[#151926] rounded border border-[#22273D]">
                      Digital Stream Only
                    </span>
                  )}
                </div>

                {ver.changelog && (
                  <div className="bg-[#090C14] border border-[#1A1F30] p-3 rounded text-xs text-[#A0AEC0]">
                    <div className="text-[10px] uppercase text-[#556772] font-bold flex items-center gap-1 mb-1">
                      <Tag className="w-3 h-3 text-purple-400" /> Changelog Notes
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{ver.changelog}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#121422] border-t border-[#24263D] px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#556772]">{versions.length} total releases on record</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1C2033] hover:bg-[#252B44] text-white rounded font-bold transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
