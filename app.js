const { useState, useMemo, useEffect, useCallback, useRef } = React;

// ==========================================
// SECTION 5: UI PRIMITIVES & COMPONENTS
// ==========================================

const VaultLogo = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
       <g transform="translate(6, 0)"> 
            <rect x="0" y="35" width="8" height="30" rx="1" fill="currentColor" />
            <rect x="8" y="40" width="6" height="6" fill="currentColor" />
            <rect x="8" y="54" width="6" height="6" fill="currentColor" />
            <circle cx="55" cy="50" r="37" stroke="currentColor" strokeWidth="5" />
            <circle cx="55" cy="50" r="30" stroke="currentColor" strokeWidth="3" strokeDasharray="0.1 15.6" strokeLinecap="round" opacity="0.8" />
            <circle cx="55" cy="50" r="22" stroke="currentColor" strokeWidth="3" />
            <g transform="translate(55, 50)">
                {[0, 60, 120, 180, 240, 300].map(deg => (
                    <line key={deg} x1="0" y1="-10" x2="0" y2="-22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform={`rotate(${deg})`} />
                ))}
            </g>
            <circle cx="55" cy="50" r="10" fill="currentColor" />
            <ellipse cx="55" cy="50" rx="3.5" ry="6.5" className="fill-white dark:fill-vault-950" />
       </g>
    </svg>
);

const Icon = ({ name, size = 20, className = "" }) => {
    const icons = {
        search: <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />,
        star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
        play: <path d="M5 3l14 9-14 9V3z" />,
        clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
        grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
        list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>,
        close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
        inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
        refresh: <><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>,
        trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
        check: <polyline points="20 6 9 17 4 12" />,
        external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
        globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
        trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
        filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
        database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
        youtube: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></>,
        'alert-circle': <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name]}
        </svg>
    );
};

const GlassButton = ({ children, onClick, active, className = "", icon }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm
            ${active 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'}
            ${className}
        `}
    >
        {icon && <Icon name={icon} size={16} />}
        {children}
    </button>
);

const Badge = ({ children, color = "indigo" }) => {
    const colors = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        gold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
            {children}
        </span>
    );
};

const MediaCardPoster = ({ item, isSeries, rating, onPlayTrailer, isAdmin, onAdminEdit, resumeTarget, onResume }) => (
    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-indigo-500/20 group-hover:ring-2 group-hover:ring-indigo-500/50">
        <img 
            src={getHighResPoster(item.Poster, 400)} 
            alt={item.Title}
            className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
            loading="lazy"
        />
        <MediaCardBadges item={item} />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Icon name="star" size={12} className="text-amber-400 fill-amber-400" />
                {rating || 'N/A'}
            </div>
        </div>
        <MediaCardHoverActions 
            item={item} 
            isSeries={isSeries} 
            onPlayTrailer={onPlayTrailer} 
            isAdmin={isAdmin} 
            onAdminEdit={onAdminEdit}
            resumeTarget={resumeTarget}
            onResume={onResume}
        />
    </div>
);

const MediaCardBadges = ({ item }) => (
    <div className="absolute top-3 left-3 flex flex-col gap-2">
        {item.userMeta?.status === 'watched' && (
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                <Icon name="check" size={14} />
            </div>
        )}
        {item._fromCache && (
            <div className="bg-emerald-500/90 text-white p-1.5 rounded-lg shadow-lg" title="Loaded Instantly">
                <span className="text-[10px] font-bold uppercase tracking-wider">⚡</span>
            </div>
        )}
        
        {item._searchDebug && (
            <div className="bg-black/70 backdrop-blur-md text-[10px] text-slate-300 px-2 py-1 rounded-lg">
                Score: {item._searchDebug.score}
            </div>
        )}
    </div>
);

const MediaCardHoverActions = ({ item, isSeries, onPlayTrailer, isAdmin, onAdminEdit, resumeTarget, onResume }) => {
    const handleTrailer = useCallback((e) => {
        e.stopPropagation();
        onPlayTrailer(item);
    }, [item, onPlayTrailer]);

    const handleAdmin = useCallback((e) => {
        e.stopPropagation();
        onAdminEdit(item);
    }, [item, onAdminEdit]);

    return (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                <button 
                    onClick={handleTrailer}
                    className="bg-indigo-600/90 backdrop-blur-md p-4 rounded-full text-white shadow-xl hover:bg-indigo-500 hover:scale-110 transition-all"
                    title="Watch Trailer"
                >
                    <Icon name="play" size={28} className="ml-1" />
                </button>
            </div>
            
            {isAdmin && (
                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                    <button onClick={handleAdmin} className="p-2 bg-indigo-500/20 rounded-lg hover:bg-indigo-500 text-white">
                        <Icon name="settings" size={14} />
                    </button>
                </div>
            )}
            
            {resumeTarget && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onResume(item, resumeTarget);
                    }}
                    className="mt-3 w-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg backdrop-blur-md transition"
                >
                    ▶ Resume S{resumeTarget.season}E{resumeTarget.episode}
                    {resumeTarget.resumeFrom > 0 && (
                        <span className="ml-2 opacity-80">
                            {Math.round(resumeTarget.resumeFrom * 100)}%
                        </span>
                    )}
                </button>
            )}

            <p className="text-white text-xs font-medium line-clamp-2 mb-1">{item.Genre}</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">{item.Year} • {isSeries ? 'Series' : 'Movie'}</p>
        </div>
    );
};

const MediaCardInfo = ({ item, isSeries, confidence }) => (
    <div className="px-1">
        <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {item.Title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
            {item.meta?.asian && <Badge color="green">Asian</Badge>}
            {item.meta?.asian?.mdl && <Badge color="green">MDL {item.meta.asian.mdl.rating}</Badge>}
            {item.meta?.anime?.score && <Badge color="indigo">MAL {item.meta.anime.score}</Badge>}
            {isSeries && <Badge color="slate">{item.meta?.series?.seasons?.length || item.totalSeasons || '?'} Seasons</Badge>}
            {confidence && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {confidence} confidence
                </span>
            )}
        </div>
    </div>
);

const MediaCard = ({ item, onClick, isAdmin, onAction, onPlayTrailer, onAdminEdit, onResume }) => {
    const isSeries = item.Type === 'series';

    const weightedRatingData = useMemo(() => {
        const ratings = extractUserRatings(item);
        if (ratings.length === 0) return null;
        return calculateWeightedRating(ratings, { minMinutes: 20, maxMinutesCap: 600 });
    }, [item]);

    const displayRating = weightedRatingData?.weightedRating ?? item.userMeta?.ratings?.overall ?? item.imdbRating ?? 'N/A';
    const ratingConfidenceLabel = useMemo(() => {
        if (!weightedRatingData) return null;
        const minutes = Math.max(...weightedRatingData.breakdown.map(b => b.minutesWatched));
        const confidence = ratingConfidence(minutes);
        if (confidence > 0.75) return 'High';
        if (confidence > 0.4) return 'Medium';
        return 'Low';
    }, [weightedRatingData]);

    const resumeTarget = useMemo(() => {
        if (item.Type !== 'series' || !item.meta?.tvmaze?.episodes || !item.userMeta?.watchHistory) return null;
        return getResumeTarget({ episodes: item.meta.tvmaze.episodes, watchHistory: item.userMeta.watchHistory });
    }, [item]);

    return (
        <div onClick={onClick} className="group relative flex flex-col gap-3 animate-reveal">
            <MediaCardPoster item={item} isSeries={isSeries} rating={displayRating} onPlayTrailer={onPlayTrailer} isAdmin={isAdmin} onAdminEdit={onAdminEdit} resumeTarget={resumeTarget} onResume={onResume} />
            <MediaCardInfo item={item} isSeries={isSeries} confidence={ratingConfidenceLabel} />
        </div>
    );
};

const ContentRail = ({ title, items, onCardClick, icon, emptyMessage }) => {
    if (!items || items.length === 0) return null;
    return (
        <section className="mb-10 animate-reveal">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                {icon && <Icon name={icon} className="text-emerald-400" />}
                {title}
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {items.map(item => (
                    <MediaCard key={item.imdbID || item.id} item={item} isAdmin={false} onClick={() => onCardClick(item)} onPlayTrailer={() => {}} onAdminEdit={() => {}} onResume={() => {}} />
                ))}
            </div>
        </section>
    );
};

function useCacheStats() {
    const [stats, setStats] = useState(null);
    useEffect(() => { setStats(getCacheStats()); }, []);
    return stats;
}

const CacheHealthPanel = () => {
    const stats = useCacheStats();
    if (!stats) return null;
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <h3 className="text-sm font-bold text-white mb-3">Cache Health</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-lg font-black text-white">{stats.totalEntries}</p><p className="text-xs text-slate-400">Entries</p></div>
                <div><p className="text-lg font-black text-amber-400">{stats.expiredEntries}</p><p className="text-xs text-slate-400">Expired</p></div>
                <div><p className="text-lg font-black text-white">{stats.maxEntries}</p><p className="text-xs text-slate-400">Max</p></div>
            </div>
        </div>
    );
};

const SeasonHeatmap = ({ seasons, onSeasonClick }) => {
    if (!seasons.length) return null;
    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-300 mb-3 tracking-wide">Season Progress</h3>
            <div className="space-y-3">
                {seasons.map(s => {
                    const bingeLevel = s.completionPercent === 100 ? 'complete' : s.completionPercent >= 70 ? 'high' : s.completionPercent >= 30 ? 'medium' : 'low';
                    return (
                        <div key={s.season} onClick={() => onSeasonClick?.(s.season)} className="cursor-pointer group">
                            <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="font-semibold text-slate-300">Season {s.season}</span>
                                <span className="text-slate-400">{s.watched}/{s.total}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div className={`h-full transition-all duration-700 ${bingeLevel === 'complete' && 'bg-emerald-500'} ${bingeLevel === 'high' && 'bg-indigo-500'} ${bingeLevel === 'medium' && 'bg-amber-500'} ${bingeLevel === 'low' && 'bg-slate-500'}`} style={{ width: `${s.completionPercent}%` }} />
                            </div>
                            {s.partial > 0 && <p className="text-[10px] text-amber-400 mt-1">{s.partial} episode{ s.partial > 1 ? 's' : '' } in progress</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GenreTasteProfile = ({ profile }) => {
    if (!profile?.percent) return null;
    const entries = Object.entries(profile.percent).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Your Taste Profile</h3>
            <div className="space-y-3">
                {entries.map(([genre, pct]) => (
                    <div key={genre}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize font-bold text-slate-400">{genre}</span>
                            <span className="text-indigo-400 font-mono">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FavoriteActors = ({ profile }) => {
    if (!profile?.percent) return null;
    const actors = Object.entries(profile.percent).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return (
        <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Actors You Finish Watching</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {actors.map(([actor, pct]) => (
                    <div key={actor} className="min-w-[120px] p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        <p className="text-sm font-semibold text-white line-clamp-2">{actor}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{pct}% affinity</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileStat = ({ label, value }) => (
    <div className="glass rounded-xl p-4 text-center">
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs uppercase tracking-wider text-slate-400">
            {label}
        </div>
    </div>
);

const ProfileSection = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="text-lg font-black text-white mb-4">{title}</h2>
        <div className="glass rounded-xl p-6">{children}</div>
    </section>
);

const GenreBars = ({ data }) => {
    const entries = Object.entries(data).slice(0, 10);
    return (
        <div className="space-y-3">
            {entries.map(([genre, value]) => (
                <div key={genre}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="capitalize">{genre}</span>
                        <span>{value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${value}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ActorList = ({ data }) => {
    const entries = Object.entries(data).slice(0, 10);
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {entries.map(([actor, val]) => (
                <div key={actor} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-300 font-medium truncate pr-2">{actor}</span>
                    <span className="text-indigo-400 font-bold">{val}%</span>
                </div>
            ))}
        </div>
    );
};

const ProfileView = ({ user, libraryItems, onBack }) => {
    const isAdmin = isAdminUser(user);
    const progressMap = useMemo(() => buildProgressMap(libraryItems), [libraryItems]);
    const genreProfile = useMemo(() => {
        const items = extractGenreItems(libraryItems);
        return getGenreProfile(items, { useRecency: true });
    }, [libraryItems]);
    const actorProfile = useMemo(() => getActorPopularityProfile({ items: libraryItems, progressMap }), [libraryItems]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-reveal">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-2">
                    <Icon name="close" size={16} /> Close Profile
                </button>
            </div>
            <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-600/30">
                    {user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">{user.user_metadata?.name || 'Vault User'}</h1>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    {isAdmin && <div className="mt-2"><Badge color="gold">Admin</Badge></div>}
                </div>
            </div>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <ProfileStat label="Titles Watched" value={libraryItems.length} />
                <ProfileStat label="Genres Tracked" value={Object.keys(genreProfile.percent).length} />
                <ProfileStat label="Actors Tracked" value={Object.keys(actorProfile.percent).length} />
                <ProfileStat label="Admin Access" value={isAdmin ? 'Yes' : 'No'} />
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProfileSection title="Genre Affinity"><GenreBars data={genreProfile.percent} /></ProfileSection>
                <ProfileSection title="Actor Affinity"><ActorList data={actorProfile.percent} /></ProfileSection>
            </div>
        </div>
    );
};

const AdminSuggestionsModal = ({ isOpen, onClose, suggestions = [], onApprove, onReject }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl glass rounded-3xl p-8 animate-reveal max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white">Admin Dashboard</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><Icon name="close" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No pending suggestions</div>
                    ) : (
                        suggestions.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div><p className="font-bold text-white">{item.title}</p><p className="text-xs text-slate-400 uppercase">{item.type} • {item.user_email}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => onApprove(item)} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Icon name="check" size={18} /></button>
                                    <button onClick={() => onReject(item)} className="p-2 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Icon name="trash" size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ item, onClose, onUpdateStatus, onRemove, isAdmin, watchHistory, topActors }) => {
    if (!item) return null;

    const [activeTab, setActiveTab] = useState('overview');
    const backdrop = tmdbImg(item.tmdb?.credits?.images?.backdrops?.[0]?.file_path, "original") || getHighResPoster(item.Poster, 1000);

    const weightedRatingData = useMemo(() => {
        const ratings = extractUserRatings(item);
        if (ratings.length === 0) return null;
        return calculateWeightedRating(ratings, { minMinutes: 20, maxMinutesCap: 600 });
    }, [item]);

    const displayRating = weightedRatingData?.weightedRating ?? item.userMeta?.ratings?.overall ?? item.imdbRating ?? 'N/A';
    const episodeProgress = useMemo(() => {
        const episodes = item.meta?.tvmaze?.episodes || item.meta?.series?.episodes || [];
        return calculateEpisodeProgress({ episodes, watchHistory });
    }, [item, watchHistory]);

    const seasonProgress = useMemo(() => {
        if (!item.meta?.tvmaze?.episodes || !item.userMeta?.watchHistory) return [];
        return calculateSeasonProgress({ episodes: item.meta.tvmaze.episodes, watchHistory: item.userMeta.watchHistory });
    }, [item]);

    const gapNudge = useMemo(() => {
        if (!episodeProgress || !episodeProgress.hasGaps) return null;
        if (episodeProgress.isCompleted) return null;
        if (episodeProgress.watchedEpisodes < 3) return null;
        const gaps = detectSeasonGaps({ episodes: item.meta?.tvmaze?.episodes || item.meta?.series?.episodes || [], watchHistory: watchHistory });
        if (gaps.length === 0) return null;
        const s = gaps[0];
        return { season: s.season, skipped: s.skipped, watched: s.watched };
    }, [episodeProgress, item, watchHistory]);

    const handleCatchUp = () => {
        const episodes = item.meta?.tvmaze?.episodes || item.meta?.series?.episodes || [];
        const catchUpTarget = episodes.find(ep => {
            const state = resolveEpisodeState(ep.id, watchHistory);
            return state.state === 'unwatched';
        });
        if (catchUpTarget) {
            alert(`Playing Catch Up: ${item.Title} S${catchUpTarget.season}E${catchUpTarget.episode}`);
        }
    };

    const scrollToSeason = (seasonNum) => {
        const el = document.getElementById(`season-${seasonNum}`);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.open = true; }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>
            <div className="relative w-full max-w-6xl max-h-full glass rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl border-white/10 animate-reveal">
                <div className="relative w-full lg:w-[400px] h-64 lg:h-auto shrink-0 overflow-hidden">
                    <img src={getHighResPoster(item.Poster, 800)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-vault-950"></div>
                    <button onClick={onClose} className="lg:hidden absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white"><Icon name="close" /></button>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden bg-vault-950">
                    <div className="p-8 pb-4 flex justify-between items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <Badge color="gold">{item.Rated}</Badge>
                                <Badge color="slate">{item.Runtime}</Badge>
                                <span className="text-slate-400 text-sm font-medium">{item.Year}</span>
                                {item._fromCache && <Badge color="green">⚡ Instant</Badge>}
                                {isAdmin && item._registry_source === 'cache' && <Badge color="slate">Registry: Cached</Badge>}
                                {isAdmin && item._registry_source === 'api' && <Badge color="green">Registry: Fresh</Badge>}
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">{item.Title}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="text-2xl font-black text-white">{displayRating}</div>
                                {weightedRatingData && (
                                    <div className="text-xs text-slate-400">Based on {weightedRatingData.contributingItems} viewing session{weightedRatingData.contributingItems > 1 ? 's' : ''}</div>
                                )}
                            </div>
                            {topActors && topActors.some(a => item.meta?.cast?.some(c => normalizeActor(c.name) === a)) && (
                                <div className="mt-3"><Badge color="gold">Features one of your favorite actors</Badge></div>
                            )}
                            <p className="text-indigo-400 font-bold mt-2 text-sm uppercase tracking-widest">{item.Genre}</p>
                            {item.meta?.asian?.mdl && (
                                <a href={item.meta.asian.mdl.url} target="_blank" rel="noreferrer" className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-bold hover:underline">View on MyDramaList <Icon name="external" size={12} /></a>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button onClick={onClose} className="hidden lg:flex bg-white/5 hover:bg-white/10 p-3 rounded-full text-white transition-all"><Icon name="close" /></button>
                            {isAdmin && (
                                <button onClick={() => alert("Admin Override: Feature Placeholder. This would open the Mapping Editor.")} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs text-indigo-300 font-bold transition-all">Fix External Mapping</button>
                            )}
                        </div>
                    </div>
                    {gapNudge && (
                        <div className="mx-8 mb-6 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3 animate-reveal">
                            <Icon name="alert-circle" size={20} className="mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">You skipped {gapNudge.skipped} episode{gapNudge.skipped > 1 ? 's' : ''} in Season {gapNudge.season}</p>
                                <p className="text-xs opacity-80 mt-1">Want to catch up before moving ahead?</p>
                            </div>
                            <button onClick={() => { setActiveTab('seasons'); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition">View episodes</button>
                        </div>
                    )}
                    <div className="px-8 flex gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
                        {['overview', 'details', 'cast', 'seasons'].map(tab => (
                            (tab !== 'seasons' || item.Type === 'series') && (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                            )
                        ))}
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-reveal">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Synopsis</h3>
                                            <p className="text-slate-300 text-lg leading-relaxed">{item.Plot}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass p-4 rounded-2xl"><p className="text-[10px] text-slate-500 uppercase font-black mb-1">Director</p><p className="text-white font-bold">{item.Director}</p></div>
                                            <div className="glass p-4 rounded-2xl"><p className="text-[10px] text-slate-500 uppercase font-black mb-1">Writer</p><p className="text-white font-bold line-clamp-1">{item.Writer}</p></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Ratings</h3>
                                        <div className="space-y-2">
                                            {Object.entries(item.meta?.ratingsExternal || {}).map(([key, val]) => val && (
                                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{key}</span>
                                                    <span className="text-sm font-black text-white">{typeof val === 'object' ? val.rating : val}</span>
                                                </div>
                                            ))}
                                            {item.meta?.asian?.mdl && (
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                                                    <span className="text-xs font-bold text-teal-400 uppercase">MyDramaList</span>
                                                    <span className="text-sm font-black text-teal-400">{item.meta.asian.mdl.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        {weightedRatingData && (
                                            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Session Breakdown</h4>
                                                <ul className="space-y-1 text-xs text-slate-300">
                                                    {weightedRatingData.breakdown.map((b, idx) => (
                                                        <li key={idx}>⭐ {b.rating} — {b.minutesWatched} min (×{b.confidence})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-reveal">
                                {[
                                    { label: 'Language', value: item.Language },
                                    { label: 'Country', value: item.Country },
                                    { label: 'Released', value: item.Released },
                                    { label: 'Box Office', value: item.BoxOffice },
                                    { label: 'Production', value: item.Production },
                                    { label: 'Awards', value: item.Awards },
                                    { label: 'IMDb ID', value: item.imdbID },
                                    { label: 'Status', value: item.userMeta?.status },
                                ].map(stat => (
                                    <div key={stat.label} className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{stat.label}</p>
                                        <p className="text-white font-bold text-sm">{stat.value || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'cast' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-reveal">
                                {item.meta?.cast?.map(person => (
                                    <div key={person.name} className="flex flex-col items-center text-center gap-3 group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all duration-300">
                                            <img src={person.photo || `https://ui-avatars.com/api/?name=${person.name}&background=1c2230&color=fff`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold line-clamp-1">{person.name}</p>
                                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{person.character}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'seasons' && item.meta?.series?.seasons && (
                            <div className="space-y-4 animate-reveal">
                                <SeasonHeatmap seasons={seasonProgress} onSeasonClick={(season) => { scrollToSeason(season); }} />
                                {item.meta.series.seasons.map(season => (
                                    <details key={season.season} id={`season-${season.season}`} className="group glass rounded-2xl overflow-hidden transition-all duration-300">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 list-none">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">S{season.season}</div>
                                                <div>
                                                    <h4 className="text-white font-bold">Season {season.season}</h4>
                                                    <p className="text-slate-500 text-xs font-medium">{season.episodes?.length || 0} Episodes • {season.airDate}</p>
                                                </div>
                                            </div>
                                            <Icon name="play" size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-6 pb-6 pt-2 divide-y divide-white/5">
                                            {season.episodes?.map(ep => (
                                                <div key={ep.episode} className="py-4 flex items-center justify-between group/ep">
                                                    <div className="flex gap-4">
                                                        <span className="text-indigo-400 font-mono text-sm">E{ep.episode}</span>
                                                        <div>
                                                            <p className="text-white text-sm font-bold group-hover/ep:text-indigo-400 transition-colors">{ep.title}</p>
                                                            <p className="text-slate-500 text-[10px] font-medium mt-0.5">{ep.airDate}</p>
                                                        </div>
                                                    </div>
                                                    {ep.watched && <Badge color="green">Watched</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-8 pt-4 border-t border-white/5 flex gap-4 bg-vault-950/80 backdrop-blur-md">
                        <button onClick={() => onUpdateStatus('watched')} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${item.userMeta?.status === 'watched' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'}`}><Icon name="check" size={18} />Watched</button>
                        <button onClick={() => onUpdateStatus('watchlist')} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${item.userMeta?.status === 'watchlist' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'}`}><Icon name="clock" size={18} />Watchlist</button>
                        <button onClick={() => onRemove(item.imdbID)} className="px-6 py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center" title="Remove from Library"><Icon name="trash" size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchOverlay = ({ isOpen, onClose, query, setQuery, results, onResultClick, isLoading, searchType, setSearchType }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] bg-vault-950/95 backdrop-blur-xl animate-fade-in p-4 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto flex flex-col h-full">
                <div className="flex flex-col gap-4 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="flex-1 relative group">
                            <Icon name="search" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={24} />
                            <input autoFocus type="text" placeholder="Search Movies, Shows, Anime, or Dramas..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 focus:border-indigo-500 rounded-3xl py-6 pl-16 pr-8 text-2xl font-bold text-white outline-none transition-all placeholder:text-slate-600" />
                            {isLoading && <Icon name="refresh" className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={24} />}
                        </div>
                        <button onClick={onClose} className="p-4 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all"><Icon name="close" size={32} /></button>
                    </div>
                    <div className="flex gap-3 justify-center">
                        {['all', 'movie', 'series'].map(t => (
                            <button key={t} onClick={() => setSearchType(t)} className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${searchType === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{t === 'all' ? 'All Sources' : t + 's'}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((item, idx) => (
                        <div key={`${item.imdbID || item.id}-${item._sourceMeta?.source || 'unknown'}-${idx}`} onClick={() => onResultClick(item)} className="group p-4 rounded-[2rem] bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer flex gap-6 relative overflow-hidden">
                            <div className="w-24 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-lg relative">
                                <img src={getHighResPoster(item.Poster, 200)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {item.confidence > 50 && <div className="absolute top-1 right-1 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">{Math.round(item.confidence)}% Match</div>}
                            </div>
                            <div className="flex-1 py-2 flex flex-col justify-center relative z-10">
                                <div className="flex items-start justify-between"><h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">{item.Title}</h4></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">{item.Year} • {item.Type}</p>
                                {item._searchDebug && (
                                    <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">{item._searchDebug.reasons.slice(0, 3).map(r => (<div key={r}>• {humanizeReason(r)}</div>))}</div>
                                )}
                                <div className="mt-3 flex flex-wrap gap-2">{item.sourcesUsed?.slice(0, 3).map(s => (<span key={s} className="px-2 py-0.5 rounded bg-white/5 text-[9px] uppercase font-bold text-slate-400">{s}</span>))}</div>
                                <div className="mt-3 flex gap-2">{item.inVault && <Badge color="green">In Vault</Badge>}</div>
                            </div>
                        </div>
                    ))}
                    {query.length > 2 && results.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center">
                            <h3 className="text-2xl font-black text-slate-700">No matches found</h3>
                            <p className="text-slate-500 mt-2 font-medium">We checked TMDB, OMDb, TVMaze, Jikan & MDL.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// SECTION 6: MAIN APPLICATION COMPONENT
// ==========================================

function App() {
    const [session, setSession] = useState(null);
    const [vault, setVault] = useState({ watched: {}, watchlist: {} });
    const [apiKeys, setApiKeys] = useState(DEFAULT_KEYS);
    const [viewMode, setViewMode] = useState('grid');
    const [currentView, setCurrentView] = useState(VIEWS.LIBRARY);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const initAdmin = async () => {
            const { data } = await supabase.auth.getUser();
            setIsAdmin(isAdminUser(data?.user));
        };
        initAdmin();
    }, []);

    const handleResume = (item, resume) => {
        const intent = { imdbID: item.imdbID, episodeId: resume.episodeId, season: resume.season, episode: resume.episode, resumeFrom: resume.resumeFrom };
        console.log("Resume Intent:", intent);
        alert(`Resuming ${item.Title} S${resume.season}E${resume.episode} at ${Math.round(resume.resumeFrom * 100)}%`);
    };

    const allVaultItems = useMemo(() => [...Object.values(vault.watched), ...Object.values(vault.watchlist)], [vault]);

    const continueWatching = useMemo(() => {
        return allVaultItems.map(item => {
            if (item.Type !== 'series' || !item.meta?.tvmaze?.episodes || !item.userMeta?.watchHistory) return null;
            const resume = getResumeTarget({ episodes: item.meta.tvmaze.episodes, watchHistory: item.userMeta.watchHistory });
            if (!resume) return null;
            return { item, resume };
        }).filter(Boolean);
    }, [allVaultItems]);

    const genreInputs = useMemo(() => {
        return allVaultItems.map(item => {
            let minutes = 0;
            if (item.Type === 'movie') {
                 const runtime = parseInt(item.Runtime) || 0;
                 if (item.userMeta?.status === 'watched') minutes = runtime || 100;
            } else if (item.Type === 'series') {
                 const progress = calculateEpisodeProgress({ episodes: item.meta?.tvmaze?.episodes || [], watchHistory: item.userMeta?.watchHistory });
                 minutes = (progress?.watchedEpisodes || 0) * 45; 
            }
            return { ...item, minutesWatched: minutes };
        });
    }, [allVaultItems]);

    const genreProfile = useMemo(() => {
        const genreItems = extractGenreItems(genreInputs);
        if (genreItems.length === 0) return null;
        return getGenreProfile(genreItems, { useRecency: true, recencyHalfLifeDays: 180 });
    }, [genreInputs]);

    const actorProfile = useMemo(() => {
        const actorItems = extractActorItems(genreInputs); 
        if (actorItems.length === 0) return null;
        const progressMap = buildProgressMap(actorItems);
        return getActorPopularityProfile({ items: actorItems, progressMap });
    }, [genreInputs]);

    const asianContent = useMemo(() => { return allVaultItems.filter(i => i.meta?.asian); }, [allVaultItems]);
    const asianDrama = useMemo(() => { return asianContent.filter(i => /drama/i.test(i.Genre || '')); }, [asianContent]);
    const anime = useMemo(() => { return allVaultItems.filter(i => i.meta?.anime); }, [allVaultItems]);

    const topActors = useMemo(() => {
        if (!actorProfile?.percent) return [];
        return Object.entries(actorProfile.percent).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([actor]) => actor);
    }, [actorProfile]);

    const actorDrivenRecs = useMemo(() => {
        return allVaultItems
            .filter(i => i.userMeta?.status !== 'watched')
            .map(i => ({ item: i, score: actorAffinityScore(i, topActors) }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(r => r.item);
    }, [allVaultItems, topActors]);

    const topGenres = useMemo(() => {
        if (!genreProfile?.percent) return [];
        return Object.entries(genreProfile.percent).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
    }, [genreProfile]);

    const recommended = useMemo(() => {
        if (!topGenres.length) return [];
        return allVaultItems
            .filter(i => i.userMeta?.status !== 'watched')
            .map(i => {
                let score = genreAffinityScore(i, topGenres);
                if (i.meta?.asian?.mdl?.rating >= 8.5) { score += 1.5; }
                return { item: i, score };
            })
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(r => r.item)
            .slice(0, 5);
    }, [allVaultItems, topGenres]);

    const exploreOutside = useMemo(() => {
        if (!topGenres.length) return [];
        return allVaultItems
            .filter(i => {
                const itemGenres = extractGenres(i.Genre);
                return !itemGenres.some(g => topGenres.includes(g));
            })
            .slice(0, 5);
    }, [allVaultItems, topGenres]);

    const approveSuggestion = async (item) => {
        if (!isAdmin) return;
        await supabase.from('content_suggestions').update({ status: 'approved', updated_at: new Date() }).eq('id', item.id);
    };

    const rejectSuggestion = async (item) => {
        if (!isAdmin) return;
        await supabase.from('content_suggestions').update({ status: 'rejected', updated_at: new Date() }).eq('id', item.id);
    };

    function adminClearCache() {
        if (!isAdmin) return;
        clearAllCache();
        console.info("Admin cache cleared");
    }

    function adminDebugSnapshot() {
        if (!isAdmin) return;
        console.table({ user: 'admin', cacheEntries: getCacheStats?.()?.totalEntries, time: new Date().toISOString() });
    }

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchType, setSearchType] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all'); 

    const [selectedItem, setSelectedItem] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAdminSuggestionsOpen, setIsAdminSuggestionsOpen] = useState(false);
    const [adminSuggestions, setAdminSuggestions] = useState([]); 

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshProgress, setRefreshProgress] = useState(0);
    
    const fetchOmdb = async (imdbID) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKeys.omdb}&i=${imdbID}&plot=full`);
        return await res.json();
    };

    const fetchSearch = async (query) => {
        if (!query || query.length < 3) return;
        setIsSearchLoading(true);
        try {
            const results = await smartSearch(query, apiKeys, searchType);
            setSearchResults(results.map(item => ({
                ...item,
                inVault: !!(vault.watched[item.imdbID] || vault.watchlist[item.imdbID])
            })));
        } catch (e) { console.error(e); }
        setIsSearchLoading(false);
    };

    const fetchTrailer = async (item) => {
        let tmdbId = item.tmdb?.id;
        const type = item.Type === 'series' ? 'tv' : 'movie';
        
        if (!tmdbId) {
           try {
               const findRes = await fetch(`https://api.themoviedb.org/3/find/${item.imdbID}?api_key=${apiKeys.tmdb}&external_source=imdb_id`);
               const findData = await findRes.json();
               const media = item.Type === 'movie' ? findData.movie_results?.[0] : findData.tv_results?.[0];
               if(media) tmdbId = media.id;
           } catch(e) {}
        }

        if (!tmdbId) {
            alert("Could not find trailer for this title.");
            return null;
        }

        try {
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/videos?api_key=${apiKeys.tmdb}`);
            const data = await res.json();
            const trailer = data.results?.find(v => v.type === "Trailer" && v.site === "YouTube") 
                         || data.results?.find(v => v.type === "Teaser" && v.site === "YouTube")
                         || data.results?.find(v => v.site === "YouTube");
            
            if (!trailer) {
                alert("No YouTube trailer available.");
                return null;
            }
            return trailer.key;
        } catch(e) { 
            alert("Error fetching trailer.");
            return null; 
        }
    }

    const handlePlayTrailer = async (item) => {
        const videoId = await fetchTrailer(item);
        if (videoId) {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        }
    };

    const updateVaultItem = (id, updatedItem) => {
        setVault(prev => {
            const status = updatedItem.userMeta?.status || 'watchlist';
            const newVault = { ...prev };
            delete newVault.watched[id];
            delete newVault.watchlist[id];
            newVault[status][id] = updatedItem;
            return newVault;
        });
    };

    const enrich = async (item) => {
        if (item.enriched && item.enrichmentSources?.length > 0) return item;
        const enrichedItem = await enrichItem(item, apiKeys, supabase, isAdmin);
        if (enrichedItem) {
            updateVaultItem(item.imdbID, enrichedItem);
            if (selectedItem?.imdbID === item.imdbID) {
                setSelectedItem(enrichedItem);
            }
            if (session) {
                const currentStatus = item.userMeta?.status || 'watchlist';
                const updatedUserMeta = { ...enrichedItem, userMeta: { ...enrichedItem.userMeta, status: currentStatus, lastUpdated: Date.now() } };
                supabase.from('vault_items').upsert({ user_id: session.user.id, imdb_id: item.imdbID, user_meta: updatedUserMeta, updated_at: new Date() });
            }
        }
        return enrichedItem;
    };

    const toggleStatus = (item, newStatus) => {
        const updated = { ...item, userMeta: { ...item.userMeta, status: newStatus, lastUpdated: Date.now() } };
        updateVaultItem(item.imdbID, updated);
        setSelectedItem(updated);
        if (session) {
            supabase.from('vault_items').upsert({ user_id: session.user.id, imdb_id: item.imdbID, user_meta: updated, updated_at: new Date() });
        }
    };

    const addToVault = async (imdbID) => {
        const data = await fetchOmdb(imdbID);
        if (!data || data.Response === "False") return;
        let item = { ...data, userMeta: { status: 'watchlist', lastUpdated: Date.now() }, meta: { ratingsExternal: { imdb: data.imdbRating } } };
        updateVaultItem(imdbID, item);
        setIsSearchOpen(false);
        setSelectedItem(item);
        await enrich(item);
    };

    const removeFromVault = async (imdbID) => {
        if (!confirm("Are you sure you want to delete this from your library?")) return;
        setVault(prev => {
            const next = { watched: {...prev.watched}, watchlist: {...prev.watchlist} };
            delete next.watched[imdbID];
            delete next.watchlist[imdbID];
            return next;
        });
        setSelectedItem(null); 
        if (session) {
            await supabase.from('vault_items').delete().eq('user_id', session.user.id).eq('imdb_id', imdbID);
        }
    };

    const refreshLibrary = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        setRefreshProgress(0);
        const allItems = [...Object.values(vault.watched), ...Object.values(vault.watchlist)];
        let processed = 0;
        for (const item of allItems) {
            try {
                const freshBase = await fetchOmdb(item.imdbID);
                if (freshBase && freshBase.Response === 'True') {
                    const merged = { ...freshBase, userMeta: item.userMeta, meta: item.meta || {}, tmdb: null, enriched: false };
                    await enrich(merged);
                }
            } catch(e) { console.error("Refresh failed for", item.Title, e); }
            processed++;
            setRefreshProgress(Math.round((processed / allItems.length) * 100));
            await new Promise(r => setTimeout(r, 250)); 
        }
        setIsRefreshing(false);
        alert("Library updated successfully!");
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(vault, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `vault_backup_${new Date().toISOString().slice(0,10)}.json`);
        linkElement.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.watched || data.watchlist) { setVault(data); alert("Vault imported successfully! (Local only)"); } 
                else { alert("Invalid vault format"); }
            } catch (err) { alert("Error reading file"); }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery, searchType]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    }, []);

    useEffect(() => {
        if (!session) return;
        supabase.from('vault_items').select('*').then(({ data }) => {
            if (data) {
                const newVault = { watched: {}, watchlist: {} };
                data.forEach(row => {
                    const item = row.user_meta;
                    newVault[item.userMeta.status][item.imdbID] = item;
                });
                setVault(newVault);
            }
        });
    }, [session]);

    useEffect(() => {
        if (selectedItem) {
            const freshItem = vault.watched[selectedItem.imdbID] || vault.watchlist[selectedItem.imdbID];
            if (freshItem && freshItem !== selectedItem) { setSelectedItem(freshItem); }
        }
    }, [vault, selectedItem]);

    const filteredItems = useMemo(() => {
        const all = [...Object.values(vault.watched), ...Object.values(vault.watchlist)];
        return all.filter(item => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'movies') return item.Type === 'movie';
            if (activeFilter === 'shows') return item.Type === 'series';
            return true;
        }).sort((a, b) => (b.userMeta?.lastUpdated || 0) - (a.userMeta?.lastUpdated || 0));
    }, [vault, activeFilter]);

    return (
        <div className="min-h-screen bg-vault-950 flex flex-col">
            <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView(VIEWS.LIBRARY)}>
                        <div className="group-hover:scale-110 transition-transform flex items-center justify-center"><VaultLogo size={44} className="text-indigo-500" /></div>
                        <div className="flex flex-col"><span className="text-xl font-black text-white uppercase tracking-tighter leading-none">The Vault</span><span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Platinum v9.2</span></div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                        <button onClick={() => { setActiveFilter('all'); setCurrentView(VIEWS.LIBRARY); }} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' && currentView === VIEWS.LIBRARY ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Library</button>
                        <button onClick={() => { setActiveFilter('movies'); setCurrentView(VIEWS.LIBRARY); }} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'movies' && currentView === VIEWS.LIBRARY ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Movies</button>
                        <button onClick={() => { setActiveFilter('shows'); setCurrentView(VIEWS.LIBRARY); }} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'shows' && currentView === VIEWS.LIBRARY ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Series</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSearchOpen(true)} className="w-48 lg:w-64 flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:bg-white/10 transition-all text-sm font-medium"><Icon name="search" size={16} />Search Registry...</button>
                    <div className="h-10 w-[1px] bg-white/5 mx-2"></div>
                    {session ? (
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Icon name="settings" /></button>
                            <button onClick={() => setCurrentView(VIEWS.PROFILE)} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition ${currentView === VIEWS.PROFILE ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40 scale-105' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-500/30'}`}>{session.user.email?.[0]?.toUpperCase()}</button>
                        </div>
                    ) : (
                        <GlassButton onClick={() => setIsSettingsOpen(true)} active icon="user">Sign In</GlassButton>
                    )}
                </div>
            </nav>

            <main className="flex-1 max-w-[1920px] mx-auto w-full px-6 py-12">
                {currentView === VIEWS.PROFILE && session ? (
                    <ProfileView user={session.user} libraryItems={allVaultItems} onBack={() => setCurrentView(VIEWS.LIBRARY)} />
                ) : (
                    <>
                        <ContentRail title="Continue Watching" icon="play" items={continueWatching.map(cw => cw.item)} onCardClick={(item) => handleResume(item, continueWatching.find(cw => cw.item.imdbID === item.imdbID).resume)} />
                        {asianDrama.length > 0 && <ContentRail title="Asian Dramas" icon="globe" items={asianDrama} onCardClick={(item) => { setSelectedItem(item); enrich(item); }} />}
                        {anime.length > 0 && <ContentRail title="Anime" icon="star" items={anime} onCardClick={(item) => { setSelectedItem(item); enrich(item); }} />}
                        {genreProfile?.totalWeight > 50 && (
                            <>
                                <ContentRail title="Actor Spotlight" icon="user" items={actorDrivenRecs} onCardClick={(item) => { setSelectedItem(item); enrich(item); }} />
                                <ContentRail title="Recommended for You" icon="star" items={recommended} onCardClick={(item) => { setSelectedItem(item); enrich(item); }} />
                                <ContentRail title="Outside Comfort Zone" icon="globe" items={exploreOutside} onCardClick={(item) => { setSelectedItem(item); enrich(item); }} />
                            </>
                        )}
                        {filteredItems.length > 0 && activeFilter === 'all' && (
                            <section className="mb-16 animate-reveal">
                                <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden group shadow-2xl">
                                    <img src={tmdbImg(filteredItems[0].tmdb?.credits?.images?.backdrops?.[0]?.file_path, "original") || getHighResPoster(filteredItems[0].Poster, 1000)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-vault-950/40 to-transparent"></div>
                                    <div className="absolute bottom-12 left-12 right-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                                        <div className="max-w-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Badge color="gold">Spotlight</Badge>
                                                <Badge color="indigo">{filteredItems[0].Year}</Badge>
                                                <span className="text-white/60 text-sm font-bold tracking-widest uppercase">{filteredItems[0].Genre}</span>
                                            </div>
                                            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight mb-4">{filteredItems[0].Title}</h2>
                                            <p className="text-slate-400 text-lg line-clamp-3 mb-8">{filteredItems[0].Plot}</p>
                                            <div className="flex gap-4">
                                                <button onClick={() => setSelectedItem(filteredItems[0])} className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/10">View Details</button>
                                                <button onClick={() => handlePlayTrailer(filteredItems[0])} className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/10 font-black uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2"><Icon name="play" size={20} /> Watch Trailer</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">Your Library<span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-xs font-bold uppercase">{filteredItems.length} Items</span></h3>
                                <div className="flex items-center gap-3">
                                    <GlassButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon="grid">Grid</GlassButton>
                                    <GlassButton active={viewMode === 'timeline'} onClick={() => setViewMode('timeline')} icon="list">Timeline</GlassButton>
                                </div>
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="py-40 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-slate-700 mb-6"><Icon name="database" size={48} /></div>
                                    <h4 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Vault is Empty</h4>
                                    <p className="text-slate-600 mt-2 font-medium">Search for movies or shows to start your collection.</p>
                                    <button onClick={() => setIsSearchOpen(true)} className="mt-8 px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all">Add First Title</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                                    {filteredItems.map(item => (
                                        <MediaCard key={item.imdbID || item.id} item={item} isAdmin={isAdmin} onClick={() => { setSelectedItem(item); enrich(item); }} onPlayTrailer={handlePlayTrailer} onAdminEdit={(i) => console.log("Edit", i)} onResume={handleResume} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onUpdateStatus={toggleStatus} onRemove={removeFromVault} isAdmin={isAdmin} watchHistory={vault.watched} topActors={topActors} />
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} results={searchResults} onResultClick={(item) => item.inVault ? setSelectedItem(vault.watched[item.imdbID] || vault.watchlist[item.imdbID]) : addToVault(item.imdbID)} isLoading={isSearchLoading} searchType={searchType} setSearchType={setSearchType} />
            <AdminSuggestionsModal isOpen={isAdminSuggestionsOpen} onClose={() => setIsAdminSuggestionsOpen(false)} suggestions={adminSuggestions} onApprove={approveSuggestion} onReject={rejectSuggestion} />
            
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="relative w-full max-w-md glass rounded-[2.5rem] p-10 animate-reveal">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="mb-6"><VaultLogo size={64} className="text-indigo-500" /></div>
                            <h3 className="text-3xl font-black text-white">Vault Access</h3>
                            <p className="text-slate-500 font-medium mt-2">Manage your collection across devices</p>
                        </div>
                        {session ? (
                            <div className="space-y-4">
                                {isAdmin && <CacheHealthPanel />}
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-sm font-bold text-white">Library Maintenance</p><p className="text-xs text-slate-500">Update metadata for all items</p></div>
                                        <button onClick={refreshLibrary} disabled={isRefreshing} className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-bold disabled:opacity-50">{isRefreshing ? `${refreshProgress}%` : 'Refresh All'}</button>
                                    </div>
                                    {isRefreshing && (<div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-300" style={{width: `${refreshProgress}%`}}></div></div>)}
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">API Configuration</h4>
                                    <input type="text" placeholder="OMDb API Key" value={apiKeys.omdb} onChange={(e) => setApiKeys({...apiKeys, omdb: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                                    <input type="text" placeholder="TMDB API Key" value={apiKeys.tmdb} onChange={(e) => setApiKeys({...apiKeys, tmdb: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                                    <input type="text" placeholder="RapidAPI Key (MDL)" value={apiKeys.rapid} onChange={(e) => setApiKeys({...apiKeys, rapid: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                                    {isAdmin && <button onClick={adminClearCache} className="w-full px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider">Clear Cache</button>}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleExport} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">Export JSON</button>
                                    <label className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all text-center cursor-pointer">Import JSON<input type="file" onChange={handleImport} className="hidden" accept=".json" /></label>
                                </div>
                                {isAdmin && <button onClick={() => { setIsSettingsOpen(false); setIsAdminSuggestionsOpen(true); }} className="w-full py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all">Open Admin Dashboard</button>}
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5"><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Signed in as</p><p className="text-white font-bold">{session.user.email}</p></div>
                                <button onClick={() => supabase.auth.signOut()} className="w-full py-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Sign Out</button>
                            </div>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const email = e.target.email.value;
                                const password = e.target.password.value;
                                const { error } = await supabase.auth.signInWithPassword({ email, password });
                                if (error) alert(error.message);
                                else setIsSettingsOpen(false);
                            }} className="space-y-4">
                                <input type="email" name="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-2xl p-4 text-white outline-none" required />
                                <input type="password" name="password" placeholder="Password" className="w-full bg-white/5 border border-white/5 focus:border-indigo-500 rounded-2xl p-4 text-white outline-none" required />
                                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:-translate-y-1 transition-all">Unlock Vault</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);