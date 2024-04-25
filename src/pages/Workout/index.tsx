import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import {
  Activity,
  Set,
  Workout,
  useWorkouts,
} from "../../providers/WorkoutsProvider";
import { useLocation } from "preact-iso";
import { secondsToMMSS } from "../../utils";
import sound from "../../assets/5seconds.mp3";

import {
  CountdownCircleTimer,
  OnComplete,
  TimeProps,
} from "react-countdown-circle-timer";
import { ReactNode } from "preact/compat";

const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
  };

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

  return { playing, setPlaying, stop };
};

interface ExtendedSet extends Set {
  round: number;
  activityStartIndex: number;
  activityEndIndex: number;
}

export function WorkoutView() {
  const { route } = useLocation();
  const { getWorkout } = useWorkouts();

  const { setPlaying, stop } = useAudio(sound);

  const workout = useSignal<Workout>(null);
  const sets = useSignal<ExtendedSet[]>([]);
  const activities = useSignal([]);
  const activity = useSignal<Activity>(null);
  const inSession = useSignal(false);
  const resetKey = useSignal("");

  useEffect(() => {
    const obj = getWorkout(this.props.id);
    if (obj) {
      workout.value = obj;

      let _activities = [];
      let _sets = [];
      for (const set of obj.sets) {
        const start = _activities.length;
        const end = start + set.activities.length - 1;
        _sets.push({
          ...set,
          round: 1,
          activityStartIndex: start,
          activityEndIndex: end,
        });
        _activities = _activities.concat(set.activities);
      }

      if (_activities.length == 0) {
        alert("No activites for this workout.");
        route("/");
      }

      console.log(_sets);

      sets.value = _sets;
      activities.value = _activities;
      activity.value = _activities[0];
    } else {
      route("/404");
    }
  }, []);

  if (!workout.value) {
    return <h1>Loading</h1>;
  }

  function renderTime(props: TimeProps): ReactNode {
    const { remainingTime } = props;
    const minutes = Math.floor(remainingTime / 60);
    let seconds = (remainingTime % 60).toString();

    let display = seconds;
    if (minutes) {
      seconds = seconds.padStart(2, "0");
      display = `${minutes}:${seconds}`;
    }

    return (
      <div
        class="flex flex-col justify-center items-center"
        role="timer"
        aria-live="assertive"
      >
        <p class="text-5xl lining-nums">{display}</p>
      </div>
    );
  }

  function goNextActivity(totalElapsedTime: number): OnComplete | void {
    inSession.value = false;

    const set = sets.value.find((s) => s.id == activity.value.setId);
    let index = activities.value.findIndex(
      (act) => act.id == activity.value.id
    );

    if (index == set.activityEndIndex) {
      // last activity in the set reached
      if (set.round < set.repetition) {
        // same set, next round
        index = set.activityStartIndex;
        set.round += 1;
      } else {
        // go next set
        index += 1;
        if (index == activities.value.length) {
          // no more activities
          alert("Session done. Good job!");
          return;
        }
      }
    } else {
      // go next activity
      index += 1;
    }

    activity.value = activities.value[index];
    inSession.value = true;
  }

  const onUpdateHandler = (remainingTime) => {
    // play audio in last 5 seconds
    if (inSession.value && remainingTime == 5) {
      setPlaying(true);
    }
  };

  const stopActivity = () => {
    stop();
    inSession.value = false;
    activity.value = activities.value[0];

    // force re-render countdown circle
    resetKey.value = "5-little-monkeys-humpy-dumpy";
    setTimeout(() => {
      resetKey.value = "";
    }, 0);
  };

  return (
    <div class="flex-col">
      <div class="flex-1 flex flex-col gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="flex flex-col items-center gap-2">
            <p class="text-xl antialiased font-semibold">
              {workout.value.name}
            </p>
            {activity.value && (
              <CountdownCircleTimer
                key={resetKey.value || activity.value.id}
                isPlaying={inSession.value}
                duration={activity.value.duration}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[10, 5, 2, 0]}
                onUpdate={onUpdateHandler}
                onComplete={goNextActivity}
                // @ts-ignore
                children={renderTime}
              />
            )}
            <div class="text-sm text-center">
              <p class="mb-1">
                {activity.value && (
                  <span class="font-semibold">{activity.value.name}</span>
                )}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 w-full gap-2">
            <button
              onClick={() => (inSession.value = !inSession.value)}
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              {inSession.value ? (
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
              {inSession.value ? "Pause" : "Start"}
            </button>
            <button
              onClick={stopActivity}
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
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
          {sets.value.map((set) => (
            <div class="border-[1px] border-gray-400 border-dotted p-4 mb-4 rounded-xl">
              <div class="flex flex-row justify-between">
                <p class="font-semibold">Set #{set.order}</p>
                <span class="font-normal">
                  {set.round} out of {set.repetition}
                </span>
              </div>
              {set.activities.map((act) => (
                <div
                  onClick={() => (activity.value = act)}
                  className={`mt-2 p-4 bg-gray-100 rounded-lg ${
                    act.id === activity.value.id
                      ? "border-[1px] border-lime-600"
                      : ""
                  }`}
                >
                  <div className="grid grid-cols-3 items-center text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <div>{act.name}</div>
                    </div>
                    <div className="col-span-2 text-right">
                      {secondsToMMSS(act.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
