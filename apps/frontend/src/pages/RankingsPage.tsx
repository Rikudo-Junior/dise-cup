import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Award } from 'lucide-react';
import { rankingsApi } from '../api';
import { useAuthStore } from '../store/auth.store';

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2'];
const avatarBg = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const TABS = [
  { label: 'Général',             value: 'general' },
  { label: 'Phase de groupes',    value: 'groups' },
  { label: 'Seizièmes de finale', value: 'r32' },
  { label: 'Huitièmes de finale', value: 'r16' },
  { label: 'Quarts de finale',    value: 'qf' },
  { label: 'Demi-finales',        value: 'sf' },
  { label: 'Match 3e place',      value: 'p3' },
  { label: 'Finale',              value: 'final' },
];

export default function RankingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [page, setPage] = useState(1);

  const { data: entries = [], isLoading } = useQuery<any[]>({
    queryKey: ['rankings', 'global', page],
    queryFn: () => rankingsApi.getGlobal(page, 20),
    enabled: activeTab === 'general',
  });

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: rankingsApi.getMyRank,
    enabled: !!user,
  });

  // podium: tri par points pour être sûr, puis top 3
  const sorted = [...entries].sort((a, b) => b.totalPoints - a.totalPoints);
  const p1 = sorted[0];
  const p2 = sorted[1];
  const p3 = sorted[2];

  const rankColor = (rank: number) => {
    if (rank === 1) return '#f59e0b';
    if (rank === 3) return '#d97706';
    return 'white';
  };
  const ptsColor = (rank: number) => {
    if (rank === 1) return '#f59e0b';
    if (rank === 3) return '#d97706';
    return 'white';
  };

  return (
    <div className="rp">

      {/* ── Header ── */}
      <div className="rp-header">
        <h1 className="rp-title">Classement</h1>
        {myRank && (
          <div className="rp-my-badge">
            <div className="rp-my-rank">#{myRank.rank}</div>
            <div className="rp-my-pts">{user?.totalPoints} pts</div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="rp-tabs">
        {TABS.map(t => (
          <button
            key={t.value}
            className={`rp-tab ${activeTab === t.value ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.value); setPage(1); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab !== 'general' ? (
        <div className="rp-coming-soon">Données disponibles en cours de compétition</div>
      ) : isLoading ? (
        <div className="hp-empty"><p>Chargement...</p></div>
      ) : (
        <>
          {/* ── Podium ── */}
          {p1 && p2 && p3 && (
            <div className="rp-podium-wrap">
              <div className="rp-podium">

                {/* 2e place */}
                <div className="rp-pod-slot">
                  <Award size={20} style={{ color: '#94a3b8' }} />
                  <div className="rp-pod-avatar" style={{ background: avatarBg(p2.username) }}>
                    {p2.username[0].toUpperCase()}
                  </div>
                  <div className="rp-pod-name">{p2.username}</div>
                  <div className="rp-pod-pts" style={{ color: '#94a3b8' }}>{p2.totalPoints} pts</div>
                  <div className="rp-pod-block rp-pod-silver">2</div>
                </div>

                {/* 1re place */}
                <div className="rp-pod-slot">
                  <Trophy size={24} style={{ color: '#f59e0b' }} />
                  <div className="rp-pod-avatar rp-pod-avatar-lg" style={{ background: avatarBg(p1.username) }}>
                    {p1.username[0].toUpperCase()}
                  </div>
                  <div className="rp-pod-name">{p1.username}</div>
                  <div className="rp-pod-pts" style={{ color: '#f59e0b' }}>{p1.totalPoints} pts</div>
                  <div className="rp-pod-block rp-pod-gold">1</div>
                </div>

                {/* 3e place */}
                <div className="rp-pod-slot">
                  <Award size={20} style={{ color: '#d97706' }} />
                  <div className="rp-pod-avatar" style={{ background: avatarBg(p3.username) }}>
                    {p3.username[0].toUpperCase()}
                  </div>
                  <div className="rp-pod-name">{p3.username}</div>
                  <div className="rp-pod-pts" style={{ color: '#d97706' }}>{p3.totalPoints} pts</div>
                  <div className="rp-pod-block rp-pod-bronze">3</div>
                </div>

              </div>
            </div>
          )}

          {/* ── Table ── */}
          <div className="rp-table-wrap">
            <div className="rp-table-head">
              <span>#</span>
              <span>JOUEUR</span>
              <span>PROMO</span>
              <span>POINTS</span>
            </div>
            {entries.map((e: any, i: number) => {
              const rank = e.rank ?? (i + 1 + (page - 1) * 20);
              return (
                <div key={e.id} className={`rp-row ${e.id === user?.id ? 'rp-row-me' : ''}`}>
                  <span className="rp-rank" style={{ color: rankColor(rank) }}>{rank}</span>
                  <div className="rp-player">
                    <div className="rp-avatar" style={{ background: avatarBg(e.username) }}>
                      {e.username[0].toUpperCase()}
                    </div>
                    <span className="rp-username">{e.username}</span>
                  </div>
                  <span className="rp-promo">{e.promotion}</span>
                  <span className="rp-pts" style={{ color: ptsColor(rank) }}>{e.totalPoints}</span>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="rp-pagination">
            <button className="rp-tab" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Précédent
            </button>
            <span className="rp-page-num">Page {page}</span>
            <button className="rp-tab" onClick={() => setPage(p => p + 1)} disabled={entries.length < 20}>
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
