import React, { useMemo, useState, useRef, useEffect } from "react";
import { ResizeObserver } from "@juggle/resize-observer";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import * as R from "ramda";
import "../styles/components/segment-detail-sankey.scss";

const colors = [
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f",
  "#4e79a7",
  "#f28e2c",
  "#e15759",
];

const weatherIcons = {
  clear:
    "https://ehsanjso.static.observableusercontent.com/files/003be897f666d10456de853215048e5cdc4249b1ad17e930ad94c04f15837c7dbf64b7cb354dae7b5b361997d6fd751b382316145879fec8580a8a72c6568611?Expires=1606737600000&Key-Pair-Id=APKAJCHFJLLLU4Y2WVSQ&Signature=o04JmAw6D5M7WU3nxnt31CPDjdA~PTiVsZc5A2XkznoLau9C55Y05i6lbNJ7EtyLWJY8zPUkfssQtjDgckg75GjNS45nZ863RJAvMibIQftoWr~47izAxf6o5E1RatRKaNIRiV2gNwV71zDVjsEBW-TFqFbbbBjgd8gMOlUZ5B6ar7QrjhjBznPP91X5i3u-bVBbRINidQVM96Vy8reKuuf2xsbj3ci4ZUrAd3ucO8xJljk67urX41lzfs-prVDQagGDrj-StxVJeUciK2-ivxy-oGCJ3dHZdVFISaK8pgxVcqrIO-mYW~Om7Wmw7UG-JNG7aIpF7vu9Qf1pSr6-yQ__",
  cloudy:
    "https://ehsanjso.static.observableusercontent.com/files/7c41512f80e4da3e46bfcadbf780b1a17dec705d595e8b37373d0a4899cb7259269b31a94b33a92d3fca310b853b1efbdd6f1c7aae32b3b63817477e0665cde3?Expires=1606737600000&Key-Pair-Id=APKAJCHFJLLLU4Y2WVSQ&Signature=I6a2e8xBkw2p2SAhd89c1cU9F19~p9pNj3lsqI9a2BLrLY-1SYwYqcL6t-aetzGdbO1OJOM3C2XYGKbX7a0Qm78eqSL9uBroolpDPTHaLa46To2~2qWGcd5AoRLpUxQosjEQf0-iiJNy08XpYDxhbL3y4eXxo8GnhrSkVfiUnVH9WilSoJVdWUrH9U4ijdlkZ9QFAwrmYP0v1Fri5bc3ozjkJuiwq0M2axvNmhLaFXlJ~WWw99M3LYThQB1CkxJrDSa8J1gf33u7xnVWYkwew23jc-b1Nd5gMm692JWd9QgJO0aySGBWTY8HMqEMV7AjdiJnK51k9-jjgq7A8rn0ig__",
  overcast:
    "https://ehsanjso.static.observableusercontent.com/files/85d039b51be39fbe0074690e555b615b6dbec5e5dafea336b1473be79ea9c5db28114f34deeaee342fca9fe70311b40a11298caa82b109aca44c704db90e18f2?Expires=1606737600000&Key-Pair-Id=APKAJCHFJLLLU4Y2WVSQ&Signature=Zlz6vtBNohRVPgTe45YiBa1QjaeGNU8P2a2zapnI0fYxdnXBWM6cJ5HdGfD-tTx1j5JpV1fBdgprCe08AoLB~qxspNMSQ-qSZTNIwpYyWniwBcw3Qp9tK~LAsMAm05T95a9C-mDYYipx2HUX1U7H0-K-F7srh6uNdOiJuiU8vdkhXGKOaRw8h5rFaXjxBzxeUE7LmUBwv8mDPrTxmw0xR6IGkPQRjU9EO-apXeI6wH14KsTwrBR80XTid1VdRbQ-NxqvLpKGmgtkJK-fuZwvvRTirytAMRhpDUFokeQgDe4ozJZe2FXQUb0mWkyjXFIVfpdDlckCmjd2XaY4An3DJw__",
  rain:
    "https://ehsanjso.static.observableusercontent.com/files/2ec22ea1f9015a1ff1444b2964e06ab275b06ab13438421c658d3d90d173e34c8bd1e5e2cd6d06953fec68a07c8535c26eb7ea007de4c0ca9cd3e7521e752154?Expires=1606737600000&Key-Pair-Id=APKAJCHFJLLLU4Y2WVSQ&Signature=B3tztlE602au2sTV-iIM-erFyTpuHj3r6O3KUdUq8wtkiD~GW-2wiDmKDuoCgqahmte8-5feh~2~jrSvIBtOzPJcPxiS~lmlF51jhOeKnrKsJ5qQ0l~fKPoRs1RsrFcN~GPMd8bT6hZPK--OD~Ys506Jh24CoWXwDMoBbUxCr3YbXf6FrP4EGUxzMlA3VfjdGV3MolHZEy1RgvN5YyPiy4macmWhv9zSkUKlVTqHFceBwcVOyc3qfsYNeFIrPmoN8A~RwLrIJAK8Ebv-lyUW5bZJSIHDH7cE5qpKAJZgtfRaV6b137z~nxquYBi1PpTTB1FPO4HRKaHRM0e5abcSHw__",
  snow:
    "https://ehsanjso.static.observableusercontent.com/files/bce032b385d42267ebff87665ac9456efe05672798798c796bd819d83a5017c786775ca62f3a1ffe481c318f07480baa849995532a901b39f701ea4e42d64c34?Expires=1606737600000&Key-Pair-Id=APKAJCHFJLLLU4Y2WVSQ&Signature=VHO-CKYZ7FKTbDLd25MZ2lSWW1XFb4w7JOhR90Ptj57AsAe2fuIZTaIv4jyheG5CKJb4En-jS54mAqzzpcqpWaLWcV28RMCOBbNajE8Bxgh-ENBOOA7hzYWLCvWRTumIxDynewWoZF2c4fYgUYdUqCnzpjnc7vzt~92FuFTw7bwH3whkhCqte9ljNGQK91im~srmvr9m~XJjW0L3BG09D~CjmLevqqK4Gzv3Ghv2uUY2NkXyUk7V-Qtt7jLipPE2t3r1-2V-6pJ6pgmgGbD1zeOv~VjaMwQn83~-fdrlZdfaEUtiPZbJc1qC4LVwKAJZj2nrDrbUaWqVWnX1GUBSAg__",
};

// https://github.com/analyzer2004/weathersankey
// Copyright 2020 Eric Lo
class WeatherChart {
  constructor(parent) {
    this._parent = parent;
    this._width = 1024;
    this._height = 768;
    this._xr = 1;
    this._offset = 0;
    this._leftMargin = 0;
    this._duration = 0;

    this._margin = {
      sankeyTop: 0,
      sankeyBottom: 50,
      temp: 0,
    };
    this._iconSize = 50;

    this._tempHeight = 0;

    this._nodes = null;
    this._links = null;
    this._data = null;
    this._sort = 0; // 0: none, 1: clear to rain, 2: rain to clear
    this._played = 0;
    this._isPlaying = false;

    this._highColor = "#ef476f";
    this._lowColor = "#457b9d";
    this._conditions = null;
  }

  size(width, height, duration, played, isPlaying) {
    this._width = width;
    this._height = height;
    this._duration = duration;
    this._played = played;
    this._isPlaying = isPlaying;
    return this;
  }

  icon(icon) {
    this._conditions = [
      {
        id: "pitch-0",
        index: 0,
        color: colors[0],
        icon: icon.clear,
        text: "Pitch 0",
      },
      {
        id: "pitch--1",
        index: 1,
        color: colors[1],
        icon: icon.cloudy,
        text: "Pitch -1",
      },
      {
        id: "pitch-1",
        index: 2,
        color: colors[2],
        icon: icon.overcast,
        text: "Pitch 1",
      },
      {
        id: "loudness-0",
        index: 3,
        color: colors[3],
        icon: icon.rain,
        text: "Loudness 0",
      },
      {
        id: "loudness--1",
        index: 4,
        color: colors[4],
        icon: icon.snow,
        text: "Loudness -1",
      },
      {
        id: "loudness-1",
        index: 5,
        color: colors[5],
        icon: icon.clear,
        text: "Loudness 1",
      },
      {
        id: "lowSpeechRate-0",
        index: 6,
        color: colors[6],
        icon: icon.cloudy,
        text: "Low Speech Rate 0",
      },
      {
        id: "lowSpeechRate-1",
        index: 7,
        color: colors[7],
        icon: icon.overcast,
        text: "Low Speech Rate 1",
      },
      {
        id: "semantics-Neg",
        index: 8,
        color: colors[8],
        icon: icon.rain,
        text: "Semantic Negative",
      },
      {
        id: "semantics-Pos",
        index: 9,
        color: colors[9],
        icon: icon.snow,
        text: "Semantic Positive",
      },
      {
        id: "semantics-Neu",
        index: 10,
        color: colors[10],
        icon: icon.clear,
        text: "Semantic Neutral",
      },
      {
        id: "uxKeywords-q",
        index: 11,
        color: colors[11],
        icon: icon.cloudy,
        text: "UX Keyword Question",
      },
      {
        id: "uxKeywords-n",
        index: 12,
        color: colors[12],
        icon: icon.overcast,
        text: "UX Keyword Negation",
      },
      {
        id: "uxKeywords-f",
        index: 13,
        color: colors[13],
        icon: icon.rain,
        text: "UX Keyword Fillers",
      },
    ];
    return this;
  }

  sort(sort) {
    this._sort = sort;
    return this;
  }

  tempChartHeight(height) {
    this._tempHeight = height;
    return this;
  }

  render(data) {
    this._init();
    this._process(data);
    this._drawSankey();
    return this;
  }

  _init() {
    // this._margin.sankeyTop = (this._height / 650) * 60;
    // this._iconSize = (this._width / 1024) * 50;
  }

  _process(data) {
    const converted = data.map((d) => {
      const segmentMargin = 2;
      const marginToRemove = (data.length - 1) * segmentMargin;
      const timelineW = this._width - marginToRemove;
      const segmentDuration = d.end - d.start;
      return {
        ...d,
        id: `${d.start}-${d.end}`,
        color: colors[Math.floor(Math.random() * 12)],
        start: d.start,
        end: d.end,
        fixedValue: timelineW * (segmentDuration / this._duration),
      };
    });

    const conds = Array.from(
      new Set(
        [].concat.apply(
          [],
          converted.map((d) => {
            const arr = [];
            // if (d.pitch !== 0) {
            //   arr.push(`pitch-${d.pitch}`);
            // }
            // if (d.loudness !== 0) {
            //   arr.push(`loudness-${d.loudness}`);
            // }
            // if (d.lowSpeechRate !== 0) {
            //   arr.push(`lowSpeechRate-${d.lowSpeechRate}`);
            // }
            arr.push(`pitch-${d.pitch}`);
            arr.push(`loudness-${d.loudness}`);
            arr.push(`lowSpeechRate-${d.lowSpeechRate}`);
            arr.push(`semantics-${d.semantics}`);
            if (d.uxKeywords[0]) {
              arr.push(`uxKeywords-${d.uxKeywords[0]}`);
            }
            return arr.map((el) => this._lookup(el));
          })
        )
      )
    );

    conds.forEach((el) => {
      const segmentMargin = 2;
      const marginToRemove = (data.length - 1) * segmentMargin;
      const timelineW = this._width - marginToRemove;
      el.fixedValue = timelineW / conds.length;
    });

    const ls = [].concat.apply(
      [],
      converted.map((d) => {
        const segmentMargin = 2;
        const marginToRemove = (data.length - 1) * segmentMargin;
        const timelineW = this._width - marginToRemove;
        const segmentDuration = d.end - d.start;
        const fixedValue = timelineW * (segmentDuration / this._duration);

        const arr = [];
        // if (d.pitch !== 0) {
        //   arr.push(`pitch-${d.pitch}`);
        // }
        // if (d.loudness !== 0) {
        //   arr.push(`loudness-${d.loudness}`);
        // }
        // if (d.lowSpeechRate !== 0) {
        //   arr.push(`lowSpeechRate-${d.lowSpeechRate}`);
        // }
        arr.push(`pitch-${d.pitch}`);
        arr.push(`loudness-${d.loudness}`);
        arr.push(`lowSpeechRate-${d.lowSpeechRate}`);
        arr.push(`semantics-${d.semantics}`);
        if (d.uxKeywords[0]) {
          arr.push(`uxKeywords-${d.uxKeywords[0]}`);
        }
        const links = arr.map((el) => {
          return {
            source: d.id,
            target: this._lookup(el).id,
            start: d.start,
            end: d.end,
            value: 2,
            // value: fixedValue / arr.length,
          };
        });
        return links;
      })
    );
    // const ns = conds.concat(converted.map(d => ({ id: d.date, color: d.color })));
    const ns = converted
      .map((d) => ({
        id: d.id,
        color: d.color,
        fixedValue: d.fixedValue,
        start: d.start,
        end: d.end,
      }))
      .concat(conds);

    const { nodes, links } = this._sankey(ns, ls);
    this._nodes = nodes;
    this._links = links;
    this._data = converted;

    return this;
  }

  _drawSankey() {
    var that = this;

    const g = this._parent
      .append("g")
      .attr(
        "transform",
        `translate(${this._leftMargin},${this._margin.sankeyTop})`
      );

    const nodes = g
      .append("g")
      .selectAll("g")
      .data(this._nodes)
      .join("g")
      .attr("opacity", (d) => {
        console.log(d);
        let activeSegment = false;

        if (d.depth === 1) {
          activeSegment = R.any(
            (el) => that._played < el.end && that._played > el.start,
            d.targetLinks
          );
        } else {
          activeSegment = that._played < d.end && that._played > d.start;
        }

        return that._isPlaying ? (activeSegment ? 1 : 0.2) : 1;
      })
      .attr("fill", (d) => d.color)
      .attr("transform", (d) => `translate(${d.y0},${d.x0})`)
      .call((g) => {
        return g
          .append("rect")
          .attr("width", (d) => d.y1 - d.y0)
          .attr("height", (d) => d.x1 - d.x0);
      })
      .on("mouseover", (e, d) => highlight(e, d))
      .on("mouseout", (e, d) => restore(e, d, true));

    this._addCondition(nodes);

    const links = g
      .append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(this._links)
      .join("g")
      .append("path")
      .attr("stroke-opacity", (d) => {
        const activeSegment = that._played < d.end && that._played > d.start;
        return that._isPlaying ? (activeSegment ? 1 : 0.05) : 0.5;
      })
      .attr("d", this._sankeyLinkVertical())
      .attr("stroke", (d) => d.target.color)
      .attr("stroke-width", (d) => 2);
    // .attr("stroke-width", (d) => Math.max(1, d.width));

    function highlight(e, d, restore) {
      links
        .filter((l) => l.source !== d && l.target !== d)
        .transition()
        .duration(100)
        .attr("stroke-opacity", restore ? 0.5 : 0.05);
      nodes
        .transition()
        .duration(100)
        .attr("opacity", (n) =>
          restore || linkedNodes(d).some((ln) => n === ln) ? 1 : 0.05
        );
    }

    function restore(e, d) {
      highlight(e, d, true);
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

  _addCondition(nodes) {
    var that = this;
    nodes
      .filter((d) => d.depth === 1)
      .call((g) =>
        g
          .append("line")
          .attr("stroke", "#999")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "3,3")
          .attr("x1", 1)
          .attr("x2", 1)
          .attr("y1", 0)
          .attr("y2", this._iconSize)
      )
      .call((g) =>
        g
          .append("text")
          .attr("class", "days")
          .attr("fill", (d) => d3.color(d.color).darker(0.3))
          .attr("x", 5)
          .attr("y", 30)
          .text((d) => this._lookup(d.id).text)
          .call(this._wrap, nodes, that)
      );
  }

  _wrap(text, width, that) {
    let data = d3.selectAll(width).data();
    const dataLen = that._data.length;
    text.each(function (d, i) {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = text.attr("dy") ? text.attr("dy") : 0,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > data[i + dataLen].value) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  _sankey(nodes, links) {
    const sankeyHeight =
      this._height -
      this._tempHeight -
      this._margin.sankeyTop -
      this._margin.sankeyBottom -
      this._margin.temp;
    return d3Sankey
      .sankey()
      .nodeId((d) => d.id)
      .nodeWidth(5)
      .nodePadding(2)
      .nodeSort(null)
      .size([sankeyHeight, this._width - this._leftMargin])({
      nodes: nodes.map((d) => Object.assign({}, d)),
      links: links.map((d) => Object.assign({}, d)),
    });
  }

  _getNodeColor(d) {
    if (d.depth === 0) return this._lookup(d.id).color;
    else if (d.depth === 1) {
      const day = this._data.find((_) => _.date === d.id);
      if (day) return this._lookup(day.condition).color;
    }
  }

  _lookup(condId) {
    return this._conditions.find((d) => d.id === condId);
  }

  _sankeyLinkVertical() {
    return d3.linkVertical().source(verticalSource).target(verticalTarget);

    function verticalSource(d) {
      return [d.source.y0 + 2, d.source.x1];
    }

    function verticalTarget(d) {
      return [d.target.y0 + 2, d.target.x0];
    }
  }
}

const chartSettings = {
  marginTop: 15,
  marginRight: 0,
  marginBottom: 20,
  marginLeft: 0,
};
const SegmentDetailSankey = ({ duration, segments, played, isPlaying }) => {
  const [ref, dms] = useChartDimensions(chartSettings);
  const refSvg = useRef();

  useEffect(() => {
    if (dms.boundedWidth !== 0 && dms.boundedHeight !== 0) {
      // 1. Access data
      let audioSegments = segments;

      // 3. Draw canvas
      const svg = d3.select(refSvg.current);

      const w = dms.width,
        h = dms.height;
      new WeatherChart(svg)
        .size(w, h, duration, played, isPlaying)
        .icon(weatherIcons)
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
    <div
      className="Chart__wrapper-sankey-detail"
      ref={ref}
      style={{ height: "200px" }}
    >
      <svg width={dms.width} height={dms.height} ref={refSvg}></svg>
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

export default SegmentDetailSankey;
