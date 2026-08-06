import React from 'react';
import SlideTemplate from './SlideTemplate';

export default function SlideUOK({ data, reportDate }) {
  return (
    <SlideTemplate
      label="УОК"
      title="Отчет по Производству Клинкера"
      daily={data?.uok?.daily}
      monthly={data?.uok?.monthly}
      reportDate={reportDate}
    />
  );
}

