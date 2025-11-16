/**
 * ParamsSidebar Component
 * 
 * Professional simulation parameters sidebar with all inputs for motorsport simulation.
 * Persists regulation and sessionType to localStorage.
 * 
 * @param {Object} props
 * @param {Object} props.params - Current parameter values
 * @param {Function} props.onParamsChange - Callback when any parameter changes
 * @param {boolean} props.isRunning - Whether simulation is running
 * @param {Function} props.onStartStop - Start/Stop simulation handler
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const STORAGE_KEYS = {
  REGULATION: 'rl_selected_reg',
  SESSION_TYPE: 'rl_session_type',
};

const ParamsSidebar = ({ params, onParamsChange, isRunning, onStartStop }) => {
  const [localParams, setLocalParams] = useState(params);

  // Sync with parent params
  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  // Persist regulation and sessionType to localStorage
  useEffect(() => {
    try {
      if (localParams.regulation) {
        localStorage.setItem(STORAGE_KEYS.REGULATION, localParams.regulation);
      }
      if (localParams.sessionType) {
        localStorage.setItem(STORAGE_KEYS.SESSION_TYPE, localParams.sessionType);
      }
    } catch (err) {
      console.warn('Failed to persist params to localStorage:', err);
    }
  }, [localParams.regulation, localParams.sessionType]);

  const handleChange = (key, value) => {
    const updated = { ...localParams, [key]: value };
    setLocalParams(updated);
    if (onParamsChange) {
      onParamsChange(updated);
    }
  };

  return (
    <aside className="sim-sidebar" aria-label="Simulation parameters">
      <motion.div
        className="params-card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3>Simulation Parameters</h3>

        {/* Session Type */}
        <label htmlFor="session-type" className="param-label">
          Session Type
        </label>
        <select
          id="session-type"
          value={localParams.sessionType || 'Qualifying'}
          onChange={(e) => handleChange('sessionType', e.target.value)}
          className="param-select"
          aria-label="Session type selector"
        >
          <option value="Practice">Practice</option>
          <option value="Qualifying">Qualifying</option>
          <option value="Race">Race</option>
        </select>

        {/* Time of Day */}
        <label htmlFor="time-of-day" className="param-label">
          Time of Day
        </label>
        <select
          id="time-of-day"
          value={localParams.timeOfDay || 'Midday'}
          onChange={(e) => handleChange('timeOfDay', e.target.value)}
          className="param-select"
          aria-label="Time of day selector"
        >
          <option value="Morning">Morning</option>
          <option value="Midday">Midday</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>

        {/* Weather */}
        <label htmlFor="weather" className="param-label">
          Weather
        </label>
        <select
          id="weather"
          value={localParams.weather || 'Clear'}
          onChange={(e) => handleChange('weather', e.target.value)}
          className="param-select"
          aria-label="Weather condition selector"
        >
          <option value="Clear">Clear</option>
          <option value="Overcast">Overcast</option>
          <option value="Rain">Rain</option>
        </select>

        {/* Regulation */}
        <label htmlFor="regulation" className="param-label">
          Regulation
        </label>
        <select
          id="regulation"
          value={localParams.regulation || '2026'}
          onChange={(e) => handleChange('regulation', e.target.value)}
          className="param-select"
          aria-label="Regulation year selector"
        >
          <option value="2022">2022 Regulations</option>
          <option value="2026">2026 Regulations</option>
        </select>

        {/* Tyre Compound */}
        <label htmlFor="tyre-compound" className="param-label">
          Tyre Compound
        </label>
        <select
          id="tyre-compound"
          value={localParams.tyreCompound || 'soft'}
          onChange={(e) => handleChange('tyreCompound', e.target.value)}
          className="param-select"
          aria-label="Tyre compound selector"
        >
          <option value="soft">Soft</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Fuel Slider */}
        <label htmlFor="fuel" className="param-label">
          Fuel (kg)
        </label>
        <input
          id="fuel"
          type="range"
          min="5"
          max="120"
          step="1"
          value={localParams.fuelKg || 50}
          onChange={(e) => handleChange('fuelKg', Number(e.target.value))}
          className="param-range"
          aria-label={`Fuel amount: ${localParams.fuelKg || 50} kilograms`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.fuelKg || 50} kg
        </div>

        {/* Run Length */}
        <label htmlFor="run-length" className="param-label">
          Run Length (minutes)
        </label>
        <input
          id="run-length"
          type="number"
          min="1"
          max="180"
          value={localParams.runMinutes || 10}
          onChange={(e) => handleChange('runMinutes', Number(e.target.value))}
          className="param-number"
          aria-label={`Run length: ${localParams.runMinutes || 10} minutes`}
        />

        {/* Ambient Temperature */}
        <label htmlFor="ambient-temp" className="param-label">
          Ambient Temperature (°C)
        </label>
        <input
          id="ambient-temp"
          type="range"
          min="-10"
          max="45"
          step="1"
          value={localParams.ambientTemp || 22}
          onChange={(e) => handleChange('ambientTemp', Number(e.target.value))}
          className="param-range"
          aria-label={`Ambient temperature: ${localParams.ambientTemp || 22} degrees Celsius`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.ambientTemp || 22}°C
        </div>

        {/* Track Temperature */}
        <label htmlFor="track-temp" className="param-label">
          Track Temperature (°C)
        </label>
        <input
          id="track-temp"
          type="range"
          min="5"
          max="70"
          step="1"
          value={localParams.trackTemp || 28}
          onChange={(e) => handleChange('trackTemp', Number(e.target.value))}
          className="param-range"
          aria-label={`Track temperature: ${localParams.trackTemp || 28} degrees Celsius`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.trackTemp || 28}°C
        </div>

        {/* Grip Level */}
        <label htmlFor="grip-level" className="param-label">
          Grip Level
        </label>
        <input
          id="grip-level"
          type="range"
          min="0"
          max="100"
          step="1"
          value={localParams.gripLevel || 85}
          onChange={(e) => handleChange('gripLevel', Number(e.target.value))}
          className="param-range"
          aria-label={`Grip level: ${localParams.gripLevel || 85} percent`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.gripLevel || 85}%
        </div>

        {/* Wind Speed */}
        <label htmlFor="wind-speed" className="param-label">
          Wind Speed (km/h)
        </label>
        <input
          id="wind-speed"
          type="range"
          min="0"
          max="120"
          step="1"
          value={localParams.windSpeed || 8}
          onChange={(e) => handleChange('windSpeed', Number(e.target.value))}
          className="param-range"
          aria-label={`Wind speed: ${localParams.windSpeed || 8} kilometers per hour`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.windSpeed || 8} km/h
        </div>

        {/* Tyre Pressure */}
        <label htmlFor="tyre-pressure" className="param-label">
          Tyre Pressure (psi)
        </label>
        <input
          id="tyre-pressure"
          type="number"
          min="12"
          max="40"
          step="0.1"
          value={localParams.tyrePressure || 22}
          onChange={(e) => handleChange('tyrePressure', Number(e.target.value))}
          className="param-number"
          aria-label={`Tyre pressure: ${localParams.tyrePressure || 22} psi`}
        />

        {/* Pit Stop Strategy */}
        <label htmlFor="pit-strategy" className="param-label">
          Pit Stop Strategy
        </label>
        <select
          id="pit-strategy"
          value={localParams.pitStrategy || 'One-stop'}
          onChange={(e) => handleChange('pitStrategy', e.target.value)}
          className="param-select"
          aria-label="Pit stop strategy selector"
        >
          <option value="None">None</option>
          <option value="One-stop">One-stop</option>
          <option value="Two-stop">Two-stop</option>
        </select>

        {/* Traffic Density */}
        <label htmlFor="traffic-density" className="param-label">
          Traffic Density
        </label>
        <select
          id="traffic-density"
          value={localParams.trafficDensity || 'Medium'}
          onChange={(e) => handleChange('trafficDensity', e.target.value)}
          className="param-select"
          aria-label="Traffic density selector"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {/* AI Difficulty */}
        <label htmlFor="ai-difficulty" className="param-label">
          AI Difficulty
        </label>
        <select
          id="ai-difficulty"
          value={localParams.aiDifficulty || 'Normal'}
          onChange={(e) => handleChange('aiDifficulty', e.target.value)}
          className="param-select"
          aria-label="AI difficulty selector"
        >
          <option value="Easy">Easy</option>
          <option value="Normal">Normal</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Safety Car Probability */}
        <label htmlFor="safety-car-prob" className="param-label">
          Safety Car Probability
        </label>
        <input
          id="safety-car-prob"
          type="range"
          min="0"
          max="100"
          step="1"
          value={localParams.safetyCarProb || 8}
          onChange={(e) => handleChange('safetyCarProb', Number(e.target.value))}
          className="param-range"
          aria-label={`Safety car probability: ${localParams.safetyCarProb || 8} percent`}
        />
        <div className="param-value" aria-live="polite">
          {localParams.safetyCarProb || 8}%
        </div>

        {/* Start/Stop Button */}
        <motion.button
          className="start-btn"
          onClick={onStartStop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={isRunning ? 'Stop simulation' : 'Start simulation'}
          aria-pressed={isRunning}
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </motion.button>

        <div className="small-note" role="note">
          Start will run a live simulated leaderboard in this demo. Wire your WebGL engine and
          telemetry feed to these inputs and to the Leaderboard (via websocket or snapshots).
        </div>
      </motion.div>
    </aside>
  );
};

ParamsSidebar.propTypes = {
  params: PropTypes.object.isRequired,
  onParamsChange: PropTypes.func.isRequired,
  isRunning: PropTypes.bool.isRequired,
  onStartStop: PropTypes.func.isRequired,
};

export default ParamsSidebar;

