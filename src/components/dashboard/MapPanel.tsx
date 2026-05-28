'use client';

import dynamic from 'next/dynamic';

const IndiaRiskMap = dynamic(() => import('./IndiaRiskMap'), { ssr: false });
const CityRiskMap = dynamic(() => import('./CityRiskMap'), { ssr: false });

export { IndiaRiskMap, CityRiskMap };
