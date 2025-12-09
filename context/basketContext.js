import React, { createContext, useContext, useState } from 'react';

const BasketContext = createContext(undefined);

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);
  const [picked, setPicked] = useState([]);
  const [budget, setBudget] = useState(null);           // total budget
  const [spent, setSpent] = useState(0);

  const pickItem = (deal, store) => {
    setPicked(prev => {
      const exists = prev.find(i => i.id === deal.id);
      if (exists) {
        return prev.filter(i => i.id !== deal.id);
      } else {
        return [...prev, { ...deal, selectedStore: store }];
      };
    });
  };

  const addToBasket = (deal, store) => {
    setBasket(prev => {
      const exists = prev.find(i => i.id === deal.id);

      if (exists) return prev.filter(i => i.id !== deal.id);

      const newBasket = [...prev, { ...deal, selectedStore: store }];

      // ---- NEW: update spent amount in AppContext ----
      if (setSpent) {
        const price = parseFloat(String(deal.price).replace(/[$,]/g || /[R,]/g || /[E,]/g, '')) || 0;
        setSpent(prevSpent => prevSpent + price);
      }
      // -------------------------------------------------
      return newBasket;
    });
  };

  const removeFromBasket = (id) => {
    setBasket(prev => prev.filter(item => item.id !== id));
  };

  const clearBasket = () => setBasket([]);

  const total = basket.reduce((sum, item) => sum + item.price, 0);

  return (
    <BasketContext.Provider value={{ picked, basket, pickItem, budget, setBudget, spent, setSpent, addToBasket, removeFromBasket, clearBasket, total }}>
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) throw new Error('useBasket must be used within BasketProvider');
  return context;
};