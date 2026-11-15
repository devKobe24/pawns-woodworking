-- One row per post: total page views.
CREATE TABLE views (
	slug TEXT PRIMARY KEY,
	count INTEGER NOT NULL DEFAULT 0
);
