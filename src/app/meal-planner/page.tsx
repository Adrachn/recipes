import React from "react";
import MealPlannerForm from "@/components/MealPlannerForm";
import { getAllRecipePacks } from "@/lib/recipes";

const MealPlannerPage = async () => {
  const packs = await getAllRecipePacks();
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Weekly Meal Planner
      </h1>
      <p className="text-center text-lg text-content-on-light-secondary mb-12">
        Select your preferences below and let us generate a delicious,
        customized meal plan for you.
      </p>
      <MealPlannerForm packs={packs} />
    </main>
  );
};

export default MealPlannerPage;
