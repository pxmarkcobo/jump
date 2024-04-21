import { useWorkouts } from "../providers/WorkoutsProvider";
import { secondsToMMSS } from "../utils";

export function WorkoutList() {
  const { workouts } = useWorkouts();

  return (
    <div class="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
      {workouts.value.map((workout) => (
        <div class="flex items-center p-4 space-x-1" key={workout.id}>
          <div class="flex-1 pr-8">
            <div class="font-bold">{workout.name}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {secondsToMMSS(workout.duration)}
            </div>
          </div>
          <a
            href={`/workout/${workout.id}`}
            class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-blue-600 text-white hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-5"
          >
            Play
          </a>
          <a
            href={`/workout/${workout.id}/edit`}
            class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-5"
          >
            Edit
          </a>
        </div>
      ))}
    </div>
  );
}
