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
import NotLoggedIn from "@/components/notLoggedIn";
import AccountContent from "@/components/accountContent";

interface SessionAvatarProps {
  isSignedIn: boolean;
}

export default function SessionAvatar({ isSignedIn }: SessionAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <PopoverContent className="w-96" align="end">
          {isSignedIn ? <AccountContent /> : <NotLoggedIn />}
        </PopoverContent>
      </Popover>
    </div>
  );
}
