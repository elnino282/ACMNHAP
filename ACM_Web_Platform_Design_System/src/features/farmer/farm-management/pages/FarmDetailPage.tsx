/**
 * Farm Detail Page
 * 
 * Displays comprehensive farm information with tabs for related entities
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useFarmDetail } from '../hooks/useFarmDetail';
import { useState } from 'react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Button,
    Skeleton,
} from '@/shared/ui';
import { FarmInfoCard } from '../ui/FarmInfoCard';
import { FarmFormDialog } from '../ui/FarmFormDialog';
import { FarmDeleteDialog } from '../ui/FarmDeleteDialog';
import { FarmPlotsTable } from '../ui/FarmPlotsTable';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * FarmDetailPage Component
 * 
 * Main detail view for a single farm with:
 * - Breadcrumb navigation
 * - Farm information card
 * - Tabs for related entities (Plots, Seasons, Stock, Harvests, Incidents)
 * - Edit and delete actions
 */
export function FarmDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const farmId = id ? parseInt(id, 10) : 0;
    
    // State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    
    // Fetch farm data
    const { farm, isLoading, isError, error } = useFarmDetail(farmId);
    
    // Handlers
    const handleBack = () => {
        navigate('/farmer/farms');
    };
    
    const handleEdit = () => {
        setEditDialogOpen(true);
    };
    
    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };
    
    const handleDeleteConfirm = () => {
        // Delete is handled by the FarmDeleteDialog
        setDeleteDialogOpen(false);
        toast.success('Farm deleted successfully');
        navigate('/farmer/farms');
    };
    
    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-7xl">
                {/* Breadcrumb skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-5 w-64" />
                </div>
                
                {/* Back button skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-32" />
                </div>
                
                {/* Card skeleton */}
                <Skeleton className="h-64 w-full mb-6" />
                
                {/* Tabs skeleton */}
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }
    
    // Error state
    if (isError || !farm) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-7xl">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Farm Not Found
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {error?.message || 'The farm you are looking for does not exist or has been deleted.'}
                        </p>
                        <Button onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Farms
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/farmer/farms">
                            My Farms
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{farm.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            {/* Back button */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Farms
                </Button>
            </div>
            
            {/* Farm Info Card */}
            <div className="mb-8">
                <FarmInfoCard
                    farm={farm}
                    canEdit={true}
                    canDelete={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            
            {/* Tabs for Related Entities */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="info">Overview</TabsTrigger>
                    <TabsTrigger value="plots">Plots</TabsTrigger>
                    <TabsTrigger value="seasons">Seasons</TabsTrigger>
                    <TabsTrigger value="stock">Stock</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="info" className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Farm Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Farm Name</p>
                                <p className="text-base font-medium">{farm.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Owner</p>
                                <p className="text-base font-medium">@{farm.ownerUsername}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Area</p>
                                <p className="text-base font-medium font-mono">
                                    {farm.area ? `${farm.area} ha` : 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="text-base font-medium">
                                    {farm.active ? '✅ Active' : '⏸️ Inactive'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Farm ID</p>
                                <p className="text-base font-medium font-mono">#{farm.id}</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                
                {/* Plots Tab */}
                <TabsContent value="plots">
                    <PlaceholderTab
                        title="Plots Management"
                        description="View and manage plots within this farm. Plots will be available in future versions."
                        icon="🌾"
                    />
                </TabsContent>
                
                {/* Seasons Tab */}
                <TabsContent value="seasons">
                    <PlaceholderTab
                        title="Seasons Management"
                        description="Track agricultural seasons for this farm. Seasons will be available in future versions."
                        icon="🗓️"
                    />
                </TabsContent>
                
                {/* Stock Tab */}
                <TabsContent value="stock">
                    <PlaceholderTab
                        title="Stock Management"
                        description="Manage inventory and stock for this farm. Stock tracking will be available in future versions."
                        icon="📦"
                    />
                </TabsContent>
                
                {/* Incidents Tab */}
                <TabsContent value="incidents">
                    <PlaceholderTab
                        title="Incidents Tracking"
                        description="Track and manage incidents affecting this farm. Incidents will be available in future versions."
                        icon="⚠️"
                    />
                </TabsContent>
            </Tabs>
            
            {/* Edit Dialog */}
            <FarmFormDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                mode="edit"
                farm={farm}
                farmId={farmId}
            />
            
            {/* Delete Dialog */}
            <FarmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                farmId={farmId}
                farmName={farm.name}
                onDeleteSuccess={handleDeleteConfirm}
            />
        </div>
    );
}

/**
 * PlaceholderTab Component
 * 
 * Displays a coming soon message for tabs that are not yet implemented
 */
interface PlaceholderTabProps {
    title: string;
    description: string;
    icon: string;
}

function PlaceholderTab({ title, description, icon }: PlaceholderTabProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <div className="text-6xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 mb-6">
                    {description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Coming Soon</span>
                </div>
            </div>
        </div>
    );
}




