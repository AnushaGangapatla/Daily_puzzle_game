// Heatmap fully powered by IndexedDB
// No server dependency for display
// Works 100% offline
import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { db } from "../../db";

const intensityMap = {
  0: "bg-gray-200",
  1: "bg-green-200",
  2: "bg-green-400",
  3: "bg-green-600",
  4: "bg-green-800"
};

export default function HeatmapContainer() {
  const [activity, setActivity] = useState([]);

  // 🔥 Load activity from IndexedDB
  useEffect(() => {
    const loadActivity = async () => {
      const data = await db.dailyActivity.toArray();
      setActivity(data);
    };
    loadActivity();
  }, []);

  // 🔥 Convert array to date-based map
  const activityMap = useMemo(() => {
    const map = {};
    activity.forEach(item => {
      map[item.date] = item;
    });
    return map;
  }, [activity]);

  // 🔥 Generate full year days dynamically
  const days = useMemo(() => {
    const startOfYear = dayjs().startOf("year");
    const endOfYear = dayjs().endOf("year");

    const allDays = [];
    let current = startOfYear;

    while (current.isBefore(endOfYear) || current.isSame(endOfYear, "day")) {
      allDays.push(current);
      current = current.add(1, "day");
    }

    return allDays;
  }, []);

  // 🔥 Group into weeks (columns)
  const weeks = useMemo(() => {
    const result = [];
    let week = [];

    days.forEach(day => {
      if (week.length === 0 && day.day() !== 0) {
        for (let i = 0; i < day.day(); i++) {
          week.push(null);
        }
      }

      week.push(day);

      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      result.push(week);
    }

    return result;
  }, [days]);

  // 🔥 Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    let current = dayjs();

    while (activityMap[current.format("YYYY-MM-DD")]?.solved) {
      count++;
      current = current.subtract(1, "day");
    }

    return count;
  }, [activityMap]);

  return (
    <div className="mt-6">
      
      {/* 🔥 Streak Display */}
      <p className="mb-3 font-medium">
        🔥 Current Streak: {streak} day{streak !== 1 && "s"}
      </p>

      {/* 🔥 Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm bg-transparent"
                    />
                  );
                }

                const dateStr = day.format("YYYY-MM-DD");
                const data = activityMap[dateStr];

                let level = 0;
                if (data?.solved) {
                  if (data.score >= 150) level = 4;
                  else if (data.score >= 100) level = 3;
                  else if (data.score >= 50) level = 2;
                  else level = 1;
                }

                const isToday =
                  dateStr === dayjs().format("YYYY-MM-DD");

                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm cursor-pointer 
                      ${intensityMap[level]} 
                      ${isToday ? "ring-2 ring-blue-500" : ""}
                    `}
                    title={`${dateStr}
Score: ${data?.score || 0}
Solved: ${data?.solved ? "Yes" : "No"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-200 rounded-sm" />
        <div className="w-3 h-3 bg-green-200 rounded-sm" />
        <div className="w-3 h-3 bg-green-400 rounded-sm" />
        <div className="w-3 h-3 bg-green-600 rounded-sm" />
        <div className="w-3 h-3 bg-green-800 rounded-sm" />
        <span>More</span>
      </div>
    </div>
  );
}
