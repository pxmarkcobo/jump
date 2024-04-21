import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { useWorkouts } from "../../providers/WorkoutsProvider";
import { useLocation } from "preact-iso";
import { secondsToMMSS } from "../../utils";
import sound from "../../assets/5seconds.mp3";

import {
  CountdownCircleTimer,
  OnComplete,
  TimeProps,
} from "react-countdown-circle-timer";
import { ReactNode } from "preact/compat";

function useAudio(url) {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing
      ? audio.play().catch((e) => console.error("Error playing audio:", e))
      : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("error", (e) => {
      console.error("Error loading audio:", e);
    });

    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  return [playing, setPlaying, toggle];
}

export function WorkoutView() {
  const { route } = useLocation();
  const { getWorkout } = useWorkouts();

  const [playing, setPlaying] = useAudio(sound);

  const workout = useSignal(null);
  const activeExercise = useSignal(null);
  const timerOn = useSignal(false);
  const initialDuration = useSignal(0);

  useEffect(() => {
    const obj = getWorkout(this.props.id);
    if (obj) {
      workout.value = obj;
      const activity = obj.exercises.find((ex) => ex.order == 0);
      if (activity) {
        activeExercise.value = activity;
        initialDuration.value = activity.duration;
      }
    } else {
      route("/404");
    }
  }, []);

  if (!workout.value) {
    return <h1>Loading</h1>;
  }

  const renderTime: ReactNode = ({
    remainingTime,
    elapsedTime,
    color,
  }: TimeProps) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    const display = minutes ? `${minutes}:${seconds}` : seconds;

    return (
      <div class="text-5xl" role="timer" aria-live="assertive">
        {display}
      </div>
    );
  };

  const goNextActivity = ({ totalElapsedTime: number }): void | OnComplete => {
    const next = activeExercise.value.order + 1;
    const nextActivity = workout.value.exercises.find((ex) => ex.order == next);

    if (nextActivity == undefined) {
      alert("Session done!");
      return;
    }

    activeExercise.value = nextActivity;
  };

  const onUpdateHandler = (remainingTime) => {
    console.log("remainingTime", remainingTime);
    if (timerOn.value && remainingTime == 5) {
      setPlaying(true);
    }
  };
  return (
    <div class="flex-col">
      <div class="flex-1 flex flex-col gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="flex flex-col items-center gap-2">
            <p class="text-xl antialiased font-semibold">
              {workout.value.name}
            </p>
            {activeExercise.value && (
              <CountdownCircleTimer
                key={activeExercise.value.id}
                isPlaying={timerOn.value}
                duration={activeExercise.value.duration}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[10, 5, 2, 0]}
                onUpdate={onUpdateHandler}
                onComplete={goNextActivity}
              >
                {renderTime}
              </CountdownCircleTimer>
            )}
            <div class="text-sm text-center">
              <p class="mb-1">
                {activeExercise.value && (
                  <span class="font-semibold">{activeExercise.value.name}</span>
                )}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 w-full gap-2">
            <button
              onClick={() => (timerOn.value = !timerOn.value)}
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              {timerOn.value ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-2 h-4 w-4"
                >
                  <rect width="4" height="16" x="6" y="4"></rect>
                  <rect width="4" height="16" x="14" y="4"></rect>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 384 512"
                  fill="black"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-2 h-4 w-4"
                >
                  <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
              )}
              {timerOn.value ? "Pause" : "Start"}
            </button>
            <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-2 h-4 w-4"
              >
                <rect x="9" y="7" width="6" height="6"></rect>
                <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                <path d="M12 17v4"></path>
                <path d="M8 21h8"></path>
              </svg>
              Stop
            </button>
          </div>
        </div>
        <section>
          {workout.value.exercises.map((exercise, index) => (
            <div
              onClick={() => (activeExercise.value = exercise)}
              class={`mt-2 p-4 bg-gray-100 rounded-lg w-[300px] ${
                activeExercise.value.id == exercise.id
                  ? "border-[1px] border-lime-600 "
                  : ""
              }`}
            >
              <div class="grid grid-cols-3 items-center text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <div>{exercise.name}</div>
                </div>
                <div class="col-span-2 text-right">
                  {secondsToMMSS(exercise.duration)}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
