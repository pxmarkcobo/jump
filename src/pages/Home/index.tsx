import { useRef, useState } from "preact/hooks";
import "./style.css";
import { useWorkouts } from "../../providers/WorkoutsProvider";
import { WorkoutList } from "../../components/WorkoutList";

export const HomeView = () => {
  const { addWorkout } = useWorkouts();
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const createWorkout = () => {
    const name = inputRef.current.value;
    if (name.trim().length < 1) {
      setError(true);
    } else {
      setError(false);
      inputRef.current.value = "";
      addWorkout(name);
    }
  };

  return (
    <section>
      <div
        class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
        ></div>
      </div>
      <div class="flex flex-col space-y-4">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-wide">Jump</h1>
          <p class="text-gray-500 dark:text-gray-400">Track your workouts</p>
        </div>
        <div class="space-y-2">
          <div class="w-full">
            <div class="space-y-2">
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                for="workout"
              >
                Please enter workout name
              </label>
              <input
                ref={inputRef}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="workout"
                placeholder="Jump Rope"
                type="text"
              />
              <p class="text-sm text-red-500 dark:text-red-400 h-5">
                {error ? "Please enter a valid name" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={createWorkout}
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600	text-white hover:bg- h-10 px-4 py-2 w-full"
          >
            Create Workout
          </button>
        </div>
        <WorkoutList />
      </div>
      <div
        class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
        ></div>
      </div>
    </section>
  );
};
