"use client";

import { auth } from "@/app/firebase/config";
import { SignOutButton } from "@/app/components/sign-out-button";
import { useEffect, useState } from "react";

type Props = {};

export const DashboardHome = (props: Props) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email ?? null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {userEmail && <p className="mb-4">Welcome {userEmail}</p>}
      <SignOutButton />
    </div>
  );
};

export default DashboardHome;
