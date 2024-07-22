import React, { useContext, useEffect, useState } from 'react';
import {
  deDupeCardsByStat,
  DividendContext,
  isCloserToCard,
  mutateCandidates,
} from '../../utils/dividends';
import CandidatesChart from './CandidatesChart';
import CardDetails from './CardDetails';

// TODO: I can download dividends CSV from fidelity, instead of my own spreadsheet
// it contains name, now, and cost, which is all I really need. There is no OK though.
// but then I would not need to fetch prices. I still need to fetch expense ratios.

// TODO: compute delta/buy/sell/total for a given candidate
// TODO: this is where backtracking algo would work well
// TODO: color code a third dimension, like ROI to transparency
export default function DividendDash() {
  const CLICK_SIZE = 10_000;
  const JITTER_DECAY = 0.8; // every click

  const { current, prices, goalTotal, goalMonthly, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.5); // fraction of the number of shares

  const currentCard = candidateToCard(current);
  const [splitCard, setSplitCard] = useState(currentCard);
  const [goalCard] = useState({
    ...currentCard,
    stats: { ...currentCard.stats, total: goalTotal, monthly: goalMonthly },
  });

  // const isBetterThanGoal = isBetterThanCard(goalCard); // goal in the bottom-right
  // const isCloseToSplit = isCloseToCard(splitCard, 1_000, 100); // split to the middle

  // const getFocus = (card) => {
  //   // TODO: maintain the focused data point as state
  //   // TODO: start with currentCard, then splitCard, then goalCard
  //   return isBetterThanGoal(card) ? isBetterThanGoal : isCloseToSplit;
  // };

  // must be defined here, because candidateToCard
  // const mutateCards = (cards) => {
  //   return cards.map(({ candidate }) => candidateToCard(mutateCandidate(candidate)));
  // }

  const makeCardsForCard = (card) => {
    setJitter((prev) => prev * JITTER_DECAY);

    setTopCards((prev) => {
      const cards = deDupeCardsByStat(
        mutateCandidates(card.candidate, CLICK_SIZE, jitter).map(
          candidateToCard
        ),
        'monthly'
      );
      return [...prev, ...cards].filter(isCloserToCard(card, 3_000, 100));
    });
  };
  useEffect(() => makeCardsForCard(splitCard), [splitCard]);

  // TODO: if I can consider N closest changes in multiples of 10, there is no need for click
  // TODO: I kind of like exploring by clicking, but it's not the most efficient
  // TODO: the de-duping logic becomes relevant once I meet the goal
  // TODO: sort by desc cost and chop off the top
  // NOTE: when I dedupe, I don't consider a ton of candidates
  // NOTE: but if there are solutions on init, I should must do it

  // explore by clicking on a data point, which generates new mutations
  const onClick = (card) => {
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(card.candidate.join('\n')); // newlines for spreadsheet

    setSplitCard(card);
  };

  const onHover = (card) => {
    // TODO: explore by HOVERING
    // append only, no filtering
    // setTopCards((prev) => [
    //   ...prev,
    //   mutateCandidates(card.candidate, HOVER_SIZE),
    // ]);
    // setSplitCard(card);
  };

  // TODO: add another chart for cost vs p&l
  // TODO: rename to current, goal, and active (split) cards
  return (
    <div className="w-3/4 h-screen p-4 space-y-5 flex flex-col items-center content-start bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2 select-none">
        <CardDetails cards={{ current: currentCard, split: splitCard }} />
      </header>
      <div className="w-full h-full">
        {!topCards.length ? (
          <div className="text-red-400">No passing candidates!</div>
        ) : (
          <CandidatesChart
            cards={[currentCard, ...topCards]}
            goal={goalCard}
            split={splitCard}
            highlight={0}
            onClick={onClick}
            onHover={onHover}
          />
        )}
      </div>
    </div>
  );
}
