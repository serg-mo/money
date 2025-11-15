import React, { useEffect, useState } from 'react';
import { CreditContext, parseCreditFile } from '../utils/credit';
import useRules from '../utils/useRules';
import CreditClassifier from './credit/CreditClassifier';
import CreditTransactionsTab from './credit/CreditTransactionsTab';
import FrameDate from './FrameDate';

export default function App({ txt }) {
  const [context, setContext] = useState({});

  const [timeResolution, setTimeResolution] = useState('month'); // TODO: week | month
  const [tab, setTab] = useState(undefined); // TODO: typeof keyof COLORS
  const [transactions, setTransactions] = useState([]); // TODO: do the same as useRules for transactions
  const [manualCategories, setManualCategories] = useRules();

  // TODO: chart month/week level + vendor level for groceries
  // TODO: see if my weekly spending is more predictable
  useEffect(() => {
    if (txt && !transactions.length) {
      // TODO: I don't want to classify payments, find a way to remove those charges
      // const filterFn = (row) => row['transaction'] === 'DEBIT'; // charges only
      const filterFn = (row) => !row['name'].includes('PAYMENT'); // exclude payments, include refunds

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
        timeResolution,
        setTimeResolution,
      });
    }
  }, [transactions, manualCategories, tab, timeResolution]);

  // TODO: remember which transactions are classified manually and assert model guesses the same
  const onCategorize = (transaction, category) => {
    const key = JSON.stringify(transaction['vector']); // must be unique
    setManualCategories({ ...manualCategories, [key]: category });
  };

  if (!Object.values(context).length) {
    return;
  }

  // NOTE: start at full length and shrink from there
  return (
    <CreditContext.Provider value={context}>
      <CreditClassifier />
      <FrameDate>
        {(slice) => <CreditTransactionsTab transactions={slice} />}
      </FrameDate>
    </CreditContext.Provider>
  );
}
