CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY ,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER,
  image TEXT
);