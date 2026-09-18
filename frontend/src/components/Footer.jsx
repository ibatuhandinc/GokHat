import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                            flex items-center justify-center">
              <Plane size={18} className="text-white -rotate-45" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                Uçuş<span className="text-brand-600">Hub</span>
              </p>
              <p className="text-xs text-slate-400">Hayalinizdeki uçuşa ulaşın</p>
            </div>
          </div>

          {/* Linkler */}
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-600 transition-colors">Uçuş Ara</Link>
            <Link to="/my-tickets" className="hover:text-brand-600 transition-colors">Biletlerim</Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors">Giriş</Link>
          </nav>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} UçuşHub — Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}