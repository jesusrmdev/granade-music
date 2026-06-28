import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/logo.png"
          alt="Granade Music"
          width={120}
          height={120}
          className="h-24 w-24 sm:h-32 sm:w-32"
          priority
        />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Granade Music
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 sm:text-xl">
          Accede a tu clase
        </p>
        <Link
          href="/login"
          className="mt-4 rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Comenzar
        </Link>
      </div>
    </div>
  );
}
