-- 揪團約打 Phase 1 資料表
-- 時間欄位一律存 Unix 毫秒（UTC），顯示時才轉 Asia/Taipei。

-- 球友：沒有帳號，只有一組隨機 ID（由 Worker 簽發 token）
CREATE TABLE players (
  id           TEXT PRIMARY KEY,
  nickname     TEXT NOT NULL,
  avatar_seed  INTEGER NOT NULL DEFAULT 0,
  level        TEXT,                 -- 自評：2.0 / 2.5 / 3.0 / 3.5 / 4.0+ / unsure
  dupr         TEXT,                 -- 自填，顯示時一律標「自填」
  code_hash    TEXT,                 -- 球友碼的 SHA-256；轉移後清空（一次性）
  created_at   INTEGER NOT NULL,
  deleted_at   INTEGER
);
CREATE UNIQUE INDEX players_code_hash ON players(code_hash) WHERE code_hash IS NOT NULL;

-- 約打團
CREATE TABLE games (
  id               TEXT PRIMARY KEY,
  court_id         INTEGER NOT NULL,          -- 對應 public/data/courts.json
  host_id          TEXT NOT NULL,
  title            TEXT NOT NULL,
  starts_at        INTEGER NOT NULL,
  duration_min     INTEGER NOT NULL,
  courts_booked    INTEGER NOT NULL,
  capacity         INTEGER NOT NULL,
  min_players      INTEGER NOT NULL,
  level_min        REAL,
  level_max        REAL,
  format           TEXT NOT NULL,
  scoring          TEXT NOT NULL,
  fee_total        INTEGER NOT NULL DEFAULT 0, -- 場租總額（元），本站不經手款項
  fee_note         TEXT,
  beginner         INTEGER NOT NULL DEFAULT 0,
  cancel_hours     INTEGER NOT NULL,           -- 開打前幾小時之後取消算「遲取消」
  community_url    TEXT,                       -- 團主的 LINE 社群連結（選填）
  note             TEXT,
  recur_weekly     INTEGER NOT NULL DEFAULT 0,
  series_id        TEXT,
  manage_key_hash  TEXT NOT NULL,              -- 團主管理連結密鑰的 SHA-256
  status           TEXT NOT NULL DEFAULT 'open'
                   CHECK (status IN ('open', 'cancelled', 'auto_cancelled', 'finished')),
  cancel_reason    TEXT,                       -- host / weather / not_enough / host_deleted
  hidden           INTEGER NOT NULL DEFAULT 0, -- 被 3 人以上檢舉時自動隱藏
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX games_status_start ON games(status, starts_at);
CREATE INDEX games_court_start ON games(court_id, starts_at);
CREATE INDEX games_host ON games(host_id);
CREATE INDEX games_series ON games(series_id) WHERE series_id IS NOT NULL;

-- 報名紀錄。一人一團一列，取消後可重新報名（覆寫同一列、排到候補最後）。
CREATE TABLE game_players (
  game_id     TEXT NOT NULL,
  player_id   TEXT NOT NULL,
  status      TEXT NOT NULL
              CHECK (status IN ('confirmed', 'waitlist', 'cancelled', 'late_cancel', 'attended', 'no_show')),
  joined_at   INTEGER NOT NULL,              -- 候補順位依這個排序
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (game_id, player_id)
);
CREATE INDEX game_players_queue ON game_players(game_id, status, joined_at);
CREATE INDEX game_players_player ON game_players(player_id, status);

-- 檢舉：同一人對同一團只算一次
CREATE TABLE reports (
  game_id      TEXT NOT NULL,
  reporter_id  TEXT NOT NULL,
  reason       TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (game_id, reporter_id)
);

-- 固定視窗頻率限制。key = 動作:IP 雜湊:視窗起點
CREATE TABLE rate_limits (
  key           TEXT PRIMARY KEY,
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL
);
CREATE INDEX rate_limits_window ON rate_limits(window_start);
