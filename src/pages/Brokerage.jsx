import React, { useEffect, useState } from 'react';
import BalanceChart from '../components/brokerage/BalanceChart';
import CashFlowChart from '../components/brokerage/CashFlowChart';
import Frame from '../components/FrameIndex';
import { formatMoney, parseBrokerageFile } from '../utils/brokerage';
import { sum } from '../utils/common';

// TODO: add arrow key handlers to zoom in/out and shift left/right
export default function Brokerage({ txt }) {
  const [transactions, setTransactions] = useState([]);

  const columns = [
    'deposits',
    'withdrawals',
    'market change minus fees',
    'dividends & interest',
  ];

  useEffect(() => {
    if (txt && !transactions.length) {
      setTransactions(parseBrokerageFile(txt));
    }
  }, [transactions, txt]);

  if (!transactions.length) {
    return;
  }

  // same columns for brokerage and checking
  // TODO: brokerage and checking download the same file, chart them both

  // TODO: BalanceChart can stack both start and ending balances
  // TODO: charts use canvas, the size of which can't be easily set with tailwind
  return (
    <Frame transactions={transactions} initialSize={12}>
      {(slice) => {
        const totals = columns.reduce((acc, name) => {
          acc[name] = sum(slice.map((fields) => parseInt(fields[name])));
          return acc;
        }, {});
        // console.log(totals);

        return (
          <div className="w-full flex flex-col justify-center items-center">
            <div className="w-3/5">
              <BalanceChart transactions={slice} column={'ending balance'} />
            </div>
            <div className="w-3/5">
              <CashFlowChart transactions={slice} title="cash flow" />
            </div>

            {columns.map((name) => (
              <div key={name} className="text-lg">
                {name}: {formatMoney(totals[name])},{' '}
                {formatMoney(totals[name] / slice.length)}/mo
              </div>
            ))}

            <div className="text-lg">
              {`Deposits + Withdrawals: ${formatMoney(totals['deposits'] + totals['withdrawals'])}`}
            </div>
            <div className="text-lg">
              {`Market + Income: ${formatMoney(totals['market change minus fees'] + totals['dividends & interest'])}`}
            </div>
          </div>
        );
      }}
    </Frame>
  );
}
