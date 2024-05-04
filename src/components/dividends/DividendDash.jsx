import React, { useContext, useEffect, useState } from "react";
import {
  mutateCandidate,
  DividendContext,
  deDupeCards,
  candidateToCard,
  makeCandidates,
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";

// TODO: this is where backtracking algo would work well
// TODO: hovering over a point should highlight the same candidate elsewhere
// TODO: color code a third dimension, like ROI to transparency
// TODO: add horizontal and vertical cutoffs for both charts

export default function DividendDash() {
  const INIT_SIZE = 1_000;
  const CLICK_SIZE = 1_000;

  const { current, goalTotal, goalMonthly, isPass, getStats } =
    useContext(DividendContext);
  const { monthly, total } = getStats(current);
  const [topCards, setTopCards] = useState([]);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  // there is always a source candidate
  const updateTopCards = (size, src) => {
    const passing = makeCandidates(size, src); //.filter(isPass);

    // NOTE: must be this shape, because we need to sort by stats, CandidateCard shape
    const cards = [
      candidateToCard(current), // must be first to be highlighted
      ...topCards,
      ...passing.map(candidateToCard),
    ];
    const deDuped = cards; // deDupeCards(cards);
    console.log(`updateTopCards: ${cards.length} -> ${deDuped.length}`);

    setTopCards(deDuped);
  };

  useEffect(() => {
    if (Object.keys(current).length) {
      updateTopCards(INIT_SIZE, current);
    }
  }, [current]);

  // explore by clicking on a data point, which generates new mutations
  const onClick = ({ candidate }) => {
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(candidate.join("\n")); // newlines for the spreadsheet

    updateTopCards(CLICK_SIZE, candidate);
  };

  return (
    <div className="h-screen w-1/2 p-4 space-y-5 flex flex-col items-center bg-gray-100 rounded-lg shadow-lg">
      <header className="text-center rounded p-2">
        <h2>
          Goal: ${goalMonthly}/mo for ${goalTotal} total
        </h2>
        <h2>
          Current: ${monthly}/mo for ${total} total
        </h2>
      </header>
      <div className="w-full h-full">
        {!topCards.length ? (
          <div className="text-red-400">No passing candidates!</div>
        ) : (
          <>
            <CandidatesChart
              cards={topCards}
              x="total"
              y="monthly"
              onClick={onClick}
            />
            <CandidatesChart
              cards={topCards}
              x="exp"
              y="roi"
              onClick={onClick}
            />
          </>
        )}
      </div>
    </div>
  );
}
