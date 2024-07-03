import React, { useContext, useEffect, useState } from "react";
import {
  CARD_SORTS,
  DividendContext,
  deDupeCardsByStat,
  makeCandidates,
  isCloseToCard,
  isBetterThanCard,
  isBetterStats,
  dfs,
  candidateCombinations,
  mutateCandidate,
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";
import CandidateChart from "./CandidateChart";
import CardStats from "./CardStats";
import CardDetails from "./CardDetails";

// TODO: I can download dividends CSV from fidelity, instead of my own spreadsheet
// it contains name, now, and cost, which is all I really need. There is no OK though.
// but then I would not need to fetch prices. I still need to fetch expense ratios.

// TODO: this is where backtracking algo would work well
// TODO: hovering over a point should highlight the same candidate elsewhere
// TODO: color code a third dimension, like ROI to transparency
// TODO: add horizontal and vertical cutoffs for both charts
// TODO: consider making goal just a x/y coordinate on both charts, i.e., they maintain their own
// TODO: each chart should know to zoom in to the appropriate quadrant of the xy coordinate
export default function DividendDash() {
  const INIT_SIZE = 10_000;
  const CLICK_SIZE = 1_000;

  const { current, prices, goalTotal, goalMonthly, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const [isThinking, setIsThinking] = useState(false);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.5); // fraction of the number of shares

  const [splitCard, setSplitCard] = useState(currentCard);
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

  const mutateCards = (cards) => {
    return cards.map(({ candidate }) => candidateToCard(mutateCandidate(candidate)));
  }

  const makeCardsForCandidate = (src) => {
    setIsThinking(true);

    const candidates = makeCandidates(current, CLICK_SIZE, jitter).map(
      candidateToCard,
    );

    setJitter((prev) => prev * 0.9); // decrease jitter

    setTopCards((prev) => {
      // multiple sorts, multiple best candidates combined into one array
      // const bests = Object.keys(CARD_SORTS).flatMap((sortKey) =>
      //   candidates.sort(CARD_SORTS[sortKey]).slice(0, TOP_SIZE),
      // );

      // TODO: splitCard needs to point to one of these, find which one
      setIsThinking(false);
      return deDupeCardsByStat([...prev, ...candidates], "monthly").filter(
        getFocus(),
      );
    });
  };

  // TODO: the de-duping logic becomes relevant once I meet the goal
  // TODO: if I can consider N closest changes in multiples of 10, there is no need for click
  // TODO: I kind of like exploring by clicking, but it's not the most efficient
  const initializeTopCards = () => {
    const isBetterThanGoal = isBetterThanCard(goalCard);

    // do not use makeCardsForCandidate here, because we need to see the cards
    let cards = [];

    const candidates = makeCandidates(current, INIT_SIZE, 0.3).map(
      candidateToCard,
    );
    cards = deDupeCardsByStat([...cards, ...candidates], "monthly");

    if (cards.some(isBetterThanGoal)) {
      console.log(`Found a card that's better than goal`);
      cards = cards.filter(isBetterThanGoal);
      setSplitCard(cards[0]); // otherwise it stays at current, initial value
    }

    setTopCards(cards);
  };
  useEffect(initializeTopCards, [current]);

  // TODO: this does not work
  // useEffect(() => {
  //   const c = Array(current.length).fill(0);
  //   let b = Array(current.length).fill(0);

  //   // TODO: some kind of memoization should happen here
  //   const isBetterThan = (a, b) =>
  //     isBetterStats(candidateToCard(a), candidateToCard(b));

  //   dfs(c, b, isBetterThan, prices);
  //   console.log("best:", b);

  //   // let cards = [];
  //   // setTopCards(cards);
  // }, [current]);

  // explore by clicking on a data point, which generates new mutations
  const onClick = (card) => {
    const { candidate } = card;
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(candidate.join("\n")); // newlines for the spreadsheet

    setSplitCard(card);
    makeCardsForCandidate(candidate);
  };

  const onHover = (card) => {
    // TODO: explore by HOVERING
    // append only, no filtering
    // setTopCards((prev) => [
    //   ...prev,
    //   makeCandidates(card.candidate, HOVER_SIZE),
    // ]);
    setSplitCard(card);
  };

  // TODO: rename to current, goal, and active (split) cards
  return (
    <div className="h-screen w-3/4 md:w-1/2 p-4 space-y-5 flex flex-col items-center bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2 select-none">
        <CardStats cards={{ current: currentCard, split: splitCard }} />
        <CardDetails cards={{ current: currentCard, split: splitCard }} />
      </header>
      <div className="w-full h-full">
        {isThinking && <div className="text-blue-400">Thinking...</div>}

        {isThinking && !topCards.length > 0 && (
          <div className="text-red-400">No passing candidates!</div>
        )}

        {topCards.length > 0 && (
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
