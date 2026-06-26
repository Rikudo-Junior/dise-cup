import { PrismaClient, BadgeType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const adminHash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ise-ensea.ci' },
    update: { promotion: 'ISE 3' },
    create: {
      email: 'admin@ise-ensea.ci',
      username: 'admin_ise',
      firstName: 'Admin',
      lastName: 'ISE',
      promotion: 'ISE 3',
      passwordHash: adminHash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  // Badges
  const badges = [
    { type: BadgeType.FIRST_PREDICTION, name: 'Premier pronostic', description: 'A fait son premier pronostic', emoji: '🎯', condition: { totalPredictions: 1 } },
    { type: BadgeType.EXACT_SCORE_KING, name: 'Roi du score exact', description: '5 scores exacts', emoji: '👑', condition: { exactScorePredictions: 5 } },
    { type: BadgeType.WIN_STREAK, name: 'Série gagnante', description: '5 pronostics corrects d\'affilée', emoji: '🔥', condition: { currentStreak: 5 } },
    { type: BadgeType.CENTURION, name: 'Centurion', description: '100 pronostics réalisés', emoji: '💯', condition: { totalPredictions: 100 } },
    { type: BadgeType.CHAMPION, name: 'Champion', description: '500 points atteints', emoji: '🏆', condition: { totalPoints: 500 } },
    { type: BadgeType.TOP_1, name: 'N°1', description: 'Classé 1er', emoji: '🥇', condition: { rank: 1 } },
    { type: BadgeType.TOP_2, name: 'N°2', description: 'Classé 2ème', emoji: '🥈', condition: { rank: 2 } },
    { type: BadgeType.TOP_3, name: 'N°3', description: 'Classé 3ème', emoji: '🥉', condition: { rank: 3 } },
    { type: BadgeType.PERFECT_WEEK, name: 'Semaine parfaite', description: 'Tous les pronostics corrects en une semaine', emoji: '⭐', condition: { perfectWeek: true } },
    { type: BadgeType.SURPRISE_EXPERT, name: 'Expert surprise', description: '3 surprises correctement pronostiquées', emoji: '😱', condition: { surprises: 3 } },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { type: badge.type },
      update: {},
      create: badge,
    });
  }

  // Saison + Tournoi de démo
  const season = await prisma.season.upsert({
    where: { name: 'Coupe du Monde 2026' },
    update: {},
    create: {
      name: 'Coupe du Monde 2026',
      description: 'FIFA World Cup 2026 — USA / Canada / Mexique',
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      isActive: true,
    },
  });

  const tournament = await prisma.tournament.upsert({
    where: { apiId: 'WC2026_MAIN' },
    update: {},
    create: {
      name: 'FIFA World Cup 2026',
      description: 'Coupe du Monde FIFA 2026',
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      isActive: true,
      apiId: 'WC2026_MAIN',
      seasonId: season.id,
    },
  });

  // Matchs de démo
  const matchesData = [
    { homeTeam: 'Côte d\'Ivoire', awayTeam: 'Ghana', homeTeamCode: 'CIV', awayTeamCode: 'GHA', scheduledAt: new Date('2026-06-26T15:00:00Z') },
    { homeTeam: 'Sénégal', awayTeam: 'Mali', homeTeamCode: 'SEN', awayTeamCode: 'MLI', scheduledAt: new Date('2026-06-26T18:00:00Z') },
    { homeTeam: 'Nigéria', awayTeam: 'Cameroun', homeTeamCode: 'NGA', awayTeamCode: 'CMR', scheduledAt: new Date('2026-06-27T15:00:00Z') },
  ];

  for (const m of matchesData) {
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeTeamCode: m.homeTeamCode,
        awayTeamCode: m.awayTeamCode,
        scheduledAt: m.scheduledAt,
        predictionDeadline: new Date(m.scheduledAt.getTime() - 15 * 60 * 1000),
        stage: 'Groupe A',
      },
    }).catch(() => {});
  }

  console.log('✅ Seeding terminé !');
  console.log('👤 Admin: admin@ise-ensea.ci / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
