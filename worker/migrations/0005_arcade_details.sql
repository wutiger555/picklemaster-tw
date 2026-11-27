-- 每場成績多記：最長連擊、用的選手與球拍（球友卡要秀）
ALTER TABLE arcade_results ADD COLUMN longest_rally INTEGER NOT NULL DEFAULT 0;
ALTER TABLE arcade_results ADD COLUMN character TEXT;
ALTER TABLE arcade_results ADD COLUMN paddle TEXT;
