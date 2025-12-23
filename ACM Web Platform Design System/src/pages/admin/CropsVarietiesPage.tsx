import { useState, useEffect } from 'react';
import { Leaf, Sprout, Search, RefreshCw, AlertCircle, Plus, Edit, X } from 'lucide-react';
import { adminCropApi, adminVarietyApi } from '@/services/api.admin';

interface Crop {
  id: number;
  cropName: string;
  description: string | null;
}

interface Variety {
  id: number;
  name: string;
  description: string | null;
  cropId: number;
  cropName: string;
}

export function CropsVarietiesPage() {
  const [activeTab, setActiveTab] = useState<'crops' | 'varieties'>('crops');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  
  // Filter state
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  
  // Form states
  const [showCropForm, setShowCropForm] = useState(false);
  const [showVarietyForm, setShowVarietyForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form fields
  const [cropName, setCropName] = useState('');
  const [cropDescription, setCropDescription] = useState('');
  const [varietyName, setVarietyName] = useState('');
  const [varietyDescription, setVarietyDescription] = useState('');
  const [varietyCropId, setVarietyCropId] = useState<number | null>(null);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminCropApi.list();
      if (response?.result) {
        setCrops(Array.isArray(response.result) ? response.result : []);
      }
    } catch (err) {
      setError('Failed to load crops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVarieties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminVarietyApi.list(selectedCropId || undefined);
      if (response?.result) {
        setVarieties(Array.isArray(response.result) ? response.result : []);
      }
    } catch (err) {
      setError('Failed to load varieties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (activeTab === 'varieties') {
      fetchVarieties();
    }
  }, [activeTab, selectedCropId]);

  const openCropForm = (crop?: Crop) => {
    if (crop) {
      setEditingCrop(crop);
      setCropName(crop.cropName);
      setCropDescription(crop.description || '');
    } else {
      setEditingCrop(null);
      setCropName('');
      setCropDescription('');
    }
    setShowCropForm(true);
  };

  const openVarietyForm = (variety?: Variety) => {
    if (variety) {
      setEditingVariety(variety);
      setVarietyName(variety.name);
      setVarietyDescription(variety.description || '');
      setVarietyCropId(variety.cropId);
    } else {
      setEditingVariety(null);
      setVarietyName('');
      setVarietyDescription('');
      setVarietyCropId(selectedCropId || (crops[0]?.id || null));
    }
    setShowVarietyForm(true);
  };

  const handleSaveCrop = async () => {
    if (!cropName.trim()) return;
    
    setFormLoading(true);
    try {
      if (editingCrop) {
        await adminCropApi.update(editingCrop.id, { cropName, description: cropDescription });
      } else {
        await adminCropApi.create({ cropName, description: cropDescription });
      }
      setShowCropForm(false);
      fetchCrops();
    } catch (err) {
      console.error('Failed to save crop:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveVariety = async () => {
    if (!varietyName.trim() || !varietyCropId) return;
    
    setFormLoading(true);
    try {
      if (editingVariety) {
        await adminVarietyApi.update(editingVariety.id, { 
          name: varietyName, 
          cropId: varietyCropId, 
          description: varietyDescription 
        });
      } else {
        await adminVarietyApi.create({ 
          name: varietyName, 
          cropId: varietyCropId, 
          description: varietyDescription 
        });
      }
      setShowVarietyForm(false);
      fetchVarieties();
    } catch (err) {
      console.error('Failed to save variety:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const renderCrops = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{crops.length} crops</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCropForm()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Crop
          </button>
          <button
            onClick={fetchCrops}
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
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                    <button onClick={fetchCrops} className="text-sm text-primary hover:underline">
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : crops.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  <Leaf className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No crops found
                </td>
              </tr>
            ) : (
              crops.map((crop) => (
                <tr key={crop.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{crop.cropName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{crop.description || '-'}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => openCropForm(crop)}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVarieties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={selectedCropId || ''}
            onChange={(e) => setSelectedCropId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          >
            <option value="">All Crops</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.cropName}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">{varieties.length} varieties</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openVarietyForm()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Variety
          </button>
          <button
            onClick={fetchVarieties}
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
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Crop</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    {error}
                    <button onClick={fetchVarieties} className="text-sm text-primary hover:underline">
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : varieties.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  <Sprout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No varieties found
                </td>
              </tr>
            ) : (
              varieties.map((variety) => (
                <tr key={variety.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{variety.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {variety.cropName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{variety.description || '-'}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => openVarietyForm(variety)}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Crops & Varieties</h1>
        <p className="text-muted-foreground">Manage the catalog of crops and varieties</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'crops'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Leaf className="inline-block h-4 w-4 mr-2" />
          Crops
        </button>
        <button
          onClick={() => setActiveTab('varieties')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'varieties'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout className="inline-block h-4 w-4 mr-2" />
          Varieties
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'crops' && renderCrops()}
      {activeTab === 'varieties' && renderVarieties()}

      {/* Crop Form Modal */}
      {showCropForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{editingCrop ? 'Edit Crop' : 'Add Crop'}</h3>
              <button onClick={() => setShowCropForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  placeholder="e.g., Rice, Corn, Wheat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={cropDescription}
                  onChange={(e) => setCropDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm min-h-[80px]"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowCropForm(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCrop}
                disabled={formLoading || !cropName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variety Form Modal */}
      {showVarietyForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{editingVariety ? 'Edit Variety' : 'Add Variety'}</h3>
              <button onClick={() => setShowVarietyForm(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Crop *</label>
                <select
                  value={varietyCropId || ''}
                  onChange={(e) => setVarietyCropId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                >
                  <option value="">Select a crop</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.cropName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={varietyName}
                  onChange={(e) => setVarietyName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  placeholder="e.g., Jasmine 85, Golden Grain"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={varietyDescription}
                  onChange={(e) => setVarietyDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm min-h-[80px]"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowVarietyForm(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVariety}
                disabled={formLoading || !varietyName.trim() || !varietyCropId}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
