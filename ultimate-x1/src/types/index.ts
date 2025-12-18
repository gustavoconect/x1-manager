import { Lane } from "@/lib/constants";
export { LANES } from "@/lib/constants";
export type { Lane };



export interface Champion {
    name: string;
    image: string;
}

export interface BlacklistEntry extends Champion {
    phase: "Groups" | "Knockout";
    player: string;
}

export interface PickEntry {
    champion: string;
    player: string;
    image: string;
}

export interface GameSides {
    A: "Blue" | "Red";
    B: "Blue" | "Red";
}

export interface SeriesScore {
    A: number;
    B: number;
}

export interface AnnouncedChampions {
    A: Champion[];
    B: Champion[];
}

export type PlayerKey = "A" | "B";
export type TournamentPhase = "Groups" | "Knockout";
export type SeriesFormat = "MD2" | "MD3" | "MD5";

export interface GameState {
    // Setup
    setup_complete: boolean;
    player_a: string;
    player_b: string;
    elo_a: string;
    elo_b: string;
    pdl_a: number;
    pdl_b: number;

    // Phase Control
    tournament_phase: TournamentPhase;
    series_format: SeriesFormat;
    series_score: SeriesScore;

    // Turn Control
    start_player: PlayerKey | null;
    lower_elo_player: PlayerKey | null;
    current_action_player: PlayerKey | null;
    announce_turn_player: PlayerKey | null;

    // Lane Ban Phase
    banned_lanes: Lane[];
    selected_lane: Lane | null;

    // Groups Phase - Draft
    drawn_champions: Champion[];

    // Rule 6 - Choice Phase
    choice_made: boolean;
    pick_order_chooser: PlayerKey | null;
    side_chooser: PlayerKey | null;
    first_picker: PlayerKey | null;

    // Picks
    picks: Record<string, PickEntry>;

    // Side Choice
    side_choice_complete: boolean;
    game1_sides: Partial<GameSides>;

    // Knockout Phase
    announced_champions: AnnouncedChampions;
    knockout_bans: string[];

    // Persistent
    global_blacklist: BlacklistEntry[];
    match_history: MatchRecord[];

    // Metadata
    version: string;
}

export interface MatchRecord {
    id: number;
    player_a: string;
    player_b: string;
    lane?: Lane;
    phase: TournamentPhase;
    format?: SeriesFormat;
    score?: SeriesScore;
    game_1?: PickEntry;
    game_2?: PickEntry;
    game_3?: PickEntry;
    game_4?: PickEntry;
    game_5?: PickEntry;
    [key: string]: unknown;
}

export interface Player {
    name: string;
    elo: string;
    pdl: number;
    wins: number;
    losses: number;
    history: string[];
}

// API Request Types
export interface PlayerSetupRequest {
    player_a: string;
    elo_a: string;
    pdl_a: number;
    player_b: string;
    elo_b: string;
    pdl_b: number;
    tournament_phase: TournamentPhase;
    series_format: SeriesFormat;
    announce_first?: string;
}

export interface BanLaneRequest {
    lane: Lane;
}

export interface PickRequest {
    game: string;
    champion: string;
    image: string;
    player: string;
}

export interface ChampionAnnounceRequest {
    champion: string;
    image: string;
}
