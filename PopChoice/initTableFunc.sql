create table popchoice (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(768) -- 1536 works for OpenAI embeddings
);


create or replace function match_popchoice (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    popchoice.id,
    popchoice.content,
    1 - (popchoice.embedding <=> query_embedding) as similarity
  from popchoice
  where 1 - (popchoice.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;