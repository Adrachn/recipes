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
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShoppingCart,
  X,
  Check,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

type MealPlanData = {
  [date: string]: Recipe | null; // Key is YYYY-MM-DD
};

const DaySlot = ({
  id,
  date,
  recipe,
  isCurrentMonth,
  isToday,
  isSelectionMode,
  isSelected,
  onSelectDay,
  onDelete,
}: {
  id: string;
  date: Date;
  recipe: Recipe | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelectDay: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const isSelectable = isSelectionMode && recipe;

  return (
    <div
      ref={setNodeRef}
      onClick={() => isSelectable && onSelectDay(id)}
      className={`rounded-lg p-2 flex flex-col border border-slate-200 min-h-[220px] transition-all duration-200 ${
        isCurrentMonth ? "bg-slate-100" : "bg-slate-50 text-slate-400"
      } ${isToday ? "border-primary border-2" : ""} ${
        isOver && !isSelectionMode ? "bg-slate-200" : ""
      } ${isSelectable ? "cursor-pointer" : ""}
      ${
        isSelected
          ? "ring-2 ring-primary ring-offset-2"
          : isSelectable
            ? "hover:ring-2 hover:ring-slate-300 bg-slate-200"
            : ""
      }
      `}
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
          <DraggableRecipeCard
            id={id}
            recipe={recipe}
            isSelectionMode={isSelectionMode}
            onDelete={() => onDelete(id)}
          />
        ) : (
          <div className="w-full h-full rounded-md" />
        )}
      </div>
    </div>
  );
};

const DraggableRecipeCard = ({
  id,
  recipe,
  isSelectionMode,
  onDelete,
}: {
  id: string;
  recipe: Recipe;
  isSelectionMode: boolean;
  onDelete: () => void;
}) => {
  const draggableId = `draggable-${id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0 : 1,
      }}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        style={{
          width: "var(--calendar-card-width)",
          height: "var(--calendar-card-height)",
        }}
      >
        <CalendarRecipeCard
          recipe={recipe}
          isSelectionMode={isSelectionMode}
          onDelete={!isSelectionMode ? onDelete : undefined}
        />
      </div>
    </div>
  );
};

export default function MealPlanView() {
  const [planData, setPlanData] = useState<MealPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

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

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDays([]); // Reset selection when toggling mode
  };

  const handleSelectDay = (id: string) => {
    setSelectedDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleGenerateList = () => {
    if (!planData || selectedDays.length === 0) return;

    const ingredients = selectedDays.flatMap(
      (day) => planData[day]?.ingredients || []
    );

    const shoppingList = ingredients.reduce(
      (acc, ingredient) => {
        if (!acc[ingredient.name]) {
          acc[ingredient.name] = [];
        }
        acc[ingredient.name].push(ingredient.quantity);
        return acc;
      },
      {} as Record<string, string[]>
    );

    console.log("--- Shopping List ---");
    console.log(shoppingList);
    // Future: Show this in a modal or new page
    alert("Shopping list generated! Check the console.");

    handleToggleSelectionMode();
  };

  const handleClearPlan = () => {
    localStorage.removeItem("monthlyMealPlan");
    setPlanData({});
    setIsClearModalOpen(false);
  };

  const handleDeleteDay = (id: string) => {
    setDayToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteDay = () => {
    if (dayToDelete && planData) {
      const newPlanData = { ...planData };
      delete newPlanData[dayToDelete];
      setPlanData(newPlanData);
      localStorage.setItem("monthlyMealPlan", JSON.stringify(newPlanData));
    }
    setDayToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && planData) {
      const activeDateKey = String(active.id).replace("draggable-", "");
      const overDateKey = String(over.id);

      if (!activeDateKey || activeDateKey === overDateKey) {
        setActiveId(null);
        return;
      }

      const newPlanData = { ...planData };

      const draggedRecipe = newPlanData[activeDateKey] || null;
      const recipeAtDestination = newPlanData[overDateKey] || null;

      // Swap the recipes for the two dates
      newPlanData[activeDateKey] = recipeAtDestination;
      newPlanData[overDateKey] = draggedRecipe;

      setPlanData(newPlanData);
      localStorage.setItem("monthlyMealPlan", JSON.stringify(newPlanData));
    }
    setActiveId(null);
  };

  const generateMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
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

  const hasPlan =
    planData && Object.values(planData).some((recipe) => recipe !== null);

  if (!hasPlan) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          Your Meal Plan is Empty
        </h2>
        <p className="text-slate-500 mb-6">
          Go to the meal planner to create a new plan.
        </p>
        <Link
          href="/meal-planner"
          className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
        >
          Create a Meal Plan
        </Link>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearPlan}
        title="Clear Meal Plan"
      >
        <p>
          Are you sure you want to clear your entire meal plan? This action
          cannot be undone.
        </p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteDay}
        title="Delete Dish"
      >
        <p>
          Are you sure you want to delete this dish from your meal plan? This
          action cannot be undone.
        </p>
      </ConfirmationModal>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-md hover:bg-slate-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-semibold transition-colors text-sm"
            title="Clear entire plan"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Plan</span>
          </button>
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-md hover:bg-slate-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
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
            <DaySlot
              key={dateKey}
              id={dateKey}
              date={day}
              recipe={recipe}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelectionMode={isSelectionMode}
              isSelected={selectedDays.includes(dateKey)}
              onSelectDay={handleSelectDay}
              onDelete={handleDeleteDay}
            />
          );
        })}
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeId && planData?.[String(activeId).replace("draggable-", "")] ? (
          <div
            style={{
              width: "var(--calendar-card-width)",
              height: "var(--calendar-card-height)",
            }}
          >
            <CalendarRecipeCard
              recipe={planData[String(activeId).replace("draggable-", "")]!}
            />
          </div>
        ) : null}
      </DragOverlay>

      {!isSelectionMode ? (
        <button
          onClick={handleToggleSelectionMode}
          className="fixed bottom-8 right-8 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-110"
          title="Create Shopping List"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      ) : (
        <div className="fixed bottom-8 inset-x-8 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-xl flex gap-4 items-center">
            <button
              onClick={handleToggleSelectionMode}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-semibold transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <p className="font-semibold text-slate-600">
              {selectedDays.length} day
              {selectedDays.length !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={handleGenerateList}
              disabled={selectedDays.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-opacity-90 disabled:bg-gray-400 text-white rounded-md font-semibold transition-colors"
            >
              <Check className="w-5 h-5" />
              Generate List
            </button>
          </div>
        </div>
      )}
    </DndContext>
  );
}
