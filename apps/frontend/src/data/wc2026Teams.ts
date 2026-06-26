export interface WCTeam {
  name: string;
  nameFr: string;
  code: string;
  flag: string;
  confederation: string;
}

export const WC2026_TEAMS: WCTeam[] = [
  // CONMEBOL
  { name: 'Argentina', nameFr: 'Argentine', code: 'ARG', flag: '🇦🇷', confederation: 'CONMEBOL' },
  { name: 'Brazil', nameFr: 'Brésil', code: 'BRA', flag: '🇧🇷', confederation: 'CONMEBOL' },
  { name: 'Colombia', nameFr: 'Colombie', code: 'COL', flag: '🇨🇴', confederation: 'CONMEBOL' },
  { name: 'Uruguay', nameFr: 'Uruguay', code: 'URU', flag: '🇺🇾', confederation: 'CONMEBOL' },
  { name: 'Ecuador', nameFr: 'Équateur', code: 'ECU', flag: '🇪🇨', confederation: 'CONMEBOL' },
  { name: 'Paraguay', nameFr: 'Paraguay', code: 'PAR', flag: '🇵🇾', confederation: 'CONMEBOL' },
  { name: 'Chile', nameFr: 'Chili', code: 'CHI', flag: '🇨🇱', confederation: 'CONMEBOL' },
  { name: 'Venezuela', nameFr: 'Venezuela', code: 'VEN', flag: '🇻🇪', confederation: 'CONMEBOL' },
  { name: 'Bolivia', nameFr: 'Bolivie', code: 'BOL', flag: '🇧🇴', confederation: 'CONMEBOL' },
  { name: 'Peru', nameFr: 'Pérou', code: 'PER', flag: '🇵🇪', confederation: 'CONMEBOL' },

  // UEFA
  { name: 'France', nameFr: 'France', code: 'FRA', flag: '🇫🇷', confederation: 'UEFA' },
  { name: 'Germany', nameFr: 'Allemagne', code: 'GER', flag: '🇩🇪', confederation: 'UEFA' },
  { name: 'Spain', nameFr: 'Espagne', code: 'ESP', flag: '🇪🇸', confederation: 'UEFA' },
  { name: 'England', nameFr: 'Angleterre', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { name: 'Portugal', nameFr: 'Portugal', code: 'POR', flag: '🇵🇹', confederation: 'UEFA' },
  { name: 'Netherlands', nameFr: 'Pays-Bas', code: 'NED', flag: '🇳🇱', confederation: 'UEFA' },
  { name: 'Italy', nameFr: 'Italie', code: 'ITA', flag: '🇮🇹', confederation: 'UEFA' },
  { name: 'Croatia', nameFr: 'Croatie', code: 'CRO', flag: '🇭🇷', confederation: 'UEFA' },
  { name: 'Belgium', nameFr: 'Belgique', code: 'BEL', flag: '🇧🇪', confederation: 'UEFA' },
  { name: 'Switzerland', nameFr: 'Suisse', code: 'SUI', flag: '🇨🇭', confederation: 'UEFA' },
  { name: 'Poland', nameFr: 'Pologne', code: 'POL', flag: '🇵🇱', confederation: 'UEFA' },
  { name: 'Austria', nameFr: 'Autriche', code: 'AUT', flag: '🇦🇹', confederation: 'UEFA' },
  { name: 'Turkey', nameFr: 'Turquie', code: 'TUR', flag: '🇹🇷', confederation: 'UEFA' },
  { name: 'Denmark', nameFr: 'Danemark', code: 'DEN', flag: '🇩🇰', confederation: 'UEFA' },
  { name: 'Serbia', nameFr: 'Serbie', code: 'SRB', flag: '🇷🇸', confederation: 'UEFA' },
  { name: 'Scotland', nameFr: 'Écosse', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA' },
  { name: 'Hungary', nameFr: 'Hongrie', code: 'HUN', flag: '🇭🇺', confederation: 'UEFA' },
  { name: 'Slovakia', nameFr: 'Slovaquie', code: 'SVK', flag: '🇸🇰', confederation: 'UEFA' },
  { name: 'Ukraine', nameFr: 'Ukraine', code: 'UKR', flag: '🇺🇦', confederation: 'UEFA' },
  { name: 'Czech Republic', nameFr: 'Rép. tchèque', code: 'CZE', flag: '🇨🇿', confederation: 'UEFA' },
  { name: 'Romania', nameFr: 'Roumanie', code: 'ROU', flag: '🇷🇴', confederation: 'UEFA' },

  // CONCACAF
  { name: 'United States', nameFr: 'États-Unis', code: 'USA', flag: '🇺🇸', confederation: 'CONCACAF' },
  { name: 'Mexico', nameFr: 'Mexique', code: 'MEX', flag: '🇲🇽', confederation: 'CONCACAF' },
  { name: 'Canada', nameFr: 'Canada', code: 'CAN', flag: '🇨🇦', confederation: 'CONCACAF' },
  { name: 'Jamaica', nameFr: 'Jamaïque', code: 'JAM', flag: '🇯🇲', confederation: 'CONCACAF' },
  { name: 'Honduras', nameFr: 'Honduras', code: 'HON', flag: '🇭🇳', confederation: 'CONCACAF' },
  { name: 'Guatemala', nameFr: 'Guatemala', code: 'GUA', flag: '🇬🇹', confederation: 'CONCACAF' },
  { name: 'Costa Rica', nameFr: 'Costa Rica', code: 'CRC', flag: '🇨🇷', confederation: 'CONCACAF' },
  { name: 'Panama', nameFr: 'Panama', code: 'PAN', flag: '🇵🇦', confederation: 'CONCACAF' },
  { name: 'El Salvador', nameFr: 'El Salvador', code: 'SLV', flag: '🇸🇻', confederation: 'CONCACAF' },

  // CAF
  { name: 'Morocco', nameFr: 'Maroc', code: 'MAR', flag: '🇲🇦', confederation: 'CAF' },
  { name: 'Senegal', nameFr: 'Sénégal', code: 'SEN', flag: '🇸🇳', confederation: 'CAF' },
  { name: "Côte d'Ivoire", nameFr: "Côte d'Ivoire", code: 'CIV', flag: '🇨🇮', confederation: 'CAF' },
  { name: 'Egypt', nameFr: 'Égypte', code: 'EGY', flag: '🇪🇬', confederation: 'CAF' },
  { name: 'Nigeria', nameFr: 'Nigéria', code: 'NGA', flag: '🇳🇬', confederation: 'CAF' },
  { name: 'Cameroon', nameFr: 'Cameroun', code: 'CMR', flag: '🇨🇲', confederation: 'CAF' },
  { name: 'Mali', nameFr: 'Mali', code: 'MLI', flag: '🇲🇱', confederation: 'CAF' },
  { name: 'Algeria', nameFr: 'Algérie', code: 'ALG', flag: '🇩🇿', confederation: 'CAF' },
  { name: 'Tunisia', nameFr: 'Tunisie', code: 'TUN', flag: '🇹🇳', confederation: 'CAF' },
  { name: 'Ghana', nameFr: 'Ghana', code: 'GHA', flag: '🇬🇭', confederation: 'CAF' },
  { name: 'DR Congo', nameFr: 'RD Congo', code: 'COD', flag: '🇨🇩', confederation: 'CAF' },
  { name: 'South Africa', nameFr: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦', confederation: 'CAF' },
  { name: 'Zambia', nameFr: 'Zambie', code: 'ZAM', flag: '🇿🇲', confederation: 'CAF' },
  { name: 'Gabon', nameFr: 'Gabon', code: 'GAB', flag: '🇬🇦', confederation: 'CAF' },

  // AFC
  { name: 'Japan', nameFr: 'Japon', code: 'JPN', flag: '🇯🇵', confederation: 'AFC' },
  { name: 'South Korea', nameFr: 'Corée du Sud', code: 'KOR', flag: '🇰🇷', confederation: 'AFC' },
  { name: 'Iran', nameFr: 'Iran', code: 'IRN', flag: '🇮🇷', confederation: 'AFC' },
  { name: 'Saudi Arabia', nameFr: 'Arabie saoudite', code: 'KSA', flag: '🇸🇦', confederation: 'AFC' },
  { name: 'Australia', nameFr: 'Australie', code: 'AUS', flag: '🇦🇺', confederation: 'AFC' },
  { name: 'Iraq', nameFr: 'Irak', code: 'IRQ', flag: '🇮🇶', confederation: 'AFC' },
  { name: 'Jordan', nameFr: 'Jordanie', code: 'JOR', flag: '🇯🇴', confederation: 'AFC' },
  { name: 'Uzbekistan', nameFr: 'Ouzbékistan', code: 'UZB', flag: '🇺🇿', confederation: 'AFC' },
  { name: 'Qatar', nameFr: 'Qatar', code: 'QAT', flag: '🇶🇦', confederation: 'AFC' },
  { name: 'Indonesia', nameFr: 'Indonésie', code: 'IDN', flag: '🇮🇩', confederation: 'AFC' },

  // OFC
  { name: 'New Zealand', nameFr: 'Nouvelle-Zélande', code: 'NZL', flag: '🇳🇿', confederation: 'OFC' },
];

// Map code → team for quick lookup
export const TEAM_BY_CODE = Object.fromEntries(
  WC2026_TEAMS.map(t => [t.code, t])
);

// Map code → flag emoji for MatchCard
export const FLAG_BY_CODE = Object.fromEntries(
  WC2026_TEAMS.map(t => [t.code, t.flag])
);
