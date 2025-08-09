import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "../services/wallet";
import { useAuth } from "./AuthContext";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  const { data, refetch } = useQuery({
    queryKey: ['balance'],
    queryFn: getBalance,
    enabled: !!user,
    refetchInterval: 30000, // تحديث الرصيد كل 30 ثانية
  });

  useEffect(() => {
    if (data) {
      setBalance(data.balance);
    }
  }, [data]);

  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, refetchBalance: refetch }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  return useContext(BalanceContext);
};