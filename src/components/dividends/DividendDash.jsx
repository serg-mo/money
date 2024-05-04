import React, { useContext, useEffect, useState } from "react";
import {
  CARD_SORTS,
  DividendContext,
  deDupeCardsByStat,
  makeCandidates,
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";

// TODO: this is where backtracking algo would work well
// TODO: hovering over a point should highlight the same candidate elsewhere
// TODO: color code a third dimension, like ROI to transparency
// TODO: add horizontal and vertical cutoffs for both charts
// TODO: consider making goal just a x/y coordinate on both charts, i.e., they maintain their own
// TODO: each chart should know to zoom in to the appropriate quadrant of the xy coordinate
export default function DividendDash() {
  const TOP_SIZE = 50;
  const INIT_SIZE = 1000;
  const CLICK_SIZE = 100;

  const { current, goalTotal, goalMonthly, isPass, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.1); // TODO: this should change with every click

  const [splitCard, setSplitCard] = useState(currentCard);
  const [highlightIndex] = useState(0); // TODO: this should not be static
  const [goalCard] = useState({
    ...currentCard,
    stats: { ...currentCard.stats, total: goalTotal, monthly: goalMonthly },
  });

  // there is always a source candidate
  const addTopCards = (size, src) => {
    const candidates = makeCandidates(size, src, jitter); //.filter(isPass);

    // NOTE: must be this shape, because we need to sort by stats, CandidateCard shape
    const cards = [...topCards, ...candidates.map(candidateToCard)];
    // TODO: write a card distance function

    // returns the percent deviation of a relative to b
    const getDistanceOnStat = (a, b, stat) => {
      return (a.stats[stat] - b.stats[stat]) / b.stats[stat];
    };

    const getAbsDistanceOnStat = (a, b, stat) => {
      return Math.abs(getDistanceOnStat(a, b, stat));
    };

    const isBetterThan = (a, b) => {
      return a.stats.total < b.stats.total && a.stats.monthly > b.stats.monthly;
    };

    // TODO: this changes if we're close to the goal
    // const focus = isBetterThan(splitCard, goalCard) ? splitCard : splitCard;

    const isCloseToSplitcard = (card) => {
      return (
        getAbsDistanceOnStat(card, splitCard, "total") < 0.1 ||
        getAbsDistanceOnStat(card, splitCard, "monthly") < 0.1
      );
    };

    const isCloseToGoal = (card) => {
      return (
        getDistanceOnStat(card, goalCard, "total") < 0.05 &&
        getDistanceOnStat(card, goalCard, "monthly") > -0.05
      );
    };

    // snap focus to goal when close to it
    const isClose = isBetterThan(splitCard, goalCard)
      ? isCloseToGoal
      : isCloseToSplitcard;

    // TODO: always focus around the splitCard or goalCard
    // TODO: switch between where to focus depending where we are, i.e., snap to points

    // NOTE: sorting and slicing really messes with the red lines
    const newTop = deDupeCardsByStat(cards, "total").filter(isClose);

    console.log(`addTopCards: ${cards.length} -> ${newTop.length}`);
    setTopCards(newTop);
  };

  useEffect(() => {
    if (Object.keys(current).length) {
      addTopCards(INIT_SIZE, current);
    }
  }, [current]);

  // explore by clicking on a data point, which generates new mutations
  const onClick = (card) => {
    const { candidate } = card;
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(candidate.join("\n")); // newlines for the spreadsheet

    setJitter((prev) => prev * 1.1); // more jitter with each click
    setSplitCard(card);

    addTopCards(CLICK_SIZE, candidate);
  };

  return (
    <div className="h-screen w-1/2 p-4 space-y-5 flex flex-col items-center bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2">
        <h2 className="text-green-500">
          Goal: {JSON.stringify(goalCard.stats).replace(/\"/g, "")}
        </h2>
        <h2 className="text-red-500">
          Split: {JSON.stringify(splitCard.stats).replace(/\"/g, "")}
        </h2>
        <h2 className="text-blue-500">
          Current: {JSON.stringify(currentCard.stats).replace(/\"/g, "")}
        </h2>
      </header>
      <div className="w-full h-full">
        {!topCards.length ? (
          <div className="text-red-400">No passing candidates!</div>
        ) : (
          <>
            <CandidatesChart
              cards={topCards}
              dims={["total", "monthly"]}
              goal={goalCard}
              split={splitCard}
              onClick={onClick}
            />
            <CandidatesChart
              cards={topCards}
              dims={["exp", "roi"]}
              goal={goalCard}
              split={splitCard}
              onClick={onClick}
            />
          </>
        )}
      </div>
    </div>
  );
}
