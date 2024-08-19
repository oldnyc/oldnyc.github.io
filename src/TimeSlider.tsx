import React from 'react';
import Slider from 'rc-slider';
import { MarkObj } from 'rc-slider/lib/Marks';

export type YearRange = [firstYear: number, lastYear: number];
export const DEFAULT_YEARS: YearRange = [1800, 2000];

export function isFullTimeRange(yearRange: [number, number]) {
  return yearRange[0] === 1800 && yearRange[1] === 2000;
}

export interface TimeSliderProps {
  years: YearRange;
  onSlide: (newYears: YearRange) => void;
  onChange?: (newYears: YearRange) => void;
}

const marks: Record<number, MarkObj> = {
  1800: { label: '1800' },
  1850: { label: '1850' },
  1900: { label: '1900' },
  1950: { label: '1950' },
  2000: { label: '2000' },
};

export function TimeSlider(props: TimeSliderProps) {
  const { years } = props;
  const [visible, setVisible] = React.useState(false);

  return (
    <div id="time-slider-container">
      <div id="time-range-summary" onClick={() => setVisible((v) => !v)}>
        <span id="time-range-labels">
          {years[0]}&ndash;{years[1]}
        </span>{' '}
        <div className="white-arrow-down"></div>
      </div>
      <div id="time-range" style={{ display: visible ? 'block' : 'none' }}>
        <Slider
          marks={marks}
          range
          min={DEFAULT_YEARS[0]}
          max={DEFAULT_YEARS[1]}
          allowCross={false}
          value={years}
          onChange={props.onSlide}
          onChangeComplete={props.onChange}
        />
      </div>
    </div>
  );
}

// #abe2fb - soft
// #96dbfa - boldish
// #2db7f5 - boldest
// #57c5f7 - boldest

// Existing OldNYC red:
// bold: #c00
// softer: #e3a1a1
