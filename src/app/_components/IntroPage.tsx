import Link from "next/link";
import { Button } from "./ui/button";

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
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Link href="/products">
          <Button>Browse Trending</Button>
        </Link>
        <Button variant="ghost">Our quality promise &rarr;</Button>
      </div>
    </div>
  );
}
