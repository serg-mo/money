import React, { useEffect, useState } from 'react';
import CreditClassifier from '../components/credit/CreditClassifier';
import CreditTransactionsTab from '../components/credit/CreditTransactionsTab';
import Frame from '../components/Frame';
import { CreditContext, parseCreditFile } from '../utils/credit';
import usePersisedState from '../utils/usePersistedState';

export default function Credit({ txt }) {
  const [context, setContext] = useState({});

  const [tab, setTab] = useState(undefined); // TODO: typeof keyof COLORS
  const [transactions, setTransactions] = useState([]);
  const [manualCategories, setManualCategories] = usePersisedState(
    {},
    'manualCategories'
  );

  // TODO: chart month/week level + vendor level for groceries
  // TODO: see if my weekly spending is more predictable
  useEffect(() => {
    if (txt && !transactions.length) {
      // TODO: I don't want to classify the refunds, find a way to remove those charges
      const filterFn = (row) => row['transaction'] === 'DEBIT'; // charges only

      setTransactions(parseCreditFile(txt).filter(filterFn));
    }
  }, [transactions, txt]);

  useEffect(() => {
    if (transactions.length) {
      setContext({
        transactions,
        setTransactions,
        manualCategories,
        setManualCategories,
        onCategorize,
        tab,
        setTab,
      });
    }
  }, [transactions, manualCategories, tab]);

  // TODO: remember which transactions are classified manually and assert model guesses the same
  const onCategorize = (transaction, category) => {
    const key = JSON.stringify(transaction['vector']); // must be unique, for unserialized vector access
    setManualCategories({ ...manualCategories, [key]: category });
  };

  if (!Object.values(context).length) {
    return;
  }

  // NOTE: start at full length and shrink from there
  return (
    <CreditContext.Provider value={context}>
      <CreditClassifier />
      <Frame transactions={transactions} initialSize={transactions.length}>
        {(slice) => <CreditTransactionsTab transactions={slice} />}
      </Frame>
    </CreditContext.Provider>
  );
}
