-- 球場評論：只存標籤（沒有自由文字），一人一座球場一份，可以修改
CREATE TABLE court_reviews (
  court_id    INTEGER NOT NULL,
  player_id   TEXT NOT NULL,
  tags        TEXT NOT NULL,      -- JSON 陣列，例如 ["floor_grip","lights_good"]
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (court_id, player_id)
);
CREATE INDEX court_reviews_court_updated ON court_reviews(court_id, updated_at);
CREATE INDEX court_reviews_player ON court_reviews(player_id);
