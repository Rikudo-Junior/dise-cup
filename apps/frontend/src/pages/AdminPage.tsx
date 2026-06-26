import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, BarChart2, Ban, Plus, Radio, CheckCircle, Clock } from 'lucide-react';
import { adminApi, matchesApi } from '../api';
import toast from 'react-hot-toast';
import { WC2026_TEAMS, TEAM_BY_CODE } from '../data/wc2026Teams';

const CONFEDERATIONS = ['CONMEBOL', 'UEFA', 'CONCACAF', 'CAF', 'AFC', 'OFC'];

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'À venir',
  LIVE: 'En direct',
  FINISHED: 'Terminé',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'status-scheduled',
  LIVE: 'status-live',
  FINISHED: 'status-finished',
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stats' | 'users' | 'matches'>('stats');

  // Match creation form state
  const [showCreate, setShowCreate] = useState(false);
  const [newMatch, setNewMatch] = useState({
    homeCode: '', awayCode: '',
    stage: '',
    scheduledAt: '',
    tournamentId: '',
  });

  // Score forms per match
  const [scoreForm, setScoreForm] = useState<Record<string, { home: string; away: string; firstScoringTeam?: string }>>({});

  // ── Queries ──────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers({ search: search || undefined }),
    enabled: tab === 'users',
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: () => matchesApi.getAll(),
    enabled: tab === 'matches',
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => matchesApi.getTournaments(),
    enabled: tab === 'matches',
  });

  // ── Mutations ─────────────────────────────────────────────────────────
  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      banned ? adminApi.unbanUser(id) : adminApi.banUser(id),
    onSuccess: () => {
      toast.success('Utilisateur mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => matchesApi.create(data),
    onSuccess: () => {
      toast.success('Match créé !');
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      setShowCreate(false);
      setNewMatch({ homeCode: '', awayCode: '', stage: '', scheduledAt: '', tournamentId: '' });
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, homeScore, awayScore, firstScoringTeam }: {
      id: string; status: string; homeScore?: number; awayScore?: number; firstScoringTeam?: string;
    }) => matchesApi.updateStatus(id, { status, homeScore, awayScore, firstScoringTeam }),
    onSuccess: () => {
      toast.success('Statut mis à jour !');
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => matchesApi.delete(id),
    onSuccess: () => {
      toast.success('Match supprimé');
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  function setStatus(match: any, status: string) {
    const sf = scoreForm[match.id];
    const homeVal = sf?.home !== '' && sf?.home !== undefined ? Number(sf.home) : match.homeScore ?? undefined;
    const awayVal = sf?.away !== '' && sf?.away !== undefined ? Number(sf.away) : match.awayScore ?? undefined;
    const firstScoring = sf?.firstScoringTeam || undefined;

    // LIVE : on passe en direct avec 0-0 par défaut si pas de score saisi
    if (status === 'LIVE') {
      statusMutation.mutate({
        id: match.id,
        status,
        homeScore: homeVal ?? 0,
        awayScore: awayVal ?? 0,
      });
      return;
    }

    // FINISHED : score obligatoire
    if (status === 'FINISHED' && (homeVal === undefined || awayVal === undefined)) {
      toast.error('Entrez le score final avant de terminer le match');
      return;
    }

    statusMutation.mutate({
      id: match.id,
      status,
      ...(status !== 'SCHEDULED' && { homeScore: homeVal, awayScore: awayVal }),
      ...(firstScoring && { firstScoringTeam: firstScoring }),
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newMatch.tournamentId) { toast.error('Sélectionne un tournoi'); return; }
    if (!newMatch.homeCode || !newMatch.awayCode) { toast.error('Équipes manquantes'); return; }
    if (newMatch.homeCode === newMatch.awayCode) { toast.error('Les deux équipes doivent être différentes'); return; }
    if (!newMatch.scheduledAt) { toast.error('Date manquante'); return; }

    const home = TEAM_BY_CODE[newMatch.homeCode];
    const away = TEAM_BY_CODE[newMatch.awayCode];
    const predictionDeadline = new Date(newMatch.scheduledAt);
    predictionDeadline.setHours(predictionDeadline.getHours() - 1);

    createMutation.mutate({
      homeTeam: home.nameFr,
      awayTeam: away.nameFr,
      homeTeamCode: home.code,
      awayTeamCode: away.code,
      stage: newMatch.stage,
      tournamentId: newMatch.tournamentId,
      scheduledAt: new Date(newMatch.scheduledAt).toISOString(),
      predictionDeadline: predictionDeadline.toISOString(),
    });
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <h2 style={{ marginBottom: '1rem' }}>Dashboard Admin</h2>

      <div className="tab-bar">
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          <BarChart2 size={15} /> Stats
        </button>
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          <Users size={15} /> Utilisateurs
        </button>
        <button className={`tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>
          <Calendar size={15} /> Gestion matchs
        </button>
      </div>

      {/* ── STATS ── */}
      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><Users size={24} /><div className="stat-value">{stats.users}</div><div className="stat-label">Utilisateurs</div></div>
          <div className="stat-card"><Calendar size={24} /><div className="stat-value">{stats.matches}</div><div className="stat-label">Matchs</div></div>
          <div className="stat-card"><BarChart2 size={24} /><div className="stat-value">{stats.predictions}</div><div className="stat-label">Pronostics</div></div>
          <div className="stat-card"><Radio size={24} style={{ color: '#ef4444' }} /><div className="stat-value">{stats.activeMatches}</div><div className="stat-label">En direct</div></div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div>
          <input
            className="search-input"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="admin-table">
            {usersData?.users?.map((u: any) => (
              <div key={u.id} className={`admin-row ${u.isBanned ? 'banned' : ''}`}>
                <div>
                  <strong>{u.firstName} {u.lastName}</strong>
                  <span className="text-muted"> @{u.username}</span>
                </div>
                <span className="promotion-badge">{u.promotion}</span>
                <span>{u.totalPoints} pts</span>
                <span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                <button
                  className={`btn btn-sm ${u.isBanned ? 'btn-secondary' : 'btn-danger'}`}
                  onClick={() => banMutation.mutate({ id: u.id, banned: u.isBanned })}
                >
                  <Ban size={14} /> {u.isBanned ? 'Débannir' : 'Bannir'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MATCHS ── */}
      {tab === 'matches' && (
        <div>
          {/* Create match button */}
          <div style={{ marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
              <Plus size={16} /> {showCreate ? 'Annuler' : 'Nouveau match'}
            </button>
          </div>

          {/* Create match form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="admin-create-form">
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>Créer un match</h4>

              <div className="admin-form-grid">
                {/* Équipe domicile */}
                <div className="admin-form-field" style={{ gridColumn: '1 / 2' }}>
                  <label>Équipe domicile</label>
                  <select
                    value={newMatch.homeCode}
                    onChange={e => setNewMatch(v => ({ ...v, homeCode: e.target.value }))}
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {CONFEDERATIONS.map(conf => (
                      <optgroup key={conf} label={conf}>
                        {WC2026_TEAMS.filter(t => t.confederation === conf).map(t => (
                          <option key={t.code} value={t.code}>{t.flag} {t.nameFr}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {newMatch.homeCode && (
                    <span style={{ fontSize: '1.5rem', marginTop: '4px' }}>
                      {TEAM_BY_CODE[newMatch.homeCode]?.flag} {TEAM_BY_CODE[newMatch.homeCode]?.nameFr}
                    </span>
                  )}
                </div>

                {/* Équipe extérieure */}
                <div className="admin-form-field" style={{ gridColumn: '2 / 3' }}>
                  <label>Équipe extérieure</label>
                  <select
                    value={newMatch.awayCode}
                    onChange={e => setNewMatch(v => ({ ...v, awayCode: e.target.value }))}
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {CONFEDERATIONS.map(conf => (
                      <optgroup key={conf} label={conf}>
                        {WC2026_TEAMS.filter(t => t.confederation === conf).map(t => (
                          <option key={t.code} value={t.code}>{t.flag} {t.nameFr}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {newMatch.awayCode && (
                    <span style={{ fontSize: '1.5rem', marginTop: '4px' }}>
                      {TEAM_BY_CODE[newMatch.awayCode]?.flag} {TEAM_BY_CODE[newMatch.awayCode]?.nameFr}
                    </span>
                  )}
                </div>

                <div className="admin-form-field">
                  <label>Phase / Groupe</label>
                  <input
                    placeholder="ex: Groupe A, Quarts de finale..."
                    value={newMatch.stage}
                    onChange={e => setNewMatch(v => ({ ...v, stage: e.target.value }))}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Date et heure</label>
                  <input
                    type="datetime-local"
                    value={newMatch.scheduledAt}
                    onChange={e => setNewMatch(v => ({ ...v, scheduledAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Tournoi</label>
                  <select
                    value={newMatch.tournamentId}
                    onChange={e => setNewMatch(v => ({ ...v, tournamentId: e.target.value }))}
                    required
                  >
                    <option value="">Sélectionner un tournoi</option>
                    {tournaments.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer le match'}
              </button>
            </form>
          )}

          {/* Match list */}
          <div className="admin-matches-list">
            {matches.length === 0 && <p className="empty">Aucun match</p>}
            {matches.map((m: any) => {
              const sf = scoreForm[m.id] ?? { home: '', away: '' };
              const isFinished = m.status === 'FINISHED';

              return (
                <div key={m.id} className="admin-match-card">
                  {/* Match info */}
                  <div className="admin-match-header">
                    <div className="admin-match-teams">
                      <strong>{m.homeTeam}</strong>
                      <span className="score-sep">vs</span>
                      <strong>{m.awayTeam}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`status-badge ${STATUS_COLORS[m.status]}`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                      {(m.status === 'LIVE' || isFinished) && m.homeScore !== null && (
                        <span className="admin-current-score">
                          {m.homeScore} – {m.awayScore}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="admin-match-meta">
                    <span>{m.tournament?.name}</span>
                    {m.stage && <span> · {m.stage}</span>}
                    <span> · {new Date(m.scheduledAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Score input + status buttons */}
                  <div className="admin-match-controls">
                    {/* Score inputs */}
                    <div className="admin-score-inputs">
                      <span style={{ fontSize: '1rem' }}>{m.homeTeamCode}</span>
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                        placeholder={m.homeScore !== null ? String(m.homeScore) : '0'}
                        value={sf.home}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], home: v } }));
                        }}
                        className="score-input"
                        disabled={isFinished}
                      />
                      <span className="score-sep">–</span>
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                        placeholder={m.awayScore !== null ? String(m.awayScore) : '0'}
                        value={sf.away}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], away: v } }));
                        }}
                        className="score-input"
                        disabled={isFinished}
                      />
                      <span style={{ fontSize: '1rem' }}>{m.awayTeamCode}</span>
                    </div>

                    {/* Première équipe à marquer */}
                    {!isFinished && (
                      <div className="admin-first-scorer">
                        <span className="admin-first-scorer-label">1er but :</span>
                        <button
                          type="button"
                          className={`btn btn-sm ${sf.firstScoringTeam === 'HOME' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setScoreForm(f => ({
                            ...f, [m.id]: { ...f[m.id], firstScoringTeam: sf.firstScoringTeam === 'HOME' ? undefined : 'HOME' }
                          }))}
                          disabled={isFinished}
                        >
                          {m.homeTeamCode}
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${sf.firstScoringTeam === 'AWAY' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setScoreForm(f => ({
                            ...f, [m.id]: { ...f[m.id], firstScoringTeam: sf.firstScoringTeam === 'AWAY' ? undefined : 'AWAY' }
                          }))}
                          disabled={isFinished}
                        >
                          {m.awayTeamCode}
                        </button>
                      </div>
                    )}
                    {isFinished && m.firstScoringTeam && (
                      <div className="admin-first-scorer">
                        <span className="admin-first-scorer-label">1er but :</span>
                        <span className="promotion-badge">
                          {m.firstScoringTeam === 'HOME' ? m.homeTeamCode : m.awayTeamCode}
                        </span>
                      </div>
                    )}
                    </div>

                    {/* Status buttons */}
                    <div className="admin-status-btns">
                      <button
                        className={`btn btn-sm ${m.status === 'SCHEDULED' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatus(m, 'SCHEDULED')}
                        disabled={isFinished || statusMutation.isPending}
                        title="Non commencé"
                      >
                        <Clock size={13} /> À venir
                      </button>
                      <button
                        className={`btn btn-sm ${m.status === 'LIVE' ? 'btn-live' : 'btn-secondary'}`}
                        onClick={() => setStatus(m, 'LIVE')}
                        disabled={isFinished || statusMutation.isPending}
                        title="Mettre en direct"
                      >
                        <Radio size={13} /> En direct
                      </button>
                      <button
                        className={`btn btn-sm ${isFinished ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatus(m, 'FINISHED')}
                        disabled={isFinished || statusMutation.isPending}
                        title="Terminer le match"
                      >
                        <CheckCircle size={13} /> Terminer
                      </button>
                    </div>

                    {/* Delete */}
                    {!isFinished && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (confirm(`Supprimer ${m.homeTeam} vs ${m.awayTeam} ?`)) {
                            deleteMutation.mutate(m.id);
                          }
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
