export default function CloudBackground({
  showGrid = true,
  className = "",
  children,
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden [contain:paint] ${className}`}
    >
      {/* 1. Subtle Engineering Dot Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#0f766e 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 20%, black 50%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 65% at 50% 20%, black 50%, transparent 100%)",
          }}
        />
      )}

      {/* 2. Main Center Cloud Bloom (#5eead4 core -> #14b8a6 mid -> #0f766e base) */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[520px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 35%, rgba(94, 234, 212, 0.28) 0%, rgba(20, 184, 166, 0.18) 32%, rgba(13, 138, 128, 0.09) 58%, rgba(15, 118, 110, 0.03) 78%, transparent 100%)",
        }}
      />

      {/* 3. Left Ambient Cloud Puff (#0d8a80 & #14b8a6 blend) */}
      <div
        aria-hidden="true"
        className="absolute -top-16 left-[-10%] w-[560px] h-[440px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 40% 40%, rgba(20, 184, 166, 0.16) 0%, rgba(13, 138, 128, 0.10) 40%, rgba(15, 118, 110, 0.03) 70%, transparent 100%)",
        }}
      />

      {/* 4. Right Elevated Cloud Aura (#5eead4 & #0f766e blend) */}
      <div
        aria-hidden="true"
        className="absolute -top-20 right-[-5%] w-[620px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 60% 30%, rgba(94, 234, 212, 0.22) 0%, rgba(15, 118, 110, 0.12) 42%, transparent 75%)",
        }}
      />

      {/* 5. Lower Ground Mist across the base */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(94, 234, 212, 0.14) 0%, rgba(20, 184, 166, 0.07) 50%, transparent 100%)",
        }}
      />

      {children}
    </div>
  );
}