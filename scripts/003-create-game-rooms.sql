-- Create game_rooms table for real-time multiplayer matchmaking
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  entry_fee integer NOT NULL DEFAULT 50,
  game_mode text DEFAULT 'classic',
  current_round integer DEFAULT 0,
  total_rounds integer DEFAULT 10,
  max_players integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- Create game_room_players table  
CREATE TABLE IF NOT EXISTS game_room_players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  is_alive boolean DEFAULT true,
  score integer DEFAULT 0,
  streak integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_room_players ENABLE ROW LEVEL SECURITY;

-- Policies for game_rooms
CREATE POLICY "Anyone can view game rooms" ON game_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game rooms" ON game_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update game rooms" ON game_rooms
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for game_room_players
CREATE POLICY "Anyone can view room players" ON game_room_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON game_room_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player data" ON game_room_players
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_room_players;

-- Index for finding open rooms
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_room_players_room ON game_room_players(room_id);
