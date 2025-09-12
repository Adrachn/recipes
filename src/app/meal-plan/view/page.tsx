import MealPlanView from "@/components/MealPlanView";

export default function MealPlanViewPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Your Weekly Meal Plan
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Here are the meals you've generated. Enjoy your cooking!
        </p>
      </div>
      <MealPlanView />
    </main>
  );
}
