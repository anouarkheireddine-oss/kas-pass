import { Coffee, ChevronRight } from 'lucide-react'

interface KasWidgetProps {
  merchantName?: string
  compact?: boolean
}

export default function KasWidget({ merchantName, compact = false }: KasWidgetProps) {
  if (compact) {
    return (
      <a
        href="https://kas.covlife.co.uk"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-[#1A1A1A] rounded-xl px-4 py-3 group hover:bg-[#00A3E0] transition-colors"
      >
        <Coffee size={16} className="text-[#00A3E0] group-hover:text-white flex-shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-xs leading-none">KAS Pass accepted here</p>
          <p className="text-white/50 text-[10px] mt-0.5 truncate">1 credit = 1 free drink</p>
        </div>
        <ChevronRight size={14} className="text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
      </a>
    )
  }

  return (
    <a
      href="https://kas.covlife.co.uk"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#1A1A1A] rounded-2xl p-6 group hover:bg-[#00A3E0] transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#00A3E0] group-hover:bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
          <Coffee size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00A3E0] group-hover:text-white/60 transition-colors">
            KAS Pass — Powered by Covlife
          </span>
          <h3 className="font-serif font-bold text-white text-lg leading-snug mt-1">
            {merchantName
              ? `${merchantName} accepts KAS Pass`
              : 'KAS Pass Accepted Here'}
          </h3>
          <p className="text-white/60 text-sm mt-1">
            Get 1 free drink this month — use one of your monthly credits.
          </p>
          <p className="text-white font-bold text-sm mt-3 group-hover:underline flex items-center gap-1">
            Get KAS Pass from £14.99/mo <ChevronRight size={14} />
          </p>
        </div>
      </div>
    </a>
  )
}
