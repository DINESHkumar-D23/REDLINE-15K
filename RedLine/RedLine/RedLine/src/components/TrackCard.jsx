/**
 * TrackCard Component
 * 
 * Reusable card component for displaying track information with image, stats, and action button.
 * 
 * @param {Object} props
 * @param {Object} props.track - Track data object
 * @param {Function} props.onSimulate - Callback when Simulate button is clicked
 * @param {boolean} props.selected - Whether this track is selected
 */
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TrackCard = ({ track, onSimulate, selected = false }) => {
  const navigate = useNavigate();

  const handleSimulate = () => {
    if (onSimulate) {
      onSimulate(track);
    } else {
      navigate(`/simulate/${track.id}`, { state: { track } });
    }
  };

  return (
    <motion.article
      className={`track-card ${selected ? 'selected' : ''}`}
      whileHover={{ scale: 1.04, y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      role="article"
      aria-label={`Track: ${track.name}`}
    >
      <div className="track-visual">
        <img
          src={track.img}
          alt={`${track.name} track layout`}
          loading="lazy"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div className="track-meta">
        <div className="meta-top">
          <h3>{track.name}</h3>
          <p className="subtitle">{track.location || track.country || ''}</p>
        </div>

        <div className="track-stats" aria-label="Track statistics">
          {track.length && (
            <div className="stat">
              <span className="stat-val">{track.length}</span>
              <span className="stat-label">Length</span>
            </div>
          )}
          {track.turns && (
            <div className="stat">
              <span className="stat-val">{track.turns}</span>
              <span className="stat-label">Turns</span>
            </div>
          )}
          {track.bestLapSeconds && (
            <div className="stat">
              <span className="stat-val">{formatLapTime(track.bestLapSeconds)}</span>
              <span className="stat-label">Best Lap</span>
            </div>
          )}
          {track.laps && (
            <div className="stat">
              <span className="stat-val">{track.laps}</span>
              <span className="stat-label">Laps</span>
            </div>
          )}
        </div>

        <motion.button
          className="simulate-btn"
          onClick={handleSimulate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Start simulation for ${track.name}`}
        >
          Simulate
        </motion.button>
      </div>
    </motion.article>
  );
};

function formatLapTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}

TrackCard.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    location: PropTypes.string,
    country: PropTypes.string,
    length: PropTypes.string,
    turns: PropTypes.number,
    bestLapSeconds: PropTypes.number,
    laps: PropTypes.number,
  }).isRequired,
  onSimulate: PropTypes.func,
  selected: PropTypes.bool,
};

export default TrackCard;

