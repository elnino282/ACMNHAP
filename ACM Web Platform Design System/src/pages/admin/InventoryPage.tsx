import { useState, useEffect } from 'react';
import { Package, Warehouse, ArrowUpDown, Search, Filter, RefreshCw, AlertCircle, MapPin, Box, Plus, Eye, BarChart3 } from 'lucide-react';
import { adminWarehouseApi, adminSupplierApi } from '@/services/api.admin';
import { RecordMovementModal } from './components/RecordMovementModal';
import { WarehouseDetailModal } from './components/WarehouseDetailModal';

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

interface WarehouseItem {
    id: number;
    name: string;
    type: string;
    farmId: number;
    farmName: string;
    provinceName: string | null;
    wardName: string | null;
    locationCount: number;
}

interface StockLocation {
    id: number;
    zone: string | null;
    aisle: string | null;
    shelf: string | null;
    bin: string | null;
    warehouseId: number;
    warehouseName?: string;
}

interface StockMovement {
    id: number;
    movementDate: string;
    movementType: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    note: string | null;
    supplyLotId: number;
    supplyItemName: string;
    warehouseId: number;
    warehouseName: string;
    locationId: number | null;
    seasonId: number | null;
}

interface SupplyLot {
    id: number;
    batchCode: string;
    expiryDate: string;
    status: string;
    supplierId: number;
    supplierName: string;
    supplyItemId: number;
    supplyItemName: string;
}

// ═══════════════════════════════════════════════════════════════
// MOVEMENT TYPE COLORS
// ═══════════════════════════════════════════════════════════════

const MOVEMENT_TYPE_COLORS: Record<string, string> = {
    IN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    OUT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ADJUST: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const LOT_STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    DEPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function InventoryPage() {
    // Tab state
    const [activeTab, setActiveTab] = useState<'warehouses' | 'locations' | 'movements' | 'lots'>('warehouses');

    // Data states
    const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
    const [locations, setLocations] = useState<StockLocation[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [supplyLots, setSupplyLots] = useState<SupplyLot[]>([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [movementTypeFilter, setMovementTypeFilter] = useState('');
    const [lotStatusFilter, setLotStatusFilter] = useState('');

    // Modals
    const [recordMovementOpen, setRecordMovementOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseItem | null>(null);
    const [warehouseDetailOpen, setWarehouseDetailOpen] = useState(false);

    // Stock check popup
    const [stockCheckLot, setStockCheckLot] = useState<SupplyLot | null>(null);
    const [stockCheckQuantity, setStockCheckQuantity] = useState<number | null>(null);
    const [stockCheckLoading, setStockCheckLoading] = useState(false);

    // ═══════════════════════════════════════════════════════════════
    // FETCH FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    const fetchWarehouses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminWarehouseApi.list({ page, size: 20, keyword: searchTerm || undefined });
            if (response?.result?.items) {
                setWarehouses(response.result.items);
                setTotalPages(response.result.totalPages || 0);
            }
        } catch (err) {
            setError('Failed to load warehouses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        setLoading(true);
        setError(null);
        try {
            // If warehouse filter is set, get locations for that warehouse
            // Otherwise we need to aggregate from all warehouses (simplified: just show message)
            if (warehouseFilter) {
                const response = await adminWarehouseApi.getLocations(parseInt(warehouseFilter));
                if (response?.result) {
                    const locs = response.result.map((l: StockLocation) => ({
                        ...l,
                        warehouseName: warehouses.find(w => w.id === l.warehouseId)?.name || 'Unknown'
                    }));
                    setLocations(locs);
                    setTotalPages(1);
                }
            } else {
                // Load locations from first few warehouses for demo
                // In production, you'd have a dedicated endpoint
                setLocations([]);
                setTotalPages(0);
            }
        } catch (err) {
            setError('Failed to load locations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovements = async () => {
        setLoading(true);
        setError(null);
        try {
            if (warehouseFilter) {
                const response = await adminWarehouseApi.getMovements(parseInt(warehouseFilter), { page, size: 20 });
                if (response?.result?.items) {
                    let filtered = response.result.items;
                    if (movementTypeFilter) {
                        filtered = filtered.filter((m: StockMovement) => m.movementType === movementTypeFilter);
                    }
                    setMovements(filtered);
                    setTotalPages(response.result.totalPages || 0);
                }
            } else {
                const response = await adminWarehouseApi.listAllMovements({ page, size: 20 });
                if (response?.result?.items) {
                    let filtered = response.result.items;
                    if (movementTypeFilter) {
                        filtered = filtered.filter((m: StockMovement) => m.movementType === movementTypeFilter);
                    }
                    setMovements(filtered);
                    setTotalPages(response.result.totalPages || 0);
                }
            }
        } catch (err) {
            setError('Failed to load movements');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplyLots = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminSupplierApi.listLots({
                page,
                size: 20,
                status: lotStatusFilter || undefined
            });
            if (response?.result?.items) {
                setSupplyLots(response.result.items);
                setTotalPages(response.result.totalPages || 0);
            }
        } catch (err) {
            setError('Failed to load supply lots');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkStock = async (lot: SupplyLot) => {
        if (!warehouses.length) {
            await fetchWarehouses();
        }
        setStockCheckLot(lot);
        setStockCheckLoading(true);
        setStockCheckQuantity(null);

        try {
            // Check stock in first warehouse (simplified - in production, show warehouse selector)
            if (warehouses.length > 0) {
                const qty = await adminWarehouseApi.getOnHandQuantity(lot.id, warehouses[0].id);
                setStockCheckQuantity(qty);
            } else {
                setStockCheckQuantity(0);
            }
        } catch (err) {
            console.error('Failed to check stock:', err);
            setStockCheckQuantity(0);
        } finally {
            setStockCheckLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (activeTab === 'warehouses') fetchWarehouses();
        else if (activeTab === 'locations') fetchLocations();
        else if (activeTab === 'movements') fetchMovements();
        else if (activeTab === 'lots') fetchSupplyLots();
    }, [activeTab, page]);

    useEffect(() => {
        if (activeTab === 'warehouses') {
            fetchWarehouses();
        }
    }, []);

    const handleSearch = () => {
        setPage(0);
        if (activeTab === 'warehouses') fetchWarehouses();
        else if (activeTab === 'movements') fetchMovements();
        else if (activeTab === 'lots') fetchSupplyLots();
    };

    const handleFilterChange = () => {
        setPage(0);
        if (activeTab === 'locations') fetchLocations();
        else if (activeTab === 'movements') fetchMovements();
        else if (activeTab === 'lots') fetchSupplyLots();
    };

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setPage(0);
        setSearchTerm('');
        setWarehouseFilter('');
        setMovementTypeFilter('');
        setLotStatusFilter('');
    };

    const handleMovementSuccess = () => {
        if (activeTab === 'movements') {
            fetchMovements();
        }
    };

    const openWarehouseDetail = (warehouse: WarehouseItem) => {
        setSelectedWarehouse(warehouse);
        setWarehouseDetailOpen(true);
    };

    // ═══════════════════════════════════════════════════════════════
    // RENDER: WAREHOUSES TAB
    // ═══════════════════════════════════════════════════════════════

    const renderWarehouses = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search warehouses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setRecordMovementOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Record Movement
                    </button>
                    <button
                        onClick={fetchWarehouses}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Farm</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock Locations</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <div className="flex flex-col items-center gap-2 text-destructive">
                                        <AlertCircle className="h-6 w-6" />
                                        {error}
                                        <button onClick={fetchWarehouses} className="text-sm text-primary hover:underline">
                                            Try again
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : warehouses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No warehouses found
                                </td>
                            </tr>
                        ) : (
                            warehouses.map((warehouse) => (
                                <tr key={warehouse.id} className="border-b border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm font-medium">{warehouse.name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                            {warehouse.type || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{warehouse.farmName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {warehouse.provinceName || warehouse.wardName
                                            ? `${warehouse.wardName || ''} ${warehouse.provinceName || ''}`.trim()
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {warehouse.locationCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => openWarehouseDetail(warehouse)}
                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════
    // RENDER: LOCATIONS TAB
    // ═══════════════════════════════════════════════════════════════

    const renderLocations = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={warehouseFilter}
                            onChange={(e) => { setWarehouseFilter(e.target.value); setTimeout(handleFilterChange, 0); }}
                            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        >
                            <option value="">Select Warehouse</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    onClick={fetchLocations}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {!warehouseFilter ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a warehouse to view its stock locations</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Zone</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aisle</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Shelf</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Bin</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Warehouse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading...
                                    </td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No stock locations found in this warehouse
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.id} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 text-sm font-medium">{loc.zone || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{loc.aisle || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{loc.shelf || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{loc.bin || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{loc.warehouseName}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════
    // RENDER: MOVEMENTS TAB
    // ═══════════════════════════════════════════════════════════════

    const renderMovements = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={warehouseFilter}
                            onChange={(e) => { setWarehouseFilter(e.target.value); setTimeout(handleFilterChange, 0); }}
                            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        <select
                            value={movementTypeFilter}
                            onChange={(e) => { setMovementTypeFilter(e.target.value); setTimeout(handleFilterChange, 0); }}
                            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="IN">IN (Inbound)</option>
                            <option value="OUT">OUT (Outbound)</option>
                            <option value="ADJUST">ADJUST (Audit)</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setRecordMovementOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Record Movement
                    </button>
                    <button
                        onClick={fetchMovements}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quantity</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Warehouse</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <div className="flex flex-col items-center gap-2 text-destructive">
                                        <AlertCircle className="h-6 w-6" />
                                        {error}
                                    </div>
                                </td>
                            </tr>
                        ) : movements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <ArrowUpDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No movements found
                                </td>
                            </tr>
                        ) : (
                            movements.map((movement) => (
                                <tr key={movement.id} className="border-b border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(movement.movementDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${MOVEMENT_TYPE_COLORS[movement.movementType] || 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {movement.movementType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{movement.supplyItemName || '-'}</td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        <span className={movement.movementType === 'OUT' ? 'text-red-600' : movement.movementType === 'IN' ? 'text-green-600' : ''}>
                                            {movement.movementType === 'OUT' ? '-' : movement.movementType === 'IN' ? '+' : ''}
                                            {movement.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{movement.warehouseName}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-xs">
                                        {movement.note || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════
    // RENDER: SUPPLY LOTS TAB
    // ═══════════════════════════════════════════════════════════════

    const renderSupplyLots = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={lotStatusFilter}
                            onChange={(e) => { setLotStatusFilter(e.target.value); setTimeout(handleFilterChange, 0); }}
                            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="DEPLETED">Depleted</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={fetchSupplyLots}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Batch Code</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Supplier</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Expiry</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <div className="flex flex-col items-center gap-2 text-destructive">
                                        <AlertCircle className="h-6 w-6" />
                                        {error}
                                    </div>
                                </td>
                            </tr>
                        ) : supplyLots.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No supply lots found
                                </td>
                            </tr>
                        ) : (
                            supplyLots.map((lot) => (
                                <tr key={lot.id} className="border-b border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm font-medium">{lot.batchCode}</td>
                                    <td className="px-4 py-3 text-sm">{lot.supplyItemName || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{lot.supplierName || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${LOT_STATUS_COLORS[lot.status] || 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {lot.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => checkStock(lot)}
                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                            Check Stock
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}

            {/* Stock Check Popup */}
            {stockCheckLot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setStockCheckLot(null)} />
                    <div className="relative bg-background border border-border rounded-lg shadow-xl p-6 min-w-[300px]">
                        <h3 className="text-lg font-semibold mb-4">Stock Check</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                <strong>Batch:</strong> {stockCheckLot.batchCode}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <strong>Item:</strong> {stockCheckLot.supplyItemName}
                            </p>
                            <div className="pt-2 border-t border-border">
                                <p className="text-sm">
                                    <strong>On-Hand Quantity:</strong>{' '}
                                    {stockCheckLoading ? (
                                        <RefreshCw className="inline h-4 w-4 animate-spin" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">{stockCheckQuantity}</span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    (Showing stock for first warehouse. Use movement recording for detailed stock by location.)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setStockCheckLot(null)}
                            className="mt-4 w-full px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════
    // RENDER: PAGINATION
    // ═══════════════════════════════════════════════════════════════

    const renderPagination = () => totalPages > 1 && (
        <div className="flex items-center justify-between">
            <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
            >
                Previous
            </button>
            <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
            </span>
            <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Inventory (System)</h1>
                <p className="text-muted-foreground">Manage warehouses, stock locations, and movements across all farms</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => handleTabChange('warehouses')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'warehouses'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Warehouse className="inline-block h-4 w-4 mr-2" />
                    Warehouses
                </button>
                <button
                    onClick={() => handleTabChange('locations')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'locations'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <MapPin className="inline-block h-4 w-4 mr-2" />
                    Locations
                </button>
                <button
                    onClick={() => handleTabChange('movements')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'movements'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <ArrowUpDown className="inline-block h-4 w-4 mr-2" />
                    Movements
                </button>
                <button
                    onClick={() => handleTabChange('lots')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'lots'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Box className="inline-block h-4 w-4 mr-2" />
                    Supply Lots
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'warehouses' && renderWarehouses()}
            {activeTab === 'locations' && renderLocations()}
            {activeTab === 'movements' && renderMovements()}
            {activeTab === 'lots' && renderSupplyLots()}

            {/* Modals */}
            <RecordMovementModal
                open={recordMovementOpen}
                onClose={() => setRecordMovementOpen(false)}
                onSuccess={handleMovementSuccess}
                warehouses={warehouses}
            />

            {selectedWarehouse && (
                <WarehouseDetailModal
                    warehouse={selectedWarehouse}
                    open={warehouseDetailOpen}
                    onClose={() => { setWarehouseDetailOpen(false); setSelectedWarehouse(null); }}
                />
            )}
        </div>
    );
}
