import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Layers, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/shared/api/http';

// Types
interface Supplier {
    id: number;
    name: string;
    licenseNo: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
}

interface SupplyItem {
    id: number;
    name: string;
    activeIngredient: string | null;
    unit: string | null;
    restrictedFlag: boolean | null;
}

interface SupplyLot {
    id: number;
    supplyItemId: number | null;
    supplyItemName: string | null;
    supplierId: number | null;
    supplierName: string | null;
    batchCode: string | null;
    expiryDate: string | null;
    status: string | null;
}

interface PageResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// API calls
const api = {
    listSuppliers: async (): Promise<PageResponse<Supplier>> => {
        const res = await httpClient.get('/api/v1/farmer/suppliers');
        return res.data.result;
    },
    createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
        const res = await httpClient.post('/api/v1/farmer/suppliers', data);
        return res.data.result;
    },
    listSupplyItems: async (): Promise<PageResponse<SupplyItem>> => {
        const res = await httpClient.get('/api/v1/farmer/supply-items');
        return res.data.result;
    },
    createSupplyItem: async (data: Partial<SupplyItem>): Promise<SupplyItem> => {
        const res = await httpClient.post('/api/v1/farmer/supply-items', data);
        return res.data.result;
    },
    listSupplyLots: async (): Promise<PageResponse<SupplyLot>> => {
        const res = await httpClient.get('/api/v1/farmer/supply-lots');
        return res.data.result;
    },
};

/**
 * Suppliers & Supplies Page
 * 
 * Manages suppliers, supply items, and supply lots with full CRUD.
 */
export function SuppliersSuppliesPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('suppliers');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Form state
    const [supplierName, setSupplierName] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemUnit, setItemUnit] = useState('');

    // Queries
    const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
        queryKey: ['farmer', 'suppliers'],
        queryFn: api.listSuppliers,
    });

    const { data: itemsData, isLoading: itemsLoading } = useQuery({
        queryKey: ['farmer', 'supply-items'],
        queryFn: api.listSupplyItems,
    });

    const { data: lotsData, isLoading: lotsLoading } = useQuery({
        queryKey: ['farmer', 'supply-lots'],
        queryFn: api.listSupplyLots,
    });

    // Mutations
    const createSupplierMutation = useMutation({
        mutationFn: api.createSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmer', 'suppliers'] });
            setCreateDialogOpen(false);
            setSupplierName('');
            setSupplierPhone('');
        },
    });

    const createItemMutation = useMutation({
        mutationFn: api.createSupplyItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmer', 'supply-items'] });
            setCreateDialogOpen(false);
            setItemName('');
            setItemUnit('');
        },
    });

    const handleCreateSupplier = () => {
        createSupplierMutation.mutate({
            name: supplierName,
            contactPhone: supplierPhone,
        });
    };

    const handleCreateItem = () => {
        createItemMutation.mutate({
            name: itemName,
            unit: itemUnit,
        });
    };

    const isLoading = suppliersLoading || itemsLoading || lotsLoading;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-[#E67E22]" />
                    <div>
                        <h1 className="text-3xl font-bold text-[#333333]">Suppliers & Supplies</h1>
                        <p className="text-[#777777]">Nhà cung cấp & Vật tư</p>
                    </div>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#E67E22] hover:bg-[#d35400]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {activeTab === 'suppliers' ? 'Add Supplier' : 'Add Supply Item'}
                            </DialogTitle>
                            <DialogDescription>
                                {activeTab === 'suppliers'
                                    ? 'Add a new supplier to your list'
                                    : 'Add a new supply item to inventory'}
                            </DialogDescription>
                        </DialogHeader>

                        {activeTab === 'suppliers' ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="supplierName">Name *</Label>
                                    <Input
                                        id="supplierName"
                                        value={supplierName}
                                        onChange={(e) => setSupplierName(e.target.value)}
                                        placeholder="Supplier name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supplierPhone">Phone</Label>
                                    <Input
                                        id="supplierPhone"
                                        value={supplierPhone}
                                        onChange={(e) => setSupplierPhone(e.target.value)}
                                        placeholder="Contact phone"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="itemName">Name *</Label>
                                    <Input
                                        id="itemName"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="Item name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="itemUnit">Unit</Label>
                                    <Input
                                        id="itemUnit"
                                        value={itemUnit}
                                        onChange={(e) => setItemUnit(e.target.value)}
                                        placeholder="e.g., kg, L, units"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={activeTab === 'suppliers' ? handleCreateSupplier : handleCreateItem}
                                disabled={
                                    (activeTab === 'suppliers' && !supplierName) ||
                                    (activeTab !== 'suppliers' && !itemName) ||
                                    createSupplierMutation.isPending ||
                                    createItemMutation.isPending
                                }
                                className="bg-[#E67E22] hover:bg-[#d35400]"
                            >
                                {(createSupplierMutation.isPending || createItemMutation.isPending) && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="suppliers" className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Suppliers
                    </TabsTrigger>
                    <TabsTrigger value="items" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Supply Items
                    </TabsTrigger>
                    <TabsTrigger value="lots" className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Supply Lots
                    </TabsTrigger>
                </TabsList>

                {/* Suppliers Tab */}
                <TabsContent value="suppliers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Suppliers</CardTitle>
                            <CardDescription>
                                {suppliersData?.items?.length || 0} supplier(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {suppliersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                                </div>
                            ) : !suppliersData?.items?.length ? (
                                <div className="text-center py-12 text-[#777777]">
                                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No suppliers found</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>License No</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {suppliersData.items.map((s: Supplier) => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">{s.name}</TableCell>
                                                <TableCell>{s.licenseNo || '-'}</TableCell>
                                                <TableCell>{s.contactEmail || '-'}</TableCell>
                                                <TableCell>{s.contactPhone || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Supply Items Tab */}
                <TabsContent value="items">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supply Items</CardTitle>
                            <CardDescription>
                                {itemsData?.items?.length || 0} item(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {itemsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                                </div>
                            ) : !itemsData?.items?.length ? (
                                <div className="text-center py-12 text-[#777777]">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No supply items found</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Active Ingredient</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Restricted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemsData.items.map((i: SupplyItem) => (
                                            <TableRow key={i.id}>
                                                <TableCell className="font-medium">{i.name}</TableCell>
                                                <TableCell>{i.activeIngredient || '-'}</TableCell>
                                                <TableCell>{i.unit || '-'}</TableCell>
                                                <TableCell>
                                                    {i.restrictedFlag ? (
                                                        <Badge className="bg-red-100 text-red-800">Yes</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-100 text-green-800">No</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Supply Lots Tab */}
                <TabsContent value="lots">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supply Lots</CardTitle>
                            <CardDescription>
                                {lotsData?.items?.length || 0} lot(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lotsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                                </div>
                            ) : !lotsData?.items?.length ? (
                                <div className="text-center py-12 text-[#777777]">
                                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No supply lots found</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supply Item</TableHead>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Batch Code</TableHead>
                                            <TableHead>Expiry Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lotsData.items.map((l: SupplyLot) => (
                                            <TableRow key={l.id}>
                                                <TableCell className="font-medium">{l.supplyItemName || '-'}</TableCell>
                                                <TableCell>{l.supplierName || '-'}</TableCell>
                                                <TableCell>{l.batchCode || '-'}</TableCell>
                                                <TableCell>{l.expiryDate || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        l.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                                                            l.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }>
                                                        {l.status || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
