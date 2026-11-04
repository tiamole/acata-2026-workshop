PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS visits (
 event_id TEXT PRIMARY KEY,
 day TEXT NOT NULL,
 page TEXT NOT NULL,
 country TEXT NOT NULL,
 visitor_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS visits_day ON visits(day);
CREATE INDEX IF NOT EXISTS visits_country_day ON visits(country,day);
CREATE TABLE IF NOT EXISTS participants (
 token_hash TEXT PRIMARY KEY,
 workspace TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS survey_responses (
 submission_id TEXT PRIMARY KEY,
 study_hash TEXT NOT NULL,
 deletion_hash TEXT NOT NULL UNIQUE,
 stage TEXT NOT NULL CHECK(stage IN ('pre','post','followup')),
 instrument_version TEXT NOT NULL,
 consent_version TEXT NOT NULL,
 consented_at TEXT NOT NULL,
 submitted_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 answers TEXT NOT NULL,
 UNIQUE(study_hash,stage,instrument_version)
);
CREATE INDEX IF NOT EXISTS survey_expiry ON survey_responses(expires_at);
CREATE TABLE IF NOT EXISTS rate_limits (
 bucket TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
