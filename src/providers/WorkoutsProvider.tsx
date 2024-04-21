import { signal } from "@preact/signals";
import { createContext, FunctionComponent } from "preact";
import { useContext } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";

interface Exercise {
  id: string;
  order: number;
  name: string;
  duration: number;
}

interface Workout {
  id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
}

interface WorkoutsContextValue {
  workouts: ReturnType<typeof signal<Workout[]>>;
  getWorkout: (id: string) => Workout;
  addWorkout: (name: string) => void;
  removeWorkout: (id: string) => void;
}

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

const WorkoutsProvider: FunctionComponent = ({ children }) => {
  const workouts = signal<Workout[]>([
    {
      id: "1",
      name: "Running",
      duration: 330,
      exercises: [
        {
          id: "1",
          order: 1,
          name: "9:00 pace",
          duration: 120,
        },
        {
          id: "2",
          order: 2,
          name: "6:00 pace",
          duration: 110,
        },
        {
          id: "3",
          order: 3,
          name: "9:00 pace",
          duration: 100,
        },
      ],
    },
  ]);

  const getWorkout = (id: string) => {
    const workout = workouts.value.find((workout) => workout.id === id);
    return workout;
  };

  const addWorkout = (name: string) => {
    workouts.value = [
      {
        id: uuidv4(),
        name: name,
        duration: 0,
        exercises: [
          {
            id: uuidv4(),
            order: 0,
            name: "Exercise #1",
            duration: 30,
          },
        ],
      },
      ...workouts.value,
    ];
  };

  const removeWorkout = (id: string) => {
    workouts.value = workouts.value.filter((workout) => workout.id !== id);
  };

  const value: WorkoutsContextValue = {
    workouts,
    getWorkout,
    addWorkout,
    removeWorkout,
  };

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutsContext);
  if (!context) {
    throw new Error("useWorkouts must be used within a WorkoutsProvider");
  }
  return context;
};

export default WorkoutsProvider;
