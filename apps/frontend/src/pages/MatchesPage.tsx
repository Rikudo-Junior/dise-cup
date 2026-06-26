import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { matchesApi, usersApi } from '../api';
import MatchCard from '../components/ui/MatchCard';

const PHASES = [
  { label: 'Toutes les phases', value: '' },
  { label: 'Phase de groupes',    value: 'Phase de groupes' },
  { label: 'Seizièmes de finale', value: 'Seizièmes de finale' },
  { label: 'Huitièmes de finale', value: 'Huitièmes de finale' },
  { label: 'Quarts de finale',    value: 'Quarts de finale' },
  { label: 'Demi-finales',        value: 'Demi-finales' },
  { label: 'Match 3e place',      value: 'Match 3e place' },
  { label: 'Finale',              value: 'Finale' },
];

export default function MatchesPage() {
  const [statusTab, setStatusTab] = useState<'todo' | 'submitted' | 'finished' | 'all'>('todo');
  const [phase, setPhase]         = useState('');

  /* ── Fetch ── */
  const { data: allMatches = [] } = useQuery<any[]>({
    queryKey: ['matches', 'all'],
    queryFn: () => matchesApi.getAll(),
  });

  const { data: upcoming = [] } = useQuery<any[]>({
    queryKey: ['matches', 'upcoming', 200],
    queryFn: () => matchesApi.getUpcoming(200),
  });

  const { data: myPreds = [] } = useQuery<any[]>({
    queryKey: ['my-predictions', 1],
    queryFn: () => usersApi.getMyPredictions(1).then((r: any) => r.predictions ?? r ?? []),
  });

  /* ── Counts ── */
  const submittedMatchIds = useMemo(
    () => new Set((myPreds as any[]).map((p: any) => p.matchId)),
    [myPreds]
  );

  const totalCount     = allMatches.length;
  const finishedCount  = allMatches.filter((m: any) => m.status === 'FINISHED').length;
  const submittedCount = submittedMatchIds.size;
  const todoCount      = upcoming.filter((m: any) => !submittedMatchIds.has(m.id)).length;

  /* ── Filtering ── */
  const visibleMatches = useMemo(() => {
    let list: any[] = [];

    if (statusTab === 'todo')      list = upcoming.filter((m: any) => !submittedMatchIds.has(m.id));
    else if (statusTab === 'submitted') list = allMatches.filter((m: any) => submittedMatchIds.has(m.id));
    else if (statusTab === 'finished')  list = allMatches.filter((m: any) => m.status === 'FINISHED');
    else                                list = allMatches;

    if (phase) list = list.filter((m: any) => m.stage === phase || m.tournament?.name === phase);

    return list;
  }, [statusTab, phase, allMatches, upcoming, submittedMatchIds]);

  const STATUS_TABS = [
    { key: 'todo',      label: 'À faire',  count: todoCount      || null },
    { key: 'submitted', label: 'Soumis',   count: submittedCount || null },
    { key: 'finished',  label: 'Terminés', count: finishedCount  || null },
    { key: 'all',       label: 'Tous',     count: totalCount     || null },
  ] as const;

  return (
    <div className="mp">

      {/* ── Titre ── */}
      <h1 className="mp-title">Pronostics</h1>

      {/* ── Tabs statut ── */}
      <div className="mp-status-tabs">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            className={`mp-status-tab ${statusTab === t.key ? 'active' : ''}`}
            onClick={() => setStatusTab(t.key)}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="mp-tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tabs phase ── */}
      <div className="mp-phase-tabs">
        {PHASES.map(p => (
          <button
            key={p.value}
            className={`mp-phase-tab ${phase === p.value ? 'active' : ''}`}
            onClick={() => setPhase(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Contenu ── */}
      <div className="mp-content">
        {visibleMatches.length === 0 ? (
          <div className="mp-empty">
            <Search size={40} strokeWidth={1.5} />
            <p>Aucun match dans cette catégorie</p>
          </div>
        ) : (
          <div className="mp-matches-grid">
            {visibleMatches.map((m: any) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
