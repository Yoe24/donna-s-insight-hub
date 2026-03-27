let _tourCompleted = false;
export const isTourCompleted = () => _tourCompleted;
export const completeTour = () => { _tourCompleted = true; };
