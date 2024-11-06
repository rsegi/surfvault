"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucide-react";

export const SessionAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignedIn,] = useState(false);

  const handleSignIn = () => {
    console.log("Sign In clicked");
    setIsOpen(false);
  };

  const handleRegister = () => {
    console.log("Register clicked");
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-10 bg-background">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-12 w-12 rounded-full p-0">
            <Avatar>
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          {isSignedIn ? (
            <AccountContent />
          ) : (
            <AuthenticationContent
              handleRegister={handleRegister}
              handleSignIn={handleSignIn}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const AuthenticationContent = ({ handleSignIn, handleRegister }) => {
  return (
    <div className="grid gap-4">
      <h3 className="font-semibold text-center">Cuenta</h3>
      <div className="grid gap-2">
        <Button onClick={handleSignIn} className="w-full">
          Iniciar sesi&oacute;n
        </Button>
        <Button onClick={handleRegister} variant="outline" className="w-full">
          Registrarse
        </Button>
      </div>
    </div>
  );
};

const AccountContent = () => {
  return (
    <div className="grid gap-4">
      <h3 className="font-semibold text-center">Mi cuenta</h3>
    </div>
  );
};
