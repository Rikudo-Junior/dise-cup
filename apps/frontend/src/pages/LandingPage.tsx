import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Zap, Trophy, Target, Clock, BarChart2 } from 'lucide-react';
import { rankingsApi } from '../api';

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: rankingsApi.getPublicStats,
    staleTime: 60_000,
  });

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <img src="/logo-ise.png" alt="Logo" />
          </div>
          <span className="landing-nav-title">2ALSY CUP</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-btn-ghost">Se connecter</Link>
          <Link to="/register" className="landing-btn-solid">Rejoindre</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-logo">
          <img src="/logo-ise.png" alt="Logo 2ALSY" />
        </div>

        <div className="landing-badge">
          <Trophy size={14} />
          Coupe du Monde 2026
        </div>

        <h1 className="landing-title">
          <span className="landing-title-accent">2ALSY</span> CUP
        </h1>

        <p className="landing-desc">
          Le jeu de pronostics officiel des Anciens du Lycée Scientifique de Yamoussoukro
        </p>
        <p className="landing-sub">
          Pronostique les matchs, accumule des points, grimpe au classement
        </p>

        <div className="landing-cta">
          <Link to="/register" className="landing-cta-primary">Rejoindre la compétition</Link>
          <Link to="/login" className="landing-cta-outline">Se connecter</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stat-card">
          <Users size={24} className="landing-stat-icon" />
          <div className="landing-stat-value">{stats?.participants ?? '—'}</div>
          <div className="landing-stat-label">Participants</div>
        </div>
        <div className="landing-stat-card">
          <Zap size={24} className="landing-stat-icon" />
          <div className="landing-stat-value">{stats?.totalPredictions ?? '—'}</div>
          <div className="landing-stat-label">Pronostics</div>
        </div>
        <div className="landing-stat-card">
          <Trophy size={24} className="landing-stat-icon" />
          <div className="landing-stat-value">{stats?.leader?.username ?? '—'}</div>
          <div className="landing-stat-label">Leader</div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-feature-card">
          <div className="landing-feature-icon"><Target size={22} /></div>
          <h3>15 pts max par match</h3>
          <p>Issue (2) + Vainqueur (3) + Score exact (6) + 1er but (4)</p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-icon"><Clock size={22} /></div>
          <h3>Pronostic live</h3>
          <p>Jusqu'à la mi-temps avec malus progressif sur les retards</p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-icon"><BarChart2 size={22} /></div>
          <h3>Classement par phase</h3>
          <p>Classement général + par phase de la compétition</p>
        </div>
      </section>
    </div>
  );
}
