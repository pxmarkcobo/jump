import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Header } from "./components/Header.jsx";
import { HomeView } from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import "./style.css";
import WorkoutsProvider from "./providers/WorkoutsProvider.js";
import { WorkoutView } from "./pages/Workout/index.js";
import { WorkoutEditView } from "./pages/WorkoutEdit/index.js";

export function App() {
  return (
    <LocationProvider>
      <WorkoutsProvider>
        <Header />
        <main class="w-full relative flex justify-center">
          <div class="max-w-[500px] py-8">
            <Router>
              <Route path="/" component={HomeView} />
              <Route path="/workout/:id" component={WorkoutView} />
              <Route path="/workout/:id/edit" component={WorkoutEditView} />
              <Route default component={NotFound} />
            </Router>
          </div>
        </main>
      </WorkoutsProvider>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
