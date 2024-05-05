import React, { useContext, useEffect, useState } from "react";
import {
  CARD_SORTS,
  DividendContext,
  deDupeCardsByStat,
  makeCandidates,
  isCloseToCard,
  isBetterThanCard,
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";
import CandidateChart from "./CandidateChart";

// TODO: this is where backtracking algo would work well
// TODO: hovering over a point should highlight the same candidate elsewhere
// TODO: color code a third dimension, like ROI to transparency
// TODO: add horizontal and vertical cutoffs for both charts
// TODO: consider making goal just a x/y coordinate on both charts, i.e., they maintain their own
// TODO: each chart should know to zoom in to the appropriate quadrant of the xy coordinate
export default function DividendDash() {
  const TOP_SIZE = 30;
  const INIT_SIZE = 1_000;
  const HOVER_SIZE = 3;

  const { current, goalTotal, goalMonthly, isPass, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const [isThinking, setIsThinking] = useState(false);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.3); // TODO: this should change with every click

  const [splitCard, setSplitCard] = useState(currentCard);
  const [highlightIndex] = useState(0); // TODO: this should not be static
  const [goalCard] = useState({
    ...currentCard,
    stats: { ...currentCard.stats, total: goalTotal, monthly: goalMonthly },
  });

  const getFocus = () => {
    // TODO: maintain the focused data point as state
    // TODO: start with currentCard, then splitCard, then goalCard
    const isBetterThanGoal = isBetterThanCard(goalCard);
    const isCloseToSplit = isCloseToCard(splitCard, 1000, 100);

    // split is how I set focus
    return isBetterThanGoal(splitCard)
      ? isBetterThanGoal // goal in the bottom-right
      : isCloseToSplit; // split to the middle
  };

  const makeUniqueCandidates = (size, src) => {
    const cards = makeCandidates(size, src, jitter).map(candidateToCard);
    return deDupeCardsByStat(cards, "monthly");
  };

  // TODO: decide on the best candidate, but mutate the whole thing
  // TODO: fix the sort, best candidate is not always the first
  // TODO: flatMap is how I can inject more candidates into existing array
  // TODO: somehow the actual best candidate does not get picked
  // TODO: the logic for current/split needs to be animatable differently
  const makeCardsForCandidate = (src) => {
    setIsThinking(true);

    setTopCards((prev) => {
      // multiple sorts, multiple best candidates combined into one array
      const bests = Object.keys(CARD_SORTS).flatMap((sortKey) =>
        makeUniqueCandidates(INIT_SIZE, src)
          .sort(CARD_SORTS[sortKey])
          .slice(0, TOP_SIZE),
      );

      // TODO: splitCard needs to point to one of these, find which one
      setIsThinking(false);
      return [...prev, ...bests].filter(getFocus());
    });
  };

  // initialize the top cards
  useEffect(() => {
    makeCardsForCandidate(current);
  }, [current]);

  // changing the split card generates more cadidates
  useEffect(() => {
    makeCardsForCandidate(splitCard.candidate);
  }, [splitCard]);

  // TODO: explore by HOVERING
  // explore by clicking on a data point, which generates new mutations
  const onClick = (card) => {
    const { candidate } = card;
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(candidate.join("\n")); // newlines for the spreadsheet

    setJitter((prev) => prev * 0.92); // less jitter with each click
    setSplitCard(card);
  };

  const onHover = (card) => {
    // append only, no filtering
    // setTopCards((prev) => [
    //   ...prev,
    //   makeUniqueCandidates(HOVER_SIZE, card.candidate),
    // ]);
    // setSplitCard(card);
  };

  // TODO: rename to current, goal, and active (split) cards
  // TODO: show a pie chart of the split card
  return (
    <div className="h-screen w-3/4 md:w-1/2 p-4 space-y-5 flex flex-col items-center bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2 select-none">
        <h2 className="text-blue-500">
          Current ({jitter}):
          {JSON.stringify(currentCard.stats).replace(/\"/g, "")}
        </h2>

        <div className="h-[20em] flex flex-row justify-between w-full">
          <CandidateChart card={currentCard} title="current" />
          <CandidateChart card={splitCard} title="split" />
        </div>
      </header>
      <div className="w-full h-full">
        {isThinking && <div className="text-blue-400">Thinking...</div>}

        {isThinking && !topCards.length > 0 && (
          <div className="text-red-400">No passing candidates!</div>
        )}

        {topCards.length > 0 && (
          <CandidatesChart
            cards={topCards}
            goal={goalCard}
            split={splitCard}
            onClick={onClick}
            onHover={onHover}
          />
        )}
      </div>
    </div>
  );
}
