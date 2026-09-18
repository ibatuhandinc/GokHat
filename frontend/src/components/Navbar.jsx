import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Ticket, LogOut, LogIn, UserPlus, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    toast.success('Çıkış yapıldı.');
    navigate('/login');
  }

  const active = (path) =>
    location.pathname === path
      ? 'text-brand-700 bg-brand-50'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                          flex items-center justify-center shadow-lg shadow-brand-600/25
                          group-hover:shadow-brand-600/45 transition-shadow">
            <Plane size={18} className="text-white -rotate-45" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-slate-900">Gök</span>
            <span className="text-brand-600">Hat</span>
          </span>
        </Link>

        {/* Masaüstü linkler */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active('/')}`}>
            Uçuş Ara
          </Link>
          {isAuthenticated && (
            <Link to="/my-tickets"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active('/my-tickets')}`}>
              <Ticket size={14} />
              Biletlerim
            </Link>
          )}
        </div>

        {/* Masaüstü oturum alanı */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Kullanıcı çipi */}
              <div className="flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-full
                              bg-slate-100 border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-[11px] font-bold
                                flex items-center justify-center">
                  {initials || <User size={13} />}
                </div>
                <span className="text-sm text-slate-500">
                  <span className="text-slate-900 font-semibold">{user?.first_name}</span>
                </span>
              </div>
              <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-4">
                <LogOut size={14} />
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">
                <LogIn size={14} />
                Giriş
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                <UserPlus size={14} />
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        {/* Mobil menü butonu */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobil menü */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2
                        flex flex-col gap-1 animate-slide-up shadow-lg">
          <Link to="/" onClick={() => setMobileOpen(false)}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active('/')}`}>
            Uçuş Ara
          </Link>
          {isAuthenticated && (
            <Link to="/my-tickets" onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active('/my-tickets')}`}>
              <Ticket size={14} /> Biletlerim
            </Link>
          )}
          <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-500
                           hover:text-slate-900 hover:bg-slate-100 transition-all text-left">
                <LogOut size={14} /> Çıkış Yap
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600
                             hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <LogIn size={14} /> Giriş Yap
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-brand-700
                             font-medium hover:bg-brand-50 transition-all">
                  <UserPlus size={14} /> Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}