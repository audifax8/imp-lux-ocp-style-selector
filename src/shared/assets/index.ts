import { CDN_FLUID_BASE_URL } from "@/declarations/constants";

export function getSVGURL(name: string, brand: string): string {
  return `${CDN_FLUID_BASE_URL}/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/${brand}/assets/svg/${name}.svg`;
}

export function getSVGURLByType(name: string, brand: string, type: string): string {
  return `${CDN_FLUID_BASE_URL}/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/${brand}/assets/${type}/${name}.png`;
}