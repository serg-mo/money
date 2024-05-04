import React, { useContext, useEffect, useState } from "react";
import {
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
  const INIT_SIZE = 1_000;
  const CLICK_SIZE = 100;

  const { current, goalTotal, goalMonthly, isPass, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const { monthly, total } = getStats(current);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.1); // TODO: this should change with every click

  const [roiSplitCard, setRoiSplitCard] = useState(currentCard);
  const [ratioSplitCard, setRatioSplitCard] = useState(currentCard);

  // there is always a source candidate
  const addTopCards = (size, src) => {
    const passing = makeCandidates(size, src, jitter); //.filter(isPass);

    // NOTE: must be this shape, because we need to sort by stats, CandidateCard shape
    const cards = [
      candidateToCard(current), // must be first to be highlighted
      ...topCards,
      ...passing.map(candidateToCard),
    ];
    const deDuped = deDupeCardsByStat(cards, "total");
    console.log(`deDupeCards: ${cards.length} -> ${deDuped.length}`);

    setTopCards(deDuped);
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

    // TODO: setJitter(prev => prev * 0.9); // less jitter with each click
    setRoiSplitCard(card);
    setRatioSplitCard(card);

    addTopCards(CLICK_SIZE, candidate);
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
              dims={["total", "monthly"]}
              split={roiSplitCard}
              onClick={onClick}
            />
            <CandidatesChart
              cards={topCards}
              dims={["exp", "roi"]}
              split={ratioSplitCard}
              onClick={onClick}
            />
          </>
        )}
      </div>
    </div>
  );
}
