'use client';

import { useState, useEffect } from 'react';

type Quote = {
  text: string;
  author: string;
  category: 'fitness' | 'spirituality' | 'love' | 'motivation';
};

const quotes: Quote[] = [
  // Fitness quotes
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "fitness"
  },
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "fitness"
  },
  {
    text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: "Khloe Kardashian",
    category: "fitness"
  },
  {
    text: "The body achieves what the mind believes.",
    author: "Unknown",
    category: "fitness"
  },
  {
    text: "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom.",
    author: "Jack LaLanne",
    category: "fitness"
  },
  
  // Spirituality quotes
  {
    text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.",
    author: "Caroline Myss",
    category: "spirituality"
  },
  {
    text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
    author: "Pierre Teilhard de Chardin",
    category: "spirituality"
  },
  {
    text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi",
    category: "spirituality"
  },
  {
    text: "The wound is the place where the Light enters you.",
    author: "Rumi",
    category: "spirituality"
  },
  {
    text: "The spiritual journey is the unlearning of fear and the acceptance of love.",
    author: "Marianne Williamson",
    category: "spirituality"
  },
  
  // Love quotes
  {
    text: "Love is the bridge between you and everything.",
    author: "Rumi",
    category: "love"
  },
  {
    text: "Love yourself first and everything else falls into line.",
    author: "Lucille Ball",
    category: "love"
  },
  {
    text: "The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart.",
    author: "Helen Keller",
    category: "love"
  },
  {
    text: "Where there is love there is life.",
    author: "Mahatma Gandhi",
    category: "love"
  },
  {
    text: "To love oneself is the beginning of a lifelong romance.",
    author: "Oscar Wilde",
    category: "love"
  },
  
  // Motivation quotes
  {
    text: "Your only limit is you.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    category: "motivation"
  },
  {
    text: "It's not about perfect. It's about effort. And when you bring that effort every single day, that's where transformation happens.",
    author: "Jillian Michaels",
    category: "motivation"
  },
  {
    text: "Dream bigger. Do bigger.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "motivation"
  }
];

export default function InspirationQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  
  // Choose a random quote when the component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);
  
  if (!quote) {
    return null;
  }
  
  return (
    <div className="py-8 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
      <h3 className="text-sm uppercase text-neutral-500 dark:text-neutral-400 font-medium tracking-wider mb-4">Daily Inspiration</h3>
      <blockquote className="text-lg italic font-normal text-neutral-700 dark:text-neutral-300 mb-3">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-right text-sm text-neutral-500 dark:text-neutral-400">
        — {quote.author}
      </p>
    </div>
  );
} 