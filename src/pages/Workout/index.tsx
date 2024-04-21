import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { useWorkouts } from "../../providers/WorkoutsProvider";
import { useLocation } from "preact-iso";
import { secondsToMMSS } from "../../utils";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export function WorkoutView() {
  const { route } = useLocation();
  const { getWorkout } = useWorkouts();

  const workout = useSignal(null);
  const excercises = useSignal([]);
  const selectedExercise = useSignal(null);

  const isEditing = useSignal(false);
  const timeLeft = useSignal(0);
  const timerOn = useSignal(false);

  useEffect(() => {
    const obj = getWorkout(this.props.id);
    if (obj) {
      workout.value = obj;
      timeLeft.value = obj.duration;
      excercises.value = [...obj.exercises];
      if (obj.exercises.length != 0) {
        selectedExercise.value = obj.exercises[0];
      }
    } else {
      route("/404");
    }
  }, []);

  if (!workout.value) {
    return <h1>Loading</h1>;
  }

  useEffect(() => {
    const { query } = this.props;
    if ("mode" in query) {
      isEditing.value = query.mode == "edit";
    }
  }, [this.props]);

  useEffect(() => {
    let interval = null;

    if (timerOn.value && timeLeft.value > 0) {
      interval = setInterval(() => {
        timeLeft.value = timeLeft.value - 1;
      }, 1000);
    } else {
      clearInterval(interval);
      if (timeLeft.value === 0) {
        timerOn.value = false;
      }
    }

    return () => clearInterval(interval);
  }, [timerOn.value, timeLeft.value]);

  useEffect(() => {
    console.log("excercises", excercises.value);
  }, [excercises.value]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(excercises.value);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    excercises.value = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));
  };

  const inputRef = useRef(null);
  const handleDurationInputChange = () => {
    const raw = inputRef.current.value;
    const filteredValue = raw.replace(/[^\d]/g, "");
    inputRef.current.value = filteredValue;
    const finalValue = filteredValue.slice(-4).padStart(4, "0");

    // Update active display
    const ids = ["minute-l", "minute-r", "second-l", "second-r"];
    for (let i = 0; i < ids.length; i++) {
      const $el = document.getElementById(ids[i]);
      const value = finalValue[i];
      if ($el) {
        $el.textContent = value;
        if (3 - i < filteredValue.length) {
          $el.classList.remove("text-gray-500");
        } else {
          $el.classList.add("text-gray-500");
        }
      }
    }
  };

  const isInputFocused = useSignal(false);

  const handleDurationInputOnBlur = (e) => {
    let value = inputRef.current.value;
    value = value.slice(-4).padStart(4, "0");

    let minutes = Math.min(parseInt(value.slice(0, 2), 10), 59)
      .toString()
      .padStart(2, "0");
    let seconds = Math.min(parseInt(value.slice(2), 10), 59)
      .toString()
      .padStart(2, "0");

    value = `${minutes}${seconds}`;
    inputRef.current.value = value;

    let displayIDs = ["d-minute-l", "d-minute-r", "d-second-l", "d-second-r"];
    let hideIfZero = true;
    for (let i = 0; i < displayIDs.length; i++) {
      const $el = document.getElementById(displayIDs[i]);
      if ($el) {
        const digit = value[i];
        $el.innerText = digit;
        if (digit == "0" && hideIfZero) {
          $el.classList.add("hidden");
        } else {
          $el.classList.remove("hidden");
          hideIfZero = false;
        }
      }
    }

    let inputIDs = ["minute-l", "minute-r", "second-l", "second-r"];
    for (let i = 0; i < inputIDs.length; i++) {
      const $el = document.getElementById(inputIDs[i]);
      if ($el) {
        $el.textContent = value[i];
      }
    }

    isInputFocused.value = false;
  };

  return (
    <div class="flex-col">
      <div class="flex-1 flex flex-col gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="flex flex-col items-center gap-2">
            <div class="text-xl">Workout: {workout.value.name}</div>
            <div class="hidden text-5xl-bold">
              {secondsToMMSS(timeLeft.value)}
            </div>
            <input
              dir="rtl"
              value=""
              class="cursor-none focus:outline-none"
              type="text"
              ref={inputRef}
              onChange={handleDurationInputChange}
              onBlur={handleDurationInputOnBlur}
              onFocus={(e) => (isInputFocused.value = true)}
            />
            <div class={isInputFocused.value ? "" : "hidden"}>
              <span id="minute-l" class="text-gray-500 text-5xl">
                0
              </span>
              <span id="minute-r" class="text-gray-500 text-5xl">
                0
              </span>
              <span class="text-gray-500 text-sm pr-4">m</span>
              <span id="second-l" class="text-gray-500 text-5xl">
                0
              </span>
              <span
                id="second-r"
                class="text-gray-500 text-5xl border-r-[1px] border-black"
              >
                0
              </span>
              <span class="text-gray-500 text-sm">s</span>
            </div>
            <div class={isInputFocused.value ? "hidden" : ""}>
              <span id="d-minute-l" class="minute text-5xl">
                0
              </span>
              <span id="d-minute-r" class="minute text-5xl">
                0
              </span>
              <span class="minute text-sm pr-4">m</span>
              <span id="d-second-l" class="second text-5xl">
                0
              </span>
              <span id="d-second-r" class="second text-5xl">
                0
              </span>
              <span class="second text-sm">s</span>
            </div>
            <div class="text-sm text-center">
              <p class="mb-1">
                {selectedExercise.value && (
                  <span class="font-semibold">
                    {selectedExercise.value.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 w-full gap-2">
            <button
              onClick={() => (timerOn.value = !timerOn.value)}
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="black"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-2 h-4 w-4"
                viewBox="0 0 576 512"
              >
                <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V428.7c-2.7 1.1-5.4 2-8.2 2.7l-60.1 15c-3 .7-6 1.2-9 1.4c-.9 .1-1.8 .2-2.7 .2H240c-6.1 0-11.6-3.4-14.3-8.8l-8.8-17.7c-1.7-3.4-5.1-5.5-8.8-5.5s-7.2 2.1-8.8 5.5l-8.8 17.7c-2.9 5.9-9.2 9.4-15.7 8.8s-12.1-5.1-13.9-11.3L144 381l-9.8 32.8c-6.1 20.3-24.8 34.2-46 34.2H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h8.2c7.1 0 13.3-4.6 15.3-11.4l14.9-49.5c3.4-11.3 13.8-19.1 25.6-19.1s22.2 7.8 25.6 19.1l11.6 38.6c7.4-6.2 16.8-9.7 26.8-9.7c15.9 0 30.4 9 37.5 23.2l4.4 8.8h8.9c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7L384 203.6V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM549.8 139.7c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM311.9 321c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L512.1 262.7l-71-71L311.9 321z" />
              </svg>
              Edit name
            </button>
            <button
              onClick={() => inputRef.current.focus()}
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="black"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-2 h-4 w-4"
                viewBox="0 0 448 512"
              >
                <path d="M176 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h16V98.4C92.3 113.8 16 200 16 304c0 114.9 93.1 208 208 208s208-93.1 208-208c0-41.8-12.3-80.7-33.5-113.2l24.1-24.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L355.7 143c-28.1-23-62.2-38.8-99.7-44.6V64h16c17.7 0 32-14.3 32-32s-14.3-32-32-32H224 176zm72 192V320c0 13.3-10.7 24-24 24s-24-10.7-24-24V192c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
              </svg>
              Edit duration
            </button>
          </div>
          <div class="hidden grid grid-cols-2 w-full gap-2">
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
          <p class="text-xl semi-bold">Exercises</p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {excercises.value.map((excercise, index) => (
                    <Draggable
                      key={excercise.id}
                      draggableId={excercise.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => (selectedExercise.value = excercise)}
                          class={`mt-2 p-4 bg-gray-100 rounded-lg w-[300px] ${
                            selectedExercise.value.id == excercise.id
                              ? "border-[1px] border-lime-600 "
                              : ""
                          }`}
                        >
                          <div class="grid grid-cols-3 items-center text-sm font-medium">
                            <div class="flex items-center space-x-2">
                              <div>{excercise.name}</div>
                            </div>
                            <div class="col-span-2 text-right">
                              {secondsToMMSS(excercise.duration)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>
      </div>
    </div>
  );
}
