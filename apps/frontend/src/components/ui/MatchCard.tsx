import { useState } from 'react';
import { Clock, Users, CheckCircle2, Pencil, Trophy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '../../api';
import type { Match } from '../../types';
import toast from 'react-hot-toast';
import { FLAG_BY_CODE } from '../../data/wc2026Teams';

interface Props { match: Match; showPrediction?: boolean; }

type Issue = 'HOME' | 'DRAW' | 'AWAY';

function issueFromScore(home: string, away: string): Issue | null {
  const h = parseInt(home, 10);
  const a = parseInt(away, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return 'HOME';
  if (h < a) return 'AWAY';
  return 'DRAW';
}

export default function MatchCard({ match, showPrediction = true }: Props) {
  const qc = useQueryClient();
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [firstScorer, setFirstScorer] = useState<'HOME' | 'AWAY' | null>(null);
  const [editing, setEditing] = useState(false);

  const homeFlag = FLAG_BY_CODE[match.homeTeamCode ?? ''] ?? '🏳️';
  const awayFlag = FLAG_BY_CODE[match.awayTeamCode ?? ''] ?? '🏳️';
  const homeCode = match.homeTeamCode || match.homeTeam.slice(0, 3).toUpperCase();
  const awayCode = match.awayTeamCode || match.awayTeam.slice(0, 3).toUpperCase();

  const deadline = new Date(match.predictionDeadline);
  const isOpen = match.status === 'SCHEDULED' && new Date() < deadline;
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'LIVE';

  const { data: myPrediction } = useQuery({
    queryKey: ['my-prediction', match.id],
    queryFn: () => predictionsApi.getMyPredictionForMatch(match.id),
    enabled: showPrediction && (isOpen || isFinished || isLive),
  });

  const mutation = useMutation({
    mutationFn: predictionsApi.create,
    onSuccess: () => {
      toast.success('Pronostic enregistré !');
      qc.invalidateQueries({ queryKey: ['my-prediction', match.id] });
      setEditing(false);
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  // Quand on clique sur un bouton vainqueur, on pré-remplit le score
  function selectIssue(issue: Issue) {
    if (issue === 'HOME') { setHome(h => h && parseInt(h) > 0 ? h : '1'); setAway(a => a && parseInt(a) === 0 ? a : '0'); }
    else if (issue === 'AWAY') { setHome(h => h && parseInt(h) === 0 ? h : '0'); setAway(a => a && parseInt(a) > 0 ? a : '1'); }
    else { setHome('0'); setAway('0'); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (home === '' || away === '') return;
    mutation.mutate({
      matchId: match.id,
      predictedHome: Number(home),
      predictedAway: Number(away),
      firstScorer: firstScorer ?? undefined,
    });
  }

  const currentIssue = issueFromScore(home, away);
  const scored = (h: string, a: string) => h !== '' && a !== '';

  // Labels résultat pronostic
  const predLabel = myPrediction?.isExactScore
    ? '⭐ Score exact'
    : myPrediction?.isCorrectWinner
    ? '✅ Bon vainqueur'
    : myPrediction?.isProcessed ? '❌ Raté' : '';

  return (
    <div className={`match-card ${isLive ? 'match-card-live' : ''}`}>
      {/* Header */}
      <div className="match-card-top">
        <div className="match-meta">
          <span className="match-tournament-name">{match.tournament?.name}</span>
          {match.stage && <span className="match-stage-tag">{match.stage}</span>}
        </div>
        {isLive
          ? <span className="status-badge status-live">● Live</span>
          : isFinished
          ? <span className="status-badge status-finished">Terminé</span>
          : <span className="status-badge status-scheduled">À venir</span>}
      </div>

      {/* Teams & score */}
      <div className="match-card-body">
        <div className="match-teams">
          <div className="team">
            <span className="team-flag-emoji">{homeFlag}</span>
            <span className="team-code">{homeCode}</span>
            <span className="team-name">{match.homeTeam}</span>
          </div>

          <div className="match-score-center">
            {isFinished || isLive
              ? <div className="score-display">{match.homeScore ?? '?'} – {match.awayScore ?? '?'}</div>
              : <div className="score-vs">VS</div>}
          </div>

          <div className="team team-away">
            <span className="team-flag-emoji">{awayFlag}</span>
            <span className="team-code">{awayCode}</span>
            <span className="team-name">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="match-card-footer">
        <Clock size={13} />
        <span>{new Date(match.scheduledAt).toLocaleString('fr-FR', {
          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        })}</span>
        {match._count && (
          <>
            <Users size={13} style={{ marginLeft: 'auto' }} />
            <span>{match._count.predictions} pronostics</span>
          </>
        )}
      </div>

      {/* Zone pronostic */}
      {showPrediction && (isOpen || (isFinished && myPrediction)) && (
        <div className="prediction-zone">

          {/* Match terminé — résultat */}
          {isFinished && myPrediction ? (
            <div className="pred-result-card">
              <div className="pred-result-row">
                <span className="pred-result-label">Mon pronostic</span>
                <span className="pred-score-show">{myPrediction.predictedHome} – {myPrediction.predictedAway}</span>
                {myPrediction.firstScorer && (
                  <span className="pred-result-sub">
                    1er but : {myPrediction.firstScorer === 'HOME' ? homeFlag : awayFlag}
                  </span>
                )}
              </div>
              <div className="pred-result-outcome">
                <span className="pred-result-tag">{predLabel}</span>
                <span className="pred-pts-earned">+{myPrediction.pointsEarned} pts</span>
              </div>
            </div>
          ) : myPrediction && !editing ? (
            /* Pronostic sauvegardé */
            <div className="pred-saved-row">
              <CheckCircle2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span className="pred-saved-label">Mon pronostic</span>
              <span className="pred-score-show">{myPrediction.predictedHome} – {myPrediction.predictedAway}</span>
              {myPrediction.firstScorer && (
                <span className="pred-result-sub">
                  1er : {myPrediction.firstScorer === 'HOME' ? homeFlag : awayFlag}
                </span>
              )}
              <button className="pred-edit-btn" onClick={() => {
                setHome(String(myPrediction.predictedHome));
                setAway(String(myPrediction.predictedAway));
                setFirstScorer((myPrediction.firstScorer as 'HOME' | 'AWAY') ?? null);
                setEditing(true);
              }}>
                <Pencil size={12} /> Modifier
              </button>
            </div>
          ) : (
            /* Formulaire de saisie */
            <form onSubmit={handleSubmit} className="pred-form-full">

              {/* Section 1 : Résultat */}
              <div className="pred-section">
                <div className="pred-section-label">Résultat prédit</div>
                <div className="issue-buttons">
                  <button
                    type="button"
                    className={`issue-btn issue-home ${currentIssue === 'HOME' ? 'active' : ''}`}
                    onClick={() => selectIssue('HOME')}
                  >
                    <span className="issue-flag">{homeFlag}</span>
                    <span>{homeCode}</span>
                  </button>
                  <button
                    type="button"
                    className={`issue-btn issue-draw ${currentIssue === 'DRAW' ? 'active' : ''}`}
                    onClick={() => selectIssue('DRAW')}
                  >
                    <span>Nul</span>
                    <span className="issue-x">X</span>
                  </button>
                  <button
                    type="button"
                    className={`issue-btn issue-away ${currentIssue === 'AWAY' ? 'active' : ''}`}
                    onClick={() => selectIssue('AWAY')}
                  >
                    <span>{awayCode}</span>
                    <span className="issue-flag">{awayFlag}</span>
                  </button>
                </div>
              </div>

              {/* Section 2 : Score exact */}
              <div className="pred-section">
                <div className="pred-section-label">Score exact <span className="pts-badge">⭐ 10 pts</span></div>
                <div className="score-row">
                  <div className="score-team-block">
                    <span className="score-team-flag">{homeFlag}</span>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                      value={home}
                      onChange={e => setHome(e.target.value.replace(/\D/g, ''))}
                      className="score-input-lg" placeholder="0"
                      autoComplete="off"
                    />
                  </div>
                  <span className="score-dash">—</span>
                  <div className="score-team-block">
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
                      value={away}
                      onChange={e => setAway(e.target.value.replace(/\D/g, ''))}
                      className="score-input-lg" placeholder="0"
                      autoComplete="off"
                    />
                    <span className="score-team-flag">{awayFlag}</span>
                  </div>
                </div>
              </div>

              {/* Section 3 : Premier buteur */}
              <div className="pred-section">
                <div className="pred-section-label">
                  Première équipe à marquer
                  <span className="pts-badge pts-bonus">+3 pts</span>
                </div>
                <div className="first-scorer-buttons">
                  <button
                    type="button"
                    className={`first-scorer-btn ${firstScorer === 'HOME' ? 'active' : ''}`}
                    onClick={() => setFirstScorer(f => f === 'HOME' ? null : 'HOME')}
                  >
                    {homeFlag} {homeCode}
                  </button>
                  <button
                    type="button"
                    className={`first-scorer-btn ${firstScorer === 'AWAY' ? 'active' : ''}`}
                    onClick={() => setFirstScorer(f => f === 'AWAY' ? null : 'AWAY')}
                  >
                    {awayCode} {awayFlag}
                  </button>
                </div>
                {!firstScorer && <span className="pred-optional">Optionnel — cliquez pour sélectionner</span>}
              </div>

              {/* Résumé des points possibles */}
              {scored(home, away) && (
                <div className="pred-points-hint">
                  <Trophy size={13} />
                  <span>
                    {currentIssue === 'DRAW' ? 'Nul' : currentIssue === 'HOME' ? homeCode : awayCode} ·
                    {' '}{home || '?'}-{away || '?'}
                    {firstScorer ? ` · 1er but : ${firstScorer === 'HOME' ? homeFlag : awayFlag}` : ''}
                  </span>
                  <span className="pts-preview">
                    max {10 + (firstScorer ? 3 : 0)} pts
                  </span>
                </div>
              )}

              <div className="pred-form-actions">
                <button type="submit" className="btn btn-primary" disabled={mutation.isPending || !scored(home, away)}>
                  {mutation.isPending ? 'Envoi...' : 'Valider mon pronostic'}
                </button>
                {editing && (
                  <button type="button" className="btn-text" onClick={() => setEditing(false)}>Annuler</button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
