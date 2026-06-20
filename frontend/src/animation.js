export const slideLeft = {
  initial: { x: 200, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -200, opacity: 0 },
  transition: { duration: 0.5 },
};

export const slideRight = {
  initial: { x: -200, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 200, opacity: 0 },
  transition: { duration: 0.5 },
};