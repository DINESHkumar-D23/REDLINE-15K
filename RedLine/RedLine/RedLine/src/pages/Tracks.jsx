/**
 * Tracks Listing Page
 * 
 * Displays a grid of tracks with filtering by series and search functionality.
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import TrackCard from '../components/TrackCard';
import Footer from '../components/Footer';
import { tracks as f1Tracks } from '../data/tracks';
import { motogpTracks } from '../data/motogpTracks';

const Tracks = () => {
  const navigate = useNavigate();
  const [seriesFilter, setSeriesFilter] = useState('all'); // 'all', 'f1', 'motogp'
  const [searchQuery, setSearchQuery] = useState('');

  const allTracks = useMemo(() => {
    const f1 = f1Tracks.map(t => ({ ...t, series: 'f1' }));
    const mgp = motogpTracks.map(t => ({ ...t, series: 'motogp' }));
    return [...f1, ...mgp];
  }, []);

  const filteredTracks = useMemo(() => {
    let filtered = allTracks;

    // Filter by series
    if (seriesFilter !== 'all') {
      filtered = filtered.filter(t => t.series === seriesFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          (t.country && t.country.toLowerCase().includes(query)) ||
          (t.location && t.location.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allTracks, seriesFilter, searchQuery]);

  const handleSimulate = (track) => {
    navigate(`/simulate/${track.id}`, { state: { track } });
  };

  return (
    <>
      <Header />
      <main className="tracks-page" style={{ paddingTop: '92px', minHeight: '100vh' }}>
        <div className="tracks-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="tracks-title">All Tracks</h1>
            <p className="tracks-subtitle">Select a track to start your simulation</p>

            {/* Filters */}
            <div className="tracks-filters" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="filter-group">
                <label htmlFor="series-filter" style={{ marginRight: '0.5rem' }}>
                  Series:
                </label>
                <select
                  id="series-filter"
                  value={seriesFilter}
                  onChange={(e) => setSeriesFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #1f2937',
                    background: '#111827',
                    color: '#e7eefc',
                  }}
                >
                  <option value="all">All</option>
                  <option value="f1">Formula 1</option>
                  <option value="motogp">MotoGP</option>
                </select>
              </div>

              <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
                <label htmlFor="search" style={{ marginRight: '0.5rem' }}>
                  Search:
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by track name, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #1f2937',
                    background: '#111827',
                    color: '#e7eefc',
                  }}
                />
              </div>
            </div>

            {/* Results count */}
            <div style={{ marginBottom: '1rem', color: '#9ca3af' }}>
              Showing {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
            </div>

            {/* Tracks Grid */}
            {filteredTracks.length > 0 ? (
              <div
                className="tracks-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filteredTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TrackCard track={track} onSimulate={handleSimulate} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <p>No tracks found matching your criteria.</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Tracks;

