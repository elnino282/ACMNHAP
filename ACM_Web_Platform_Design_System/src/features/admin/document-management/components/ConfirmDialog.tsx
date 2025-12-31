import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { AdminDocument } from '@/services/api.admin';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: AdminDocument | null;
    action: 'deactivate' | 'activate';
    onConfirm: () => void;
    isLoading?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    onOpenChange,
    document,
    action,
    onConfirm,
    isLoading = false,
}) => {
    if (!document) return null;

    const isDeactivate = action === 'deactivate';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isDeactivate ? 'Deactivate Document?' : 'Activate Document?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isDeactivate ? (
                            <>
                                Are you sure you want to deactivate{' '}
                                <span className="font-medium text-foreground">"{document.title}"</span>?
                                The document will no longer be visible to users.
                            </>
                        ) : (
                            <>
                                Are you sure you want to activate{' '}
                                <span className="font-medium text-foreground">"{document.title}"</span>?
                                The document will become visible to users again.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={isDeactivate ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isDeactivate ? 'Deactivate' : 'Activate'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
