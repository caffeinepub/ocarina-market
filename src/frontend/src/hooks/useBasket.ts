import { useState, useEffect } from 'react';

const BASKET_STORAGE_KEY = 'ocarina-basket';

export function useBasket() {
  const [itemIds, setItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(itemIds));
    } catch (error) {
      console.error('Failed to save basket to localStorage:', error);
    }
  }, [itemIds]);

  const addItem = (itemId: Uint8Array) => {
    const idString = Array.from(itemId).join(',');
    setItemIds((prev) => {
      if (prev.includes(idString)) {
        return prev;
      }
      return [...prev, idString];
    });
  };

  const removeItem = (itemId: Uint8Array) => {
    const idString = Array.from(itemId).join(',');
    setItemIds((prev) => prev.filter((id) => id !== idString));
  };

  const clearBasket = () => {
    setItemIds([]);
  };

  const hasItem = (itemId: Uint8Array): boolean => {
    const idString = Array.from(itemId).join(',');
    return itemIds.includes(idString);
  };

  const getItemIds = (): Uint8Array[] => {
    return itemIds.map((idString) => {
      const numbers = idString.split(',').map(Number);
      return new Uint8Array(numbers);
    });
  };

  return {
    itemIds: getItemIds(),
    itemCount: itemIds.length,
    addItem,
    removeItem,
    clearBasket,
    hasItem,
  };
}
