import React, { createContext, useContext, useState } from 'react';

const BasketContext = createContext(undefined);

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);
  const [picked, setPicked] = useState([]);

  const pickItem = (deal, store) => {
    setPicked(prev => {
      const exists = prev.find(i => i.id === deal.id);
      if (exists) return prev;
      return [...prev, { ...deal, selectedStore: store }];
    });
  };

  const unpick = (id) => {
    setPicked(prev => prev.filter(item => item.id !== id));
  };

  const addToBasket = (deal, store) => {
    setBasket(prev => {
      const exists = prev.find(i => i.id === deal.id);
      if (exists) {
        // Already in basket → REMOVE IT (toggle off)
        return prev.filter(i => i.id !== deal.id);
      } else {
        // Not in basket → ADD IT (toggle on)
        return [...prev, { ...deal, selectedStore: store }];
      }
    });
  };

  const removeFromBasket = (id) => {
    setBasket(prev => prev.filter(item => item.id !== id));
  };

  const clearBasket = () => setBasket([]);

  const total = basket.reduce((sum, item) => sum + item.price, 0);

  return (
    <BasketContext.Provider value={{ picked, basket, pickItem, unpick, addToBasket, removeFromBasket, clearBasket, total }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) throw new Error('useBasket must be used within BasketProvider');
  return context;
};