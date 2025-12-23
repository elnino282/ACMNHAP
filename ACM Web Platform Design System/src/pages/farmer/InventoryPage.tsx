import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Loader2, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi, type Warehouse, type StockLocation } from '@/entities/inventory/api/client';

/**
 * Inventory Page
 * 
 * Displays warehouses and stock movements for farmer's farms.
 */
export function InventoryPage() {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

    // Fetch warehouses
    const {
        data: warehouses,
        isLoading: warehousesLoading,
        error: warehousesError
    } = useQuery({
        queryKey: ['farmer', 'warehouses'],
        queryFn: inventoryApi.listWarehouses,
        staleTime: 5 * 60 * 1000,
    });

    const warehouseId = parseInt(selectedWarehouseId, 10);
    const hasWarehouse = !isNaN(warehouseId) && warehouseId > 0;

    // Set default warehouse when loaded
    useEffect(() => {
        if (warehouses?.length && !selectedWarehouseId) {
            setSelectedWarehouseId(String(warehouses[0].id));
        }
    }, [warehouses, selectedWarehouseId]);

    // Fetch locations for selected warehouse
    const {
        data: locations,
        isLoading: locationsLoading,
        error: locationsError
    } = useQuery({
        queryKey: ['farmer', 'warehouses', warehouseId, 'locations'],
        queryFn: () => inventoryApi.listLocations(warehouseId),
        enabled: hasWarehouse,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch movements for selected warehouse
    const {
        data: movementsData,
        isLoading: movementsLoading,
    } = useQuery({
        queryKey: ['farmer', 'warehouses', warehouseId, 'movements'],
        queryFn: () => inventoryApi.listMovements(warehouseId, { page: 0, size: 20 }),
        enabled: hasWarehouse,
        staleTime: 5 * 60 * 1000,
    });

    const selectedWarehouse = warehouses?.find((w: Warehouse) => w.id === warehouseId);

    // Loading state
    if (warehousesLoading) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
                    <p className="text-[#333333]/70">Loading inventory...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (warehousesError) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Failed to Load
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[#555555]">Unable to load warehouses. Please try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No warehouses state
    if (!warehouses?.length) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center p-6">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <Package className="w-12 h-12 mx-auto text-[#777777] opacity-50 mb-4" />
                        <CardTitle>No Warehouses Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[#555555]">You don't have any warehouses set up for your farms yet.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-[#9B59B6]" />
                <div>
                    <h1 className="text-3xl font-bold text-[#333333]">Inventory</h1>
                    <p className="text-[#777777]">Kho hàng & Vật tư</p>
                </div>
            </div>

            {/* Warehouse Selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-[#777777]" />
                        <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                            <SelectTrigger className="w-80">
                                <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((w: Warehouse) => (
                                    <SelectItem key={w.id} value={String(w.id)}>
                                        {w.name} - {w.farmName || 'Unknown Farm'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedWarehouse && (
                            <div className="ml-4 text-sm text-[#777777]">
                                <span className="font-medium">{selectedWarehouse.type || 'General'}</span>
                                {selectedWarehouse.locationCount !== null && (
                                    <span> • {selectedWarehouse.locationCount} locations</span>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stock Locations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Stock Locations
                    </CardTitle>
                    <CardDescription>
                        Physical storage areas within this warehouse
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {locationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                            <span className="ml-2 text-[#777777]">Loading locations...</span>
                        </div>
                    ) : locationsError ? (
                        <div className="flex items-center justify-center py-8 text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Failed to load locations
                        </div>
                    ) : !locations?.length ? (
                        <div className="text-center py-8 text-[#777777]">
                            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No locations defined for this warehouse</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Zone</TableHead>
                                    <TableHead className="w-[100px]">Aisle</TableHead>
                                    <TableHead className="w-[100px]">Shelf</TableHead>
                                    <TableHead className="w-[100px]">Bin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((loc: StockLocation) => (
                                    <TableRow key={loc.id}>
                                        <TableCell>{loc.zone || '-'}</TableCell>
                                        <TableCell>{loc.aisle || '-'}</TableCell>
                                        <TableCell>{loc.shelf || '-'}</TableCell>
                                        <TableCell>{loc.bin || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Recent Movements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        Recent Stock Movements
                    </CardTitle>
                    <CardDescription>
                        Latest inventory transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {movementsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                            <span className="ml-2 text-[#777777]">Loading movements...</span>
                        </div>
                    ) : !movementsData?.items?.length ? (
                        <div className="text-center py-8 text-[#777777]">
                            <ArrowRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No stock movements recorded</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Supply Item</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movementsData.items.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            {m.movementDate ? new Date(m.movementDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                m.movementType === 'IN' ? 'bg-green-100 text-green-800' :
                                                    m.movementType === 'OUT' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }>
                                                {m.movementType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{m.supplyItemName || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {m.quantity?.toString() || '-'}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {m.note || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
