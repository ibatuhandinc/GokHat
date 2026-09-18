import { useEffect, useState } from 'react';
import { Ticket, Plane, Clock, Hash, User, XCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  async function fetchTickets() {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/my-tickets');
      setTickets(data.data);
    } catch {
      toast.error('Biletler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTickets(); }, []);

  async function handleCancel(id, pnr) {
    if (!window.confirm(`${pnr} numaralı biletinizi iptal etmek istediğinize emin misiniz?`)) return;
    try {
      setCancelling(id);
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Bilet iptal edildi. Koltuk tekrar satışa açıldı.');
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'İptal başarısız.');
    } finally {
      setCancelling(null);
    }
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

  const statusBadge = (status) => {
    if (status === 'confirmed') return <span className="badge-confirmed">✓ Onaylı</span>;
    if (status === 'cancelled') return <span className="badge-cancelled">✕ İptal</span>;
    return <span className="badge-pending">⏳ Bekliyor</span>;
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100
                              flex items-center justify-center">
                <Ticket size={22} className="text-brand-600" />
              </span>
              Biletlerim
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {!loading && `${tickets.length} bilet`}
            </p>
          </div>
          <button onClick={fetchTickets} disabled={loading} className="btn-ghost text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>

        {/* Yükleniyor */}
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-44 shimmer" />
            ))}
          </div>
        )}

        {/* Bilet kartları */}
        {!loading && tickets.length > 0 && (
          <div className="space-y-5">
            {tickets.map((t) => (
              <div key={t.id}
                className={`card overflow-hidden transition-all duration-300 animate-fade-in
                  ${t.status === 'cancelled' ? 'opacity-60' : 'hover:border-brand-200 hover:shadow-card-hover'}`}>

                {/* Üst şerit */}
                <div className="flex items-center justify-between px-5 py-3.5
                                bg-gradient-to-r from-brand-50/80 to-transparent
                                border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Plane size={14} className="text-brand-600 -rotate-45" />
                    <span className="text-sm font-bold text-brand-700">{t.flight_number}</span>
                  </div>
                  {statusBadge(t.status)}
                </div>

                <div className="p-5">
                  {/* Güzergah */}
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {new Date(t.departure_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">{t.departure_city}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-center gap-1">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                        <Plane size={14} className="text-brand-500 shrink-0 -rotate-45" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      </div>
                      <p className="text-[10px] text-slate-400">Direkt</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">
                        {new Date(t.arrival_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">{t.arrival_city}</p>
                    </div>
                  </div>

                  {/* Boarding pass ayracı */}
                  <div className="relative -mx-5 my-5">
                    <div className="border-t border-dashed border-slate-200" />
                    <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full
                                    bg-slate-50 border border-slate-200/70" />
                    <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full
                                    bg-slate-50 border border-slate-200/70" />
                  </div>

                  {/* Detaylar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: <Hash size={13} />, label: 'PNR', value: t.pnr_code, highlight: true },
                      { icon: <User size={13} />, label: 'Yolcu', value: t.passenger_name },
                      { icon: <Ticket size={13} />, label: 'Koltuk', value: `${t.seat_number}. Koltuk` },
                      { icon: <Clock size={13} />, label: 'Kalkış', value: fmt(t.departure_time) },
                    ].map(({ icon, label, value, highlight }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          {icon}
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                        </div>
                        <p className={`text-sm font-bold truncate
                          ${highlight ? 'text-brand-700 font-mono tracking-widest text-base' : 'text-slate-800'}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Alt bilgi: fiyat + iptal */}
                  <div className="flex items-center justify-between mt-5">
                    <div>
                      <p className="text-xs text-slate-400">Bilet ücreti</p>
                      <p className="text-xl font-black text-slate-900">
                        ₺{parseFloat(t.price).toLocaleString('tr-TR')}
                      </p>
                    </div>

                    {t.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(t.id, t.pnr_code)}
                        disabled={cancelling === t.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   text-red-600 bg-white border border-red-200
                                   hover:bg-red-50 hover:border-red-300
                                   transition-all disabled:opacity-50">
                        {cancelling === t.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <XCircle size={14} />
                        }
                        İptal Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boş durum */}
        {!loading && tickets.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 border border-slate-200
                            flex items-center justify-center mx-auto mb-5">
              <Ticket size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Henüz Biletiniz Yok</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
              Ana sayfadan uçuş arayıp biletinizi satın alın.
            </p>
            <a href="/" className="btn-primary inline-flex px-8 py-3">
              <Plane size={16} className="-rotate-45" />
              Uçuş Ara
            </a>
          </div>
        )}
      </div>
    </div>
  );
}