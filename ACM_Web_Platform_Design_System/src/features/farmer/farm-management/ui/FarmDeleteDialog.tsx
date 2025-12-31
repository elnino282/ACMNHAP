import { AlertCircle, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
} from '@/shared/ui';

interface FarmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    farmName: string | null;
    onConfirm: () => void;
    isDeleting: boolean;
}

/**
 * Farm delete confirmation dialog
 */
export function FarmDeleteDialog({
    open,
    onOpenChange,
    farmName,
    onConfirm,
    isDeleting,
}: FarmDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        Delete Farm
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the farm "{farmName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
