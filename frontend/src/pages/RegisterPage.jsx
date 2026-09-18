import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Ad zorunludur.';
    if (!form.last_name.trim())  e.last_name  = 'Soyad zorunludur.';
    if (!form.email.trim())      e.email      = 'E-posta zorunludur.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli bir e-posta girin.';
    if (!form.password)          e.password   = 'Şifre zorunludur.';
    else if (form.password.length < 6) e.password = 'En az 6 karakter olmalıdır.';
    else if (!/[A-Z]/.test(form.password)) e.password = 'En az bir büyük harf içermelidir.';
    else if (!/[0-9]/.test(form.password)) e.password = 'En az bir rakam içermelidir.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await register(form);
      toast.success('Kayıt başarılı! Hoş geldiniz 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Kayıt başarısız.';
      toast.error(msg);
      if (msg.includes('e-posta')) setErrors(p => ({ ...p, email: msg }));
    } finally {
      setLoading(false);
    }
  }

  const field = (name, label, type, placeholder, icon) => (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input
          type={name === 'password' ? (showPass ? 'text' : 'password') : type}
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          placeholder={placeholder}
          className={`input-field pl-10 ${errors[name] ? 'border-red-400 focus:ring-red-400/25 focus:border-red-400' : ''}`}
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="text-xs text-red-600 mt-1 animate-fade-in">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      {/* Dekoratif arka plan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96
                      rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="card rounded-3xl p-8 shadow-card-hover">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700
                            flex items-center justify-center shadow-xl shadow-brand-600/30">
              <Plane size={24} className="text-white -rotate-45" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Hesap Oluştur</h1>
              <p className="text-sm text-slate-400 mt-1">UçuşHub'a katılın, fırsatları kaçırmayın</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('first_name', 'Ad', 'text', 'Adınız', <User size={15} />)}
              {field('last_name', 'Soyad', 'text', 'Soyadınız', <User size={15} />)}
            </div>
            {field('email', 'E-posta', 'email', 'ornek@mail.com', <Mail size={15} />)}
            {field('password', 'Şifre', 'password', '••••••••', <Lock size={15} />)}

            <p className="text-[11px] text-slate-400">
              En az 6 karakter, 1 büyük harf ve 1 rakam içermelidir.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Hesap oluşturuluyor...</>
                : 'Kayıt Ol'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}