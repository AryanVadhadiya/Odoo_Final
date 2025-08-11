import React, { useMemo, useState } from 'react';
import { Users, Search, MapPin, ShieldCheck, ShieldOff, Calendar } from 'lucide-react';

const Community = () => {
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [filter, setFilter] = useState('all'); // all | public | private
  const [sortBy, setSortBy] = useState('recent'); // recent | name

  const profiles = useMemo(
    () => [
      { id: 'u1', name: 'Aarav Sharma', location: 'Delhi, India', avatarUrl: 'https://i.pravatar.cc/120?img=15', isPublic: true, joinedAt: '2025-05-02', tripsCount: 5 },
      { id: 'u2', name: 'Meera Nair', location: 'Mumbai, India', avatarUrl: 'https://i.pravatar.cc/120?img=32', isPublic: false, joinedAt: '2025-02-21', tripsCount: 2 },
      { id: 'u3', name: 'Rahul Verma', location: 'Bengaluru, India', avatarUrl: 'https://i.pravatar.cc/120?img=47', isPublic: true, joinedAt: '2024-11-10', tripsCount: 8 },
      { id: 'u4', name: 'Sophia Lee', location: 'New York, USA', avatarUrl: 'https://i.pravatar.cc/120?img=21', isPublic: true, joinedAt: '2025-06-01', tripsCount: 3 },
      { id: 'u5', name: 'Liam Wilson', location: 'London, UK', avatarUrl: 'https://i.pravatar.cc/120?img=28', isPublic: false, joinedAt: '2025-01-12', tripsCount: 4 },
      { id: 'u6', name: 'Yuki Tanaka', location: 'Tokyo, Japan', avatarUrl: 'https://i.pravatar.cc/120?img=5', isPublic: true, joinedAt: '2024-12-05', tripsCount: 6 },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = profiles.filter((p) =>
      [p.name, p.location].some((v) => (v || '').toLowerCase().includes(q))
    );
    if (filter === 'public') list = list.filter((p) => p.isPublic);
    if (filter === 'private') list = list.filter((p) => !p.isPublic);
    if (sortBy === 'recent') list = [...list].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [profiles, search, filter, sortBy]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { All: filtered };
    if (groupBy === 'location') {
      return filtered.reduce((acc, p) => {
        const key = p.location.split(',').pop().trim();
        acc[key] = acc[key] || [];
        acc[key].push(p);
        return acc;
      }, {});
    }
    return { All: filtered };
  }, [filtered, groupBy]);

  const sectionKeys = useMemo(() => Object.keys(grouped), [grouped]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-2">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Community
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Travelers</h1>
          <p className="text-gray-600">Browse community profiles. Public profiles are viewable.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              className="input pl-10 h-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input md:w-48" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="none">Group by: None</option>
            <option value="location">Group by: Location</option>
          </select>
          <select className="input md:w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Filter: All</option>
            <option value="public">Filter: Public</option>
            <option value="private">Filter: Private</option>
          </select>
          <select className="input md:w-48" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Sort by: Recently Joined</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sectionKeys.map((key) => (
          <div key={key} className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">{key}</h2>
            </div>
            <div className="card-body">
              {grouped[key].length === 0 ? (
                <div className="text-gray-600">No profiles.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[key].map((p) => (
                    <div key={p.id} className="card hover:shadow-medium transition-shadow duration-200">
                      <div className="card-body">
                        <div className="flex items-center gap-4 mb-3">
                          <img src={p.avatarUrl} alt={p.name} className="w-14 h-14 rounded-full object-cover border border-white shadow" />
                          <div>
                            <div className="text-base font-semibold text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" /> {p.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            {p.isPublic ? (
                              <><ShieldCheck className="h-4 w-4 text-success-600 mr-1" /> Public</>
                            ) : (
                              <><ShieldOff className="h-4 w-4 text-warning-600 mr-1" /> Private</>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> Joined {new Date(p.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">Trips: <span className="font-medium">{p.tripsCount}</span></div>
                          {p.isPublic ? (
                            <button className="btn-secondary btn-sm">View Profile</button>
                          ) : (
                            <button className="btn-secondary btn-sm opacity-60 cursor-not-allowed" disabled>Private</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;


