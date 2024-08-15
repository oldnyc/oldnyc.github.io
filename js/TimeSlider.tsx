import React from "react";
import Nouislider from "nouislider-react";
// import "nouislider/dist/nouislider.css";

export type YearRange = [firstYear: number, lastYear: number];
export const DEFAULT_YEARS: YearRange = [1800, 2000];
const RANGE = {
  min: [DEFAULT_YEARS[0]],
  max: [DEFAULT_YEARS[1]],
};

export function isFullTimeRange(yearRange: [number, number]) {
  return (yearRange[0] === 1800 && yearRange[1] === 2000);
}

export interface TimeSliderProps {
  years: YearRange;
  onSlide: (newYears: YearRange) => void;
  onChange?: (newYears: YearRange) => void;
}

// Note: ownership of current years is a little weird; you can't change it programmatically.
export function TimeSlider(props: TimeSliderProps) {
  const {years} = props;
  const [visible, setVisible] = React.useState(false);
  return (
    <div id="time-slider-container">
      <div id="time-range-summary" onClick={() => setVisible(v => !v)}>
        <span id="time-range-labels">{years[0]}&ndash;{years[1]}</span>{' '}
        <div className="white-arrow-down"></div>
      </div>
      <div id="time-range" style={{display: visible ? 'block' : 'none' }}>
        <Nouislider range={RANGE} step={1} start={DEFAULT_YEARS} connect onSlide={(_v, _h, years) => {
          props.onSlide(years as [number, number]);
        }} onChange={(_v, _h, years) => {
          props.onChange?.(years as [number, number]);
        }} />
      </div>
    </div>
  );
}
