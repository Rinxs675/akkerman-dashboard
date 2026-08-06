import React from 'react';
import SlideTemplate from './SlideTemplate';

export default function SlideOIUC({ data, reportDate }) {
  return (
    <SlideTemplate
      label="УОиУЦ"
      title="Отчет по Отгрузке цемента"
      daily={data?.oiuc?.daily}
      monthly={data?.oiuc?.monthly}
      reportDate={reportDate}
    />
  );
}

