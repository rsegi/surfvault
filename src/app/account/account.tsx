"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/confirmationDialog";
import { deleteAccount } from "@/lib/deleteAccountServerAction";
import { signOut } from "next-auth/react";

export default function AccountPage() {
  const user = useCurrentUser();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!user?.id) {
      console.error("Usuario no autenticado");
      toast.error("Debes estar autenticado para eliminar una cuenta.");
      return;
    }
    await deleteAccount(user.id);
    await signOut();
    toast.success("Cuenta eliminada.");
    setIsDeleteDialogOpen(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">Cargando...</div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mi Cuenta</CardTitle>
          <CardDescription>Informaci&oacute;n sobre mi cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Nombre de usuario
            </p>
            <p className="text-lg font-semibold">{user.username}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Eliminar Cuenta
          </Button>
        </CardFooter>
      </Card>
      <ConfirmationDialog
        confirmButtonText="Eliminar Cuenta"
        descriptionText="Tu cuenta ser&aacute; borrada junto a todos los datos
                    asociados a la cuenta."
        title="Est&aacute;s seguro de que deseas eliminar tu cuenta?"
        descriptionHighlight="Esta operaci&oacute;n es irreversible."
        handleConfirm={handleDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
}
