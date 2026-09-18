import { Plane, Clock, Users, ArrowRight, Zap } from 'lucide-react';

/**
 * Uçuş arama sonuç kartı.
 * Props: { flight, onSelect }
 */
export default function FlightCard({ flight, onSelect }) {
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

  const duration = () => {
    const diff = new Date(flight.arrival_time) - new Date(flight.departure_time);
    const h = Math.floor(diff / 3600000);
    const m = Math.round((diff % 3600000) / 60000);
    return `${h}s ${m}dk`;
  };

  const availability = () => {
    const pct = flight.available_seats / flight.total_seats;
    if (pct > 0.3) return { label: `${flight.available_seats} koltuk`, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct > 0.1) return { label: `Son ${flight.available_seats} koltuk!`, cls: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: `Kritik: ${flight.available_seats} koltuk`, cls: 'text-red-700 bg-red-50 border-red-200' };
  };

  const avail = availability();

  return (
    <div className="group card p-5 hover:border-brand-300 hover:shadow-card-hover
                    transition-all duration-300 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Uçuş numarası & tarih */}
        <div className="flex items-center gap-3 sm:w-32 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100
                          flex items-center justify-center shrink-0
                          group-hover:bg-brand-100 transition-colors">
            <Plane size={16} className="text-brand-600 -rotate-45" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-700 tracking-wider">{flight.flight_number}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(flight.departure_time)}</p>
          </div>
        </div>

        {/* Güzergah */}
        <div className="flex-1 flex items-center gap-3 sm:gap-4">
          {/* Kalkış */}
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{fmt(flight.departure_time)}</p>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">{flight.departure_city}</p>
          </div>

          {/* Uçuş çizgisi */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock size={10} />
              {duration()}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <ArrowRight size={14} className="text-brand-500 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400">Direkt</p>
          </div>

          {/* Varış */}
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{fmt(flight.arrival_time)}</p>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">{flight.arrival_city}</p>
          </div>
        </div>

        {/* Sağ panel: Fiyat + Müsaitlik + Buton */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center
                        gap-3 sm:gap-2 sm:w-40 shrink-0 pt-3 sm:pt-0
                        border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4">

          {/* Müsaitlik */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${avail.cls}`}>
            <Users size={10} />
            {avail.label}
          </div>

          {/* Fiyat */}
          <div className="text-center sm:text-right">
            <p className="text-[11px] text-slate-400">kişi başı</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              ₺{parseFloat(flight.price).toLocaleString('tr-TR')}
            </p>
          </div>

          {/* Buton */}
          <button
            onClick={() => onSelect(flight)}
            disabled={flight.available_seats <= 0}
            className="btn-primary text-sm px-4 py-2.5 w-full sm:w-auto whitespace-nowrap">
            <Zap size={14} className="shrink-0" />
            {flight.available_seats <= 0 ? 'Tükendi' : 'Bilet Seç'}
          </button>
        </div>
      </div>
    </div>
  );
}