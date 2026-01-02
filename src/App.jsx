import React, { useState, useEffect } from 'react';

const EXERCISES = ['pushups', 'squats', 'pullups'];
const TARGET = 10000;
const STORAGE_KEY = 'misogi-2026';

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function App() {
  const [data, setData] = useState({ logs: {} });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState({ pushups: '', squats: '', pullups: '' });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.log('No existing data');
    }
    setLoading(false);
  }

  function saveData(newData) {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  function addReps(exercise, amount) {
    const newData = { ...data, logs: { ...data.logs } };
    if (!newData.logs[selectedDate]) {
      newData.logs[selectedDate] = { pushups: 0, squats: 0, pullups: 0 };
    }
    newData.logs[selectedDate] = {
      ...newData.logs[selectedDate],
      [exercise]: (newData.logs[selectedDate][exercise] || 0) + amount
    };
    saveData(newData);
  }

  function handleCustomAdd(exercise) {
    const amount = parseInt(customAmount[exercise]);
    if (amount > 0) {
      addReps(exercise, amount);
      setCustomAmount({ ...customAmount, [exercise]: '' });
    }
  }

  function getTotals() {
    const totals = { pushups: 0, squats: 0, pullups: 0 };
    Object.values(data.logs || {}).forEach(day => {
      EXERCISES.forEach(ex => {
        totals[ex] += day[ex] || 0;
      });
    });
    return totals;
  }

  function getWeekTotals() {
    const currentWeek = getWeekNumber(new Date(selectedDate));
    const currentYear = new Date(selectedDate).getFullYear();
    const totals = { pushups: 0, squats: 0, pullups: 0 };
    Object.entries(data.logs || {}).forEach(([date, day]) => {
      const d = new Date(date);
      if (getWeekNumber(d) === currentWeek && d.getFullYear() === currentYear) {
        EXERCISES.forEach(ex => {
          totals[ex] += day[ex] || 0;
        });
      }
    });
    return totals;
  }

  function getDayTotals() {
    return data.logs?.[selectedDate] || { pushups: 0, squats: 0, pullups: 0 };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const yearTotals = getTotals();
  const weekTotals = getWeekTotals();
  const dayTotals = getDayTotals();
  const today = formatDate(new Date());

  const exerciseConfig = {
    pushups: { label: 'Push-ups', emoji: '💪', color: 'bg-amber-500' },
    squats: { label: 'Squats', emoji: '🦵', color: 'bg-emerald-500' },
    pullups: { label: 'Pull-ups', emoji: '🏋️', color: 'bg-sky-500' }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Misogi 2026</h1>
          <p className="text-zinc-500 text-sm">10,000 each · 30,000 total</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(formatDate(d));
            }}
            className="p-2 bg-zinc-800 rounded-lg active:bg-zinc-700"
          >
            ←
          </button>
          <div className="bg-zinc-800 px-4 py-2 rounded-lg text-center min-w-40">
            <div className="font-medium">
              {selectedDate === today ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-xs text-zinc-500">Day {getDayOfYear(new Date(selectedDate))}</div>
          </div>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              if (d <= new Date()) setSelectedDate(formatDate(d));
            }}
            className="p-2 bg-zinc-800 rounded-lg active:bg-zinc-700"
          >
            →
          </button>
        </div>

        {/* Exercise Cards */}
        {EXERCISES.map(exercise => {
          const config = exerciseConfig[exercise];
          const dayCount = dayTotals[exercise] || 0;
          const yearCount = yearTotals[exercise] || 0;
          const pct = ((yearCount / TARGET) * 100).toFixed(1);
          
          return (
            <div key={exercise} className="bg-zinc-900 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.emoji}</span>
                  <span className="font-semibold">{config.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{dayCount}</div>
                  <div className="text-xs text-zinc-500">today</div>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex gap-2 mb-3">
                {[1, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => addReps(exercise, n)}
                    className="flex-1 bg-zinc-800 active:bg-zinc-700 py-3 rounded-xl font-medium transition-colors"
                  >
                    +{n}
                  </button>
                ))}
                <div className="flex-1 flex gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={customAmount[exercise]}
                    onChange={(e) => setCustomAmount({ ...customAmount, [exercise]: e.target.value })}
                    placeholder="#"
                    className="w-12 bg-zinc-800 rounded-l-xl px-2 text-center outline-none"
                  />
                  <button
                    onClick={() => handleCustomAdd(exercise)}
                    className="bg-zinc-700 active:bg-zinc-600 px-3 rounded-r-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${config.color} transition-all duration-300`}
                  style={{ width: `${Math.min(100, (yearCount / TARGET) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{yearCount.toLocaleString()} / 10,000</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}

        {/* Weekly Summary */}
        <div className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <h3 className="font-semibold mb-3">Week {getWeekNumber(new Date(selectedDate))} Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {EXERCISES.map(ex => (
              <div key={ex}>
                <div className="text-xl font-bold">{weekTotals[ex]}</div>
                <div className="text-xs text-zinc-500">{exerciseConfig[ex].label}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3 pt-3 border-t border-zinc-800">
            <span className="text-zinc-400">Week Total: </span>
            <span className="font-bold">{weekTotals.pushups + weekTotals.squats + weekTotals.pullups}</span>
          </div>
        </div>

        {/* Year Totals */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <h3 className="font-semibold mb-3">2026 Year-to-Date</h3>
          <div className="space-y-2">
            {EXERCISES.map(ex => (
              <div key={ex} className="flex justify-between text-sm">
                <span className="text-zinc-400">{exerciseConfig[ex].label}</span>
                <span>{yearTotals[ex].toLocaleString()} <span className="text-zinc-600">/ 10k</span></span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t border-zinc-800">
              <span>Total</span>
              <span>{(yearTotals.pushups + yearTotals.squats + yearTotals.pullups).toLocaleString()} <span className="text-zinc-600">/ 30k</span></span>
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="mt-4 text-center text-sm text-zinc-500">
          {(TARGET - yearTotals.pullups).toLocaleString()} pull-ups to go · {365 - getDayOfYear(new Date())} days left
        </div>
      </div>
    </div>
  );
}
