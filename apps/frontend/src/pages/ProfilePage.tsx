import { useQuery } from '@tanstack/react-query';
import { usersApi, badgesApi } from '../api';
import { useAuthStore } from '../store/auth.store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({ queryKey: ['my-stats'], queryFn: usersApi.getStats, enabled: !!user });
  const { data: badges = [] } = useQuery({ queryKey: ['my-badges'], queryFn: badgesApi.getMy, enabled: !!user });
  const { data: predictionsData } = useQuery({ queryKey: ['my-predictions'], queryFn: () => usersApi.getMyPredictions(1), enabled: !!user });

  if (!user) return null;

  const sr = stats?.successRate ?? 0;
  const exact = stats?.exactScorePredictions ?? user.exactScorePredictions;
  const streak = stats?.currentStreak ?? user.currentStreak;

  return (
    <div className="page">
      {/* Hero profil */}
      <div className="profile-hero">
        <div className="avatar-xl-initials">{user.firstName[0]}{user.lastName[0]}</div>
        <div className="profile-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p className="profile-username">@{user.username} · <span className="promo-pill">{user.promotion}</span></p>
          {badges.length > 0 && (
            <div className="badges-row" style={{ marginTop: 10 }}>
              {badges.slice(0, 5).map((ub: any) => (
                <div key={ub.id} className="badge-chip" title={ub.badge.description}>
                  <span className="badge-chip-emoji">{ub.badge.emoji}</span>
                  {ub.badge.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">🏆</div>
          <div className="stat-value stat-gold">{user.totalPoints}</div>
          <div className="stat-label">Points totaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-value stat-green">{sr}%</div>
          <div className="stat-label">Taux de réussite</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-value stat-blue">{exact}</div>
          <div className="stat-label">Scores exacts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-value stat-red">{streak}</div>
          <div className="stat-label">Série en cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-value">{user.totalPredictions}</div>
          <div className="stat-label">Pronostics</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-value">{user.correctPredictions}</div>
          <div className="stat-label">Corrects</div>
        </div>
      </div>

      {/* Historique */}
      <section className="section">
        <h3>Derniers pronostics</h3>
        {!predictionsData?.predictions?.length ? (
          <p className="empty">Aucun pronostic pour l'instant</p>
        ) : (
          predictionsData.predictions.map((p: any) => {
            const cls = p.isExactScore ? 'exact' : p.isCorrectWinner ? 'correct' : p.isProcessed ? 'wrong' : '';
            return (
              <div key={p.id} className={`pred-history-row ${cls}`}>
                <span className="pred-teams">{p.match.homeTeam} vs {p.match.awayTeam}</span>
                <span className="pred-my">{p.predictedHome}–{p.predictedAway}</span>
                {p.isProcessed && <span className="pred-actual">({p.match.homeScore}–{p.match.awayScore})</span>}
                {p.isProcessed && (
                  <span className="pred-pts" style={{ marginLeft: 'auto' }}>
                    {p.isExactScore ? '⭐' : p.isCorrectWinner ? '✅' : '❌'} +{p.pointsEarned} pts
                  </span>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
