import "@/components/loader.css";

export default function Loading() {
  const letters = "CODEBOUNCE".split("");

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black">
      <div className="flex items-center justify-center mb-8">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="font-pixelated text-4xl sm:text-5xl md:text-6xl text-white logo-shadow-main bounce-letter"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>
      <div className="w-64 sm:w-80">
        <div className="loading-bar"></div>
      </div>
    </div>
  );
}
