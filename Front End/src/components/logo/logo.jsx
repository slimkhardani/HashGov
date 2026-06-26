import "./logo.css";

export function Logo({ isFooter = false }) {
  return (
    <div className={`logo-wrapper ${isFooter ? "footer-logo-wrapper" : ""}`}>
      <svg
        width={isFooter ? "40" : "40"} /* Adjusted width to match height */
        height={isFooter ? "40" : "40"} /* Adjusted height */
        viewBox="0 0 100 100"
        className="logo-svg"
      >
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          color="var(--primary)"
        />
        <line
          x1="20"
          y1="50"
          x2="80"
          y2="50"
          stroke="currentColor"
          strokeWidth="5"
          color="var(--primary)"
        />
      </svg>
      <span className="logo-text">HashGov</span>
    </div>
  );
}
