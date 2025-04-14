export default function Intro() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-20 text-center">
      <h1 className="text-primaryAccent text-4xl font-bold tracking-tight sm:text-6xl">
        Your marketplace for high-quality{" "}
        <span className="text-secondaryAccent">thrifts.</span>
      </h1>
      <p className="text-muted-foreground mt-6 max-w-prose text-lg">
        Welcome to ThriftiNUS. The best marketplace for NUS students!
      </p>
    </div>
  );
}

