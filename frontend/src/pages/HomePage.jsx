import { useState, useCallback } from 'react';
import {
  Search, MapPin, Calendar, Plane, ArrowRight, Loader2,
  ArrowLeftRight, ChevronDown, Zap, ShieldCheck, Headphones, Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import FlightCard from '../components/FlightCard';
import SeatModal from '../components/SeatModal';
import toast from 'react-hot-toast';

const CITIES = [
  'Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Trabzon',
  'Adana', 'Bursa', 'Gaziantep', 'Kayseri', 'Konya',
];

const STATS = [
  { value: '120+', label: 'Günlük Uçuş' },
  { value: '10', label: 'Şehir' },
  { value: '7/24', label: 'Canlı Destek' },
  { value: '%98', label: 'Memnuniyet' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Anında Rezervasyon',
    desc: 'Koltuğunu seç, ödemeni yap; biletin saniyeler içinde senin olsun.',
    iconBg: 'bg-brand-50 text-brand-600',
  },
  {
    icon: ShieldCheck,
    title: 'Güvenli Altyapı',
    desc: 'Kişisel verilerin ve ödemelerin uçtan uca korunur.',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Headphones,
    title: '7/24 Destek',
    desc: 'Yolculuk öncesi ve sırasında her an yanındayız.',
    iconBg: 'bg-amber-50 text-amber-600',
  },
];

const POPULAR = [
  { from: 'Istanbul', to: 'Ankara', icon: '🏛️' },
  { from: 'Istanbul', to: 'Izmir', icon: '🌊' },
  { from: 'Ankara', to: 'Antalya', icon: '🏖️' },
  { from: 'Izmir', to: 'Istanbul', icon: '🌉' },
];

export default function HomePage() {
  const [form, setForm] = useState({ from: '', to: '', date: '' });
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const search = useCallback(async (e) => {
    e?.preventDefault();
    if (!form.from && !form.to && !form.date) {
      return toast.error('En az bir arama kriteri girin.');
    }
    try {
      setLoading(true);
      setSearched(true);
      const params = {};
      if (form.from) params.from = form.from;
      if (form.to)   params.to   = form.to;
      if (form.date) params.date = form.date;
      const { data } = await api.get('/flights', { params });
      setFlights(data.data);
      if (data.data.length === 0) toast('Arama kriterlerine uygun uçuş bulunamadı.', { icon: '🔍' });
    } catch {
      toast.error('Uçuşlar alınamadı. Sunucu bağlantısını kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  function swap() {
    setForm(p => ({ ...p, from: p.to, to: p.from }));
  }

  function resetSearch() {
    setForm({ from: '', to: '', date: '' });
    setFlights([]);
    setSearched(false);
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-16">

      {/* ── HERO ── */}
      <section className="px-4 pt-14 pb-10">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                          bg-white border border-brand-200 text-brand-700
                          text-xs font-semibold mb-6 shadow-sm">
            <Sparkles size={12} className="animate-pulse" />
            En iyi uçuş fiyatları
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Hayalinizdeki<br />
            <span className="bg-gradient-to-r from-brand-600 via-sky-500 to-cyan-400
                             bg-clip-text text-transparent">
              Uçuşu Bulun
            </span>
          </h1>
          <p className="text-slate-500 mt-5 text-lg max-w-xl mx-auto">
            Binlerce uçuş arasından en uygun fiyatı keşfedin, anında rezervasyon yapın.
          </p>
        </div>

        {/* ── ARAMA FORMU ── */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={search}
            className="card rounded-3xl p-2.5 flex flex-col sm:flex-row gap-2">

            {/* Nereden */}
            <div className="flex-1 relative">
              <label className="absolute left-4 top-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nereden
              </label>
              <MapPin size={15} className="absolute left-4 bottom-3.5 text-slate-400 pointer-events-none" />
              <select
                value={form.from}
                onChange={e => setForm(p => ({ ...p, from: e.target.value }))}
                className="w-full pt-7 pb-3 pl-10 pr-9 rounded-2xl bg-transparent text-slate-800 text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:bg-slate-50
                           transition-all appearance-none cursor-pointer">
                <option value="">Şehir seç</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 bottom-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Swap butonu */}
            <button type="button" onClick={swap}
              className="hidden sm:flex w-10 items-center justify-center self-center
                         rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50
                         transition-all shrink-0 my-1 group/swap">
              <ArrowLeftRight size={16} className="transition-transform group-hover/swap:rotate-180" />
            </button>

            {/* Nereye */}
            <div className="flex-1 relative">
              <label className="absolute left-4 top-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nereye
              </label>
              <Plane size={15} className="absolute left-4 bottom-3.5 text-slate-400 pointer-events-none -rotate-45" />
              <select
                value={form.to}
                onChange={e => setForm(p => ({ ...p, to: e.target.value }))}
                className="w-full pt-7 pb-3 pl-10 pr-9 rounded-2xl bg-transparent text-slate-800 text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:bg-slate-50
                           transition-all appearance-none cursor-pointer">
                <option value="">Şehir seç</option>
                {CITIES.filter(c => c !== form.from).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 bottom-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Tarih */}
            <div className="flex-1 relative">
              <label className="absolute left-4 top-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tarih
              </label>
              <Calendar size={15} className="absolute left-4 bottom-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full pt-7 pb-3 pl-10 pr-4 rounded-2xl bg-transparent text-slate-800 text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:bg-slate-50 transition-all"
              />
            </div>

            {/* Arama butonu */}
            <button type="submit" disabled={loading}
              className="btn-primary px-8 py-4 rounded-2xl text-base shrink-0">
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <><Search size={18} /> Ara</>
              }
            </button>
          </form>
        </div>

        {/* ── İSTATİSTİK ŞERİDİ ── */}
        <div className="max-w-3xl mx-auto mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="card px-4 py-4 text-center">
              <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── İÇERİK ── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">

        {/* Loading iskelet */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-32 shimmer" />
            ))}
          </div>
        )}

        {/* Sonuçlar */}
        {!loading && searched && flights.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {flights.length} uçuş bulundu
              </h2>
              <span className="text-sm text-slate-400">
                {form.from && form.to
                  ? `${form.from} → ${form.to}`
                  : form.from || form.to || 'Tüm uçuşlar'}
              </span>
            </div>
            <div className="space-y-3">
              {flights.map(f => (
                <FlightCard key={f.id} flight={f} onSelect={setSelected} />
              ))}
            </div>
          </>
        )}

        {/* Boş durum */}
        {!loading && searched && flights.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200
                            flex items-center justify-center mx-auto mb-4">
              <Search size={30} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Uçuş Bulunamadı</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
              Farklı şehirler veya tarihler deneyebilirsiniz.
            </p>
            <button onClick={resetSearch} className="btn-ghost text-sm">
              Aramayı Temizle
            </button>
          </div>
        )}

        {/* İlk açılış: popüler güzergahlar + özellikler */}
        {!searched && (
          <>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-xl font-bold text-slate-900">Popüler Güzergahlar</h2>
              <span className="text-sm text-slate-400">Hızlı başlangıç</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {POPULAR.map(r => (
                <button key={r.from + r.to}
                  onClick={() => setForm(p => ({ ...p, from: r.from, to: r.to }))}
                  className="card p-4 text-left hover:border-brand-300 hover:shadow-card-hover
                             transition-all duration-200 group">
                  <span className="text-2xl mb-2 block">{r.icon}</span>
                  <p className="text-sm font-semibold text-slate-800">{r.from}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <ArrowRight size={11} className="text-brand-500" />
                    {r.to}
                  </div>
                </button>
              ))}
            </div>

            {/* Neden UçuşHub? */}
            <h2 className="text-xl font-bold text-slate-900 mt-14 mb-1 text-center">
              Neden <span className="text-brand-600">UçuşHub</span>?
            </h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              Binlerce yolcu bizi tercih ediyor
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {FEATURES.map(f => (
                <div key={f.title} className="card p-5 hover:shadow-card-hover transition-all duration-200">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${f.iconBg}`}>
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── KOLTUK MODAL ── */}
      {selected && (
        <SeatModal
          flight={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setFlights(prev => prev.map(f =>
              f.id === selected.id
                ? { ...f, available_seats: Math.max(0, f.available_seats - 1) }
                : f
            ));
          }}
        />
      )}
    </div>
  );
}