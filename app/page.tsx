"use client";

import { redirect } from "next/navigation";
import { Typewriter, Cursor } from "react-simple-typewriter";
import ButtonProvider from "./components/ButtonProvider";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    console.log(session);
  }

  if (session) {
    redirect("/dashboard/home ");
  }
  return (
    <section className="w-full h-screen flex items-center justify-center flex-col gap-2 relative">
      <h1 className="text-4xl md:text-6xl  font-black mb-2 text-center uppercase flex items-center">
        <Typewriter
          typeSpeed={50}
          words={[
            "Bienvenue",
            "Welcome",
            "Willkommen",
            "Bienvenido",
            "Benvenuto",
          ]}
          loop={0}
        />
        <span>
          <Cursor />
        </span>
      </h1>
      <ButtonProvider />
    </section>
  );
}
