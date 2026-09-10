import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Image as ImageIcon,
  AlertCircle,
  MoreVertical,
  UtensilsCrossed,
  Sparkles,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Category, MenuItem } from '../types';
import { ImageUpload } from '../components/ImageUpload';
import { MenuPreviewModal } from '../components/MenuPreviewModal';

export function MenuEditor() {
  const {
    activeRestaurant,
    categories,
    menuItems,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    reorderItems,
  } = useRestaurant();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  if (!activeRestaurant) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
        <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Aucun restaurant actif</h3>
      </div>
    );
  }

  // Handle Category Modal
  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryDesc(cat.description);
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDesc('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: categoryName.trim(),
        description: categoryDesc.trim(),
      });
    } else {
      const created = await addCategory({
        name: categoryName.trim(),
        description: categoryDesc.trim(),
      });
      setSelectedCategoryId(created.id);
    }

    setIsCategoryModalOpen(false);
  };

  // Reorder Categories
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const copy = [...categories];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    await reorderCategories(copy);
  };

  // Handle Item Modal
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemDesc(item.description);
      setItemPrice(item.price);
      setItemCategoryId(item.category_id);
      setItemImage(item.image_url);
      setItemAvailable(item.is_available);
    } else {
      setEditingItem(null);
      setItemName('');
      setItemDesc('');
      setItemPrice('');
      setItemCategoryId(
        selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || ''
      );
      setItemImage('');
      setItemAvailable(true);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemPrice === '' || !itemCategoryId) return;

    if (editingItem) {
      await updateItem(editingItem.id, {
        name: itemName.trim(),
        description: itemDesc.trim(),
        price: Number(itemPrice),
        category_id: itemCategoryId,
        image_url: itemImage,
        is_available: itemAvailable,
      });
    } else {
      await addItem({
        category_id: itemCategoryId,
        name: itemName.trim(),
        description: itemDesc.trim(),
        price: Number(itemPrice),
        image_url: itemImage,
        is_available: itemAvailable,
      });
    }

    setIsItemModalOpen(false);
  };

  // Reorder items in a category
  const moveItem = async (item: MenuItem, direction: 'up' | 'down') => {
    const siblings = menuItems
      .filter(i => i.category_id === item.category_id)
      .sort((a, b) => a.display_order - b.display_order);

    const index = siblings.findIndex(i => i.id === item.id);
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= siblings.length) return;

    const copy = [...siblings];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    await reorderItems(copy);
  };

  // Filtered menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCat =
      selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            Mon Menu
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Organisez vos catégories, ajustez vos prix et actualisez vos disponibilités en direct.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>Prévisualiser le menu</span>
          </button>

          <button
            onClick={() => openCategoryModal()}
            className="px-4 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-stone-500" />
            <span>Nouvelle Catégorie</span>
          </button>

          <button
            onClick={() => openItemModal()}
            disabled={categories.length === 0}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Plat</span>
          </button>
        </div>
      </div>

      {/* Categories Toolbar & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                selectedCategoryId === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tous les plats ({menuItems.length})
            </button>
            {categories.map((cat, idx) => {
              const count = menuItems.filter(i => i.category_id === cat.id).length;
              return (
                <div key={cat.id} className="inline-flex items-center shrink-0">
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedCategoryId === cat.id
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {!cat.is_visible && <EyeOff className="w-3 h-3 text-stone-400" />}
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategoryId === cat.id
                          ? 'bg-stone-700 text-stone-200'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>
        </div>

        {/* Categories Reordering & Quick Management if a specific category is selected */}
        {selectedCategoryId !== 'all' && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            {(() => {
              const activeCat = categories.find(c => c.id === selectedCategoryId);
              const catIndex = categories.findIndex(c => c.id === selectedCategoryId);
              if (!activeCat) return null;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800">Catégorie : {activeCat.name}</span>
                    {activeCat.description && (
                      <span className="text-stone-500 italic truncate max-w-sm">
                        « {activeCat.description} »
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveCategory(catIndex, 'up')}
                      disabled={catIndex === 0}
                      title="Monter la catégorie"
                      className="p-1 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveCategory(catIndex, 'down')}
                      disabled={catIndex === categories.length - 1}
                      title="Descendre la catégorie"
                      className="p-1 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        updateCategory(activeCat.id, { is_visible: !activeCat.is_visible })
                      }
                      className="p-1.5 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                      title={activeCat.is_visible ? 'Masquer la catégorie' : 'Afficher la catégorie'}
                    >
                      {activeCat.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => openCategoryModal(activeCat)}
                      className="p-1.5 rounded bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                      title="Renommer la catégorie"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la catégorie "${activeCat.name}" et tous ses plats associés ?`)) {
                          deleteCategory(activeCat.id);
                          setSelectedCategoryId('all');
                        }
                      }}
                      className="p-1.5 rounded bg-white border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Empty State: No categories */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            Commencez par créer votre première catégorie
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto">
            Créez par exemple « Entrées », « Plats Chauds », « Pizzas » ou « Boissons » pour organiser votre carte.
          </p>
          <button
            onClick={() => openCategoryModal()}
            className="mt-5 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Créer ma première catégorie
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State: No items in filtered selection */
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-stone-100 text-stone-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            Ajoutez votre premier plat ou produit
          </h3>
          <p className="text-xs text-stone-500 mt-1.5">
            {searchQuery
              ? 'Aucun résultat correspondant à votre recherche.'
              : 'Cette catégorie ne contient aucun plat pour l’instant.'}
          </p>
          <button
            onClick={() => openItemModal()}
            className="mt-5 px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Ajouter un plat
          </button>
        </div>
      ) : (
        /* Menu Items Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const category = categories.find(c => c.id === item.category_id);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md flex flex-col overflow-hidden group ${
                  item.is_available ? 'border-stone-200' : 'border-stone-200 bg-stone-50/70 opacity-80'
                }`}
              >
                {/* Food Image Container */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
                        !item.is_available ? 'grayscale' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-100">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[11px] font-medium text-stone-400">Sans image</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer ${
                        item.is_available
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-stone-800 text-stone-200 hover:bg-stone-900'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.is_available ? 'bg-white' : 'bg-red-400'
                        }`}
                      />
                      <span>{item.is_available ? 'Disponible' : 'En rupture'}</span>
                    </button>
                  </div>

                  {/* Price Tag Badge */}
                  <div className="absolute bottom-2.5 right-2.5 bg-stone-900/90 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                    {item.price} {activeRestaurant.currency}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 font-semibold mb-1">
                      <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                        {category?.name || 'Sans catégorie'}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-amber-800 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Aucune description rédigée.'}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveItem(item, 'up')}
                        title="Monter"
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(item, 'down')}
                        title="Descendre"
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openItemModal(item)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition flex items-center gap-1 font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer définitivement "${item.name}" ?`)) {
                            deleteItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  placeholder="Ex: Tajines & Spécialités"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description courte (Optionnelle)
                </label>
                <input
                  type="text"
                  value={categoryDesc}
                  onChange={e => setCategoryDesc(e.target.value)}
                  placeholder="Ex: Préparés minute dans la tradition marocaine"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl shadow-xs transition"
                >
                  {editingCategory ? 'Enregistrer' : 'Créer la catégorie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENU ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50 shrink-0">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Modifier le plat' : 'Ajouter un plat au menu'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom du plat *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    placeholder="Ex: Tajine d'agneau aux pruneaux"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={itemCategoryId}
                    onChange={e => setItemCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Prix ({activeRestaurant.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={itemPrice}
                    onChange={e =>
                      setItemPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="Ex: 140"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Disponibilité en salle
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={itemAvailable}
                        onChange={e => setItemAvailable(e.target.checked)}
                        className="rounded text-amber-700 focus:ring-amber-600 w-4 h-4"
                      />
                      <span>Disponible immédiatement</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description & Ingrédients
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  placeholder="Décrivez les ingrédients, cuisson et saveurs pour mettre en appétit le client..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Photo Upload & Gallery */}
              <ImageUpload
                value={itemImage}
                onChange={setItemImage}
                label="Photo du plat (Indispensable pour le client)"
                placeholderText="Cliquez pour importer ou choisir une photo culinaire"
              />

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl shadow-xs transition"
                >
                  {editingItem ? 'Enregistrer les modifications' : 'Ajouter au menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPreviewModalOpen && activeRestaurant && (
        <MenuPreviewModal
          restaurant={activeRestaurant}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}
