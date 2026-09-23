-- 固定球敘的「我會去」：以「球場＋台北日期」為單位，一人一票
CREATE TABLE session_interests (
  court_id    INTEGER NOT NULL,
  date        TEXT NOT NULL,     -- YYYY-MM-DD（台北）
  player_id   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (court_id, date, player_id)
);
CREATE INDEX session_interests_date ON session_interests(date);
CREATE INDEX session_interests_player ON session_interests(player_id);
