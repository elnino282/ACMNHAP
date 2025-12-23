import { useState, useEffect } from 'react';
import { Package, Truck, Box, Search, RefreshCw, AlertCircle, MoreHorizontal } from 'lucide-react';
import { adminSupplierApi } from '@/services/api.admin';

interface Supplier {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  licenseNo: string;
}

interface SupplyItem {
  id: number;
  name: string;
  unit: string;
  activeIngredient: string | null;
  restrictedFlag: boolean;
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

export function SuppliersSuppliesPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'items' | 'lots'>('suppliers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [supplyLots, setSupplyLots] = useState<SupplyLot[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminSupplierApi.list({ page, size: 20, keyword: searchTerm || undefined });
      if (response?.result?.items) {
        setSuppliers(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminSupplierApi.listItems({ page, size: 20, keyword: searchTerm || undefined });
      if (response?.result?.items) {
        setSupplyItems(response.result.items);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load supply items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminSupplierApi.listLots({ page, size: 20 });
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

  useEffect(() => {
    if (activeTab === 'suppliers') fetchSuppliers();
    else if (activeTab === 'items') fetchItems();
    else fetchLots();
  }, [activeTab, page]);

  const handleSearch = () => {
    setPage(0);
    if (activeTab === 'suppliers') fetchSuppliers();
    else if (activeTab === 'items') fetchItems();
  };

  const renderTable = (
    columns: string[],
    data: any[],
    renderRow: (item: any) => React.ReactNode
  ) => (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center">
                <div className="flex flex-col items-center gap-2 text-destructive">
                  <AlertCircle className="h-6 w-6" />
                  {error}
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                No data found
              </td>
            </tr>
          ) : (
            data.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64"
            />
          </div>
        </div>
        <button
          onClick={fetchSuppliers}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {renderTable(
        ['Name', 'Email', 'Phone', 'License', 'Actions'],
        suppliers,
        (supplier) => (
          <tr key={supplier.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{supplier.name}</td>
            <td className="px-4 py-3 text-sm">{supplier.contactEmail || '-'}</td>
            <td className="px-4 py-3 text-sm">{supplier.contactPhone || '-'}</td>
            <td className="px-4 py-3 text-sm">{supplier.licenseNo || '-'}</td>
            <td className="px-4 py-3">
              <button className="p-1 hover:bg-muted rounded">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )
      )}
    </div>
  );

  const renderItems = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64"
            />
          </div>
        </div>
        <button
          onClick={fetchItems}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {renderTable(
        ['Name', 'Unit', 'Active Ingredient', 'Restricted', 'Actions'],
        supplyItems,
        (item) => (
          <tr key={item.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
            <td className="px-4 py-3 text-sm">{item.unit}</td>
            <td className="px-4 py-3 text-sm">{item.activeIngredient || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {item.restrictedFlag ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Yes
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  No
                </span>
              )}
            </td>
            <td className="px-4 py-3">
              <button className="p-1 hover:bg-muted rounded">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )
      )}
    </div>
  );

  const renderLots = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm w-64"
            />
          </div>
        </div>
        <button
          onClick={fetchLots}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {renderTable(
        ['Batch Code', 'Item', 'Supplier', 'Expiry', 'Status', 'Actions'],
        supplyLots,
        (lot) => (
          <tr key={lot.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{lot.batchCode}</td>
            <td className="px-4 py-3 text-sm">{lot.supplyItemName || '-'}</td>
            <td className="px-4 py-3 text-sm">{lot.supplierName || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-3 text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                {lot.status || 'ACTIVE'}
              </span>
            </td>
            <td className="px-4 py-3">
              <button className="p-1 hover:bg-muted rounded">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )
      )}
    </div>
  );

  const Pagination = () => totalPages > 1 && (
    <div className="flex items-center justify-between mt-4">
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Suppliers & Supplies</h1>
        <p className="text-muted-foreground">Manage suppliers, supply items, and supply lots</p>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => { setActiveTab('suppliers'); setPage(0); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'suppliers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="inline-block h-4 w-4 mr-2" />
          Suppliers
        </button>
        <button
          onClick={() => { setActiveTab('items'); setPage(0); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'items'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="inline-block h-4 w-4 mr-2" />
          Supply Items
        </button>
        <button
          onClick={() => { setActiveTab('lots'); setPage(0); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'lots'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Box className="inline-block h-4 w-4 mr-2" />
          Supply Lots
        </button>
      </div>

      {activeTab === 'suppliers' && renderSuppliers()}
      {activeTab === 'items' && renderItems()}
      {activeTab === 'lots' && renderLots()}
      <Pagination />
    </div>
  );
}
