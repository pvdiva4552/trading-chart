import React, { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, HistogramSeries } from "lightweight-charts";
import addIcon from "./icons/add.png";
import expand from "./icons/expand.png";

const RangeChart = ({ setCurrentPrice }) => {
  const chartRef = useRef();
  const tooltipRef = useRef();
  const currentPriceRef = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeframe, setTimeframe] = useState("1d");
  const chartInstance = useRef();

  const intervals = ["1d", "3d", "1w", "1m", "6m", "1y", "max"];

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: {
        textColor: "black",
        background: { type: "solid", color: "white" },
        borderBottom: {
          color: "rgba(0, 0, 0, 0.1)",
          width: 1,
        },
      },
      grid: {
        vertLines: { color: "rgba(0,0,0,0.1)", visible: true },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        visible: true,
        borderVisible: false,
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          const hour = date.getHours();
          if (hour === 27 || hour === 18) {
            return "";
          }
          return `${hour}`;
        },
      },
      rightPriceScale: {
        visible: false,
        drawTicks: false,
      },
      leftPriceScale: {
        visible: false,
      },
    });

    chartInstance.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#4B40EE",
      lineWidth: 2,
      topColor: "rgba(232, 231, 255, 0.9)",
      bottomColor: "rgba(255, 255, 255, 0.5)",
      priceLineVisible: false,
      priceScaleId: "right",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      base: 0,
      lineWidth: 2,
      barWidth: 6,
      barSpacing: 15,
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
      priceFormat: {
        type: "volume",
      },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chart.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.4,
      },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      visible: false,
    });

    const generateDataForTimeframe = (timeframe) => {
      const startTime = 1643202922 + 86400;
      let timeStep;
      let initialCount;

      switch (timeframe) {
        case "1s":
          timeStep = 1;
          initialCount = 200;
          break;
        case "1d":
          timeStep = 86400;
          initialCount = 200;
          break;
        case "3d":
          timeStep = 86400 * 3;
          initialCount = 60;
          break;
        case "1w":
          timeStep = 86400 * 7;
          initialCount = 30;
          break;
        case "1m":
          timeStep = 86400 * 30;
          initialCount = 12;
          break;
        case "6m":
          timeStep = 86400 * 30 * 6;
          initialCount = 6;
          break;
        case "1y":
          timeStep = 86400 * 365;
          initialCount = 2;
          break;
        case "max":
          timeStep = 86400 * 365 * 10;
          initialCount = 200;
          break;
        default:
          timeStep = 86400;
          initialCount = 200;
      }

      const data = Array.from({ length: initialCount }, (_, i) => {
        const value = Math.floor(Math.random() * 10) + 50050;
        const volume = i % 2 === 0 ? Math.floor(Math.random() * 10) + 5 : 0;
        return {
          time: startTime + i * timeStep,
          value,
          volume,
        };
      });

      return data;
    };

    let data = generateDataForTimeframe(timeframe);
    areaSeries.setData(data.map((d) => ({ time: d.time, value: d.value })));
    const volumeScaleFactor = 0.01;
    volumeSeries.setData(
      data
        .filter((d) => d.volume > 0)
        .map((d) => ({
          time: d.time,
          value: d.volume * volumeScaleFactor,
          color: "#E6E8EB",
        }))
    );

    chart.timeScale().fitContent();

    let latestTime = data[data.length - 1].time;
    let secondCounter = 0;

    const interval = setInterval(() => {
      latestTime += 1;
      secondCounter += 1;

      const newPrice = Math.random() * 50 + 50000;
      setCurrentPrice(newPrice);

      areaSeries.update({ time: latestTime, value: newPrice });

      const y = areaSeries.priceToCoordinate(newPrice);
      if (y && currentPriceRef.current) {
        currentPriceRef.current.style.top = `${y}px`;
        currentPriceRef.current.textContent = newPrice.toFixed(2);
      }

      if (secondCounter % 2 === 0) {
        const newVolume = Math.floor(Math.random() * 10) + 5;
        volumeSeries.update({
          time: latestTime,
          value: newVolume * volumeScaleFactor,
          color: "#E6E8EB",
        });
        data.push({ time: latestTime, value: newPrice, volume: newVolume });
      } else {
        data.push({ time: latestTime, value: newPrice, volume: 0 });
      }
    }, 1000);

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData.has(areaSeries)) {
        tooltipRef.current.style.display = "none";
        return;
      }
      const price = param.seriesData.get(areaSeries).value;
      const coordinate = areaSeries.priceToCoordinate(price);
      if (coordinate === null) return;

      tooltipRef.current.style.display = "flex";
      tooltipRef.current.style.top = `${coordinate}px`;

      tooltipRef.current.querySelector("#tooltip-text").textContent =
        price.toFixed(2);
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (chartRef.current && chartInstance.current) {
          chartInstance.current.resize(
            chartRef.current.clientWidth,
            chartRef.current.clientHeight
          );
        }
      });
    });
    resizeObserver.observe(chartRef.current);

    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
      chart.remove();
    };
  }, [timeframe]);

  const toggleFullScreen = () => {
    if (!chartRef.current) return;

    if (!isFullScreen) {
      chartRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleIntervalClick = (interval) => {
    setTimeframe(interval);
  };

  return (
    <div
      style={{
        width: "950px",
        margin: "0px auto",
        overflow: "hidden",
        marginTop: "60px",
      }}
    >
      <div
        style={{
          width: "750px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "25px" }}>
          <button
            onClick={toggleFullScreen}
            style={{
              backgroundColor: "#fff",
              color: "#6F7177",
              border: "none",
              padding: "0px",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "400",
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={expand} alt="" />
            <span style={{ marginLeft: "10px", fontSize: "18px" }}>
              {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </button>
          <button
            onClick={toggleFullScreen}
            style={{
              backgroundColor: "#fff",
              color: "#6F7177",
              border: "none",
              padding: "0px",
              borderRadius: "5px",
              fontWeight: "400",
              fontSize: "18px",
              cursor: "pointer",
              zIndex: 1001,
              marginLeft: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={addIcon} alt="" />
            <span style={{ marginLeft: "10px", fontSize: "18px" }}>
              Compare
            </span>
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            zIndex: 1001,
          }}
        >
          {intervals.map((i) => (
            <button
              key={i}
              onClick={() => handleIntervalClick(i)}
              style={{
                padding: "8px 14px",
                backgroundColor: timeframe === i ? "#4B40EE" : "transparent",
                color: timeframe === i ? "white" : "#6b7280",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "400",
                fontSize: "18px",
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            borderBottom: "2px solid #E2E4E7",
            borderLeft: "2px solid #E2E4E7",
            borderRight: "2px solid #E2E4E7",
            overflowY: "hidden",
            width: "839px",
            marginTop: "46px",
          }}
        >
          <div
            ref={chartRef}
            style={{
              width: "839px",
              height: isFullScreen ? "100vh" : "343px",
              transform: "translateY(25px)",
            }}
          />
        </div>

        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            right: 0,
            zIndex: 1000,
            width: "109px",
            height: "33px",
            backgroundColor: "#1A243A",
            borderRadius: "5px",
            color: "white",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "500",
            pointerEvents: "none",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <div
            id="tooltip-text"
            style={{ width: "100%", textAlign: "center" }}
          />
        </div>

        <div
          ref={currentPriceRef}
          style={{
            position: "absolute",
            right: 0,
            width: "109px",
            height: "33px",
            zIndex: 1000,
            backgroundColor: "#4B40EE",
            color: "white",
            borderRadius: "5px",
            fontSize: "14px",
            fontWeight: "500",
            pointerEvents: "none",
            WebkitFontSmoothing: "antialiased",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>
    </div>
  );
};

export default RangeChart;
