import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = 'E-posta zorunludur.';
    if (!form.password)     e.password = 'Şifre zorunludur.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await login(form);
      toast.success('Hoş geldiniz! ✈️');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Giriş başarısız.';
      toast.error(msg);
      setErrors({ password: 'E-posta veya şifre hatalı.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      {/* Dekoratif arka plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96
                      rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="card rounded-3xl p-8 shadow-card-hover">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700
                            flex items-center justify-center shadow-xl shadow-brand-600/30">
              <Plane size={24} className="text-white -rotate-45" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Tekrar Hoş Geldiniz</h1>
              <p className="text-sm text-slate-400 mt-1">Hesabınıza giriş yapın</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-posta */}
            <div>
              <label className="field-label">E-posta</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="ornek@mail.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400/25 focus:border-red-400' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Şifre */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Şifre</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400/25 focus:border-red-400' : ''}`}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Giriş yapılıyor...</>
                : 'Giriş Yap'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Kayıt Olun
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          🔒 Bilgileriniz güvenli altyapıyla korunur
        </p>
      </div>
    </div>
  );
}