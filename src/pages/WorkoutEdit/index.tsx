import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { useWorkouts } from "../../providers/WorkoutsProvider";
import { useLocation } from "preact-iso";
import { cn, secondsToMMSS } from "../../utils";
import { v4 as uuidv4 } from "uuid";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function DurationEditor({
  minuteLeft,
  minuteRight,
  secondLeft,
  secondRight,
  isEditing,
}) {
  return (
    <div>
      <span
        className={cn("tabular-nums text-5xl", {
          "text-gray-600": isEditing.value,
        })}
      >
        {minuteLeft}
      </span>
      <span
        className={cn("tabular-nums text-5xl", {
          "text-gray-600": isEditing.value,
        })}
      >
        {minuteRight}
      </span>
      <span
        className={cn("text-sm pr-4", { "text-gray-600": isEditing.value })}
      >
        m
      </span>
      <span
        className={cn("tabular-nums text-5xl", {
          "text-gray-600": isEditing.value,
        })}
      >
        {secondLeft}
      </span>
      <span
        className={cn("tabular-nums text-5xl border-r-[1px] border-white", {
          "text-gray-600 border-black": isEditing.value,
        })}
      >
        {secondRight}
      </span>
      <span className={cn("text-sm", { "text-gray-600": isEditing.value })}>
        s
      </span>
    </div>
  );
}

function ExerciseList({
  onDragEnd,
  exercises,
  activeExercise,
  selectExercise,
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {exercises.map((exercise, index) => (
              <Draggable
                key={exercise.id}
                draggableId={exercise.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => selectExercise(exercise)}
                    className={`mt-2 p-4 bg-gray-100 rounded-lg w-[300px] ${
                      activeExercise.id === exercise.id
                        ? "border-[1px] border-lime-600"
                        : ""
                    }`}
                  >
                    <div className="grid grid-cols-3 items-center text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <div>{exercise.name}</div>
                      </div>
                      <div className="col-span-2 text-right">
                        {secondsToMMSS(exercise.duration)}
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
  );
}

export function WorkoutEditView() {
  const { route } = useLocation();
  const { getWorkout, updateWorkout } = useWorkouts();

  const workout = useSignal(null);
  const [exercises, setExercises] = useState([]);
  const [activeExercise, setActiveExercise] = useState(null);

  const inputRef = useRef(null);

  const minuteLeft = useSignal("0");
  const minuteRight = useSignal("0");
  const secondLeft = useSignal("0");
  const secondRight = useSignal("0");

  const updateDurationDisplay = (duration) => {
    const time = secondsToMMSS(duration, true);
    const [minutes, seconds] = time.split(":");

    minuteLeft.value = minutes[0];
    minuteRight.value = minutes[1];
    secondLeft.value = seconds[0];
    secondRight.value = seconds[1];
  };

  useEffect(() => {
    const obj = getWorkout(this.props.id);
    if (obj) {
      workout.value = obj;
      setExercises([...obj.exercises]);
      if (obj.exercises.length != 0) {
        const firstExercise = obj.exercises[0];
        setActiveExercise(firstExercise);
        updateDurationDisplay(firstExercise.duration);
      }
    } else {
      route("/404");
    }
  }, []);

  if (!workout.value) {
    return <h1>Fetching workout info...</h1>;
  }

  useEffect(() => {
    if (activeExercise) {
      const updatedExercises = exercises.map((ex) =>
        ex.id === activeExercise.id ? { ...activeExercise } : ex
      );
      setExercises(updatedExercises);
    }
  }, [activeExercise]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(exercises);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setExercises(
      newItems.map((item, index) => ({
        ...item,
        order: index,
      }))
    );
  };

  const handleDurationInputChange = () => {
    const raw = inputRef.current.value;

    // remove non-numeric values
    const filtered = raw.replace(/[^\d]/g, "");
    inputRef.current.value = filtered;

    const padded = filtered.slice(-4).padStart(4, "0");
    minuteLeft.value = padded[0];
    minuteRight.value = padded[1];
    secondLeft.value = padded[2];
    secondRight.value = padded[3];
  };

  const isEditing = useSignal(false);

  const handleDurationInputOnBlur = (e) => {
    isEditing.value = false;

    // 59:59 max duration
    const finalMinuteLeft = Math.min(parseInt(minuteLeft.value), 5);
    const finalMinuteRight = Math.min(parseInt(minuteRight.value), 9);
    const finalSecondLeft = Math.min(parseInt(secondLeft.value), 5);
    const finalSecondRight = Math.min(parseInt(secondRight.value), 9);

    minuteLeft.value = finalMinuteLeft.toString();
    minuteRight.value = finalMinuteRight.toString();
    secondLeft.value = finalSecondLeft.toString();
    secondRight.value = finalSecondRight.toString();

    const duration =
      finalMinuteLeft * 600 +
      finalMinuteRight * 60 +
      finalSecondLeft * 10 +
      finalSecondRight;

    setActiveExercise({ ...activeExercise, duration });

    inputRef.current.value = "";
  };

  const editNameHandler = (exercise) => {
    const name = prompt("Please enter exercise name:");
    const _exercise = exercise || activeExercise;
    setActiveExercise({ ..._exercise, name });
  };

  const selectExercise = (exercise) => {
    setActiveExercise(exercise);
    updateDurationDisplay(exercise.duration);
  };

  const addNewExercise = () => {
    const exercise = { id: uuidv4(), name: "Exercise", duration: 0 };
    setExercises((prev) => [exercise, ...prev]);
    selectExercise(exercise);
    editNameHandler(exercise);
  };

  const saveChanges = () => {
    const { id, name } = workout.value;
    const duration = exercises.reduce((total, exercise) => {
      return total + exercise.duration;
    }, 0);

    updateWorkout(workout.value.id, {
      id,
      name,
      duration,
      exercises: [...exercises],
    });

    alert("Changes saved.");
  };

  return (
    <div class="flex-col">
      <div class="flex-1 flex flex-col gap-4">
        <div class="flex flex-col gap-2 items-center">
          <div class="flex flex-col items-center gap-2">
            <div class="flex justify-between w-full">
              <p class="text-xl antialiased font-semibold">
                {workout.value.name}
              </p>
              <button
                type="button"
                onClick={addNewExercise}
                class="whitespace-nowrap rounded-md text-sm font-medium bg-background"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-2 h-6 w-6 fill-green-800"
                  viewBox="0 0 512 512"
                >
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                </svg>
              </button>
            </div>
            <input
              dir="rtl"
              class="cursor-none focus:outline-none h-0 w-0"
              type="text"
              ref={inputRef}
              onChange={handleDurationInputChange}
              onBlur={handleDurationInputOnBlur}
              onFocus={(e) => (isEditing.value = true)}
            />
            <DurationEditor
              minuteLeft={minuteLeft.value}
              minuteRight={minuteRight.value}
              secondLeft={secondLeft.value}
              secondRight={secondRight.value}
              isEditing={isEditing}
            />
            <p class="text-sm text-center mb-1 font-semibold">
              {activeExercise.name}
            </p>
            <div class="grid grid-cols-2 w-full gap-2">
              <button
                onClick={editNameHandler}
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
          </div>
        </div>
        <section>
          <ExerciseList
            onDragEnd={onDragEnd}
            exercises={exercises}
            activeExercise={activeExercise}
            selectExercise={selectExercise}
          />
        </section>
        <button
          onClick={saveChanges}
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600	text-white hover:bg- h-10 px-4 py-2 w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
