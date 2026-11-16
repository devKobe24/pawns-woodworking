-- Anonymous comments. The password (PBKDF2, per-comment salt) lets the writer delete their own comment.
CREATE TABLE comments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL,
	name TEXT NOT NULL,
	body TEXT NOT NULL,
	password_salt TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	ip_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX comments_by_slug ON comments (slug, created_at);
CREATE INDEX comments_by_ip ON comments (ip_hash, created_at);
