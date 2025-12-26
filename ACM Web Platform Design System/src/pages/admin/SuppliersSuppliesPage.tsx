import { useState, useEffect } from 'react';
import { Package, Truck, Box, Search, RefreshCw, AlertCircle, Plus, Edit, Trash2, Eye, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { adminSupplierApi, SupplierCreateRequest, SupplyItemCreateRequest, SupplyLotCreateRequest } from '@/services/api.admin';
import { toast } from 'sonner';

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
  category: string;
  unit: string;
  activeIngredient: string | null;
  restrictedFlag: boolean;
  description: string | null;
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
// FORM MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════

interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: React.ReactNode;
}

function FormModal({ title, isOpen, onClose, onSubmit, loading, children }: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
          <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/30">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONFIRM DELETE MODAL
// ═══════════════════════════════════════════════════════════════

interface ConfirmDeleteProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmDelete({ isOpen, title, message, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-sm mx-4 shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

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

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [editingLot, setEditingLot] = useState<SupplyLot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'supplier' | 'item' | 'lot', id: number, name: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [supplierForm, setSupplierForm] = useState<SupplierCreateRequest>({ name: '', licenseNo: '', contactEmail: '', contactPhone: '' });
  const [itemForm, setItemForm] = useState<SupplyItemCreateRequest>({ name: '', category: 'OTHER', unit: '', activeIngredient: '', restrictedFlag: false, description: '' });
  const [lotForm, setLotForm] = useState<SupplyLotCreateRequest>({ supplyItemId: 0, supplierId: undefined, batchCode: '', expiryDate: '', status: 'IN_STOCK' });

  // ═══════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════
  // CRUD HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const openSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({ name: supplier.name, licenseNo: supplier.licenseNo || '', contactEmail: supplier.contactEmail || '', contactPhone: supplier.contactPhone || '' });
    } else {
      setEditingSupplier(null);
      setSupplierForm({ name: '', licenseNo: '', contactEmail: '', contactPhone: '' });
    }
    setShowSupplierModal(true);
  };

  const openItemModal = (item?: SupplyItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ name: item.name, category: item.category || 'OTHER', unit: item.unit || '', activeIngredient: item.activeIngredient || '', restrictedFlag: item.restrictedFlag || false, description: item.description || '' });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', category: 'OTHER', unit: '', activeIngredient: '', restrictedFlag: false, description: '' });
    }
    setShowItemModal(true);
  };

  const openLotModal = (lot?: SupplyLot) => {
    if (lot) {
      setEditingLot(lot);
      setLotForm({ supplyItemId: lot.supplyItemId, supplierId: lot.supplierId || undefined, batchCode: lot.batchCode || '', expiryDate: lot.expiryDate || '', status: lot.status || 'IN_STOCK' });
    } else {
      setEditingLot(null);
      setLotForm({ supplyItemId: supplyItems[0]?.id || 0, supplierId: undefined, batchCode: '', expiryDate: '', status: 'IN_STOCK' });
    }
    setShowLotModal(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingSupplier) {
        await adminSupplierApi.update(editingSupplier.id, supplierForm);
        toast.success('Supplier updated successfully');
      } else {
        await adminSupplierApi.create(supplierForm);
        toast.success('Supplier created successfully');
      }
      setShowSupplierModal(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save supplier');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingItem) {
        await adminSupplierApi.updateItem(editingItem.id, itemForm);
        toast.success('Supply item updated successfully');
      } else {
        await adminSupplierApi.createItem(itemForm);
        toast.success('Supply item created successfully');
      }
      setShowItemModal(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save supply item');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveLot = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingLot) {
        await adminSupplierApi.updateLot(editingLot.id, lotForm);
        toast.success('Supply lot updated successfully');
      } else {
        await adminSupplierApi.createLot(lotForm);
        toast.success('Supply lot created successfully');
      }
      setShowLotModal(false);
      fetchLots();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to save supply lot';
      if (errorMsg.includes('license')) {
        toast.error('Restricted items require a supplier with a valid license');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      if (deleteTarget.type === 'supplier') {
        await adminSupplierApi.delete(deleteTarget.id);
        toast.success('Supplier deleted');
        fetchSuppliers();
      } else if (deleteTarget.type === 'item') {
        await adminSupplierApi.deleteItem(deleteTarget.id);
        toast.success('Supply item deleted');
        fetchItems();
      } else {
        await adminSupplierApi.deleteLot(deleteTarget.id);
        toast.success('Supply lot deleted');
        fetchLots();
      }
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete';
      if (err?.response?.status === 409) {
        toast.error(`Cannot delete: has active ${deleteTarget.type === 'supplier' ? 'lots' : deleteTarget.type === 'item' ? 'lots' : 'movements'}`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

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
        <div className="flex gap-2">
          <button
            onClick={() => openSupplierModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
          <button
            onClick={fetchSuppliers}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {renderTable(
        ['Name', 'Email', 'Phone', 'License', 'Actions'],
        suppliers,
        (supplier) => (
          <tr key={supplier.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{supplier.name}</td>
            <td className="px-4 py-3 text-sm">{supplier.contactEmail || '-'}</td>
            <td className="px-4 py-3 text-sm">{supplier.contactPhone || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {supplier.licenseNo ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {supplier.licenseNo}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => openSupplierModal(supplier)} className="p-1.5 hover:bg-muted rounded" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget({ type: 'supplier', id: supplier.id, name: supplier.name })} className="p-1.5 hover:bg-destructive/10 text-destructive rounded" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
        <div className="flex gap-2">
          <button
            onClick={() => openItemModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Supply Item
          </button>
          <button
            onClick={fetchItems}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {renderTable(
        ['Name', 'Category', 'Unit', 'Active Ingredient', 'Restricted', 'Actions'],
        supplyItems,
        (item) => (
          <tr key={item.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
            <td className="px-4 py-3 text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                {item.category || 'OTHER'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm">{item.unit || '-'}</td>
            <td className="px-4 py-3 text-sm">{item.activeIngredient || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {item.restrictedFlag ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <ShieldAlert className="h-3 w-3" />
                  Restricted
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  No
                </span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => openItemModal(item)} className="p-1.5 hover:bg-muted rounded" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })} className="p-1.5 hover:bg-destructive/10 text-destructive rounded" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
        <div className="flex gap-2">
          <button
            onClick={() => openLotModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Supply Lot
          </button>
          <button
            onClick={fetchLots}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {renderTable(
        ['Batch Code', 'Item', 'Supplier', 'Expiry', 'Status', 'Actions'],
        supplyLots,
        (lot) => (
          <tr key={lot.id} className="border-b border-border hover:bg-muted/30">
            <td className="px-4 py-3 text-sm font-medium">{lot.batchCode || '-'}</td>
            <td className="px-4 py-3 text-sm">{lot.supplyItemName || '-'}</td>
            <td className="px-4 py-3 text-sm">{lot.supplierName || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-3 text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${lot.status === 'IN_STOCK' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  lot.status === 'USED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                    'bg-primary/10 text-primary'
                }`}>
                {lot.status || 'ACTIVE'}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => openLotModal(lot)} className="p-1.5 hover:bg-muted rounded" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget({ type: 'lot', id: lot.id, name: lot.batchCode || `Lot #${lot.id}` })} className="p-1.5 hover:bg-destructive/10 text-destructive rounded" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'suppliers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Truck className="inline-block h-4 w-4 mr-2" />
          Suppliers
        </button>
        <button
          onClick={() => { setActiveTab('items'); setPage(0); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'items'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Package className="inline-block h-4 w-4 mr-2" />
          Supply Items
        </button>
        <button
          onClick={() => { setActiveTab('lots'); setPage(0); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'lots'
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

      {/* Supplier Modal */}
      <FormModal
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSubmit={handleSaveSupplier}
        loading={modalLoading}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={supplierForm.name}
            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License No</label>
          <input
            type="text"
            value={supplierForm.licenseNo}
            onChange={(e) => setSupplierForm({ ...supplierForm, licenseNo: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            placeholder="Required for restricted items"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={supplierForm.contactEmail}
            onChange={(e) => setSupplierForm({ ...supplierForm, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            value={supplierForm.contactPhone}
            onChange={(e) => setSupplierForm({ ...supplierForm, contactPhone: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
      </FormModal>

      {/* Supply Item Modal */}
      <FormModal
        title={editingItem ? 'Edit Supply Item' : 'Add Supply Item'}
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSubmit={handleSaveItem}
        loading={modalLoading}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={itemForm.category}
            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
          >
            <option value="FERTILIZER">Fertilizer</option>
            <option value="PESTICIDE">Pesticide</option>
            <option value="SEED">Seed</option>
            <option value="TOOL">Tool</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            type="text"
            value={itemForm.unit}
            onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            placeholder="kg, liters, bags..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Active Ingredient</label>
          <input
            type="text"
            value={itemForm.activeIngredient}
            onChange={(e) => setItemForm({ ...itemForm, activeIngredient: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="restrictedFlag"
            checked={itemForm.restrictedFlag}
            onChange={(e) => setItemForm({ ...itemForm, restrictedFlag: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="restrictedFlag" className="text-sm font-medium">Restricted Item</label>
        </div>
        {itemForm.restrictedFlag && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Restricted items require suppliers to have a valid license number. All movements will be tracked.
              </p>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            rows={2}
          />
        </div>
      </FormModal>

      {/* Supply Lot Modal */}
      <FormModal
        title={editingLot ? 'Edit Supply Lot' : 'Add Supply Lot'}
        isOpen={showLotModal}
        onClose={() => setShowLotModal(false)}
        onSubmit={handleSaveLot}
        loading={modalLoading}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Supply Item *</label>
          <select
            value={lotForm.supplyItemId}
            onChange={(e) => setLotForm({ ...lotForm, supplyItemId: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
            required
          >
            <option value={0}>Select item...</option>
            {supplyItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.restrictedFlag && '(Restricted)'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <select
            value={lotForm.supplierId || ''}
            onChange={(e) => setLotForm({ ...lotForm, supplierId: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
          >
            <option value="">Select supplier...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.licenseNo && `(Licensed)`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Batch Code</label>
          <input
            type="text"
            value={lotForm.batchCode}
            onChange={(e) => setLotForm({ ...lotForm, batchCode: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <input
            type="date"
            value={lotForm.expiryDate}
            onChange={(e) => setLotForm({ ...lotForm, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={lotForm.status}
            onChange={(e) => setLotForm({ ...lotForm, status: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
          >
            <option value="IN_STOCK">In Stock</option>
            <option value="USED">Used</option>
            <option value="DISPOSED">Disposed</option>
          </select>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDelete
        isOpen={!!deleteTarget}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={modalLoading}
      />
    </div>
  );
}
