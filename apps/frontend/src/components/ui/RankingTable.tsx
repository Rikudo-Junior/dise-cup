import { Flame } from 'lucide-react';
import type { RankingEntry } from '../../types';

interface Props { entries: RankingEntry[]; highlightId?: string; }

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingTable({ entries, highlightId }: Props) {
  if (entries.length === 0) return <p className="empty">Aucun participant</p>;

  return (
    <div className="ranking-table">
      <div className="ranking-head">
        <span>#</span>
        <span>Joueur</span>
        <span>Promo</span>
        <span>Pts</span>
        <span>Réussite</span>
        <span>Série</span>
      </div>
      {entries.map((e) => (
        <div key={e.id} className={`ranking-row ${e.id === highlightId ? 'ranking-row-me' : ''}`}>
          <span className="rank-num">{MEDALS[e.rank] ?? e.rank}</span>
          <div className="ranking-user">
            {e.avatarUrl
              ? <img src={e.avatarUrl} alt="" className="avatar-sm" />
              : <div className="avatar-initials">{e.username[0].toUpperCase()}</div>
            }
            <div className="ranking-info">
              <div className="ranking-name">@{e.username}</div>
            </div>
          </div>
          <span><span className="promo-pill">{e.promotion}</span></span>
          <span className="col-points">{e.totalPoints}</span>
          <span className="col-rate">{e.successRate}%</span>
          <span className="col-streak">
            {e.currentStreak ? <><Flame size={13} /> {e.currentStreak}</> : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}
