import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { useDispatch, useSelector } from 'react-redux';
import { setTVL, setPRICE } from '../slices/mainSlice';

const Chart = ({ name, type }) => {
  const updateName = (name) => {
    const lower = name.toLowerCase();
    const noSpace = lower.replace(/ /g, '-');
    return noSpace;
  };

  const [updatedName, setUpdatedName] = useState(updateName(name));
  const [marketData, setMarketData] = useState(null);

  const tvlData = useSelector((state) => state.main.TVL);
  const priceData = useSelector((state) => state.main.Price);
  const volumeData = useSelector((state) => state.main.Volume);
  const mcapData = useSelector((state) => state.main.MCAP);
  const protocols = useSelector((state) => state.main.protocols);
  const dispatch = useDispatch();

  const foundProtocol = protocols.find((protocol) => protocol.name === name);
  const geckoID = foundProtocol ? foundProtocol.geckoID : null;

  useEffect(() => {
    dispatch(setTVL(updatedName));
    if(geckoID){
      dispatch(setPRICE(geckoID))
    }
    else{
      dispatch(setPRICE(updatedName));

    }
  }, [dispatch, updatedName]);

  useEffect(() => {
    if (type === 'TVL') {
      setMarketData(tvlData);
    }
    if (type === 'PRICE') {
      setMarketData(priceData);
    }
    if (type === 'Volume') {
      setMarketData(volumeData);
    }
    if (type === 'MCAP') {
      setMarketData(mcapData);
    }
  }, [type, tvlData, priceData, volumeData, mcapData]);

  const chartContainerRef = useRef();
  const chartRef = useRef(null);

  useEffect(() => {
    if (marketData === null) {
      return;
    }

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000033' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
    });

    chartRef.current = chart;

    if (type === 'Volume') {
      const histogramSeries = chart.addHistogramSeries({
        color: 'rgba(56, 33, 110, 1)',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const data = marketData.map((datapoint) => ({ ...datapoint })); // Create new objects for each datapoint
      histogramSeries.setData(data);
    } else {
      const areaSeries = chart.addAreaSeries({
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        lineColor: 'rgba(56, 33, 110, 1)',
        topColor: 'rgba(56, 33, 110, 0.6)',
        bottomColor: 'rgba(56, 33, 110, 0.1)',
      });

      const data = marketData.map((datapoint) => ({ ...datapoint })); // Create new objects for each datapoint
      areaSeries.setData(data);

      const mainSeries = chart.addAreaSeries();
      mainSeries.setData(data);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          chart.resize(width, height);
        }
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
    };
  }, [marketData, type]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default Chart;
