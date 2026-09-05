import React, { useMemo } from 'react';

interface DynamicGreetingProps {
  userName?: string;
  totalVisits?: number;
}

export const DynamicGreeting: React.FC<DynamicGreetingProps> = ({ userName = "Explorer", totalVisits = 0 }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = userName;

    if (hour >= 5 && hour < 12) {
      const morningGreetings = [
        `Morning, ${name} ☀️ Chai or mango popsicle today?`,
        `${name}, chai first or adventure first? ☕`,
        `Good morning, ${name}. Where are we escaping to today?`,
        `Fresh day in Warangal! What's the morning mission?`
      ];
      return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    } else if (hour >= 12 && hour < 17) {
      const afternoonGreetings = [
        `${name}, hungry? 🍛 Biryani or ice cream calling?`,
        `Afternoon slump, ${name}? Let's grab something chilled.`,
        `Have you explored anywhere new today, ${name}?`,
        `Sun is high in Hanamkonda. Time to refuel.`
      ];
      return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
    } else if (hour >= 17 && hour < 21) {
      const eveningGreetings = [
        `${name}, sunset or street food tonight? 🌅`,
        `Bored, ${name}? Good. Let's fix that right now.`,
        `${name}, what's the plan tonight with the gang?`,
        `Golden hour in Warangal. Don't waste it at home.`
      ];
      return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
    } else {
      const nightGreetings = [
        `${name}, still awake? 🌙 Late-night food mission?`,
        `Hunter Road drive-in is calling your name, ${name}.`,
        `Night owl hours in Kazipet! Where are we rolling?`,
        `The city is quiet, but cravings never sleep, ${name}.`
      ];
      return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
    }
  }, [userName]);

  return (
    <div className="px-4 pt-3 pb-1 max-w-md mx-auto">
      <div className="bg-[#F2E829] p-3.5 rounded-xl border-3 border-black shadow-retro flex items-center justify-between text-black">
        <div>
          <h2 className="font-heading font-black text-base text-black leading-snug">
            {greeting}
          </h2>
          <div className="text-[11px] text-black font-mono mt-0.5 flex items-center gap-1.5 flex-wrap font-medium">
            <span>📍 Warangal • Hanamkonda • Kazipet</span>
            {totalVisits > 0 && (
              <span className="text-black font-black bg-[#F2B949] px-1.5 py-0.5 rounded border border-black">• {totalVisits} visits logged</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
