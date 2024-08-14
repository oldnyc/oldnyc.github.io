import React from "react";
import Nouislider from "nouislider-react";
// import "nouislider/dist/nouislider.css";

export type YearRange = [firstYear: number, lastYear: number];
export const DEFAULT_YEARS: YearRange = [1800, 2000];
const RANGE = {
  min: [DEFAULT_YEARS[0]],
  max: [DEFAULT_YEARS[1]],
};

export interface TimeSliderProps {
  years: YearRange;
  onChangeYears: (newYears: YearRange) => void;
}

export function TimeSlider(props: TimeSliderProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div id="time-slider-container">
      <div id="time-range-summary" onClick={() => setVisible(v => !v)}>
        <span id="time-range-labels">1800&ndash;2000</span>
        <div className="white-arrow-down"></div>
      </div>
      <div id="time-range" style={{display: visible ? 'block' : 'none' }}>
        <Nouislider range={RANGE} step={1} start={DEFAULT_YEARS} connect onSlide={(_v, _h, years) => {
          // props.onChangeYears(years as [number, number]);
          console.log('slide', years);
        }} onChange={(_v, _h, years) => {
          console.log('change', years);
          props.onChangeYears(years as [number, number]);
        }} />
      </div>
    </div>
  );
}
