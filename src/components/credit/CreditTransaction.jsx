import moment from 'moment';
import React, { useContext } from 'react';
import {
  CreditContext,
  formatAmount,
  formatConfidence,
  getOpacity,
} from '../../utils/credit';
import CategoryPicker from './CategoryPicker';

// TODO: maybe show categories vertically + animate their appearance disappearance
export default function Transaction({ onClick, ...t }) {
  const { manualCategories } = useContext(CreditContext);
  const isActual = JSON.stringify(t['vector']) in manualCategories;
  const confidence = isActual ? 1 : t['confidences'][t['category']] ?? 0; // actual overwrites predicted

  const title = Object.entries(t['confidences'])
    .map(([key, value]) => `${key}: ${formatConfidence(value)}`)
    .join('\n');

  // TODO: set the transparancy of the category to the confidence
  // TODO: clicking on the merchant name should show only their dataset in the chart
  return (
    <tr className="group border border-slate-600">
      <td className="px-2 py-4 align-middle" title={t['name']}>
        {t['normalizedName']}
      </td>
      <td className="px-2 text-center">
        <div className="block group-hover:hidden">{t['location']}</div>
        <div className="hidden group-hover:block">
          {onClick && <CategoryPicker transaction={t} onClick={onClick} />}
        </div>
      </td>
      <td
        className="px-2 py-4 text-center"
        title={moment(t['date']).format('MMM D')}
      >
        {moment(t['date']).format('YYYY-MM-DD')}
      </td>
      <td className="px-2 py-4 text-center">${formatAmount(t['amount'])}</td>
      <td className={`p-2 text-center ${getOpacity(confidence)}`} title={title}>
        {t['category']}
      </td>
      <td className={`p-2 text-center ${getOpacity(confidence)}`}>
        {formatConfidence(confidence)}
      </td>
    </tr>
  );
}
