import React from "react";
import MealPlannerForm from "@/components/MealPlannerForm";
import { getAllRecipePacks } from "@/lib/recipes";
import Container from "@/components/Container";

const MealPlannerPage = async () => {
  const packs = await getAllRecipePacks();
  return (
    <main>
      <Container className="py-8">
        <div className="col-span-12">
          <h1 className="text-4xl font-bold text-center mb-8">
            Weekly Meal Planner
          </h1>
          <p className="text-center text-lg text-content-on-light-secondary mb-12">
            Select your preferences below and let us generate a delicious,
            customized meal plan for you.
          </p>
          <MealPlannerForm packs={packs} />
        </div>
      </Container>
    </main>
  );
};

export default MealPlannerPage;
