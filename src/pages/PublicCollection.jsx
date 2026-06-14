import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, Copy, ArrowRight, Zap } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getPublicCategory, getPublicLinks, cloneCollection } from '../lib/db';
import { LinkCard } from '../components/ui/LinkCard';
import { Button } from '../components/ui/Button';

export function PublicCollection() {
  const { uid, categoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      try {
        const cat = await getPublicCategory(uid, categoryId);
        const lnks = await getPublicLinks(uid, categoryId);
        setCategory(cat);
        setLinks(lnks);
      } catch (err) {
        console.error(err);
        setError("This collection is either private or does not exist.");
      } finally {
        setLoading(false);
      }
    };
    
    if (uid && categoryId) {
      fetchPublicData();
    }
  }, [uid, categoryId]);

  const handleClone = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCloning(true);
    try {
      await cloneCollection(user.uid, uid, categoryId);
      alert("Collection cloned successfully!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to clone collection.");
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-canvas flex items-center justify-center text-on-dark text-label-uppercase">LOADING COLLECTION...</div>;
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red" />
        <h1 className="text-display-md text-on-dark mb-4 tracking-tight">NOT FOUND</h1>
        <p className="text-body-md text-muted max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col overflow-hidden relative">
      {/* Decorative M-stripe */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red z-50" />
      
      {/* Header */}
      <header className="h-24 border-b border-hairline flex items-center px-4 md:px-8 bg-surface-card shrink-0 gap-6 justify-between">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="w-12 h-12 bg-canvas border border-hairline flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-m-blue-light" />
          </div>
          <div className="min-w-0">
            <div className="text-caption text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <span>Public Collection</span>
              <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: category.color }} />
            </div>
            <h1 className="text-display-sm text-on-dark truncate">
              {category.name.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4">
          <Button 
            onClick={handleClone}
            disabled={cloning}
            variant="primary"
            className="hidden md:flex"
          >
            {cloning ? 'CLONING...' : user ? 'CLONE COLLECTION' : 'LOGIN TO CLONE'}
            {!cloning && <Copy size={16} className="ml-2" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-display-sm text-on-dark mb-4">NO LINKS FOUND</h3>
            <p className="text-body-md text-muted max-w-md">
              This public collection is currently empty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
            {links.map(link => (
              <LinkCard 
                key={link.id} 
                link={link} 
                viewMode="grid" 
                isSelected={false}
                onToggleSelect={() => {}}
                onEdit={() => {}} 
                onDelete={() => {}} 
                onStatusToggle={() => {}}
                onClickLink={(l) => window.open(l.url, '_blank')}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-surface-elevated border-t border-hairline z-50">
        <Button 
          onClick={handleClone}
          disabled={cloning}
          variant="primary"
          className="w-full justify-center"
        >
          {cloning ? 'CLONING...' : user ? 'CLONE COLLECTION' : 'LOGIN TO CLONE'}
          {!cloning && <Copy size={16} className="ml-2" />}
        </Button>
      </div>
    </div>
  );
}
