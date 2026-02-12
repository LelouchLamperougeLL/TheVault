// ==========================================
// SECTION 1: GLOBAL CONFIGURATION & CONSTANTS
// ==========================================

const SUPABASE_URL = "https://ugllcdapuzihpkgcoaxj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbGxjZGFwdXppaHBrZ2NvYXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTA3NzksImV4cCI6MjA4NjA2Njc3OX0.73I1cW1fqRUha5_6spK7C8m-SXUHQQfyjmcbNNbdfCI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_IDS = ["74e5b3ea-113f-4d6c-be2a-b0b52b2e92c3"];
const DEFAULT_KEYS = { omdb: '5591108c', tmdb: '68b27c1f85725736f0aec18b903197b0', rapid: '9782bOaf7fmsh8b54c22e5cOaf5cp13e6e8jsn8e2e765657a5' };
const RAPID_HOST_MDL = 'mydramalist-api.p.rapidapi.com';
const MDL_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

const VIEWS = {
    LIBRARY: 'library',
    MOVIES: 'movies',
    SERIES: 'series',
    PROFILE: 'profile'
};

const ASIAN_SOURCES = {
    MDL: 'mdl',
    MAL: 'mal'
};

// Cache Configuration
const CACHE_CONFIG = {
    VERSION: 'v1',
    TTL_MS: 30 * 24 * 60 * 60 * 1000, // 30 days
    PREFIX: 'cinestat_cache:',
    MAX_ENTRIES: 500
};

const EAST_SE_ASIA_COUNTRIES = [
    'japan', 'south korea', 'north korea', 'korea',
    'china', 'hong kong', 'taiwan',
    'thailand', 'vietnam', 'philippines',
    'malaysia', 'indonesia', 'singapore'
];
const EAST_SE_ASIA_LANGUAGES = [
    'japanese', 'korean',
    'mandarin', 'cantonese', 'chinese',
    'thai', 'vietnamese',
    'malay', 'indonesian'
];
const WESTERN_COUNTRIES = [
    'united states', 'usa', 'canada',
    'united kingdom', 'uk', 'england',
    'france', 'germany', 'spain',
    'australia'
];
const WESTERN_LANGUAGES = [
    'english', 'french', 'spanish',
    'german', 'italian', 'portuguese'
];

// ==========================================
// SECTION 2: CORE UTILITIES (Framework Agnostic)
// ==========================================

const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const now = () => Date.now();
const isAdminUser = (user) => {
    if (!user || !user.id) return false;
    return ADMIN_IDS.includes(user.id);
};

async function safeFetch(url, options = {}, retries = 2) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            return { error: true, status: res.status };
        }
        return await res.json();
    } catch (e) {
        if (retries > 0) {
             await new Promise(r => setTimeout(r, 400 * (3 - retries)));
             return safeFetch(url, options, retries - 1);
        }
        return { error: true, status: 'network_error' };
    }
}

function humanizeReason(reason) {
    if (reason === 'exact-title') return 'Exact title match';
    if (reason.startsWith('fuzzy'))
        return `Title similarity ${reason.match(/\d+/)?.[0]}%`;
    if (reason === 'exact-year') return 'Exact release year';
    if (reason === 'near-year') return 'Close release year';
    if (reason.startsWith('popularity'))
        return 'Popular title';
    if (reason.includes('tmdb')) return 'Trusted source (TMDB)';
    if (reason.includes('tvmaze')) return 'Trusted source (TVMaze)';
    return reason;
}

const getHighResPoster = (url, width = 600) => {
    if (!url || url === "N/A") return "https://via.placeholder.com/300x450?text=No+Poster";
    if (url.includes("media-amazon.com")) return url.replace(/_V1_.*\.jpg$/, `_V1_SX${width}.jpg`);
    if (url.includes("tmdb.org")) return url.replace(/\/w\d+\//, width > 700 ? "/original/" : `/w${width}/`);
    return url;
};

const tmdbImg = (path, size = "w780") => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
const formatCurrency = (val) => val ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val) : 'N/A';
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; 
    }
    return Math.abs(hash).toString(16);
};

// ==========================================
// SECTION 3: CACHING & STORAGE SYSTEM
// ==========================================

function createStorage() {
    try {
        const k = '__test__';
        localStorage.setItem(k, '1');
        localStorage.removeItem(k);
        return {
            get: k => localStorage.getItem(k),
            set: (k, v) => localStorage.setItem(k, v),
            remove: k => localStorage.removeItem(k),
            keys: () => Object.keys(localStorage)
        };
    } catch {
        const mem = new Map();
        return {
            get: k => mem.get(k) || null,
            set: (k, v) => mem.set(k, v),
            remove: k => mem.delete(k),
            keys: () => Array.from(mem.keys())
        };
    }
}

const storage = createStorage();

function enforceCacheSize() {
    const keys = storage.keys().filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
    if (keys.length <= CACHE_CONFIG.MAX_ENTRIES) return;

    const entries = keys.map(k => {
        try {
            const e = JSON.parse(storage.get(k));
            return { key: k, lastAccessed: e?.lastAccessed || 0 };
        } catch {
            return { key: k, lastAccessed: 0 };
        }
    }).sort((a, b) => a.lastAccessed - b.lastAccessed);

    const overflow = entries.length - CACHE_CONFIG.MAX_ENTRIES;
    for (let i = 0; i < overflow; i++) {
        storage.remove(entries[i].key);
        if (process.env.NODE_ENV === 'development') console.debug('[cache evict]', entries[i].key);
    }
}

function cacheSet(key, value) {
    const entry = {
        v: CACHE_CONFIG.VERSION,
        value,
        expiresAt: now() + CACHE_CONFIG.TTL_MS,
        lastAccessed: now()
    };
    storage.set(CACHE_CONFIG.PREFIX + key, JSON.stringify(entry));
    if (storage.keys().length > CACHE_CONFIG.MAX_ENTRIES) {
        enforceCacheSize();
    }
}

function cacheGet(key) {
    const raw = storage.get(CACHE_CONFIG.PREFIX + key);
    if (!raw) return null;
    try {
        const entry = JSON.parse(raw);
        if (entry.v !== CACHE_CONFIG.VERSION || now() > entry.expiresAt) {
            storage.remove(CACHE_CONFIG.PREFIX + key);
            return null;
        }
        entry.expiresAt = now() + CACHE_CONFIG.TTL_MS;
        entry.lastAccessed = now();
        storage.set(CACHE_CONFIG.PREFIX + key, JSON.stringify(entry));
        if (process.env.NODE_ENV === 'development') console.debug('[cache hit]', key);
        return entry.value;
    } catch {
        storage.remove(CACHE_CONFIG.PREFIX + key);
        return null;
    }
}

function cacheDelete(key) { storage.remove(CACHE_CONFIG.PREFIX + key); }
function clearAllCache() { storage.keys().filter(k => k.startsWith(CACHE_CONFIG.PREFIX)).forEach(k => storage.remove(k)); }

function evictExpiredEntries() {
    for (const key of storage.keys()) {
        if (!key.startsWith(CACHE_CONFIG.PREFIX)) continue;
        try {
            const entry = JSON.parse(storage.get(key));
            if (!entry || entry.v !== CACHE_CONFIG.VERSION || now() > entry.expiresAt) {
                storage.remove(key);
            }
        } catch {
            storage.remove(key);
        }
    }
}

function getCacheStats() {
    const keys = storage.keys().filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
    let expired = 0;
    for (const k of keys) {
        try {
            const e = JSON.parse(storage.get(k));
            if (!e || now() > e.expiresAt) expired++;
        } catch {
            expired++;
        }
    }
    return {
        totalEntries: keys.length,
        expiredEntries: expired,
        maxEntries: CACHE_CONFIG.MAX_ENTRIES
    };
}

// Initialize Cache
evictExpiredEntries();

// ==========================================
// SECTION 4: LOGIC ENGINES (Business Logic)
// ==========================================

// --- EPISODE PROGRESS ENGINE ---
function resolveEpisodeState(episodeId, watchHistory) {
    const record = watchHistory?.[episodeId];
    if (!record) return { state: 'unwatched', progress: 0 };
    if (record.watched === true) return { state: 'watched', progress: 1 };
    if (typeof record.progress === 'number' && record.progress > 0) return { state: 'partial', progress: record.progress };
    return { state: 'unwatched', progress: 0 };
}

function calculateEpisodeProgress({ episodes, watchHistory }) {
    let watchedEpisodes = 0;
    let lastWatched = null;
    let nextToWatch = null;
    let hasGaps = false;
    let gapDetected = false;

    if (!episodes || !Array.isArray(episodes)) return null;

    for (const ep of episodes) {
        const state = resolveEpisodeState(ep.id, watchHistory);
        if (state.state === 'watched') {
            watchedEpisodes++;
            lastWatched = { episodeId: ep.id, season: ep.season, episode: ep.episode };
        } else {
            if (watchedEpisodes > 0 && !gapDetected) {
                hasGaps = true;
                gapDetected = true;
            }
            if (!nextToWatch) {
                nextToWatch = { episodeId: ep.id, season: ep.season, episode: ep.episode };
            }
        }
    }

    const totalEpisodes = episodes.length;
    const completionPercent = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;

    return { watchedEpisodes, totalEpisodes, completionPercent, lastWatched, nextToWatch, isCompleted: watchedEpisodes === totalEpisodes, hasGaps };
}

function detectSeasonGaps({ episodes, watchHistory }) {
    const seasons = {};
    for (const ep of episodes) {
        const state = resolveEpisodeState(ep.id, watchHistory);
        seasons[ep.season] ??= { season: ep.season, watched: 0, skipped: 0, total: 0 };
        seasons[ep.season].total++;
        if (state.state === 'watched') seasons[ep.season].watched++;
        else seasons[ep.season].skipped++;
    }
    return Object.values(seasons).filter(s => s.watched > 0 && s.skipped > 0).sort((a, b) => a.season - b.season);
}

function getResumeTarget({ episodes, watchHistory }) {
    if (!episodes || !Array.isArray(episodes)) return null;
    for (const ep of episodes) {
        const state = resolveEpisodeState(ep.id, watchHistory);
        if (state.state === 'partial') return { episodeId: ep.id, season: ep.season, episode: ep.episode, resumeFrom: state.progress };
        if (state.state === 'unwatched') return { episodeId: ep.id, season: ep.season, episode: ep.episode, resumeFrom: 0 };
    }
    return null; 
}

function calculateSeasonProgress({ episodes, watchHistory }) {
    if (!episodes || !Array.isArray(episodes)) return [];
    const seasons = {};
    for (const ep of episodes) {
        seasons[ep.season] ??= { season: ep.season, watched: 0, partial: 0, total: 0 };
        const state = resolveEpisodeState(ep.id, watchHistory);
        seasons[ep.season].total++;
        if (state.state === 'watched') seasons[ep.season].watched++;
        if (state.state === 'partial') seasons[ep.season].partial++;
    }
    return Object.values(seasons).map(s => ({ ...s, completionPercent: s.total ? Math.round((s.watched / s.total) * 100) : 0 }));
}

// --- WEIGHTED RATING ENGINE ---
function extractUserRatings(item) {
    if (!item.userMeta?.ratings) return [];
    return Object.values(item.userMeta.ratings)
        .filter(r => typeof r.rating === 'number' && typeof r.minutesWatched === 'number')
        .map(r => ({ imdbID: item.imdbID, rating: r.rating, minutesWatched: r.minutesWatched }));
}

function ratingConfidence(minutesWatched, minMinutes = 20) {
    if (minutesWatched < minMinutes) return 0;
    return Math.min(1, Math.log1p(minutesWatched) / Math.log1p(300));
}

function timeWeight(minutesWatched) { return Math.log1p(minutesWatched); }

function calculateWeightedRating(ratings, options = {}) {
    const { minMinutes = 20, maxMinutesCap = null } = options;
    let weightedSum = 0, totalWeight = 0, contributingItems = 0;
    const breakdown = [];

    for (const r of ratings) {
        if (typeof r.rating !== 'number' || r.rating < 1 || r.rating > 10 || typeof r.minutesWatched !== 'number' || r.minutesWatched <= 0) continue;
        let minutes = r.minutesWatched;
        if (maxMinutesCap) minutes = Math.min(minutes, maxMinutesCap);
        const confidence = ratingConfidence(minutes, minMinutes);
        if (confidence === 0) continue;
        const weight = timeWeight(minutes) * confidence;
        const contribution = r.rating * weight;
        weightedSum += contribution;
        totalWeight += weight;
        contributingItems++;
        breakdown.push({ imdbID: r.imdbID, rating: r.rating, minutesWatched: minutes, confidence: Number(confidence.toFixed(2)), weight: Number(weight.toFixed(2)), contribution: Number(contribution.toFixed(2)) });
    }

    if (totalWeight === 0) return { weightedRating: 0, contributingItems: 0, breakdown: [] };
    return { weightedRating: Number((weightedSum / totalWeight).toFixed(2)), contributingItems, breakdown };
}

// --- GENRE INTELLIGENCE ENGINE ---
function extractGenres(genres) {
    if (!genres) return [];
    if (Array.isArray(genres)) return genres.map(g => g.toLowerCase().trim()).filter(Boolean);
    if (typeof genres === 'string') return genres.split(',').map(g => g.toLowerCase().trim()).filter(Boolean);
    return [];
}

function recencyWeight(lastWatchedAt, halfLifeDays = 180) {
    if (!lastWatchedAt) return 1;
    const ageDays = (Date.now() - lastWatchedAt) / (1000 * 60 * 60 * 24);
    return Math.exp(-ageDays / halfLifeDays);
}

function calculateFractionalGenreDistribution(items, options = {}) {
    const { useRecency = false, recencyHalfLifeDays = 180 } = options;
    const distribution = {};
    let totalWeight = 0;

    for (const item of items) {
        const genres = extractGenres(item.genres);
        if (genres.length === 0) continue;
        const baseWeight = timeWeight(item.minutesWatched);
        if (baseWeight === 0) continue;
        const recency = useRecency ? recencyWeight(item.lastWatchedAt, recencyHalfLifeDays) : 1;
        const weight = baseWeight * recency;
        const fractional = weight / genres.length;
        totalWeight += weight;
        for (const genre of genres) {
            distribution[genre] ??= 0;
            distribution[genre] += fractional;
        }
    }
    return { distribution, totalWeight };
}

function normalizeGenreDistribution(distribution) {
    const total = Object.values(distribution).reduce((sum, v) => sum + v, 0);
    if (total === 0) return {};
    const normalized = {};
    for (const [genre, value] of Object.entries(distribution)) {
        normalized[genre] = Number(((value / total) * 100).toFixed(2));
    }
    return normalized;
}

function getGenreProfile(items, options = {}) {
    const { distribution, totalWeight } = calculateFractionalGenreDistribution(items, options);
    return { raw: distribution, percent: normalizeGenreDistribution(distribution), totalWeight };
}

function extractGenreItems(items) {
    return items
        .filter(i => typeof i.minutesWatched === 'number' && i.minutesWatched > 0 && i.Genre)
        .map(i => ({ genres: i.Genre, minutesWatched: i.minutesWatched, lastWatchedAt: i.userMeta?.lastWatchedAt }));
}

function genreAffinityScore(item, preferredGenres) {
    const itemGenres = extractGenres(item.Genre);
    if (!itemGenres.length) return 0;
    return itemGenres.reduce((score, g) => score + (preferredGenres.includes(g) ? 1 : 0), 0);
}

// --- ACTOR POPULARITY ENGINE ---
function buildProgressMap(items) {
    const map = {};
    items.forEach(item => {
        if (!item.imdbID) return;
        const minutes = item.minutesWatched ?? item.userMeta?.minutesWatched ?? 0;
        map[item.imdbID] = {
            watchedEpisodes: item.userMeta?.watchedEpisodes,
            totalEpisodes: item.userMeta?.totalEpisodes,
            isCompleted: item.userMeta?.status === 'watched',
            minutesWatched: minutes
        };
    });
    return map;
}

function extractActorItems(items) {
    return items.filter(i => Array.isArray(i.meta?.cast) && i.meta.cast.length > 0 && (typeof i.minutesWatched === 'number' || typeof i.userMeta?.minutesWatched === 'number'));
}

function normalizeActor(name) { return name.toLowerCase().replace(/\s+/g, ' ').trim(); }

function completionWeight(progress) {
    if (!progress) return 0;
    if (progress.isCompleted === true) return 1;
    if (typeof progress.watchedEpisodes === 'number' && typeof progress.totalEpisodes === 'number' && progress.totalEpisodes > 0) {
        const ratio = progress.watchedEpisodes / progress.totalEpisodes;
        return Math.pow(ratio, 0.7);
    }
    return 0;
}

function roleWeight(order) {
    if (order === undefined || order === null) return 1;
    if (order === 0) return 1.5;
    if (order <= 3) return 1.2;
    if (order <= 10) return 1;
    return 0.6;
}

function calculateActorPopularity({ items, progressMap }) {
    const actorScores = {};
    for (const item of items) {
        const progress = progressMap[item.imdbID];
        const cast = item.meta?.cast || item.cast || [];
        if (!progress || !Array.isArray(cast)) continue;
        const minutes = progress.minutesWatched ?? 0;
        if (minutes === 0) continue;
        const completion = completionWeight(progress);
        if (completion === 0) continue;
        const time = timeWeight(minutes);
        if (time === 0) continue;
        const itemWeight = completion * time;
        for (const actor of cast) {
            const key = normalizeActor(actor.name);
            const rWeight = roleWeight(actor.order);
            actorScores[key] ??= 0;
            actorScores[key] += itemWeight * rWeight;
        }
    }
    return actorScores;
}

function normalizeActorPopularity(actorScores) {
    const total = Object.values(actorScores).reduce((sum, v) => sum + v, 0);
    if (total === 0) return {};
    const normalized = {};
    for (const [actor, score] of Object.entries(actorScores)) {
        normalized[actor] = Number(((score / total) * 100).toFixed(2));
    }
    return normalized;
}

function getActorPopularityProfile({ items, progressMap }) {
    const raw = calculateActorPopularity({ items, progressMap });
    return { raw, percent: normalizeActorPopularity(raw) };
}

function actorAffinityScore(item, favoriteActors) {
    if (!Array.isArray(item.meta?.cast)) return 0;
    return item.meta.cast.reduce((score, actor) => {
        const name = normalizeActor(actor.name);
        if (!favoriteActors.includes(name)) return score;
        if (actor.order === 0) return score + 2;
        if (actor.order <= 3) return score + 1;
        return score + 0.5;
    }, 0);
}

// --- SEARCH & CANONICALIZATION ENGINE ---
function normalizeQuery(query) {
    if (!query) return '';
    return query.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\b(the|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim();
}

function canonicalizeQuery(query) { return normalizeQuery(query).split(' ').filter(Boolean).sort().join(' '); }

function normalizeType(type) {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'tv' || t === 'series' || t === 'show') return 'series';
    if (t === 'movie' || t === 'film') return 'movie';
    if (t === 'anime') return 'anime';
    return t;
}

function normalizeYear(year) {
    if (!year) return '';
    const y = String(year).trim();
    return /^\d{4}$/.test(y) ? y : '';
}

function buildStableCacheKey({ type, query, year }) {
    const version = 'v2';
    const t = normalizeType(type);
    const q = canonicalizeQuery(query);
    const y = normalizeYear(year);
    const semanticKey = `${t}|${q}|${y}`;
    const hash = hashString(semanticKey);
    return [version, t, q, y, hash].join('|');
}

function normalizeTitle(str) { return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(); }
function tokenize(title) { return normalizeTitle(title).split(/\s+/).filter(Boolean); }

function tokenSimilarity(a, b) {
    const A = new Set(tokenize(a));
    const B = new Set(tokenize(b));
    if (A.size === 0 || B.size === 0) return 0;
    let intersection = 0;
    for (const t of A) if (B.has(t)) intersection++;
    return intersection / Math.max(A.size, B.size);
}

function extractYear(item) {
    return (
        item.Year || item.year || item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || item.premiered?.slice(0, 4) || null
    );
}

function extractPopularity(item, index) {
    if (typeof item.popularity === 'number') return item.popularity;
    if (typeof item.imdbVotes === 'string') {
        return parseInt(item.imdbVotes.replace(/,/g, ''), 10) || 0;
    }
    return Math.max(0, 100 - index);
}

function scoreCandidate({ item, query, targetYear, titleKey = 'title', index }) {
    let score = 0;
    const reasons = [];
    const queryNorm = normalizeTitle(query);
    const title = item[titleKey] || '';
    const titleNorm = normalizeTitle(title);
    const year = extractYear(item);

    if (titleNorm === queryNorm) { score += 50; reasons.push('exact-title'); }
    const similarity = tokenSimilarity(title, query);
    if (similarity > 0) {
        const fuzzyScore = Math.round(similarity * 35);
        score += fuzzyScore;
        reasons.push(`fuzzy(${fuzzyScore})`);
    }
    if (targetYear && year) {
        if (year == targetYear) { score += 25; reasons.push('exact-year'); }
        else if (Math.abs(year - targetYear) === 1) { score += 15; reasons.push('near-year'); }
    }
    const pop = extractPopularity(item, index);
    if (pop > 0) {
        const popScore = Math.min(10, Math.round(pop / 100));
        score += popScore;
        reasons.push(`popularity(${popScore})`);
    }
    if (item.source === 'tvmaze') score += 5;
    if (item.source === 'tmdb') { score += 5; reasons.push('source(tmdb)'); }
    return { item, score, reasons };
}

function selectBestCandidateEnhanced({ results, query, year = null, titleKey = 'title', debug = false }) {
    if (!Array.isArray(results) || results.length === 0) return null;
    const scored = results.map((item, index) => scoreCandidate({ item, query, targetYear: year, titleKey, index }));
    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0];
    if (debug) {
        return {
            selected: winner.item,
            score: winner.score,
            reasons: winner.reasons,
            ranking: scored.map(s => ({ title: s.item[titleKey], year: extractYear(s.item), score: s.score, reasons: s.reasons }))
        };
    }
    return winner.item;
}

// --- ASIAN REGISTRY & DETECTION ---
async function getExternalMapping(imdbID, supabase) {
    const { data } = await supabase.from('imdb_external_map').select('source, source_id').eq('imdb_id', imdbID).single();
    return data || null;
}

async function getRegistryEntry(source, sourceId, supabase) {
    const { data } = await supabase.from('asian_external_registry').select('*').eq('source', source).eq('source_id', sourceId).single();
    return data || null;
}

async function adminUpsertRegistry(entry, isAdmin, supabase) {
    if (!isAdmin) { console.warn("Registry override blocked: non-admin"); return; }
    await supabase.from('asian_external_registry').upsert({ ...entry, updated_at: new Date(), overridden_by: 'admin' });
}

async function adminPersistIMDbMapping(imdbID, source, sourceId, isAdmin, supabase) {
    if (!isAdmin) return;
    await supabase.from('imdb_external_map').upsert({ imdb_id: imdbID, source, source_id: sourceId, updated_at: new Date() });
}

async function fetchMDLDetail(id, apiKey) {
    return safeFetch(`https://${RAPID_HOST_MDL}/title/${id}`, { headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': RAPID_HOST_MDL } });
}

async function resolveMDLExternally(title, apiKey) {
    if (!apiKey) return null;
    const search = await searchMDL(title, apiKey);
    const found = search?.results?.[0];
    if (!found || found.error) return null;
    const detail = await fetchMDLDetail(found.id, apiKey);
    if (!detail || detail.error) return null;
    return { source_id: found.id, title: detail.title, rating: detail.score, votes: detail.votes, payload: detail };
}

async function resolveMALExternally(title) {
    const res = await searchJikan(title);
    if (!res || res.error) return null;
    const anime = res.data?.[0];
    if (!anime) return null;
    return { source_id: anime.mal_id, title: anime.title, rating: anime.score, votes: anime.scored_by, payload: anime };
}

async function resolveAsianRegistry({ imdbID, title, preferredSource, supabase, apiKeys, isAdmin }) {
    if (!imdbID || !title) return null;
    try {
        const mapping = await getExternalMapping(imdbID, supabase);
        if (mapping?.overridden_by === 'admin') {
            const cached = await getRegistryEntry(mapping.source, mapping.source_id, supabase);
            if (cached) return { ...cached.payload, _registry_source: 'cache' };
        }
        if (mapping && mapping.source === preferredSource) {
            const cached = await getRegistryEntry(mapping.source, mapping.source_id, supabase);
            if (cached) return { ...cached.payload, _registry_source: 'cache' };
        }
    } catch(e) {}

    let resolved = null;
    if (preferredSource === ASIAN_SOURCES.MDL) { resolved = await resolveMDLExternally(title, apiKeys.rapid); }
    if (preferredSource === ASIAN_SOURCES.MAL) { resolved = await resolveMALExternally(title); }
    if (!resolved) return null;

    try {
        if (isAdmin) {
            await adminUpsertRegistry({ source: preferredSource, source_id: resolved.source_id, payload: resolved }, isAdmin, supabase);
            await adminPersistIMDbMapping(imdbID, preferredSource, resolved.source_id, isAdmin, supabase);
        }
    } catch (e) { console.warn("Registry Persist Failed", e); }

    return { id: resolved.source_id, title: resolved.title, rating: resolved.rating, votes: resolved.votes, raw: resolved.payload, source: preferredSource, _registry_source: 'api' };
}

function normalizeOrigin(str) { return (str || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
function containsAny(haystack, needles) { return needles.some(term => haystack.includes(term)); }

function scoreAsianOrigin({ Country, Language, Genre }) {
    const country = normalizeOrigin(Country);
    const language = normalizeOrigin(Language);
    const genre = normalizeOrigin(Genre);
    const blob = `${country} ${language}`;
    let score = 0;
    const reasons = [];

    if (containsAny(country, EAST_SE_ASIA_COUNTRIES)) { score += 50; reasons.push('asian-country'); }
    if (containsAny(language, EAST_SE_ASIA_LANGUAGES)) { score += 40; reasons.push('asian-language'); }
    if (/drama|anime/.test(genre)) { score += 10; reasons.push('genre-hint'); }
    if (containsAny(country, WESTERN_COUNTRIES)) { score -= 60; reasons.push('western-country'); }
    if (containsAny(language, WESTERN_LANGUAGES)) { score -= 40; reasons.push('western-language'); }
    if (/animation/.test(genre)) {
        if (containsAny(blob, WESTERN_COUNTRIES) || containsAny(blob, WESTERN_LANGUAGES)) {
            score -= 50;
            reasons.push('western-animation-block');
        }
    }
    return { score, reasons };
}

function detectAsianOrigin(item, options = {}) {
    const { threshold = 50, debug = false } = options;
    const { score, reasons } = scoreAsianOrigin(item);
    const isAsian = score >= threshold;
    if (debug) return { isAsian, score, reasons };
    return isAsian;
}

// --- ENRICHMENT PIPELINE ---
function classifyForEnrichment(item) {
    return {
        isSeries: item.Type === 'series',
        isAnimation: /Animation/i.test(item.Genre || ''),
        isAsian: detectAsianOrigin(item)
    };
}

async function enrichAnime(item, ctx, supabase, isAdmin) {
    if (!ctx.isAnimation || item.meta?.anime) return null;
    const anime = await resolveAsianRegistry({ imdbID: item.imdbID, title: item.Title, preferredSource: ASIAN_SOURCES.MAL, supabase, apiKeys: {}, isAdmin });
    if (!anime) return null;
    return { anime: { malId: anime.id || anime.mal_id, score: anime.score, studios: anime.studios?.map(s => s.name) || [], confidence: 0.9 } };
}

async function enrichTVMaze(item, ctx) {
    if (!ctx.isSeries || item.meta?.tvmaze) return null;
    const cacheKey = `tvmaze_${item.imdbID}`;
    const cached = cacheGet(cacheKey);
    if (cached) return { ...cached, _fromCache: true };
    const show = await safeFetch(`https://api.tvmaze.com/lookup/shows?imdb=${item.imdbID}`);
    if (!show || show.error) return null;
    const [episodes, cast] = await Promise.all([
        safeFetch(`https://api.tvmaze.com/shows/${show.id}/episodes`),
        safeFetch(`https://api.tvmaze.com/shows/${show.id}/cast`)
    ]);
    const result = { tvmaze: { id: show.id, episodes: episodes.error ? [] : episodes, cast: cast.error ? [] : cast, confidence: 0.95 } };
    cacheSet(cacheKey, result);
    return { ...result, _fromCache: false };
}

async function resolveMDL(item, ctx, supabase, apiKeys, isAdmin) {
    if (!ctx.isAsian || item.meta?.asian) return null;
    const mdl = await resolveAsianRegistry({ imdbID: item.imdbID, title: item.Title, preferredSource: ASIAN_SOURCES.MDL, supabase, apiKeys, isAdmin });
    if (!mdl) return null;
    return { asian: { mdl: { id: mdl.id, title: mdl.title, rating: mdl.score || mdl.rating, votes: mdl.votes, url: `https://mydramalist.com/${mdl.id}`, confidence: 0.9 } } };
}

async function enrichTMDB(item, ctx, apiKeys) {
    if (!apiKeys.tmdb) return null;
    let tmdbId = item.tmdb?.id;
    let tmdbData = null;
    const cacheKey = `tmdb_enrich_${item.imdbID}`;
    const cached = cacheGet(cacheKey);
    if (cached) return { ...cached, _fromCache: true };

    if (!tmdbId) {
        const find = await safeFetch(`https://api.themoviedb.org/3/find/${item.imdbID}?api_key=${apiKeys.tmdb}&external_source=imdb_id`);
        if (find && !find.error) {
            tmdbData = ctx.isSeries ? find?.tv_results?.[0] : find?.movie_results?.[0];
            if (tmdbData) tmdbId = tmdbData.id;
        }
    }
    if (!tmdbId) return null;

    const [credits, details, images] = await Promise.all([
        safeFetch(`https://api.themoviedb.org/3/${ctx.isSeries ? 'tv' : 'movie'}/${tmdbId}/credits?api_key=${apiKeys.tmdb}`),
        ctx.isSeries ? safeFetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKeys.tmdb}`) : null,
        safeFetch(`https://api.themoviedb.org/3/${ctx.isSeries ? 'tv' : 'movie'}/${tmdbId}/images?api_key=${apiKeys.tmdb}`)
    ]);

    const result = {
        tmdb: {
            id: tmdbId,
            cast: credits && !credits.error ? (credits.cast || []) : [],
            director: credits && !credits.error ? (credits.crew?.filter(c => c.job === 'Director').map(d => d.name) || []) : [],
            seasons: details && !details.error ? details.seasons : null,
            credits: { images: { backdrops: images && !images.error ? (images.backdrops || []) : [] } },
            confidence: 0.95
        }
    };
    cacheSet(cacheKey, result);
    return { ...result, _fromCache: false };
}

async function enrichItem(item, apiKeys, supabase, isAdmin) {
    const ctx = classifyForEnrichment(item);
    const meta = { ...(item.meta || {}) };
    let tmdbData = { ...(item.tmdb || {}) }; 
    const provenance = [];
    let isInstant = false;

    const stages = [
        () => enrichAnime(item, ctx, supabase, isAdmin),
        () => enrichTVMaze(item, ctx),
        () => resolveMDL(item, ctx, supabase, apiKeys, isAdmin),
        () => enrichTMDB(item, ctx, apiKeys)
    ];

    const results = await Promise.allSettled(stages.map(s => s()));

    results.forEach(res => {
        if (res.status === 'fulfilled' && res.value) {
            const result = res.value;
            if (result._fromCache) isInstant = true;
            if (result.tmdb) { tmdbData = { ...tmdbData, ...result.tmdb }; delete result.tmdb; }
            Object.assign(meta, result);
            provenance.push(...Object.keys(result));
        } else if (res.status === 'rejected') {
            console.warn("Enrichment stage failed", res.reason);
        }
    });

    if (tmdbData.cast) {
        const newCast = tmdbData.cast.map(c => ({ name: c.name, character: c.character, photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null }));
        const combined = [...(meta.cast || []), ...newCast];
        const seen = new Set();
        meta.cast = combined.filter(a => {
            const k = normalizeActor(a.name);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });
    }

    return { ...item, meta, tmdb: tmdbData, enrichmentSources: provenance, enriched: true, _fromCache: isInstant };
}

// --- SEARCH API WRAPPERS & NORMALIZATION ---
async function searchTMDB(query, year, type = 'movie', apiKey) {
    if (!apiKey) return null;
    const endpoint = type === 'series' ? 'search/tv' : 'search/movie';
    let url = `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    if (year) { url += type === 'series' ? `&first_air_date_year=${year}` : `&year=${year}`; }
    return safeFetch(url);
}

async function searchTVMaze(query) {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    return safeFetch(url);
}

async function searchOMDB(query, year, type = 'movie', apiKey) {
    if (!apiKey) return null;
    let url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=${type === 'series' ? 'series' : 'movie'}`;
    if (year) url += `&y=${year}`;
    return safeFetch(url);
}

async function searchJikan(query) {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`;
    return safeFetch(url);
}

async function searchMDL(query, apiKey) {
    if (!apiKey) return null;
    return safeFetch(`https://${RAPID_HOST_MDL}/search/title?q=${encodeURIComponent(query)}`, { headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': RAPID_HOST_MDL } });
}

function normalizeCandidate(raw, source) {
    let type = 'movie'; 
    if (source === 'tvmaze' || source === 'jikan' || source === 'mdl') type = 'series';
    if (source === 'omdb' && raw.Type === 'series') type = 'series';
    if (source === 'tmdb' && (raw.media_type === 'tv' || raw.first_air_date)) type = 'series';

    return {
        source,
        title: raw.title || raw.name || raw.Title,
        year: raw.premiered?.slice(0, 4) || raw.release_date?.slice(0, 4) || raw.first_air_date?.slice(0, 4) || raw.Year || null,
        imdbID: raw.externals?.imdb || raw.imdbID || null,
        tmdbID: source === 'tmdb' ? raw.id : null,
        plot: raw.summary?.replace(/<[^>]+>/g, '') || raw.overview || raw.Plot || null,
        poster: raw.image?.original || (raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : raw.Poster) || null,
        type: type,
        popularity: raw.popularity,
        imdbVotes: raw.imdbVotes,
        raw,
        _sourceMeta: { source, fetchedAt: Date.now() }
    };
}

function reconcile(candidates) {
    const clusters = [];
    const processed = new Set();
    const imdbMap = {};
    candidates.forEach((c, idx) => {
        if (c.imdbID) {
            if (!imdbMap[c.imdbID]) imdbMap[c.imdbID] = [];
            imdbMap[c.imdbID].push(c);
            processed.add(idx);
        }
    });
    Object.values(imdbMap).forEach(cluster => clusters.push(cluster));
    candidates.forEach((c, idx) => {
        if (!processed.has(idx)) clusters.push([c]);
    });
    return clusters;
}

function mergeBest(cluster) {
    cluster.sort((a, b) => b.score - a.score);
    const pick = field => cluster.find(c => c[field])?.[field] || null;
    const primary = cluster[0];
    return {
        Title: pick('title'),
        Year: pick('year'),
        imdbID: pick('imdbID'),
        Type: primary.type,
        Plot: pick('plot'),
        Poster: pick('poster'),
        tmdb: primary.tmdbID ? { id: primary.tmdbID } : null,
        sourcesUsed: cluster.map(c => c.source),
        confidence: primary.score,
        _searchDebug: { score: primary.score, reasons: primary.reasons || [] }
    };
}

async function smartSearch(query, apiKeys, type = 'all', year = null) {
    const q = query.trim();
    const wrappedPromises = [];
    if (type === 'all' || type === 'movie') wrappedPromises.push(searchTMDB(q, year, 'movie', apiKeys.tmdb).then(v => ({v, s: 'tmdb'})));
    if (type === 'all' || type === 'series') wrappedPromises.push(searchTMDB(q, year, 'series', apiKeys.tmdb).then(v => ({v, s: 'tmdb'})));
    if (type === 'all' || type === 'series') wrappedPromises.push(searchTVMaze(q).then(v => ({v, s: 'tvmaze'})));
    if (type === 'all' || type === 'movie') wrappedPromises.push(searchOMDB(q, year, 'movie', apiKeys.omdb).then(v => ({v, s: 'omdb'})));
    if (type === 'all' || type === 'series') wrappedPromises.push(searchOMDB(q, year, 'series', apiKeys.omdb).then(v => ({v, s: 'omdb'})));
    if (type === 'all' || type === 'series') wrappedPromises.push(searchJikan(q).then(v => ({v, s: 'jikan'})));
    if (type === 'all' || type === 'series') wrappedPromises.push(searchMDL(q, apiKeys.rapid).then(v => ({v, s: 'mdl'})));

    const wrappedResults = await Promise.allSettled(wrappedPromises);
    const rawCandidates = [];
    
    wrappedResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.v && !res.value.v.error) {
            const val = res.value.v;
            let list = [];
            if (res.value.s === 'tmdb') list = val.results || [];
            else if (res.value.s === 'tvmaze') list = val.map(v => v.show) || [];
            else if (res.value.s === 'omdb') list = val.Search || [];
            else if (res.value.s === 'jikan') list = val.data || [];
            else if (res.value.s === 'mdl') list = val.results || [];
            list.forEach(item => rawCandidates.push(normalizeCandidate(item, res.value.s)));
        }
    });

    if (rawCandidates.length === 0) return [];
    rawCandidates.forEach((c, index) => {
        const result = scoreCandidate({ item: c, query: q, targetYear: year, titleKey: 'title', index: index });
        c.score = result.score;
        c.reasons = result.reasons;
    });

    const clusters = reconcile(rawCandidates);
    const mergedResults = clusters.map(cluster => mergeBest(cluster));
    return mergedResults.sort((a, b) => b.confidence - a.confidence);
}