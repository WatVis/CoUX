import React, { useMemo, useState, useRef, useEffect } from "react";
import { useTrack } from "../contexts/TrackProvider";
import { ResizeObserver } from "@juggle/resize-observer";
import * as d3 from "d3";
import * as R from "ramda";
import "../styles/components/scrolling-speed-chart.scss";

const chartSettings = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 20,
};
const ScrollingSpeedChart = ({
  chartData,
  sceneBreaks,
  duration,
  segments,
  played,
  isPlaying,
  projectId,
  setPlayed,
  player,
}) => {
  const { trackEvent } = useTrack();
  const sectionMargin = 15;
  const [ref, dms] = useChartDimensions(chartSettings);
  const refSvg = useRef();
  const [data, setData] = useState(chartData);

  useEffect(() => {
    if (dms.boundedWidth !== 0 && dms.boundedHeight !== 0) {
      // 1. Access data
      let dataset = data;
      let audioSegments = segments;
      const yAccessor = (d) => d;

      // 3. Draw canvas
      const svg = d3.select(refSvg.current);
      const wrapper = d3.select(refSvg.current);

      const bounds = wrapper
        .append("g")
        .attr("class", "bound")
        .style(
          "transform",
          `translate(${dms.marginLeft}px, ${dms.marginTop}px)`
        );

      const lableBounds = wrapper.append("g").attr("class", "lableBounds");

      // 4. Create scales
      const offset = 0;

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dms.boundedHeight - offset, 0]);
      // .nice(20);

      const xScale = d3
        .scaleLinear()
        .domain([0, dataset.length - 1])
        .range([0, dms.boundedWidth]);

      // 5. Draw data
      const segmentsSvg = bounds
        .selectAll(".season")
        .data(audioSegments)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.start))
        .attr("width", (d, index) => {
          return Math.round(xScale(d.end) - xScale(d.start));
        })
        .attr("y", offset)
        .attr("height", dms.boundedHeight - offset)
        .attr("class", (d) => {
          const activeSegment = played < d.end && played > d.start;
          return `season ${activeSegment ? "active" : ""}`;
        });

      // draw the line

      // const dots = bounds
      //   .selectAll(".dot")
      //   .data(dataset)
      //   .enter()
      //   .append("circle")
      //   .attr("cx", (d, i) => xScale(i))
      //   .attr("cy", (d) => yScale(yAccessor(d)))
      //   .attr("r", 2)
      //   .attr("class", "dot");

      const lineGenerator = d3
        .line()
        .x((d, i) => xScale(i))
        .y((d) => yScale(yAccessor(d)));
      // .curve(d3.curveCardinal);

      const line = bounds
        .append("path")
        .attr("class", "line")
        .attr("d", lineGenerator(dataset));

      // 6. Draw peripherals

      // const seasonMeans = bounds
      //   .selectAll(".season-mean")
      //   .data(seasonsData)
      //   .enter()
      //   .append("line")
      //   .attr("x1", (d) => xScale(d.start))
      //   .attr("x2", (d) => xScale(d.end))
      //   .attr("y1", (d) => yScale(d.mean))
      //   .attr("y2", (d) => yScale(d.mean))
      //   .attr("class", "season-mean");
      // const seasonMeanLabel = bounds
      //   .append("text")
      //   .attr("x", 35)
      //   .attr("y", yScale(seasonsData[0].mean))
      //   .attr("class", "season-mean-label")
      //   .text("Mean");

      // //   const seasonLabels = bounds
      // //     .selectAll(".season-label")
      // //     .data(seasonsData)
      // //     .enter()
      // //     .append("text")
      // //     .filter((d) => xScale(d.end) - xScale(d.start) > 60)
      // //     .attr(
      // //       "x",
      // //       (d) => xScale(d.start) + (xScale(d.end) - xScale(d.start)) / 2
      // //     )
      // //     .attr("y", dms.boundedHeight + 30)
      // //     .text((d) => d.name)
      // //     .attr("class", "season-label");

      // const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(2);
      // let tickLabels = ["Slow", "Fast"];
      // yAxisGenerator.tickFormat((d, i) => tickLabels[i]);

      // const yAxisBg = lableBounds
      //   .append("rect")
      //   .attr("x", 0)
      //   .attr("y", 0)
      //   .attr("width", 50)
      //   .attr("height", dms.boundedHeight + dms.marginTop)
      //   .attr("class", "y-axis-bg");

      // const yAxis = lableBounds
      //   .append("g")
      //   .attr("class", "y-axis")
      //   .style("transform", `translate(50px, ${dms.marginTop}px)`)
      //   .call(yAxisGenerator);

      // const yAxisLabelSuffix = bounds
      //   .append("text")
      //   .attr("y", 2)
      //   .attr("x", "50%")
      //   .text("Scrolling Speed")
      //   .attr("class", "y-axis-label y-axis-label-suffix");

      // lableBounds
      //   .append("line")
      //   .attr("x1", 0)
      //   .attr("x2", dms.boundedWidth)
      //   .attr("y1", dms.boundedHeight / 2)
      //   .attr("y2", dms.boundedHeight / 2)
      //   .attr("class", "y-axis-tick-2");

      // // 7. Draw Scene Breaks

      const sceneScale = d3
        .scaleTime()
        .domain([0, duration])
        .range([0, dms.boundedWidth]);

      bounds
        .selectAll(".scene-split")
        .data(sceneBreaks)
        .enter()
        .append("line")
        .attr("x1", sceneScale)
        .attr("x2", sceneScale)
        .attr("y1", 0)
        .attr("y2", dms.boundedHeight)
        .attr("class", "scene-split");

      const scrubber = bounds.selectAll(".scrubber-chart").data([played]);
      scrubber
        .enter()
        .append("line")
        .attr("x1", sceneScale)
        .attr("x2", sceneScale)
        .attr("y1", 0)
        .attr("y2", dms.boundedHeight)
        .attr("class", "scrubber-chart");

      scrubber.exit().remove(); //remove unneeded circles

      // 8. Set up interactions

      const listeningRect = bounds
        .append("rect")
        .attr("class", "listening-rect")
        .attr("width", dms.boundedWidth)
        .attr("height", dms.boundedHeight)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .on("click", onClick);

      const tooltip = d3.select("#tooltip");
      const tooltipLine = bounds
        .append("line")
        .attr("class", "tooltip-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", dms.boundedHeight)
        .attr("stroke-width", 1)
        .attr("stroke", "#45b9f6")
        .style("opacity", 0);

      const tooltipCircle = bounds
        .append("circle")
        .attr("class", "tooltip-circle")
        .attr("r", 4)
        .attr("stroke", "#45b9f6")
        .attr("fill", "#212442")
        .attr("stroke-width", 1)
        .style("opacity", 0);

      function onMouseMove(event) {
        const mousePosition = event.clientX - sectionMargin - dms.marginLeft;
        const closestIndex = Math.round(xScale.invert(mousePosition));

        const closestDataPoint = dataset[closestIndex];

        const closestXValue = closestIndex;
        const closestYValue = closestDataPoint;

        const formatScrollingSpeed = (d) => `${d3.format(".1f")(d)}`;
        tooltip.select("#date").text(formatScrollingSpeed(closestYValue));

        const x = xScale(closestXValue) + dms.marginLeft;
        const y = yScale(closestYValue) + dms.marginTop;

        tooltip.style(
          "transform",
          `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
        );

        tooltip.style("opacity", 1);

        tooltipLine
          .attr("x1", xScale(closestXValue))
          .attr("x2", xScale(closestXValue))
          .style("opacity", 1);

        tooltipCircle
          .attr("cx", xScale(closestXValue))
          .attr("cy", yScale(closestYValue))
          .style("opacity", 1);
      }

      function onMouseLeave() {
        tooltip.style("opacity", 0);

        tooltipLine.style("opacity", 0);
        tooltipCircle.style("opacity", 0);
      }

      function onClick(event) {
        const mousePosition = event.clientX - sectionMargin - dms.marginLeft;
        const head = (mousePosition / dms.boundedWidth) * duration;
        player.seekTo(head);
        setPlayed(head);
        localStorage.setItem(
          `coux-project-${projectId}`,
          JSON.stringify({ played: head })
        );
        trackEvent({
          section: "scrolling-speed-chart",
          action: "click",
          newHead: head,
        });
      }
    }
    return () => {
      const svg = d3.select(refSvg.current);
      svg.selectAll("*").remove();
    };
  }, [
    data,
    dms.boundedHeight,
    dms.boundedWidth,
    dms.marginLeft,
    dms.marginTop,
    duration,
    sceneBreaks,
    played,
    isPlaying,
  ]);

  return (
    <div className="Chart__wrapper" ref={ref} style={{ height: "100px" }}>
      <div className="heading">
        <h3>Scrolling Speed</h3>
        <p className="legend">Vertical lines are Scene Breaks</p>
      </div>
      <div className="y-axis">
        <p className="fast">Fast</p>
        <p className="slow">Slow</p>
      </div>
      <svg width={dms.width} height={dms.height} ref={refSvg}></svg>
      <div id="tooltip" className="tooltip">
        <div className="tooltip-date">
          <span id="date"></span>
        </div>
      </div>
    </div>
  );
};

const useChartDimensions = (passedSettings) => {
  const ref = useRef();
  const dimensions = combineChartDimensions(passedSettings);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (dimensions.width && dimensions.height) return [ref, dimensions];
    const element = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;
      const entry = entries[0];
      if (width !== entry.contentRect.width) setWidth(entry.contentRect.width);
      if (height !== entry.contentRect.height)
        setHeight(entry.contentRect.height);
    });
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [dimensions, width, height]);
  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });
  return [ref, newSettings];
};

const combineChartDimensions = (dimensions) => {
  const parsedDimensions = {
    ...dimensions,
    marginTop: dimensions.marginTop,
    marginRight: dimensions.marginRight,
    marginBottom: dimensions.marginBottom,
    marginLeft: dimensions.marginLeft,
  };
  return {
    ...parsedDimensions,
    boundedHeight: Math.max(
      parsedDimensions.height -
        parsedDimensions.marginTop -
        parsedDimensions.marginBottom,
      0
    ),
    boundedWidth: Math.max(
      parsedDimensions.width -
        parsedDimensions.marginLeft -
        parsedDimensions.marginRight,
      0
    ),
  };
};

export default ScrollingSpeedChart;
