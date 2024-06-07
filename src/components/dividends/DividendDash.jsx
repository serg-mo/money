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
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";
import CandidateChart from "./CandidateChart";
import { lookupDividends } from "../../utils/dividends";

// TODO: this is where backtracking algo would work well
// TODO: hovering over a point should highlight the same candidate elsewhere
// TODO: color code a third dimension, like ROI to transparency
// TODO: add horizontal and vertical cutoffs for both charts
// TODO: consider making goal just a x/y coordinate on both charts, i.e., they maintain their own
// TODO: each chart should know to zoom in to the appropriate quadrant of the xy coordinate
export default function DividendDash() {
  const TOP_SIZE = 30;
  const INIT_SIZE = 1000;
  const CLICK_SIZE = 100;

  const { current, prices, goalTotal, goalMonthly, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const [isThinking, setIsThinking] = useState(false);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.3);

  const [splitCard, setSplitCard] = useState(currentCard);
  const [highlights, setHighlights] = useState([]);
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

  // TODO: decide on the best candidate, but mutate the whole thing
  // TODO: fix the sort, best candidate is not always the first
  // TODO: flatMap is how I can inject more candidates into existing array
  // TODO: somehow the actual best candidate does not get picked
  // TODO: the logic for current/split needs to be animatable differently
  // TODO: jitter is really a measure of how much to mutate the current candidate
  // TODO: csv has "since" column + I only do one transaction at a time, so mutate one fund at a time
  const makeCardsForCandidate = (src, size) => {
    setIsThinking(true);

    setTopCards((prev) => {
      // multiple sorts, multiple best candidates combined into one array
      const bests = Object.keys(CARD_SORTS).flatMap((sortKey) =>
        makeCandidates(src, size, jitter)
          .map(candidateToCard)
          .sort(CARD_SORTS[sortKey])
          .slice(0, TOP_SIZE),
      );

      // TODO: splitCard needs to point to one of these, find which one
      setIsThinking(false);
      return deDupeCardsByStat([...prev, ...bests], "monthly").filter(
        getFocus(),
      );
    });
  };

  // initialize the top cards
  useEffect(() => {
    const isBetterThanGoal = isBetterThanCard(goalCard);
    let cards = [];
    for (let i = 0; i < 10; i++) {
      // do not use makeCardsForCandidate here, because we need to see the cards
      // multiple sorts, multiple best candidates combined into one array
      cards = deDupeCardsByStat(
        [
          ...cards,
          ...makeCandidates(current, INIT_SIZE, jitter).map(candidateToCard),
        ],
        "monthly",
      );

      if (cards.some(isBetterThanGoal)) {
        console.log(`Found a card that's better than goal on ${i} iteration`);
        cards = cards.filter(isBetterThanGoal);

        setSplitCard(cards[0]); // otherwise it stays at current, initial value
        break;
      }
    }

    setTopCards(cards);
  }, [current]);

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

    setHighlights((prev) => [...prev, card]);
    setJitter((prev) => prev * 0.92); // less jitter with each click

    setSplitCard(card);
    makeCardsForCandidate(candidate, CLICK_SIZE);
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

  const cardStats = Object.entries({
    current: currentCard,
    split: splitCard,
    goal: goalCard,
  }).map(([key, { stats }]) => (
    <div key={key}>
      {key}: {JSON.stringify(stats).replace(/\"/g, "")}
    </div>
  ));

  // lookupDividends("XYLD").then(console.log);

  // TODO: rename to current, goal, and active (split) cards
  // TODO: show a pie chart of the split card
  return (
    <div className="h-screen w-3/4 md:w-1/2 p-4 space-y-5 flex flex-col items-center bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2 select-none">
        <div className="text-sm text-blue-500">{cardStats}</div>

        <div className="h-[20em] flex flex-col items-center">
          <CandidateChart current={currentCard} split={splitCard} />
        </div>

        {/* <div>{ JSON.stringify(highlights)}</div> */}
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
