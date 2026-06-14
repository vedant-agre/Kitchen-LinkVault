import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, Grid, List as ListIcon, Activity, CheckSquare, X, FolderInput, Tag, Trash2, Share2, Globe, Edit2, Plus } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getCategories, getLinks, deleteLink, bulkDeleteLinks, bulkUpdateLinks, bulkAddTagToLinks, updateLink, incrementLinkClick, updateCategory, deleteCategory, addCategory } from '../lib/db';
import { logout } from '../lib/auth';
import { CategoryTab } from '../components/ui/CategoryTab';
import { QuickAddBar } from '../components/QuickAddBar';
import { LinkList } from '../components/LinkList';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EditLinkModal } from '../components/EditLinkModal';
import { AddEditCategoryModal } from '../components/AddEditCategoryModal';
import { BulkTagModal } from '../components/BulkTagModal';

const SMART_COLLECTIONS = [
  { id: 'all', name: 'All Links', isSmart: true },
  { id: 'recent', name: 'Added This Week', isSmart: true },
  { id: 'popular', name: 'Most Clicked', isSmart: true },
  { id: 'revisit', name: 'To Revisit', isSmart: true }
];

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState(SMART_COLLECTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [checkingDeadLinks, setCheckingDeadLinks] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState(null);
  const [categoryModalState, setCategoryModalState] = useState({ isOpen: false, mode: 'add', category: null, isDeleting: false });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchData(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async (uid) => {
    setLoading(true);
    try {
      const [fetchedCategories, fetchedLinks] = await Promise.all([
        getCategories(uid),
        getLinks(uid)
      ]);
      setCategories(fetchedCategories);
      setLinks(fetchedLinks);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // -------------------------------------------------------------
  // Bulk Actions & Interactions
  // -------------------------------------------------------------

  const handleToggleSelect = (id) => {
    setSelectedLinks(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => setSelectedLinks([]);

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedLinks.length} links?`)) {
      await bulkDeleteLinks(user.uid, selectedLinks);
      setLinks(links.filter(l => !selectedLinks.includes(l.id)));
      setSelectedLinks([]);
    }
  };

  const handleBulkTag = async (tag) => {
    await bulkAddTagToLinks(user.uid, selectedLinks, tag);
    setIsTagModalOpen(false);
    handleClearSelection();
    fetchData(user.uid);
  };


  const handleDeleteLink = async (link) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteLink(user.uid, link.id);
        setLinks(links.filter(l => l.id !== link.id));
      } catch (err) {
        console.error("Failed to delete link", err);
      }
    }
  };

  const handleStatusToggle = async (link) => {
    const nextStatus = link.status === 'saved' ? 'to-revisit' : (link.status === 'to-revisit' ? 'read' : 'saved');
    await updateLink(user.uid, link.id, { status: nextStatus });
    setLinks(links.map(l => l.id === link.id ? { ...l, status: nextStatus } : l));
  };

  const handleClickLink = async (link) => {
    // Open the link in a new tab
    window.open(link.url, '_blank', 'noopener,noreferrer');
    
    // Increment click count without blocking UI
    incrementLinkClick(user.uid, link.id).catch(console.error);
    setLinks(links.map(l => l.id === link.id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l));
  };

  const checkDeadLinks = async () => {
    setCheckingDeadLinks(true);
    for (const link of filteredLinks) {
      try {
        await fetch(link.url, { mode: 'no-cors' });
      } catch (err) {
        console.warn(`Link dead or blocked: ${link.url}`);
        updateLink(user.uid, link.id, { tags: [...(link.tags || []), 'dead-link'] });
      }
    }
    fetchData(user.uid);
    setCheckingDeadLinks(false);
    alert("Dead link check complete. Broken links tagged with 'dead-link'.");
  };

  const handleShareCategory = async () => {
    if (!activeCategory || activeCategory.isSmart) return;
    
    const newIsPublic = !activeCategory.isPublic;
    
    // Update DB
    await updateCategory(user.uid, activeCategory.id, { isPublic: newIsPublic });
    
    // Update local state
    setCategories(categories.map(c => c.id === activeCategory.id ? { ...c, isPublic: newIsPublic } : c));
    setActiveCategory({ ...activeCategory, isPublic: newIsPublic });

    if (newIsPublic) {
      const shareUrl = `${window.location.origin}/collection/${user.uid}/${activeCategory.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert(`Category is now public!\nShareable link copied to clipboard:\n${shareUrl}`);
    } else {
      alert("Category is now private.");
    }
  };

  const handleEditCategoryClick = () => {
    if (!activeCategory || activeCategory.isSmart) return;
    setCategoryModalState({ isOpen: true, mode: 'edit', category: activeCategory, isDeleting: false });
  };

  const handleHeaderDeleteClick = () => {
    if (!activeCategory || activeCategory.isSmart || activeCategory.name?.toLowerCase() === 'unsorted') return;
    setCategoryModalState({ isOpen: true, mode: 'edit', category: activeCategory, isDeleting: true });
  };

  const handleModalDeleteCategory = async (catToDelete) => {
    if (!catToDelete || catToDelete.isSmart || catToDelete.name?.toLowerCase() === 'unsorted') return;
    const unsortedCat = categories.find(c => c.name.toLowerCase() === 'unsorted');
    if (unsortedCat) {
      const linksToMove = links.filter(l => l.categoryId === catToDelete.id).map(l => l.id);
      if (linksToMove.length > 0) {
        await bulkUpdateLinks(user.uid, linksToMove, { categoryId: unsortedCat.id });
      }
    }
    await deleteCategory(user.uid, catToDelete.id);
    fetchData(user.uid);
    if (activeCategory.id === catToDelete.id) {
      setActiveCategory(SMART_COLLECTIONS[0]);
    }
    setCategoryModalState({ isOpen: false, mode: 'add', category: null, isDeleting: false });
  };

  const handleAddCategoryClick = () => {
    setCategoryModalState({ isOpen: true, mode: 'add', category: null, isDeleting: false });
  };

  const handleSaveCategory = async (name, color) => {
    if (categoryModalState.mode === 'add') {
      await addCategory(user.uid, name, color, categories.length + 1);
    } else if (categoryModalState.mode === 'edit' && categoryModalState.category) {
      await updateCategory(user.uid, categoryModalState.category.id, { name, color });
      if (activeCategory.id === categoryModalState.category.id) {
        setActiveCategory(prev => ({ ...prev, name, color }));
      }
    }
    setCategoryModalState({ isOpen: false, mode: 'add', category: null, isDeleting: false });
    fetchData(user.uid);
  };

  // -------------------------------------------------------------
  // Filtering & Smart Collections
  // -------------------------------------------------------------

  const filteredLinks = links.filter(link => {
    // 1. Category / Smart Collection filter
    let matchesCategory = false;
    
    if (activeCategory.isSmart) {
      if (activeCategory.id === 'all') matchesCategory = true;
      if (activeCategory.id === 'recent') {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchesCategory = (link.createdAt?.toMillis() || 0) > oneWeekAgo;
      }
      if (activeCategory.id === 'popular') matchesCategory = true; // Sort handled below
      if (activeCategory.id === 'revisit') matchesCategory = link.status === 'to-revisit';
    } else {
      matchesCategory = activeCategory.name === "Unsorted" 
        ? link.categoryId === activeCategory.id || !link.categoryId
        : link.categoryId === activeCategory.id;
    }
    
    // 2. Search filter
    if (!searchQuery) return matchesCategory;

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (link.title && link.title.toLowerCase().includes(query)) ||
      (link.note && link.note.toLowerCase().includes(query)) ||
      (link.url && link.url.toLowerCase().includes(query)) ||
      (link.source && link.source.toLowerCase().includes(query)) ||
      (link.tags && link.tags.some(tag => tag.toLowerCase().includes(query)));
    
    return matchesCategory && matchesSearch;
  });

  // Sort popular first if active category is 'popular'
  if (activeCategory.id === 'popular') {
    filteredLinks.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  } else {
    // Default: newest first
    filteredLinks.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-canvas flex items-center justify-center text-on-dark text-label-uppercase">LOADING...</div>;
  }

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-canvas/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-hairline transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-hairline h-16 flex items-center justify-between shrink-0">
          <h2 className="text-title-md text-on-dark font-bold tracking-tight">LINKVAULT</h2>
          <button className="md:hidden text-muted" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 pb-24">
          <div className="text-caption text-muted mb-4 uppercase tracking-widest">Smart Collections</div>
          <div className="flex flex-col gap-1 mb-8">
            {SMART_COLLECTIONS.map(cat => (
              <CategoryTab 
                key={cat.id} 
                category={cat} 
                isActive={activeCategory?.id === cat.id}
                onClick={(c) => { setActiveCategory(c); setSidebarOpen(false); }} 
              />
            ))}
          </div>

          <div className="text-caption text-muted mb-4 uppercase tracking-widest flex items-center justify-between">
            <span>Categories</span>
            <button onClick={handleAddCategoryClick} className="hover:text-on-dark transition-colors" title="Add Category">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {categories.map(cat => (
              <div key={cat.id} style={{ paddingLeft: cat.parentId ? '1rem' : '0' }}>
                <CategoryTab 
                  category={cat} 
                  isActive={activeCategory?.id === cat.id}
                  onClick={(c) => { setActiveCategory(c); setSidebarOpen(false); }} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-hairline bg-surface-card flex items-center gap-3 shrink-0">
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-hairline" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <div className="text-body-sm text-on-dark truncate">{user.displayName}</div>
          </div>
          <button onClick={handleLogout} className="text-muted hover:text-on-dark transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red z-50" />
        
        {/* Header */}
        <header className="h-16 border-b border-hairline flex items-center px-4 md:px-8 bg-canvas shrink-0 gap-4">
          <button 
            className="md:hidden text-muted hover:text-on-dark transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <h1 className="text-display-sm text-on-dark truncate">
              {activeCategory?.name?.toUpperCase() || 'COLLECTION'}
            </h1>
            {!activeCategory?.isSmart && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShareCategory}
                  className={`p-2 transition-colors flex items-center gap-2 border border-hairline text-label-uppercase text-[10px] ${activeCategory?.isPublic ? 'text-m-blue-light border-m-blue-light bg-surface-elevated' : 'text-muted hover:text-on-dark'}`}
                  title="Toggle Public Sharing"
                >
                  {activeCategory?.isPublic ? <Globe size={14} /> : <Share2 size={14} />}
                  <span className="hidden sm:inline">{activeCategory?.isPublic ? 'PUBLIC' : 'SHARE'}</span>
                </button>
                <button 
                  onClick={handleEditCategoryClick}
                  className="p-2 transition-colors border border-hairline text-muted hover:text-on-dark hover:border-muted flex items-center gap-2"
                  title="Rename Category"
                >
                  <Edit2 size={14} />
                </button>
                {activeCategory?.name?.toLowerCase() !== 'unsorted' && (
                  <button 
                    onClick={handleHeaderDeleteClick}
                    className="p-2 transition-colors border border-hairline text-muted hover:text-m-red hover:border-m-red flex items-center gap-2"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={checkDeadLinks}
              disabled={checkingDeadLinks}
              className="text-label-uppercase text-muted hover:text-on-dark transition-colors flex items-center gap-2"
            >
              <Activity size={16} />
              {checkingDeadLinks ? 'CHECKING...' : 'CHECK LINKS'}
            </button>
          </div>

          <div className="relative hidden md:block w-64 ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <Input 
              placeholder="SEARCH LINKS..." 
              className="w-full pl-10 !h-10 text-body-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 border-l border-hairline pl-4 ml-4">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-on-dark' : 'text-muted hover:text-on-dark'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'text-on-dark' : 'text-muted hover:text-on-dark'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="relative md:hidden mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <Input 
              placeholder="SEARCH LINKS..." 
              className="w-full pl-10 !h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <QuickAddBar 
            categories={categories}
            defaultCategoryId={activeCategory?.isSmart ? null : activeCategory?.id} 
            onAddSuccess={() => fetchData(user.uid)} 
          />
          
          <LinkList 
            links={filteredLinks} 
            viewMode={viewMode} 
            selectedLinks={selectedLinks}
            onToggleSelect={handleToggleSelect}
            onEdit={(link) => setLinkToEdit(link)}
            onDelete={handleDeleteLink}
            onStatusToggle={handleStatusToggle}
            onClickLink={handleClickLink}
          />
        </div>

        {/* Bulk Action Bar */}
        {selectedLinks.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-elevated border border-m-blue-light shadow-2xl p-4 flex items-center gap-6 z-50">
            <div className="flex items-center gap-2 text-on-dark font-bold">
              <CheckSquare size={20} className="text-m-blue-light" />
              <span>{selectedLinks.length} SELECTED</span>
            </div>
            
            <div className="w-px h-6 bg-hairline"></div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setIsTagModalOpen(true)} className="flex items-center gap-2 text-label-uppercase text-on-dark hover:text-m-blue-light transition-colors">
                <Tag size={16} /> TAG
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 text-label-uppercase text-m-red hover:text-white transition-colors">
                <Trash2 size={16} /> DELETE
              </button>
            </div>

            <div className="w-px h-6 bg-hairline"></div>

            <button onClick={handleClearSelection} className="text-muted hover:text-on-dark transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
      </main>

      {/* Edit Link Modal */}
      {linkToEdit && (
        <EditLinkModal 
          link={linkToEdit}
          categories={categories}
          user={user}
          onClose={() => setLinkToEdit(null)}
          onSaveSuccess={() => {
            setLinkToEdit(null);
            fetchData(user.uid);
          }}
        />
      )}

      <AddEditCategoryModal
        isOpen={categoryModalState.isOpen}
        mode={categoryModalState.mode}
        category={categoryModalState.category}
        initialIsDeleting={categoryModalState.isDeleting}
        onClose={() => setCategoryModalState({ isOpen: false, mode: 'add', category: null, isDeleting: false })}
        onSave={handleSaveCategory}
        onDelete={handleModalDeleteCategory}
      />

      <BulkTagModal
        isOpen={isTagModalOpen}
        selectedCount={selectedLinks.length}
        onClose={() => setIsTagModalOpen(false)}
        onSave={handleBulkTag}
      />
    </div>
  );
}
