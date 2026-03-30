export const haptics = {
  tick: () => navigator.vibrate?.(10),
  triggerLoser: () => navigator.vibrate?.([300, 100, 500]),
  triggerOthers: () => navigator.vibrate?.([150, 50, 150]),
};
