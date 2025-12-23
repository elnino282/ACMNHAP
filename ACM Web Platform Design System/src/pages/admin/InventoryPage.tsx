import { useState, useEffect } from 'react';
import { Package, Warehouse, ArrowUpDown, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { adminWarehouseApi } from '@/services/api.admin';

interface WarehouseItem {
  id: number;
  name: string;
  type: string;
  farmId: number;
  farmName: string;
  locationCount: number;
}

interface StockMovement {
  id: number;
  movementDate: string;
  movementType: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  note: string;
  supplyLotId: number;
  supplyItemName: string;
  warehouseId: number;
  warehouseName: string;
}

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'movements'>('warehouses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminWarehouseApi.listAllMovements({ page, size: 20 });
      if (response?.result?.items) {
        setMovements(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load movements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'warehouses') {
      fetchWarehouses();
    } else {
      fetchMovements();
    }
  }, [activeTab, page]);

  const handleSearch = () => {
    setPage(0);
    if (activeTab === 'warehouses') {
      fetchWarehouses();
    }
  };

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
        <button
          onClick={fetchWarehouses}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Farm</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Locations</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
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
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
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
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
                  <td className="px-4 py-3 text-sm">{warehouse.locationCount || 0}</td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary hover:underline">View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  );

  const renderMovements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
        <button
          onClick={fetchMovements}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      movement.movementType === 'IN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      movement.movementType === 'OUT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {movement.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{movement.supplyItemName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{movement.quantity}</td>
                  <td className="px-4 py-3 text-sm">{movement.warehouseName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Inventory (System)</h1>
        <p className="text-muted-foreground">Manage warehouses and stock movements across all farms</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => { setActiveTab('warehouses'); setPage(0); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'warehouses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Warehouse className="inline-block h-4 w-4 mr-2" />
          Warehouses
        </button>
        <button
          onClick={() => { setActiveTab('movements'); setPage(0); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'movements'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpDown className="inline-block h-4 w-4 mr-2" />
          Movements
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'warehouses' && renderWarehouses()}
      {activeTab === 'movements' && renderMovements()}
    </div>
  );
}
