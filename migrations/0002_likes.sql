-- One row per (post, browser). The browser id comes from the pw_visitor cookie.
CREATE TABLE likes (
	slug TEXT NOT NULL,
	visitor TEXT NOT NULL,
	ip_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT (unixepoch()),
	PRIMARY KEY (slug, visitor)
);
CREATE INDEX likes_by_ip ON likes (slug, ip_hash);

-- Random salt per database, so stored IP hashes can't be reversed by hashing every IPv4 address.
CREATE TABLE secrets (
	name TEXT PRIMARY KEY,
	value TEXT NOT NULL
);
INSERT INTO secrets (name, value) VALUES ('ip_salt', lower(hex(randomblob(32))));
