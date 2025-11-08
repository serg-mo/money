import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { CreditContext } from '../utils/credit';

export default function FrameDate({ children }) {
  const { transactions, timeResolution } = useContext(CreditContext);

  const format = 'YYYY-MM-DD';
  const unit = timeResolution === 'month' ? 'months' : 'weeks'; // moment unit
  const width = timeResolution === 'month' ? 12 : 52;

  const [window, setWindow] = useState({ after: null, before: null });

  useEffect(() => {
    if (transactions.length > 0) {
      const dates = transactions.map((t) => moment(t.date));
      const before = moment.max(dates).endOf(timeResolution).format(format); // absolute
      const after = moment(before)
        .subtract(width, unit)
        .startOf(timeResolution)
        .format(format); // relative
      // console.log({ after, before });

      setWindow({ after, before });
    }
  }, [transactions, timeResolution]);

  const shiftWindow = (delta) => {
    setWindow((prev) => {
      // TODO: do not advance before to a date after today, the chart looks weird then
      const newAfer = moment(prev.after).add(delta, unit);
      const newBefore = moment(prev.before).add(delta, unit);

      return {
        after: newAfer.format(format),
        before: newBefore.format(format),
      };
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'ArrowLeft') {
      shiftWindow(-1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      shiftWindow(1);
      event.preventDefault();
    }
    // TODO: left/right move the left edge, up/down right edge
    // TODO: make this a context that the cart can read
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [timeResolution]);

  const filtered = transactions.filter(
    (t) =>
      window.after &&
      window.before &&
      moment(t.date).isBetween(window.after, window.before)
  );
  // console.log(window)

  return children(filtered);
}
