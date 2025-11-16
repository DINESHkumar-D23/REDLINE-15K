import React from "react";
import Header from "../components/Header";
import homebg from "../assets/homebg.mp4";   // <-- import the video
import "../css/Home.css";

export default function Home() {
  return (
    <>
      <Header />

      <main className="home-container">
        {/* Background Video */}
        <video className="home-bg-video" autoPlay muted loop playsInline>
          <source src={homebg} type="video/mp4" />
        </video>

        {/* Page Content */}
        <div className="home-content">
          <img src="RedLine/src/assets/logored2.png" alt="" />
          <h1>Welcome to the Home Page</h1>
          <p>Now you’re inside RedLine’s main interface!</p>
        </div>
      </main>
    </>
  );
}
