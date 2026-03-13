-- ═══════════════════════════════════════════════════════════════
-- Zain's Content Planner — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── Profiles (extends auth.users) ──────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Skits (per-user) ──────────────────────────────────────
CREATE TABLE skits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inspiration TEXT DEFAULT '',
  cast_size TEXT DEFAULT '2',
  characters TEXT DEFAULT 'A + B',
  category TEXT DEFAULT 'AI Agent',
  style_ref TEXT DEFAULT '',
  script TEXT DEFAULT '',
  environment TEXT DEFAULT '',
  status TEXT DEFAULT 'Idea',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Influencers (shared by default, optionally private) ────
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  platforms JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  guide_content TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Categories (per-user) ─────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skits ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ─── Profiles: read/update/insert own ──────────────────────
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── Skits: full CRUD on own rows ─────────────────────────
CREATE POLICY "Users can view own skits"
  ON skits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skits"
  ON skits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skits"
  ON skits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skits"
  ON skits FOR DELETE USING (auth.uid() = user_id);

-- ─── Influencers: own + public visible, CRUD on own ───────
CREATE POLICY "Users can view own or public influencers"
  ON influencers FOR SELECT
  USING (auth.uid() = user_id OR is_private = false);
CREATE POLICY "Users can insert own influencers"
  ON influencers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own influencers"
  ON influencers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own influencers"
  ON influencers FOR DELETE USING (auth.uid() = user_id);

-- ─── Categories: full CRUD on own rows ────────────────────
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_skits_user_id ON skits(user_id);
CREATE INDEX idx_influencers_user_id ON influencers(user_id);
CREATE INDEX idx_influencers_private ON influencers(is_private);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- ═══════════════════════════════════════════════════════════════
-- MULTI-BOARD SCHEMA (run AFTER the above)
-- ═══════════════════════════════════════════════════════════════

-- ─── BOARDS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  slug        TEXT UNIQUE NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_boards_slug  ON boards(slug);

-- ─── BOARD MEMBERS ───────────────────────────────────────────
-- email  = who was invited (may not have an account yet)
-- user_id = set when they sign in (auth.email() matches)
CREATE TABLE IF NOT EXISTS board_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role        TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
  invited_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(board_id, email)
);
CREATE INDEX idx_bm_board ON board_members(board_id);
CREATE INDEX idx_bm_user  ON board_members(user_id);
CREATE INDEX idx_bm_email ON board_members(email);

-- ─── ADD board_id TO EXISTING TABLES ─────────────────────────
ALTER TABLE skits      ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES boards(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES boards(id) ON DELETE CASCADE;
ALTER TABLE skits      ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE skits      ADD COLUMN IF NOT EXISTS links TEXT DEFAULT '';
ALTER TABLE skits      ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT NULL;
ALTER TABLE skits      ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT NULL;
CREATE INDEX idx_skits_board      ON skits(board_id);
CREATE INDEX idx_categories_board ON categories(board_id);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE boards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- boards: owner full access
CREATE POLICY "boards_owner_all"     ON boards FOR ALL    USING (auth.uid() = owner_id);
-- boards: members can read
CREATE POLICY "boards_member_read"   ON boards FOR SELECT USING (
  EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id
          AND (user_id = auth.uid() OR email = auth.email()))
);
-- boards: public boards visible to everyone (incl. anon)
CREATE POLICY "boards_public_read"   ON boards FOR SELECT USING (is_public = true);

-- board_members: owner manages
CREATE POLICY "bm_owner_all"         ON board_members FOR ALL USING (
  EXISTS (SELECT 1 FROM boards WHERE id = board_id AND owner_id = auth.uid())
);
-- board_members: each person sees their own invite
CREATE POLICY "bm_self_read"         ON board_members FOR SELECT USING (
  user_id = auth.uid() OR email = auth.email()
);

-- skits: members can read
CREATE POLICY "skits_member_read"    ON skits FOR SELECT USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = skits.board_id
    AND (user_id = auth.uid() OR email = auth.email())
  )
);
-- skits: editors can write
CREATE POLICY "skits_editor_insert"  ON skits FOR INSERT WITH CHECK (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = skits.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
CREATE POLICY "skits_editor_update"  ON skits FOR UPDATE USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = skits.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
CREATE POLICY "skits_editor_delete"  ON skits FOR DELETE USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = skits.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
-- skits: public if board is public OR script is individually marked public
CREATE POLICY "skits_public_read"    ON skits FOR SELECT USING (
  is_public = true
  OR (
    board_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM boards WHERE id = skits.board_id AND is_public = true
    )
  )
);

-- categories: same pattern
CREATE POLICY "cats_member_read"     ON categories FOR SELECT USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = categories.board_id
    AND (user_id = auth.uid() OR email = auth.email())
  )
);
CREATE POLICY "cats_editor_insert"   ON categories FOR INSERT WITH CHECK (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = categories.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
CREATE POLICY "cats_editor_update"   ON categories FOR UPDATE USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = categories.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
CREATE POLICY "cats_editor_delete"   ON categories FOR DELETE USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM board_members WHERE board_id = categories.board_id
    AND (user_id = auth.uid() OR email = auth.email()) AND role = 'editor'
  )
);
CREATE POLICY "cats_public_read"     ON categories FOR SELECT USING (
  board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM boards WHERE id = categories.board_id AND is_public = true
  )
);
