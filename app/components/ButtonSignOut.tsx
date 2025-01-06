"use client";
import { auth } from "../firebase/config"; // Importez l'instance d'authentification depuis config
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Déconnexion de Firebase Auth
      console.log("User has been logged out");
      router.push("/"); // Redirige l'utilisateur vers la page d'accueil
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return <Button onClick={handleLogout}>Sign Out</Button>;
};

export default LogoutButton;
