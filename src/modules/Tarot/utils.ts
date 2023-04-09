import * as THREE from "three";

export const log = (str: string) => {
  if (import.meta.env.MODE === "production") return;

  console.log(`Tarot: ${str}`);
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const cameraSizes = {
  width: 0,
  height: 0,
};

export const calcCameraSizes = (camera: THREE.PerspectiveCamera) => {
  const vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
  const height = 2 * Math.tan(vFOV / 2) * camera.position.z; // visible height
  const width = height * camera.aspect;

  cameraSizes.width = width;
  cameraSizes.height = height;
};

export const isTablet = () => window.matchMedia("(max-width: 1024px)").matches;

export const getRandomInt = (min: number, max: number): number => {
  // eslint-disable-next-line no-param-reassign
  min = Math.ceil(min);
  // eslint-disable-next-line no-param-reassign
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
