import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  title: string;
  descriptionText: string;
  confirmButtonText: string;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  handleConfirm: () => void;
  descriptionHighlight?: string;
};

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={props.isDeleteDialogOpen}
      onOpenChange={props.setIsDeleteDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>
            <p>{props.descriptionText}</p>
            {props.descriptionHighlight && (
              <>
                <br />
                <p className="font-semibold">{props.descriptionHighlight}</p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.setIsDeleteDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={props.handleConfirm}>
            {props.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
