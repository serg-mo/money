import React, { useContext, useEffect, useState } from "react";
import {
  DividendContext,
  isBetterThanCard,
  isCloseToCard,
  makeCandidates,
  mutateCandidate
} from "../../utils/dividends";
import CandidatesChart from "./CandidatesChart";
import CardDetails from "./CardDetails";

// TODO: I can download dividends CSV from fidelity, instead of my own spreadsheet
// it contains name, now, and cost, which is all I really need. There is no OK though.
// but then I would not need to fetch prices. I still need to fetch expense ratios.

// TODO: compute delta/buy/sell/total for a given candidate
// TODO: this is where backtracking algo would work well
// TODO: color code a third dimension, like ROI to transparency
export default function DividendDash() {
  const INIT_SIZE = 20_000;
  const CLICK_SIZE = 3_000;

  const { current, prices, goalTotal, goalMonthly, getStats } =
    useContext(DividendContext);

  const candidateToCard = (candidate) => ({
    candidate,
    stats: getStats(candidate),
  });

  const currentCard = candidateToCard(current);
  const [topCards, setTopCards] = useState([]);
  const [jitter, setJitter] = useState(0.5); // fraction of the number of shares
  const [splitCard, setSplitCard] = useState(currentCard);
  const [goalCard] = useState({
    ...currentCard,
    stats: { ...currentCard.stats, total: goalTotal, monthly: goalMonthly },
  });


  const isBetterThanGoal = isBetterThanCard(goalCard); // goal in the bottom-right
  const isCloseToSplit = isCloseToCard(splitCard, 1000, 100); // split to the middle

  const getFocus = (card) => {
    // TODO: maintain the focused data point as state
    // TODO: start with currentCard, then splitCard, then goalCard
    return isBetterThanGoal(card) ? isBetterThanGoal : isCloseToSplit;
  };

  const mutateCards = (cards) => {
    return cards.map(({ candidate }) => candidateToCard(mutateCandidate(candidate)));
  }

  // TODO: this should be a useEffect for changing splitCard
  const makeCardsForCandidate = (src) => {
    const cards = makeCandidates(current, CLICK_SIZE, jitter).map(candidateToCard);
    setJitter((prev) => prev * 0.95); // decrease jitter

    setTopCards((prev) => {
      // TODO: splitCard needs to point to one of these, find which one
      // return deDupeCardsByStat([...prev, ...cards], "monthly").filter(
      //   getFocus(),
      // );

      // NOTE: when I dedupe, I don't consider a ton of candidates
      return [...prev, ...cards].filter(getFocus(splitCard));
    });
  };

  // TODO: if I can consider N closest changes in multiples of 10, there is no need for click
  // TODO: I kind of like exploring by clicking, but it's not the most efficient
  const initializeTopCards = () => {
    if (topCards.length) {
      return;
    }

    // do not use makeCardsForCandidate here, because we need to see the cards
    // NOTE: when I dedupe, I don't consider a ton of candidates
    const cards = makeCandidates(current, INIT_SIZE, jitter).map(candidateToCard);

    const better = cards.find(isBetterThanGoal);
    if (better) {
      // TODO: the de-duping logic becomes relevant once I meet the goal
      // TODO: sor by desc cost and chop off the top
      console.log(`Found a card that's better than goal`);
      setSplitCard(better); // otherwise it stays at current, initial value
      setTopCards(cards.filter(getFocus(better)));
    } else {
      setTopCards(cards);
    }
  };
  useEffect(initializeTopCards, [current, topCards]);

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
    const load = async (text) => await navigator.clipboard.writeText(text);
    load(card.candidate.join("\n")); // newlines for spreadsheet

    setSplitCard(card);
    makeCardsForCandidate(card.candidate);
  };

  const onHover = (card) => {
    // TODO: explore by HOVERING
    // append only, no filtering
    // setTopCards((prev) => [
    //   ...prev,
    //   makeCandidates(card.candidate, HOVER_SIZE),
    // ]);
    // setSplitCard(card);
  };

  // TODO: add another chart for cost vs p&l
  // TODO: rename to current, goal, and active (split) cards
  return (
    <div className="h-screen p-4 space-y-5 flex flex-col items-center content-start bg-gray-100 rounded-lg shadow-lg">
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
