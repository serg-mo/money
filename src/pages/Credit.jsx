import moment from 'moment';
import React, { useEffect, useState } from 'react';
import CreditClassifier from '../components/credit/CreditClassifier';
import CreditTransactionsTab from '../components/credit/CreditTransactionsTab';
import Frame from '../components/Frame';
import { CreditContext, parseCreditFile } from '../utils/credit';
import usePersisedState from '../utils/usePersistedState';

export default function Credit({ txt }) {
  const [context, setContext] = useState({});

  const [tab, setTab] = useState(undefined); // TODO: type CATEGORIES,
  const [transactions, setTransactions] = useState([]);
  const [manualCategories, setManualCategories] = usePersisedState(
    {},
    'manualCategories'
  );

  // TODO: it would be nice to see the chart at month/week level + vendor level for groceries
  // TODO: I bet you my weekly spending is more predictable
  // TODO: bring back the arrow key navigation and derive which transactions to show
  useEffect(() => {
    if (txt && !transactions.length) {
      const cutoff = moment().subtract(12, 'months').format('YYYY-MM-DD');
      const filterFn = (row) =>
        row['transaction'] === 'DEBIT' && row['date'] >= cutoff;

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
    // console.log({ key, category });

    setManualCategories({ ...manualCategories, [key]: category });
  };

  if (!Object.values(context).length) {
    return;
  }

  const render = (slice) => <CreditTransactionsTab transactions={slice} />;

  return (
    <CreditContext.Provider value={context}>
      <CreditClassifier />
      <Frame transactions={transactions} render={render} initialSize={100} />
    </CreditContext.Provider>
  );
}
