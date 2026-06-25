const CHUNK_WORD_SIZE = 400;
const CHUNK_WORD_OVERLAP = 50;

// Stopwords to exclude from scoring so common words don't dominate
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'that', 'this', 'it', 'its', 'as', 'not',
]);

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

/**
 * Splits raw text into overlapping chunks for search indexing.
 * Preserves original casing in content for AI readability.
 */
const chunkText = (text) => {
  if (!text?.trim()) return [];

  const words = text.split(/\s+/);
  const chunks = [];
  let startWord = 0;
  let charCursor = 0;

  while (startWord < words.length) {
    const endWord = Math.min(startWord + CHUNK_WORD_SIZE, words.length);
    const chunkWords = words.slice(startWord, endWord);
    const content = chunkWords.join(' ');

    chunks.push({
      index: chunks.length,
      content,
      startChar: charCursor,
      endChar: charCursor + content.length,
    });

    const stepWords = Math.max(CHUNK_WORD_SIZE - CHUNK_WORD_OVERLAP, 1);
    const stepContent = words.slice(startWord, startWord + stepWords).join(' ');
    charCursor += stepContent.length + 1;
    startWord += stepWords;
  }

  return chunks;
};

/**
 * Scores a chunk against a query using normalized term-overlap (cosine-like).
 * Returns a value in [0, 1].
 */
const scoreChunk = (chunkContent, queryTokens) => {
  if (!queryTokens.length) return 0;
  const chunkTokens = tokenize(chunkContent);
  const chunkSet = new Set(chunkTokens);
  const matches = queryTokens.filter((t) => chunkSet.has(t)).length;
  return matches / (Math.sqrt(queryTokens.length) * Math.sqrt(chunkTokens.length || 1) + 1e-10);
};

/**
 * Finds the most relevant handbook chunks for a given query string.
 * @param {Array}  chunks  — chunk objects from Handbook.chunks
 * @param {string} query   — natural-language query (e.g. the finding observation)
 * @param {number} topK    — maximum results to return
 * @returns {Array} top-K chunks sorted by relevance score descending
 */
const searchHandbookChunks = (chunks, query, topK = 3) => {
  if (!chunks?.length || !query?.trim()) return [];

  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk.content, queryTokens) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

module.exports = { chunkText, searchHandbookChunks, tokenize };
