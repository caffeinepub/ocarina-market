import { useState, useEffect } from 'react';

const BASKET_KEY = 'folk-market-basket';

export function useBasket() {
  const [basketItems, setBasketItems] = useState<Uint8Array[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(BASKET_KEY);
    if (stored) {
      try {
        const itemStrings = JSON.parse(stored) as string[];
        const items = itemStrings.map((str) => {
          const bytes = str.split(',').map(Number);
          return new Uint8Array(bytes);
        });
        setBasketItems(items);
      } catch (error) {
        console.error('Failed to load basket:', error);
        localStorage.removeItem(BASKET_KEY);
      }
    }
  }, []);

  const saveBasket = (items: Uint8Array[]) => {
    const itemStrings = items.map((item) => Array.from(item).join(','));
    localStorage.setItem(BASKET_KEY, JSON.stringify(itemStrings));
    setBasketItems(items);
  };

  const addToBasket = (itemId: Uint8Array) => {
    const exists = basketItems.some(
      (id) => id.toString() === itemId.toString()
    );
    if (!exists) {
      saveBasket([...basketItems, itemId]);
    }
  };

  const removeFromBasket = (itemId: Uint8Array) => {
    const filtered = basketItems.filter(
      (id) => id.toString() !== itemId.toString()
    );
    saveBasket(filtered);
  };

  const clearBasket = () => {
    localStorage.removeItem(BASKET_KEY);
    setBasketItems([]);
  };

  const isInBasket = (itemId: Uint8Array) => {
    return basketItems.some((id) => id.toString() === itemId.toString());
  };

  const getBasketItemIds = () => basketItems;

  const getBasketItemCount = () => basketItems.length;

  return {
    addToBasket,
    removeFromBasket,
    clearBasket,
    isInBasket,
    getBasketItemIds,
    getBasketItemCount,
  };
}
