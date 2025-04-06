import moment from 'moment';
import { useEffect, useState } from 'react';

export default function FrameDate({ transactions, children, dateProp = 'month' }) {
  const format = "YYYY-MM-DD"
  const unit = "months" // TODO: determine moment unit 
  // TODO: const width = dateProp === 'week' ? 52 : 12;
  const [window, setWindow] = useState({ after: null, before: null, width: 0 });

  useEffect(() => {
    if (transactions.length > 0) {
      const dates = transactions.map(t => moment(t.date));
      const before = moment.max(dates).format(format);
      const width = dateProp === 'week' ? 52 : 12;
      const after = moment(before).subtract(width, unit).format(format);
      // console.log({ after, before, width });

      setWindow({ after, before, width });
    }
  }, [transactions, dateProp]);

  const shiftWindow = (delta) => {
    setWindow(prev => {
      // const today = moment()
      const width = dateProp === 'week' ? 52 : 12;

      const newAfter = moment(prev.after).add(delta, unit).format(format)
      // const tentativeBefore = moment(newAfter).add(width, unit).format(format);
      // const newBefore = moment.min(tentativeBefore, today).format(format); // before stops moving right at today
      const newBefore = moment(newAfter).add(width, unit).format(format);

      return {
        ...prev,
        after: newAfter,
        before: newBefore,
      }
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
    // TODO: up/down increase/decrease the width
    // TODO: make this a context that the cart can read
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const filtered = transactions.filter(t => window.after && window.before && moment(t.date).isBetween(window.after, window.before));
  // console.log(window)

  return children(filtered);
}
