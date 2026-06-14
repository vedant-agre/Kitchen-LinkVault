import { doc, getDoc, setDoc, collection, query, getDocs, addDoc, serverTimestamp, updateDoc, deleteDoc, where, writeBatch, increment, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

// Setup user document and default categories on first login
export const setupUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create the base user document
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });

    // Create default categories
    const categoriesRef = collection(db, `users/${user.uid}/categories`);
    const defaultCategories = [
      { name: "Unsorted", color: "#3c3c3c", order: 0, isDefault: true },
      { name: "Programming", color: "#0066b1", order: 1, isDefault: true },
      { name: "Design", color: "#e22718", order: 2, isDefault: true },
      { name: "AI Tools", color: "#f4b400", order: 3, isDefault: true },
    ];

    for (const cat of defaultCategories) {
      await addDoc(categoriesRef, {
        ...cat,
        createdAt: serverTimestamp(),
      });
    }
  }
};

export const getCategories = async (uid) => {
  const q = query(collection(db, `users/${uid}/categories`));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.order - b.order);
};

export const addCategory = async (uid, name, color, order, parentId = null) => {
  const categoriesRef = collection(db, `users/${uid}/categories`);
  const newCat = await addDoc(categoriesRef, {
    name,
    color,
    order,
    parentId,
    isDefault: false,
    createdAt: serverTimestamp()
  });
  return { id: newCat.id, name, color, order, parentId, isDefault: false };
};

export const deleteCategory = async (uid, categoryId) => {
  await deleteDoc(doc(db, `users/${uid}/categories`, categoryId));
};

export const getLinks = async (uid) => {
  const q = query(collection(db, `users/${uid}/links`));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
    // Sort by createdAt descending (newest first)
    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
  });
};

export const checkLinkExists = async (uid, url) => {
  const q = query(collection(db, `users/${uid}/links`), where("url", "==", url));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const addLink = async (uid, linkData) => {
  const linksRef = collection(db, `users/${uid}/links`);
  const newLink = await addDoc(linksRef, {
    ...linkData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: newLink.id, ...linkData };
};

export const updateLink = async (uid, linkId, updates) => {
  const linkRef = doc(db, `users/${uid}/links`, linkId);
  await updateDoc(linkRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteLink = async (uid, linkId) => {
  await deleteDoc(doc(db, `users/${uid}/links`, linkId));
};

export const bulkDeleteLinks = async (uid, linkIds) => {
  const batch = writeBatch(db);
  linkIds.forEach(id => {
    const linkRef = doc(db, `users/${uid}/links`, id);
    batch.delete(linkRef);
  });
  await batch.commit();
};

export const bulkUpdateLinks = async (uid, linkIds, updates) => {
  const batch = writeBatch(db);
  linkIds.forEach(id => {
    const linkRef = doc(db, `users/${uid}/links`, id);
    batch.update(linkRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  });
  await batch.commit();
};

export const bulkAddTagToLinks = async (uid, linkIds, tag) => {
  const batch = writeBatch(db);
  linkIds.forEach(id => {
    const linkRef = doc(db, `users/${uid}/links`, id);
    batch.update(linkRef, {
      tags: arrayUnion(tag),
      updatedAt: serverTimestamp()
    });
  });
  await batch.commit();
};

export const incrementLinkClick = async (uid, linkId) => {
  const linkRef = doc(db, `users/${uid}/links`, linkId);
  await updateDoc(linkRef, {
    clickCount: increment(1),
    updatedAt: serverTimestamp()
  });
};

export const updateCategory = async (uid, categoryId, updates) => {
  const categoryRef = doc(db, `users/${uid}/categories`, categoryId);
  await updateDoc(categoryRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const getPublicCategory = async (uid, categoryId) => {
  const categoryRef = doc(db, `users/${uid}/categories`, categoryId);
  const categorySnap = await getDoc(categoryRef);
  if (!categorySnap.exists() || !categorySnap.data().isPublic) {
    throw new Error("Category not found or not public");
  }
  return { id: categorySnap.id, ...categorySnap.data() };
};

export const getPublicLinks = async (uid, categoryId) => {
  const q = query(collection(db, `users/${uid}/links`), where("categoryId", "==", categoryId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
  });
};

export const cloneCollection = async (currentUserUid, sourceUid, categoryId) => {
  const publicCategory = await getPublicCategory(sourceUid, categoryId);
  const publicLinks = await getPublicLinks(sourceUid, categoryId);

  // 1. Create a new category for the current user
  const newCatRef = await addDoc(collection(db, `users/${currentUserUid}/categories`), {
    name: `${publicCategory.name} (Cloned)`,
    color: publicCategory.color,
    order: 99,
    parentId: null,
    isDefault: false,
    createdAt: serverTimestamp()
  });

  const newCatId = newCatRef.id;

  // 2. Clone links in batch
  const batch = writeBatch(db);
  publicLinks.forEach(link => {
    const newLinkRef = doc(collection(db, `users/${currentUserUid}/links`));
    batch.set(newLinkRef, {
      url: link.url,
      title: link.title,
      note: link.note || "",
      categoryId: newCatId,
      tags: link.tags || [],
      favicon: link.favicon || null,
      previewImage: link.previewImage || null,
      source: link.source || "Web",
      status: "saved",
      clickCount: 0,
      isPublic: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
  return newCatId;
};
