import { useState, useEffect, useCallback } from 'react';
import { X, Plane, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Koltuk seçimi ve bilet onay modalı.
 * Props: { flight, onClose, onSuccess }
 */
export default function SeatModal({ flight, onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [takenSeats, setTakenSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState('seats'); // 'seats' | 'confirm'

  /* Dolu koltukları yükle */
  const loadSeats = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/flights/${flight.id}`);
      setTakenSeats(data.data.taken_seats || []);
    } catch {
      toast.error('Koltuk bilgisi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [flight.id]);

  useEffect(() => {
    loadSeats();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [loadSeats]);

  /* Koltuk seç */
  function handleSeatClick(num) {
    if (takenSeats.includes(num)) return;
    setSelectedSeat(num === selectedSeat ? null : num);
  }

  /* Onayla */
  async function handleConfirm() {
    if (!isAuthenticated) {
      toast.error('Bilet almak için giriş yapmanız gerekiyor.');
      navigate('/login');
      return;
    }
    if (!selectedSeat) return toast.error('Lütfen bir koltuk seçin.');
    if (!passengerName.trim() || passengerName.trim().length < 2) {
      return toast.error('Lütfen geçerli bir yolcu adı girin.');
    }

    try {
      setBooking(true);
      const { data } = await api.post('/bookings', {
        flight_id:      flight.id,
        seat_number:    selectedSeat,
        passenger_name: passengerName.trim(),
      });
      toast.success(`Biletiniz alındı! PNR: ${data.data.pnr_code}`, { duration: 5000 });
      onSuccess?.(data.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Rezervasyon başarısız.';
      toast.error(msg);
      if (msg.includes('zaten alınmış')) {
        await loadSeats();
        setSelectedSeat(null);
        setStep('seats');
      }
    } finally {
      setBooking(false);
    }
  }

  /* Koltuk grid */
  const totalSeats = flight.total_seats || 180;
  const cols = 6;
  const rows = Math.ceil(totalSeats / cols);

  function seatClass(num) {
    if (takenSeats.includes(num)) return 'seat-taken';
    if (num === selectedSeat) return 'seat-selected';
    return 'seat-available';
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto
                      bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl
                      shadow-2xl animate-slide-up flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100
                            flex items-center justify-center">
              <Plane size={18} className="text-brand-600 -rotate-45" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{flight.flight_number}</p>
              <p className="text-xs text-slate-400">
                {flight.departure_city} → {flight.arrival_city} &nbsp;·&nbsp; {fmt(flight.departure_time)}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                       hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Adım göstergesi */}
        <div className="flex px-6 pt-4 gap-2 shrink-0">
          {['seats', 'confirm'].map((s, i) => (
            <button key={s}
              onClick={() => step === 'confirm' && s === 'seats' && setStep('seats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${step === s
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-400 border border-transparent cursor-default'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {i + 1}
              </span>
              {s === 'seats' ? 'Koltuk Seç' : 'Onayla'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto">

          {/* ── ADIM 1: Koltuk seçimi ── */}
          {step === 'seats' && (
            <div className="space-y-5">
              {/* Lejant */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-50 border border-emerald-300 inline-block" />
                  Müsait
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-200 border border-slate-300 inline-block" />
                  Dolu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-brand-600 inline-block" />
                  Seçili
                </span>
              </div>

              {/* Kabin başlığı */}
              <div className="flex justify-center">
                <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full
                                text-xs text-slate-500 flex items-center gap-2">
                  <Plane size={12} className="text-brand-500 -rotate-45" />
                  Kabin — {flight.departure_city} → {flight.arrival_city}
                </div>
              </div>

              {/* Koltuk ızgarası */}
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 size={32} className="animate-spin text-brand-600" />
                  <p className="text-sm text-slate-400">Koltuklar yükleniyor...</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="min-w-max mx-auto">
                    {/* Sütun harfleri */}
                    <div className="flex items-center gap-1 mb-2 pl-8">
                      {['A','B','C','','D','E','F'].map((l, i) => (
                        <div key={i} className={`w-9 text-center text-[11px] font-bold text-slate-400 ${l === '' ? 'invisible' : ''}`}>
                          {l}
                        </div>
                      ))}
                    </div>

                    {Array.from({ length: rows }, (_, row) => {
                      const rowNum = row + 1;
                      const seats = Array.from({ length: cols }, (_, c) => row * cols + c + 1).filter(n => n <= totalSeats);
                      return (
                        <div key={row} className="flex items-center gap-1 mb-1">
                          <span className="w-7 text-right text-[10px] text-slate-300 mr-1 shrink-0">{rowNum}</span>
                          {seats.slice(0, 3).map(n => (
                            <button key={n} onClick={() => handleSeatClick(n)} className={seatClass(n)} title={`Koltuk ${n}`}>
                              {n === selectedSeat ? '✓' : n}
                            </button>
                          ))}
                          {/* Koridor */}
                          <div className="w-4 shrink-0" />
                          {seats.slice(3).map(n => (
                            <button key={n} onClick={() => handleSeatClick(n)} className={seatClass(n)} title={`Koltuk ${n}`}>
                              {n === selectedSeat ? '✓' : n}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seçili koltuk bilgisi */}
              {selectedSeat && (
                <div className="flex items-center justify-between bg-brand-50 border border-brand-200
                                rounded-xl px-4 py-3 animate-fade-in">
                  <div className="text-sm text-slate-600">
                    Seçilen koltuk: <span className="text-brand-700 font-bold text-base">{selectedSeat}</span>
                  </div>
                  <button onClick={() => setStep('confirm')} className="btn-primary text-sm px-5 py-2.5">
                    Devam Et →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ADIM 2: Onay ── */}
          {step === 'confirm' && (
            <div className="space-y-5 animate-fade-in">
              {/* Özet kutu */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rezervasyon Özeti</p>
                {[
                  ['Uçuş', flight.flight_number],
                  ['Güzergah', `${flight.departure_city} → ${flight.arrival_city}`],
                  ['Kalkış', new Date(flight.departure_time).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })],
                  ['Koltuk', `${selectedSeat}. Koltuk`],
                  ['Fiyat', `₺${parseFloat(flight.price).toLocaleString('tr-TR')}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{k}</span>
                    <span className={`font-semibold ${k === 'Fiyat' ? 'text-brand-700 text-lg' : 'text-slate-800'}`}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Yolcu adı */}
              <div>
                <label className="field-label">
                  <User size={11} className="inline mr-1" />
                  Yolcu Adı Soyadı
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  placeholder="Adınızı ve soyadınızı girin"
                  className="input-field"
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1.5">Biletinizde görünecek isim</p>
              </div>

              {/* Uyarı */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800/90">
                  Ödeme simüle edilmektedir. Bilet onaylandıktan sonra PNR kodunuz oluşturulacak ve biletlerim sayfasında görüntülenebilecektir.
                </p>
              </div>

              {/* Aksiyon */}
              <div className="flex gap-3">
                <button onClick={() => setStep('seats')} className="btn-ghost flex-1">
                  ← Geri
                </button>
                <button onClick={handleConfirm} disabled={booking || !passengerName.trim()}
                  className="btn-primary flex-1 py-3">
                  {booking ? (
                    <><Loader2 size={16} className="animate-spin" /> İşleniyor...</>
                  ) : (
                    <><CheckCircle size={16} /> Bileti Onayla</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}