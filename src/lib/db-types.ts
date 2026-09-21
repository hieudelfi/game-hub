// Type definitions matching db/migrations/202609180001_init.sql +
// db/migrations/202609210001_rls_rpc.sql.
// Regenerate với `supabase gen types typescript --project-id <id>` sau khi P0-4 xong.

export interface DbProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
  streak_last_date: string | null;
  last_played_at: string | null;
  settings: Record<string, unknown>;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbGame {
  id: string;
  slug: string;
  title: string;
  system: string;
  cover_url: string | null;
  category: string;
  weight: number;
  is_active: boolean;
  manifest_url: string;
  min_duration_sec: number;
  created_at: string;
}

export interface DbScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  level_reached: number;
  duration_sec: number;
  played_at: string;
}

export interface DbSave {
  user_id: string;
  game_id: string;
  slot: number;
  state_blob: string | null;
  state_url: string | null;
  level: number;
  updated_at: string;
}

export interface WeeklyLeaderboardRow {
  game_id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  best_score: number;
  last_played_at: string;
}

export interface SubmitScoreResult {
  rank: number;
  xp_delta: number;
  new_achievements: string[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Partial<DbProfile> & Pick<DbProfile, "id" | "nickname">;
        Update: Partial<DbProfile>;
        Relationships: [];
      };
      games: {
        Row: DbGame;
        Insert: Partial<DbGame> & Pick<DbGame, "slug" | "title" | "system" | "manifest_url">;
        Update: Partial<DbGame>;
        Relationships: [];
      };
      scores: {
        Row: DbScore;
        Insert: DbScore;
        Update: Partial<DbScore>;
        Relationships: [];
      };
      saves: {
        Row: DbSave;
        Insert: Partial<DbSave> & Pick<DbSave, "user_id" | "game_id">;
        Update: Partial<DbSave>;
        Relationships: [];
      };
    };
    Views: {
      weekly_leaderboard_view: {
        Row: WeeklyLeaderboardRow;
        Relationships: [];
      };
    };
    Functions: {
      submit_score: {
        Args: {
          p_game_id: string;
          p_score: number;
          p_level?: number;
          p_duration_sec?: number;
          p_client_score_id?: string;
        };
        Returns: SubmitScoreResult;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
