import moment from 'moment';
import { useEffect, useState } from 'react';

export default function FrameDate({
  transactions,
  children,
  dateProp = 'month',
}) {
  const format = 'YYYY-MM-DD';
  const unit = dateProp === 'month' ? 'months' : 'weeks'; // TODO: determine moment unit
  const width = dateProp === 'month' ? 12 : 52;

  const [window, setWindow] = useState({ after: null, before: null });

  useEffect(() => {
    if (transactions.length > 0) {
      const dates = transactions.map((t) => moment(t.date));
      const before = moment.max(dates).endOf(dateProp).format(format); // absolute
      const after = moment(before)
        .subtract(width, unit)
        .startOf(dateProp)
        .format(format); // relative
      // console.log({ after, before });

      setWindow({ after, before });
    }
  }, [transactions, dateProp]);

  const shiftAfter = (delta) => {
    setWindow((prev) => ({
      ...prev,
      after: moment(prev.after).add(delta, unit).format(format),
    }));
  };

  const shiftBefore = (delta) => {
    setWindow((prev) => ({
      ...prev,
      before: moment(prev.before).add(delta, unit).format(format),
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'ArrowLeft') {
      shiftAfter(-1);
      shiftBefore(-1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      shiftAfter(1);
      shiftBefore(1);
      event.preventDefault();
    }
    // TODO: up/down increase/decrease the width
    // TODO: make this a context that the cart can read
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const filtered = transactions.filter(
    (t) =>
      window.after &&
      window.before &&
      moment(t.date).isBetween(window.after, window.before)
  );
  // console.log(window)

  return children(filtered);
}
