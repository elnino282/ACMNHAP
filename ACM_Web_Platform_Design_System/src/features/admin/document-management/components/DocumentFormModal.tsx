import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, ExternalLink } from 'lucide-react';
import { AdminDocument } from '@/services/api.admin';
import { TYPE_OPTIONS, STATUS_OPTIONS } from '../constants';

// ═══════════════════════════════════════════════════════════════
// FORM VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════

const documentFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    documentUrl: z.string().url('Must be a valid URL'),
    documentType: z.enum(['POLICY', 'GUIDE', 'MANUAL', 'LEGAL', 'OTHER']),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface DocumentFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document?: AdminDocument | null;
    onSubmit: (data: DocumentFormValues) => void;
    isSubmitting?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
    open,
    onOpenChange,
    document,
    onSubmit,
    isSubmitting = false,
}) => {
    const isEditing = !!document;

    const form = useForm<DocumentFormValues>({
        resolver: zodResolver(documentFormSchema),
        defaultValues: {
            title: '',
            description: '',
            documentUrl: '',
            documentType: 'OTHER',
            status: 'ACTIVE',
        },
    });

    // Reset form when document changes or modal opens
    useEffect(() => {
        if (open) {
            if (document) {
                form.reset({
                    title: document.title,
                    description: document.description || '',
                    documentUrl: document.documentUrl,
                    documentType: document.documentType as DocumentFormValues['documentType'],
                    status: document.status as DocumentFormValues['status'],
                });
            } else {
                form.reset({
                    title: '',
                    description: '',
                    documentUrl: '',
                    documentType: 'OTHER',
                    status: 'ACTIVE',
                });
            }
        }
    }, [open, document, form]);

    const handleSubmit = form.handleSubmit((data) => {
        onSubmit(data);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Document' : 'Create Document'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the document information below.'
                            : 'Add a new document link to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Farm Safety Policy"
                            {...form.register('title')}
                            disabled={isSubmitting}
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the document..."
                            rows={3}
                            {...form.register('description')}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Document URL */}
                    <div className="space-y-2">
                        <Label htmlFor="documentUrl">
                            Document URL <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="documentUrl"
                                type="url"
                                placeholder="https://example.com/document.pdf"
                                className="flex-1"
                                {...form.register('documentUrl')}
                                disabled={isSubmitting}
                            />
                            {form.watch('documentUrl') && !form.formState.errors.documentUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(form.getValues('documentUrl'), '_blank')}
                                    title="Open URL in new tab"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {form.formState.errors.documentUrl && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.documentUrl.message}
                            </p>
                        )}
                    </div>

                    {/* Document Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>
                                Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={form.watch('documentType')}
                                onValueChange={(value) =>
                                    form.setValue('documentType', value as DocumentFormValues['documentType'])
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={form.watch('status')}
                                onValueChange={(value) =>
                                    form.setValue('status', value as DocumentFormValues['status'])
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Document'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
