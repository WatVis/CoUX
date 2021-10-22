import React, { useMemo, useState, useRef, useEffect } from "react";
import { ResizeObserver } from "@juggle/resize-observer";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import * as R from "ramda";
import { contrast } from "../utils/utils";
import { useTrack } from "../contexts/TrackProvider";
import { useComments } from "../contexts/CommentsProvider";
import { useProject } from "../contexts/ProjectProvider";
import "../styles/components/segment-connection.scss";

// https://github.com/analyzer2004/weathersankey
// Copyright 2020 Eric Lo
class WeatherChart {
  constructor(parent) {
    this._parent = parent;
    this._width = 1000;
    this._btm_width = 900;
    this._height = 200;
    this._xr = 1;
    this._offset = 0;
    this._leftMargin = 0;
    this._duration = 0;

    this._margin = {
      sankeyTop: 0,
      sankeyBottom: 0,
      temp: 0,
    };
    this._iconSize = 0;

    this._tempHeight = 0;

    this._nodes = null;
    this._links = null;
    this._data = null;
    this._sort = 0; // 0: none, 1: clear to rain, 2: rain to clear
    this._played = 0;
    this._isPlaying = false;
    this._trackEvent = undefined;
    this._segments = undefined;

    this._highColor = "#ef476f";
    this._lowColor = "#457b9d";
    this._conditions = null;
    this._discBySegment = undefined;
    this._colors = {
      AGREED: "#71c9ce",
      NOT_AGREED: "#f53e4c",
      IN_PROGRESS: "#45b9f6",
      VOTING: "#fab81c",
      NULL: "#cdd0cb",
    };
  }

  size(
    width,
    height,
    bottomWidth,
    duration,
    played,
    isPlaying,
    discBySegment,
    trackEvent
  ) {
    this._width = width;
    this._height = height;
    this._btm_width = bottomWidth;
    this._duration = duration;
    this._played = played;
    this._isPlaying = isPlaying;
    this._discBySegment = discBySegment;
    this._trackEvent = trackEvent;
    return this;
  }

  render(data) {
    this._init();
    this._process(data);
    this._drawSankey();
    return this;
  }

  _init() {
    this._margin.sankeyTop = 0;
  }

  _process(data) {
    const converted = data.map((d, index) => {
      const segmentMargin = 2;
      const marginToRemove = (data.length - 1) * segmentMargin;
      const timelineW = this._width - marginToRemove;
      const segmentDuration = d.end - d.start;
      let segmentW;
      return {
        ...d,
        id: `${d.start}-${d.end}`,
        color: "#45b9f6",
        fixedValue: timelineW * (segmentDuration / this._duration),
      };
    });

    const segmentMargin = 2;
    const marginToRemove = (data.length - 1) * segmentMargin;
    const timelineW = this._btm_width - marginToRemove;
    const segWidth = timelineW / data.length;

    const ls = converted.map((d) => {
      return {
        source: `${d.start}-${d.end}`,
        target: `${d.end}-${d.start}`,
        value: 2,
        _id: d._id,
      };
    });
    const conds = converted.map((d) => {
      return {
        id: `${d.end}-${d.start}`,
        start: d.start,
        end: d.end,
        color: "#45b9f6",
        fixedValue: segWidth,
        _id: d._id,
      };
    });

    const ns = conds.concat(
      converted.map((d) => ({
        id: d.id,
        start: d.start,
        end: d.end,
        color: "#45b9f6",
        fixedValue: d.fixedValue,
        _id: d._id,
      }))
    );

    const { nodes, links } = this._sankey(ns, ls);
    this._nodes = nodes;
    this._links = links;
    this._data = converted;
    this._segments = R.map(R.prop("end"), data);
    this._segments = R.prepend(0, this._segments);
    this._segments[this._segments.length - 1] = this._duration;

    return this;
  }

  _drawSankey() {
    var that = this;
    const segmentMargin = 0;
    const marginToRemove = (this._data.length - 1) * segmentMargin;
    const timelineW = this._btm_width - marginToRemove;
    const segWidth = timelineW / this._data.length;

    const colorCoding = (discussions) => {
      const byStatus = R.groupBy(function (discussion) {
        const status = discussion.status;
        return status === "IN_PROGRESS" ? "IN_PROGRESS" : "VOTING";
      });
      const discByStatus = discussions ? byStatus(discussions) : {};
      const hasAnyInProg = R.propOr([], "IN_PROGRESS", discByStatus).length > 0;

      const hasAnyDisc = R.keys(discByStatus).length > 0;

      const finalColor = hasAnyDisc
        ? hasAnyInProg
          ? "IN_PROGRESS"
          : "NULL"
        : "NULL";
      return finalColor;
    };

    const g = this._parent
      .append("g")
      .attr(
        "transform",
        `translate(${this._leftMargin},${this._margin.sankeyTop})`
      );

    const tooltip = d3.select("#tooltip-connection");

    const nodes = g
      .append("g")
      .selectAll("g")
      .data(this._nodes)
      .join("g")
      .attr("opacity", (d) => {
        const activeSegment = that._played < d.end && that._played > d.start;
        return activeSegment ? 1 : 0.2;
      })
      .attr("fill", (d) => {
        return this._colors[colorCoding(this._discBySegment[d._id])];
      })
      .attr("transform", (d, i) =>
        d.depth === 1
          ? `translate(${i * segWidth + 90},${d.x0 + 3})`
          : `translate(${d.y0},${d.x0})`
      )
      .call((g) =>
        g
          .append("rect")
          .attr("width", (d) =>
            d.depth === 1 ? Math.floor(d.y1 - d.y0) : d.y1 - d.y0
          )
          .attr("height", (d) => (d.depth === 1 ? 1 : d.x1 - d.x0))
      )
      .on("mouseover", (e, d) => highlight(e, d))
      .on("mouseout", (e, d) => restore(e, d, true));

    // this._addCondition(nodes);
    // this._addDate(nodes);

    const links = g
      .append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(this._links)
      .join("g")
      .append("path")
      .attr("stroke-opacity", (d) => {
        const activeSegment =
          that._played < d.source.end && that._played > d.source.start;
        return activeSegment ? 1 : 0.2;
      })
      .attr("d", this._sankeyLinkVertical())
      .attr(
        "stroke",
        (d) => this._colors[colorCoding(this._discBySegment[d.source._id])]
      )
      .attr("stroke-width", (d) => Math.max(1, d.width));

    const segmentCount = this._segments.length - 1;
    const segmentW = this._btm_width / segmentCount;
    const segmentId = R.findIndex(R.lte(this._played), this._segments);
    const offset = segmentW * (segmentId - 1) + 91;
    const playPos =
      ((this._played - this._segments[segmentId - 1]) /
        (this._segments[segmentId] - this._segments[segmentId - 1])) *
      segmentW;

    var data = {
      source: {
        x: (this._played / this._duration) * this._width + 1,
        y: 4,
      },
      target: {
        x: offset + playPos,
        y: this._height - 1,
      },
    };

    var playHeadCurve = d3
      .linkVertical()
      .x((d) => d.x)
      .y((d) => d.y);

    const playHead = g
      .append("g")
      .attr("fill", "none")
      .append("path")
      .attr("d", playHeadCurve(data))
      .style("fill", "none")
      .style("stroke", "#f53e4c")
      .style("stroke-width", "2px");

    function highlight(e, d, restore) {
      links
        .filter((l) => l.source !== d && l.target !== d)
        .transition()
        .duration(500)
        .attr("stroke-opacity", restore ? 1 : 0.2);
      nodes
        .transition()
        .duration(500)
        .attr("opacity", (n) =>
          restore || linkedNodes(d).some((ln) => n === ln) ? 1 : 0.2
        );

      const id = d.sourceLinks[0].source._id;

      tooltip
        .select("#connection-date")
        .text(colorCoding(that._discBySegment[id]));

      const x = (d.y0 + d.y1) / 2;
      const y = 50;

      const color = that._colors[colorCoding(that._discBySegment[id])];

      that._trackEvent({
        section: "connection-sankey",
        action: "hover",
        segmentStatus: colorCoding(that._discBySegment[id]),
        segmentId: id,
      });

      tooltip
        .style(
          "transform",
          `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
        )
        .style("background", color)
        .style("color", contrast(color));

      tooltip.style("opacity", 1);
    }

    function restore(e, d) {
      highlight(e, d, true);
      tooltip.style("opacity", 0);
    }

    function linkedNodes(n) {
      return Array.from(
        new Set(
          that._links
            .flatMap((d) =>
              d.source === n || d.target === n ? [d.source, d.target] : null
            )
            .filter((d) => d !== null)
        )
      );
    }
  }
  _sankey(nodes, links) {
    const sankeyHeight =
      this._height - this._margin.sankeyTop - this._margin.sankeyBottom;
    return d3Sankey
      .sankey()
      .nodeId((d) => d.id)
      .nodeWidth(4)
      .nodePadding(2)
      .nodeSort(null)
      .size([sankeyHeight, this._width - this._leftMargin])({
      nodes: nodes.map((d) => Object.assign({}, d)),
      links: links.map((d) => Object.assign({}, d)),
    });
  }

  _getNodeColor(d) {
    if (d.depth === 0) return this._lookup().color;
    else if (d.depth === 1) {
      const day = this._data.find((_) => _.date === d.id);
      if (day) return this._lookup().color;
    }
  }

  _lookup() {
    const colorMap = [
      { color: "#f53e4c" },
      { color: "#fdae61" },
      { color: "#ffffbf" },
      { color: "#abd9e9" },
      { color: "#2c7bb6" },
    ];
    return colorMap[Math.floor(Math.random() * 5)];
  }

  _sankeyLinkVertical() {
    const segmentMargin = 0;
    const marginToRemove = (this._data.length - 1) * segmentMargin;
    const timelineW = this._btm_width - marginToRemove;
    const segWidth = timelineW / this._data.length;
    return d3
      .linkVertical()
      .source(verticalSource)
      .target((d, i) => verticalTarget(d, i, segWidth));

    function verticalSource(d) {
      return [d.source.y0 + 1, d.source.x1];
    }

    function verticalTarget(d, i, segWidth) {
      return [i * segWidth + 91, d.target.x0 + 4];
    }
  }
}

const chartSettings = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
};
const SegmentConnection = ({ duration, segments, played, isPlaying }) => {
  const { trackEvent } = useTrack();

  const [ref, dms] = useChartDimensions(chartSettings);
  const refSvg = useRef();

  const { discussions, userId } = useComments();
  const { isColab } = useProject();
  const filteredDiscussions = isColab
    ? discussions
    : R.filter(
        (el) => R.any(R.propEq("id", userId), el.participants),
        discussions
      );
  const discBySegment = R.groupBy(R.prop("segment"), filteredDiscussions);

  useEffect(() => {
    if (dms.boundedWidth !== 0 && dms.boundedHeight !== 0) {
      // 1. Access data
      let audioSegments = segments;
      // 3. Draw canvas
      const svg = d3.select(refSvg.current);

      const w = dms.width,
        h = dms.height,
        bottomWidth = dms.width - 90;
      new WeatherChart(svg)
        .size(
          w,
          h,
          bottomWidth,
          duration,
          played,
          isPlaying,
          discBySegment,
          trackEvent
        )
        .render(audioSegments);
    }
    return () => {
      const svg = d3.select(refSvg.current);
      svg.selectAll("*").remove();
    };
  }, [
    dms.boundedHeight,
    dms.boundedWidth,
    dms.marginLeft,
    dms.marginTop,
    duration,
    played,
    isPlaying,
  ]);

  return (
    <div className="Chart__wrapper-sankey" ref={ref} style={{ height: "25px" }}>
      <svg width={dms.width} height={dms.height} ref={refSvg}></svg>
      <div id="tooltip-connection" className="tooltip-connection">
        <div className="tooltip-connection-date">
          <span id="connection-date"></span>
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

export default SegmentConnection;
