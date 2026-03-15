-- Drop the old ones if you already created them
DROP FUNCTION IF EXISTS match_trade_rules;
DROP TABLE IF EXISTS trade_knowledge_base;

-- Create the table with 384 dimensions
CREATE TABLE trade_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade TEXT,
  region TEXT,
  scenario TEXT,
  risk_level TEXT,
  action_plan TEXT,
  authority_name TEXT,
  authority_url TEXT,
  search_query TEXT,
  embedding vector(384) -- Updated for the free open-source model
);

-- Create the search function matching the 384 dimensions
CREATE OR REPLACE FUNCTION match_trade_rules (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_region text
)
RETURNS TABLE (
  id uuid,
  trade text,
  scenario text,
  risk_level text,
  action_plan text,
  authority_name text,
  authority_url text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    trade,
    scenario,
    risk_level,
    action_plan,
    authority_name,
    authority_url,
    1 - (embedding <=> query_embedding) AS similarity
  FROM trade_knowledge_base
  WHERE region = filter_region
  AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
