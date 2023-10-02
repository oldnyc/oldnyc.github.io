/// <reference types="jquery" />

interface GridImage {
  id: string;
  src: string;
  largesrc?: string;
  width: number;
  height: number;
}

interface GridOptions {
  minHeight: number;
  maxHeight: number;
  speed: number;
  easing: string;
  rowHeight: number;
}

interface JQuery {
  expandableGrid(options: Partial<GridOptions>, images: GridImage[]): void;
  expandableGrid(action: "select", id: string): boolean;
  expandableGrid(action: "deselect"): void;
  expandableGrid(action: "selectedId"): string;
}
