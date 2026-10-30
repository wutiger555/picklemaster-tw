-- 匹克硬邦幫（/game 小遊戲）：雲端存檔與每週排行榜
-- 和揪團共用球友身分（players.id）；表名用 arcade_ 開頭，避免和約打團的 games 混淆

-- 每位球友一份存檔（戰績、踢館星數、設定、教學進度），整份 JSON，前端負責合併
CREATE TABLE arcade_profiles (
  player_id   TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- 每一場的結果：排行榜從這裡算，週次用台北時間週一 00:00 起算的毫秒
CREATE TABLE arcade_results (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id    TEXT NOT NULL,
  week         INTEGER NOT NULL,
  mode         TEXT NOT NULL,           -- match / dink
  difficulty   TEXT NOT NULL,           -- rookie / club / pro
  doubles      INTEGER NOT NULL DEFAULT 0,
  specials     INTEGER NOT NULL DEFAULT 1,
  venue        TEXT NOT NULL,
  won          INTEGER NOT NULL DEFAULT 0,
  score_me     INTEGER NOT NULL DEFAULT 0,
  score_opp    INTEGER NOT NULL DEFAULT 0,
  rallies      INTEGER NOT NULL DEFAULT 0, -- Dink 挑戰的拍數
  points       INTEGER NOT NULL DEFAULT 0, -- 這場算進「本週積分」的分數
  duration_ms  INTEGER NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX arcade_results_week_player ON arcade_results(week, player_id);
CREATE INDEX arcade_results_player ON arcade_results(player_id);
