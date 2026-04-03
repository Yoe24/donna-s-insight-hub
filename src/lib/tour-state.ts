let _tourCompleted = false;
export const isTourCompleted = () => _tourCompleted;
export const completeTour = () => { _tourCompleted = true; };

// Demo tour — persisted in localStorage
const DEMO_TOUR_KEY = "donna_demo_tour_completed";
export const isDemoTourCompleted = () => localStorage.getItem(DEMO_TOUR_KEY) === "true";
export const completeDemoTour = () => localStorage.setItem(DEMO_TOUR_KEY, "true");
