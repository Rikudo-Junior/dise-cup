import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Award, CheckSquare, CalendarDays, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matchesApi, rankingsApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import MatchCard from '../components/ui/MatchCard';

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2'];
const avatarBg = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const RANK_COLOR: Record<number, string> = { 1: '#f59e0b', 2: '#94a3b8', 3: '#d97706' };

export default function HomePage() {
  const { user } = useAuthStore();

  const { data: upcoming = [] } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => matchesApi.getUpcoming(5),
  });

  const { data: openMatches = [] } = useQuery({
    queryKey: ['matches', 'SCHEDULED'],
    queryFn: () => matchesApi.getAll({ status: 'SCHEDULED' }),
  });

  const { data: rankings = [] } = useQuery({
    queryKey: ['rankings', 'global'],
    queryFn: () => rankingsApi.getGlobal(1, 5),
  });

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: rankingsApi.getMyRank,
    enabled: !!user,
  });

  const openCount = openMatches.length;
  const top5 = rankings.slice(0, 5);

  return (
    <div className="hp">

      {/* ── Greeting ── */}
      <div className="hp-greeting-row">
        <div>
          <h1 className="hp-greeting">
            Bonjour, <span className="hp-greeting-name">@{user?.username}</span>
          </h1>
          <p className="hp-greeting-sub">
            {user?.promotion}
            {myRank?.rank ? ` – Rang #${myRank.rank} sur le classement` : ''}
          </p>
        </div>
        {myRank?.rank && (
          <div className="hp-rank-badge">
            <div className="hp-rank-number">#{myRank.rank}</div>
            <div className="hp-rank-label">Classement</div>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="hp-stats">
        <div className="hp-stat-card">
          <TrendingUp size={22} className="hp-icon-blue" />
          <div className="hp-stat-value hp-val-blue">{user?.totalPoints ?? 0}</div>
          <div className="hp-stat-label">Points totaux</div>
        </div>
        <div className="hp-stat-card">
          <Award size={22} className="hp-icon-gold" />
          <div className="hp-stat-value hp-val-gold">
            {myRank?.rank ? `#${myRank.rank}` : '—'}
          </div>
          <div className="hp-stat-label">Rang actuel</div>
        </div>
        <div className="hp-stat-card">
          <CheckSquare size={22} className="hp-icon-teal" />
          <div className="hp-stat-value hp-val-teal">{user?.totalPredictions ?? 0}</div>
          <div className="hp-stat-label">Pronostics faits</div>
        </div>
        <div className="hp-stat-card">
          <CalendarDays size={22} className="hp-icon-purple" />
          <div className="hp-stat-value hp-val-purple">{openCount}</div>
          <div className="hp-stat-label">Matchs ouverts</div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="hp-main-grid">

        {/* Matchs à pronostiquer */}
        <section className="hp-section">
          <div className="hp-section-head">
            <h2 className="hp-section-title">Matchs à pronostiquer</h2>
            <Link to="/matches" className="hp-see-all">
              Voir tout <ChevronRight size={14} />
            </Link>
          </div>
          <div className="hp-section-body">
            {upcoming.length === 0 ? (
              <div className="hp-empty">
                <CheckSquare size={36} className="hp-icon-teal" />
                <p>Tu as pronostiqué tous les matchs disponibles.</p>
              </div>
            ) : (
              <div className="matches-list">
                {upcoming.map((m: any) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>
        </section>

        {/* Top 5 */}
        <section className="hp-section">
          <div className="hp-section-head">
            <h2 className="hp-section-title">Top 5</h2>
            <Link to="/rankings" className="hp-see-all">
              Classement <ChevronRight size={14} />
            </Link>
          </div>
          <div className="hp-top5">
            {top5.map((e: any) => (
              <div key={e.id} className="hp-top5-row">
                <span
                  className="hp-top5-rank"
                  style={{ color: RANK_COLOR[e.rank] ?? 'var(--text-muted)' }}
                >
                  #{e.rank}
                </span>
                <div
                  className="hp-top5-avatar"
                  style={{ background: avatarBg(e.username) }}
                >
                  {e.username[0].toUpperCase()}
                </div>
                <span className="hp-top5-name">{e.username}</span>
                <span className="hp-top5-pts">{e.totalPoints}</span>
              </div>
            ))}
            {top5.length === 0 && (
              <p className="empty" style={{ padding: '24px' }}>Aucun participant</p>
            )}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        DISE CUP 2026 &nbsp;—&nbsp; L'expertise au service du développement
        &nbsp;—&nbsp; Réalisé par <span className="hp-footer-credit">Rikudo Junior</span>
      </footer>
    </div>
  );
}
