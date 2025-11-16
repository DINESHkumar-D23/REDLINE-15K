/**
 * Sample Telemetry Data
 * 
 * Example telemetry snapshots for testing and development.
 * Format matches expected websocket payload structure.
 */

export const SAMPLE_F1_TELEMETRY = {
  type: 'leaderboard',
  timestamp: Date.now(),
  data: [
    { pos: 1, name: 'L. Hamilton', team: 'Mercedes', time: '1:28.062', gap: '0.000' },
    { pos: 2, name: 'M. Verstappen', team: 'Red Bull Racing', time: '1:28.325', gap: '0.263' },
    { pos: 3, name: 'C. Leclerc', team: 'Ferrari', time: '1:28.735', gap: '0.673' },
    { pos: 4, name: 'S. Pérez', team: 'Red Bull Racing', time: '1:29.091', gap: '1.029' },
    { pos: 5, name: 'G. Russell', team: 'Mercedes', time: '1:29.450', gap: '1.388' },
    { pos: 6, name: 'F. Alonso', team: 'Aston Martin', time: '1:29.782', gap: '1.720' },
    { pos: 7, name: 'L. Norris', team: 'McLaren', time: '1:30.125', gap: '2.063' },
    { pos: 8, name: 'O. Piastri', team: 'McLaren', time: '1:30.456', gap: '2.394' },
  ],
};

export const SAMPLE_MOTOGP_TELEMETRY = {
  type: 'leaderboard',
  timestamp: Date.now(),
  data: [
    { pos: 1, name: 'F. Bagnaia', team: 'Ducati Lenovo', time: '1:34.082', gap: '0.000' },
    { pos: 2, name: 'M. Márquez', team: 'Repsol Honda', time: '1:34.325', gap: '0.243' },
    { pos: 3, name: 'F. Quartararo', team: 'Monster Yamaha', time: '1:34.735', gap: '0.653' },
    { pos: 4, name: 'J. Martín', team: 'Pramac Racing', time: '1:34.991', gap: '0.909' },
    { pos: 5, name: 'A. Espargaró', team: 'Aprilia Racing', time: '1:35.230', gap: '1.148' },
    { pos: 6, name: 'J. Miller', team: 'Red Bull KTM', time: '1:35.567', gap: '1.485' },
    { pos: 7, name: 'B. Binder', team: 'Red Bull KTM', time: '1:35.891', gap: '1.809' },
    { pos: 8, name: 'E. Bastianini', team: 'Ducati Lenovo', time: '1:36.125', gap: '2.043' },
  ],
};

/**
 * Generate a random telemetry snapshot
 */
export function generateRandomTelemetry(baseData) {
  const shuffled = [...baseData];
  
  // Randomly swap adjacent positions
  const swaps = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < swaps; i++) {
    const index = Math.floor(Math.random() * (shuffled.length - 1));
    [shuffled[index], shuffled[index + 1]] = [shuffled[index + 1], shuffled[index]];
  }

  // Update positions and times
  return shuffled.map((entry, idx) => ({
    ...entry,
    pos: idx + 1,
    time: entry.time || generateRandomLapTime(),
    gap: idx === 0 ? '0.000' : `${(idx * 0.25 + Math.random() * 0.1).toFixed(3)}`,
  }));
}

function generateRandomLapTime() {
  const mins = Math.floor(Math.random() * 2) + 1;
  const secs = 28 + Math.random() * 8;
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
}

