/**
 * Loading Component
 * 
 * Reusable loading spinner component with optional message.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './Loading.css';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'loading-container-fullscreen'
    : 'loading-container';

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label="Loading">
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </motion.div>
      {message && (
        <motion.p
          className="loading-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

Loading.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loading;

