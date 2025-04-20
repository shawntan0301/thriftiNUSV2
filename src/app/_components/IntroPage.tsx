export default function Intro() {
  return (
    <section
      className="relative w-full bg-cover bg-center bg-no-repeat py-20 px-4 mb-16"
      style={{
        backgroundImage: "url('/assets/intro-bg.jpg')",
      }}
    >
      {/* Soft white translucent overlay */}
      <div className="absolute inset-0 bg-white opacity-70"></div>

      {/* Text content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-primaryAccent text-4xl font-bold tracking-tight sm:text-6xl">
          Your marketplace for high-quality{" "}
          <span className="text-secondaryAccent">thrifts.</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-prose text-lg">
          Welcome to ThriftiNUS. The best marketplace for NUS students!
        </p>
      </div>
    </section>
  );
}
