-- Create tables for the chat application

-- Users profile table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_model TEXT NOT NULL DEFAULT 'grok-2',
  theme TEXT NOT NULL DEFAULT 'system',
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_chat_id ON attachments(chat_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can only read and update their own profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- User Settings: Users can only read and update their own settings
CREATE POLICY "Users can view their own settings" 
  ON user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Chats: Users can only CRUD their own chats
CREATE POLICY "Users can view their own chats" 
  ON chats FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" 
  ON chats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
  ON chats FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
  ON chats FOR DELETE 
  USING (auth.uid() = user_id);

-- Messages: Users can only CRUD messages in their own chats
CREATE POLICY "Users can view messages in their own chats" 
  ON messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in their own chats" 
  ON messages FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages in their own chats" 
  ON messages FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete messages in their own chats" 
  ON messages FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

-- Attachments: Users can only CRUD attachments in their own chats
CREATE POLICY "Users can view attachments in their own chats" 
  ON attachments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = attachments.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert attachments in their own chats" 
  ON attachments FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = attachments.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete attachments in their own chats" 
  ON attachments FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = attachments.chat_id 
    AND chats.user_id = auth.uid()
  ));
