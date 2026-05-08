CREATE TABLE IF NOT EXISTS mrtitems (
  id TEXT PRIMARY KEY ,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER,
  image TEXT,
  onupdate TEXT
);