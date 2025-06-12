import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const allTimes = Array.from({ length: ((22 - 4 + 1) * 4) }, (_, i) => {
  const base = 4 * 60;
  const totalMinutes = base + i * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const isPM = totalMinutes >= 12 * 60;
  const displayHour = ((hour % 12) || 12).toString();
  const displayMinute = minute.toString().padStart(2, '0');
  const ampm = isPM ? 'PM' : 'AM';
  const label = `${displayHour}:${displayMinute} ${ampm}`;
  return { value: label, label };
});

export default function TimeSelect({ values, onChange }) {
  const selectedOptions = values.map(val => ({ value: val, label: val }));

  return (
    <Select
      options={allTimes}
      value={selectedOptions}
      onChange={(selected) => onChange(selected.map(s => s.value))}
      components={animatedComponents}
      isMulti
      closeMenuOnSelect={false}
      styles={{
        menu: (base) => ({
          ...base,
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 9999,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: '200px',
          overflowY: 'auto',
        }),
        control: (base) => ({
          ...base,
          overflow: 'visible', // ✨ prevents parent clipping
        }),
      }}
    />
  );
}
