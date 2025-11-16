import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // log if you want
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 20,
          background: "linear-gradient(90deg,#2b0000,#3b0000)",
          color: "#ffd1d1",
          borderRadius: 10,
          maxWidth: 880,
          margin: "18px auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }}>
          <strong>Animation failed to load.</strong>
          <div style={{ marginTop: 8, fontSize: 13 }}>{this.state.error.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
