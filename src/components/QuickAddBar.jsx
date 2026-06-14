import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { addLink, checkLinkExists } from '../lib/db';
import { auth } from '../lib/firebase';

const LINKPREVIEW_API_KEY = import.meta.env.VITE_LINKPREVIEW_API_KEY || "";

const SOURCES = ['Web', 'Instagram', 'YouTube', 'X', 'Other'];

const DOMAIN_CATEGORY_MAP = {
  'github.com': 'Programming',
  'stackoverflow.com': 'Programming',
  'dribbble.com': 'Design',
  'behance.net': 'Design',
  'figma.com': 'Design',
};

const DOMAIN_SOURCE_MAP = {
  'instagram.com': 'Instagram',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'twitter.com': 'X',
  'x.com': 'X',
};

export function QuickAddBar({ onAddSuccess, defaultCategoryId, categories = [] }) {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('Web');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  
  // New manual override fields
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId || '');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  // Auto-suggest source and category based on URL
  useEffect(() => {
    if (!url) {
      setSuggestedCategory(null);
      setSource('Web');
      return;
    }
    try {
      let parsedUrl = url;
      if (!/^https?:\/\//i.test(url)) parsedUrl = 'https://' + url;
      const hostname = new URL(parsedUrl).hostname.replace(/^www\./, '');
      
      if (DOMAIN_SOURCE_MAP[hostname]) {
        setSource(DOMAIN_SOURCE_MAP[hostname]);
      } else {
        setSource('Web');
      }

      if (DOMAIN_CATEGORY_MAP[hostname]) {
        const matchingCat = categories.find(c => c.name.toLowerCase() === DOMAIN_CATEGORY_MAP[hostname].toLowerCase());
        if (matchingCat) {
          setSuggestedCategory(matchingCat);
          setSelectedCategoryId(matchingCat.id);
        }
      } else {
        setSuggestedCategory(null);
      }
    } catch {
      // Invalid URL while typing, ignore
    }
  }, [url, categories]);

  // Update selectedCategoryId if defaultCategoryId changes from parent
  useEffect(() => {
    if (!suggestedCategory && defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId);
    }
  }, [defaultCategoryId, suggestedCategory]);

  const fetchMetadata = async (targetUrl) => {
    try {
      const response = await fetch(`https://api.linkpreview.net/?key=${LINKPREVIEW_API_KEY}&q=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      return await response.json();
    } catch (err) {
      console.error(err);
      return { title: null, image: null, description: null };
    }
  };

  const handleSubmit = async (e, overrideWarning = false) => {
    e.preventDefault();
    if (!url) return;
    
    let parsedUrl = url;
    if (!/^https?:\/\//i.test(url)) parsedUrl = 'https://' + url;

    try {
      new URL(parsedUrl);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setError(null);
    setWarning(null);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      if (!overrideWarning) {
        const exists = await checkLinkExists(user.uid, parsedUrl);
        if (exists) {
          setWarning("This URL is already in your collection. Add anyway?");
          setLoading(false);
          return;
        }
      }

      const metadata = await fetchMetadata(parsedUrl);
      const domain = new URL(parsedUrl).hostname;
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      const finalCategoryId = selectedCategoryId || defaultCategoryId;

      const newLinkData = {
        url: parsedUrl,
        title: metadata.title || parsedUrl,
        note: description || metadata.description || "",
        categoryId: finalCategoryId,
        tags: [],
        favicon: favicon,
        previewImage: metadata.image || null,
        source: source,
        status: "saved",
        clickCount: 0,
        isPublic: false
      };

      await addLink(user.uid, newLinkData);
      
      // Reset form
      setUrl('');
      setSuggestedCategory(null);
      setDescription('');
      setSelectedCategoryId(defaultCategoryId || '');
      
      if (onAddSuccess) onAddSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to add link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12 flex flex-col gap-3">
      <form onSubmit={(e) => handleSubmit(e, false)} className="relative flex flex-col gap-3 w-full group">
        <div className="relative flex w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
            <Plus className="w-5 h-5 text-muted group-focus-within:text-on-dark transition-colors" />
          </div>
          <Input 
            type="text" 
            placeholder="Paste URL to add a new link..." 
            className="w-full pl-12 pr-32 h-16 text-title-md !bg-surface-card !border-hairline focus:!border-on-dark transition-colors relative z-0"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
              setWarning(null);
            }}
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-10">
            <Button 
              type="submit" 
              variant="primary" 
              className="!h-12 px-6"
              disabled={loading || !url}
            >
              {loading ? 'ADDING...' : 'ADD'}
            </Button>
          </div>
        </div>

        {/* Additional fields when URL is active */}
        {url && (
          <div className="flex flex-col sm:flex-row gap-3 bg-surface-card border border-hairline p-3 animate-fade-in">
            <div className="flex-1">
              <Input 
                type="text"
                placeholder="Add a short description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-10 text-body-sm bg-canvas border-hairline"
                disabled={loading}
              />
            </div>
            <div className="sm:w-64">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-canvas border border-hairline text-body-sm text-on-dark focus:outline-none focus:border-m-blue-light rounded-none uppercase tracking-widest appearance-none"
                disabled={loading}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `└ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Suggestion Chips and Source Selectors */}
      {(url || source !== 'Web') && (
        <div className="flex flex-wrap items-center gap-4 text-caption text-muted">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest">Source:</span>
            <div className="flex gap-2">
              {SOURCES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`px-3 py-1 border rounded-none transition-colors ${
                    source === s 
                      ? 'border-on-dark text-on-dark bg-surface-elevated' 
                      : 'border-hairline text-muted hover:border-muted hover:text-on-dark'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="p-4 bg-surface-card border border-m-red text-on-dark text-body-sm">{error}</div>}
      
      {warning && (
        <div className="p-4 bg-surface-card border border-warning flex items-center justify-between">
          <span className="text-on-dark text-body-sm">{warning}</span>
          <div className="flex gap-4">
            <button type="button" onClick={() => setWarning(null)} className="text-label-uppercase text-muted hover:text-on-dark">CANCEL</button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="text-label-uppercase text-warning hover:text-on-dark">ADD ANYWAY</button>
          </div>
        </div>
      )}
    </div>
  );
}
