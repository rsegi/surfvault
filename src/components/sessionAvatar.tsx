"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucide-react";
import NotLoggedIn from "@/components/notLoggedIn";
import AccountContent from "@/components/accountContent";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function SessionAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useCurrentUser();

  return (
    <div className="flex items-center justify-center min-h-10 bg-primary">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-white">{user?.name}</span>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-12 w-12 rounded-full p-0">
              <Avatar>
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            {user ? <AccountContent /> : <NotLoggedIn />}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
