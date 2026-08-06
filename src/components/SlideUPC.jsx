import React from 'react';
import SlideTemplate from './SlideTemplate';

export default function SlideUPC({ data, reportDate }) {
  return (
    <SlideTemplate
      label="УПЦ"
      title="Отчет по Производству Цемента"
      daily={data?.upc?.daily}
      monthly={data?.upc?.monthly}
      reportDate={reportDate}
    />
  );
}

