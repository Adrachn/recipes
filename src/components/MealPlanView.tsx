"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import Link from "next/link";
import CalendarRecipeCard from "./CalendarRecipeCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MealPlanData = {
  [date: string]: Recipe | null; // Key is YYYY-MM-DD
};

const SortableDay = ({
  id,
  date,
  recipe,
  isCurrentMonth,
  isToday,
}: {
  id: string;
  date: Date;
  recipe: Recipe | null;
  isCurrentMonth: boolean;
  isToday: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg p-2 flex flex-col border border-slate-200 min-h-[220px] touch-none ${
        isCurrentMonth ? "bg-slate-100" : "bg-slate-50 text-slate-400"
      } ${isToday ? "border-primary border-2" : ""}`}
    >
      <p
        className={`font-semibold text-sm text-right ${
          isToday ? "text-primary" : ""
        }`}
      >
        {date.getDate()}
      </p>
      <div className="flex-grow flex items-center justify-center mt-1">
        {recipe ? (
          <div
            className="w-full h-full transition-transform duration-200 ease-in-out group-hover:scale-105"
            style={{
              width: "var(--calendar-card-width)",
              height: "var(--calendar-card-height)",
            }}
          >
            <CalendarRecipeCard recipe={recipe} />
          </div>
        ) : (
          <div className="w-full h-full rounded-md" />
        )}
      </div>
    </div>
  );
};

export default function MealPlanView() {
  const [planData, setPlanData] = useState<MealPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem("monthlyMealPlan");
      if (savedPlan) {
        setPlanData(JSON.parse(savedPlan));
      } else {
        setPlanData({}); // Initialize with empty object if nothing is saved
      }
    } catch (error) {
      console.error("Failed to parse meal plan from localStorage", error);
      setPlanData({});
    }
    setIsLoading(false);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id && planData) {
      const activeDateKey = active.id as string;
      const overDateKey = over.id as string;

      const newPlanData = { ...planData };

      const draggedRecipe = newPlanData[activeDateKey] || null;
      const recipeAtDestination = newPlanData[overDateKey] || null;

      // Swap the recipes for the two dates
      newPlanData[activeDateKey] = recipeAtDestination;
      newPlanData[overDateKey] = draggedRecipe;

      setPlanData(newPlanData);
      localStorage.setItem("monthlyMealPlan", JSON.stringify(newPlanData));
    }
  };

  const generateMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    // Adjust to start the week on Monday (getDay() is 0 for Sun, 1 for Mon)
    const dayOfWeek = startDate.getDay();
    const daysToShift = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToShift);

    const grid = [];
    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const gridDate = new Date(startDate);
      gridDate.setDate(startDate.getDate() + i);
      grid.push(gridDate);
    }
    return grid;
  };

  const monthGrid = generateMonthGrid(currentDate);

  const changeMonth = (offset: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const getTodayKey = () => {
    return new Date().toISOString().split("T")[0];
  };

  const todayKey = getTodayKey();

  if (isLoading) {
    return (
      <div className="text-center text-slate-500">Loading your plan...</div>
    );
  }

  // Get all unique recipe slugs and date keys for SortableContext
  const itemIds = monthGrid.map((day) => day.toISOString().split("T")[0]);
  const activeRecipe = activeId
    ? Object.values(planData || {}).find((r) => r?.slug === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-md hover:bg-slate-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-md hover:bg-slate-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center font-bold text-slate-600 p-2">
              {day}
            </div>
          ))}
          {monthGrid.map((day) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const dateKey = day.toISOString().split("T")[0]; // YYYY-MM-DD
            const recipe = planData?.[dateKey] || null;
            const isToday = dateKey === todayKey;

            return (
              <SortableDay
                key={dateKey}
                id={dateKey}
                date={day}
                recipe={recipe}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
              />
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeRecipe ? (
          <div
            style={{
              width: "var(--calendar-card-width)",
              height: "var(--calendar-card-height)",
              transform: "scale(0.85)",
              transformOrigin: "top",
            }}
          >
            <CalendarRecipeCard recipe={activeRecipe} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
