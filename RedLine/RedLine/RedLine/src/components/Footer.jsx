/**
 * Footer Component
 * 
 * Site footer with links and copyright information.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-section">
          <h4>RedLine</h4>
          <p>Professional motorsport simulation & leaderboard platform</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav aria-label="Footer navigation">
            <ul>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/formula1">Formula 1</Link>
              </li>
              <li>
                <Link to="/motogp">MotoGP</Link>
              </li>
              <li>
                <Link to="/drones">Drone Racing</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                Documentation
              </a>
            </li>
            <li>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                API Reference
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} RedLine Motorsport Simulation. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

