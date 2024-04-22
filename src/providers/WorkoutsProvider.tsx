import { signal } from "@preact/signals";
import { createContext, FunctionComponent } from "preact";
import { useContext } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";

export interface Activity {
  id: string;
  setId: string;
  order: number;
  name: string;
  duration: number;
}

export interface Set {
  id: string;
  workoutId: string;
  order: number;
  repetition: number;
  activities: Activity[];
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  sets: Set[];
}

const KEY = "workouts";

const getDataFromStorage = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

const saveDataToStorage = (data: Workout[]) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

interface WorkoutsContextValue {
  workouts: ReturnType<typeof signal<Workout[]>>;
  getWorkout: (id: string) => Workout;
  addWorkout: (name: string) => void;
  removeWorkout: (id: string) => void;
  updateWorkout: (id: string, workout: Workout) => void;
}

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

const WorkoutsProvider: FunctionComponent = ({ children }) => {
  const data = getDataFromStorage();
  const workouts = signal<Workout[]>(data);

  const getWorkout = (id: string) => {
    const workout = workouts.value.find((workout) => workout.id === id);
    return workout;
  };

  const addWorkout = (name: string) => {
    const workoutId = uuidv4();
    const setId = uuidv4();
    const _workouts = [
      {
        id: workoutId,
        name: name,
        duration: 0,
        sets: [
          {
            id: setId,
            workoutId: workoutId,
            order: 1,
            repetition: 1,
            activities: [
              {
                id: uuidv4(),
                setId: setId,
                order: 1,
                name: "Work",
                duration: 90,
              },
              {
                id: uuidv4(),
                setId: setId,
                order: 2,
                name: "Rest",
                duration: 30,
              },
            ],
          },
        ],
      },
      ...workouts.value,
    ];
    saveDataToStorage(_workouts);
    workouts.value = _workouts;
  };

  const removeWorkout = (id: string) => {
    const _workouts = workouts.value.filter((workout) => workout.id !== id);
    saveDataToStorage(_workouts);
    workouts.value = _workouts;
  };

  const updateWorkout = (workoutID: string, workout: Workout) => {
    const _workouts = workouts.value.map((ex) =>
      ex.id === workoutID ? { ...workout } : ex
    );
    saveDataToStorage(_workouts);
    workouts.value = _workouts;
  };

  const value: WorkoutsContextValue = {
    workouts,
    getWorkout,
    addWorkout,
    removeWorkout,
    updateWorkout,
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
