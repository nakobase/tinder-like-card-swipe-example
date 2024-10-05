'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import dogs from '@/data/dogs.json';
import TinderCard from 'react-tinder-card';
import { ThumbsDown, ThumbsUp, Undo2 } from 'lucide-react';

export const TinderLikeCardSwipe = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(dogs.length - 1);
  const [percentage, setPercentage] = useState<number>(0);
  const [swipedList, setSwipedList] = useState<{ name: string; isLiked: boolean }[]>([]);

  const currentIndexRef = useRef<number>(currentIndex);
  const canGoBack = currentIndex < dogs.length - 1;
  const canSwipe = currentIndex >= 0;


  const cardRefs = useMemo(
    () => Array.from({ length: dogs.length }, () => React.createRef<any>()),
    [dogs.length],
  );

  const calculateProgress = useCallback(
    (index: number) => {
      const progress = 1 - (index + 1) / dogs.length;
      setPercentage(progress);
    },
    [dogs.length],
  );

  const updateCurrentIndex = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
      calculateProgress(newIndex);
    },
    [calculateProgress],
  );

  const goBack = useCallback(async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    await cardRefs[newIndex].current?.restoreCard();
    updateCurrentIndex(newIndex);
    setSwipedList((prev) => prev.slice(0, -1));
  }, [canGoBack, currentIndex, cardRefs, updateCurrentIndex]);

  const updateSwipedList = useCallback((name: string, isLiked: boolean) => {
    setSwipedList((prev) => {
      if (prev.some((item) => item.name === name)) return prev;
      return [...prev, { name, isLiked }];
    });
  }, []);

  const swipe = useCallback(
    async (direction: 'left' | 'right') => {
      if (canSwipe && currentIndex < dogs.length) {
        await cardRefs[currentIndex].current?.swipe(direction);
      }
    },
    [canSwipe, currentIndex, cardRefs],
  );

  const onSwipe = useCallback(
    (direction: string, index: number) => {
      updateCurrentIndex(index - 1);
      updateSwipedList(dogs[index].breed, direction === 'right');
    },
    [updateCurrentIndex, updateSwipedList],
  );

  const onCardLeftScreen = useCallback(
    (index: number) => {
      if (currentIndexRef.current >= index) {
        cardRefs[index].current?.restoreCard();
      }
    },
    [cardRefs],
  );

  return (
    <div className="mt-10 overflow-hidden w-full">
      <div className="flex items-center flex-col w-1/2 mx-auto">
        <h1 className="text-2xl">Tinder-like card swipe</h1>
        <span className="text-lg mt-8">
          {dogs.length - currentIndex - 1}/{dogs.length}
        </span>
        <div className="w-full h-2 bg-gray-500 mt-2 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${percentage * 100}%` }}
          />
        </div>
        <div className="mt-6 w-[300px] h-[420px] relative">
          {dogs.map((dog, index) => (
            <TinderCard
              ref={cardRefs[index]}
              key={dog.name}
              onSwipe={(dir) => onSwipe(dir, index)}
              onCardLeftScreen={() => onCardLeftScreen(index)}
              className="absolute w-full h-full overflow-hidden rounded-2xl shadow-lg"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-300 transform scale-100"
                style={{ backgroundImage: `url(${dog.image})` }}
              />
            </TinderCard>
          ))}
        </div>
        <div className="mt-8 flex flex-row gap-8">
          <button
            onClick={() => swipe('left')}
            className="w-12 h-12 rounded-full bg-gray-50 flex justify-center items-center shadow-lg"
          >
            <ThumbsDown />
          </button>
          <button
            onClick={goBack}
            className="w-12 h-12 rounded-full bg-gray-200 flex justify-center items-center shadow-lg"
          >
            <Undo2 />
          </button>
          <button
            onClick={() => swipe('right')}
            className="w-12 h-12 rounded-full bg-red-100 flex justify-center items-center shadow-lg"
          >
            <ThumbsUp />
          </button>
        </div>
        <div className="mt-10 bg-gray-100 p-4 w-full rounded-md">
          <h2 className="text-lg">Result</h2>
          <ul className="mt-4">
            {swipedList.map((item, index) => (
              <li key={index} className="flex items-center gap-4">
                <span>{item.isLiked ? '👍' : '👎'}</span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
