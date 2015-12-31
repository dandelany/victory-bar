import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3Scale from "d3-scale";
import {Chart, Collection, Data, PropTypes, Scale, Style} from "victory-util";
import { VictoryAnimation } from "victory-animation";
import Bar from "./bar";
import BarLabel from "./bar-label";


const defaultStyles = {
  data: {
    width: 8,
    padding: 6,
    stroke: "transparent",
    strokeWidth: 0,
    fill: "#756f6a",
    opacity: 1
  },
  labels: {
    fontSize: 12,
    padding: 4
  }
};

const defaultData = [
  {x: 1, y: 1},
  {x: 2, y: 2},
  {x: 3, y: 3},
  {x: 4, y: 4}
];

@Radium
export default class VictoryBar extends React.Component {
  static role = "bar";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the bar chart will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: React.PropTypes.object,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points, or an array of arrays of data points for multiple datasets.
     * Each data point should be an object with x and y properties.
     * @examples [{x: 1, y:2}, {x: 2, y: 3}],
     * [[{x: "a", y: 1}, {x: "b", y: 2}], [{x: "a", y: 2}, {x: "b", y: 3}]]
     */
    data: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          x: React.PropTypes.any,
          y: React.PropTypes.any
        })
      ),
      React.PropTypes.arrayOf(
        React.PropTypes.arrayOf(
          React.PropTypes.shape({
            x: React.PropTypes.any,
            y: React.PropTypes.any
          })
        )
      )
    ]),
    /**
     * The dataAttributes prop describes how a data set should be styled.
     * This prop can be given as an object, or an array of objects. If this prop is
     * given as an array of objects, the properties of each object in the array will
     * be applied to the data points in the corresponding array of the data prop.
     * @examples {fill: "blue", opacity: 0.6}, [{fill: "red"}, {fill: "orange"}]
     */
    dataAttributes: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.arrayOf(PropTypes.object)
    ]),
    /**
     * The categories prop specifies the categories for a bar chart. This prop should
     * be given as an array of string values, numeric values, or arrays. When this prop is
     * given as an array of arrays, the minimum and maximum values of the arrays define range bands,
     * allowing numeric data to be grouped into segments.
     * @examples ["dogs", "cats", "mice"], [[0, 5], [5, 10], [10, 15]]
     */
    categories: PropTypes.homogeneousArray,
    /**
     * The colorScale prop is an optional prop that defines the color scale the chart's bars
     * will be created on. This prop should be given as an array of CSS colors, or as a string
     * corresponding to one of the built in color scales. VictoryBar will automatically assign
     * values from this color scale to the bars unless colors are explicitly provided in the
     * `dataAttributes` prop.
     */
    colorScale: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(PropTypes.string),
      React.PropTypes.oneOf([
        "greyscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    /**
     * The domain prop describes the range of values your bar chart will cover. This prop can be
     * given as a array of the minimum and maximum expected values for your bar chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @examples [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: React.PropTypes.oneOfType([
      PropTypes.domain,
      React.PropTypes.shape({
        x: PropTypes.domain,
        y: PropTypes.domain
      })
    ]),
    /**
     * The domainPadding prop specifies a number of pixels of padding to add to the
     * beginning and end of a domain. This prop is useful for preventing 0 pixel bars,
     * and taking bar width into account.
     */
    domainPadding: React.PropTypes.oneOfType([
      React.PropTypes.shape({
        x: PropTypes.nonNegative,
        y: PropTypes.nonNegative
      }),
      PropTypes.nonNegative
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: PropTypes.nonNegative,
    /**
     * The horizontal prop determines whether the bars will be laid vertically or
     * horizontally. The bars will be vertical if this prop is false or unspecified,
     * or horizontal if the prop is set to true.
     */
    horizontal: React.PropTypes.bool,
    /**
     * The labels prop defines labels that will appear above each bar or
     * group of bars in your bar chart. This prop should be given as an array of values.
     * The number of elements in the label array should be equal to number of elements in
     * the categories array, or if categories is not defined, to the number of unique
     * x values in your data. Use this prop to add labels to individual bars, stacked bars,
     * and groups of bars.
     * @examples: ["spring", "summer", "fall", "winter"]
     */
    labels: React.PropTypes.array,
    /**
     * The labelComponents prop takes in an array of entire, HTML-complete label components
     * which will be used to create labels for individual bars, stacked bars, or groups of
     * bars as appropriate.
     */
    labelComponents: React.PropTypes.array,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.shape({
        top: React.PropTypes.number,
        bottom: React.PropTypes.number,
        left: React.PropTypes.number,
        right: React.PropTypes.number
      })
    ]),
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @examples d3Scale.time(), {x: d3Scale.linear(), y: d3Scale.log()}
     */
    scale: React.PropTypes.oneOfType([
      PropTypes.scale,
      React.PropTypes.shape({
        x: PropTypes.scale,
        y: PropTypes.scale
      })
    ]),
    /**
     * The stacked prop determines whether the chart should consist of stacked bars.
     * When this prop is set to false, grouped bars will be rendered instead.
     */
    stacked: React.PropTypes.bool,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryBar with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryBar relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @examples {data: {fill: "red", width: 8}, labels: {fontSize: 12}}
     */
    style: React.PropTypes.shape({
      parent: React.PropTypes.object,
      data: React.PropTypes.object,
      labels: React.PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: PropTypes.nonNegative
  };

  static defaultProps = {
    data: defaultData,
    domainPadding: 1,
    colorScale: "greyscale",
    height: 300,
    padding: 50,
    scale: d3Scale.linear(),
    stacked: false,
    standalone: true,
    width: 450
  };

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.padding = Chart.getPadding(props);
    this.stringMap = {
      x: Data.createStringMap(props, "x"),
      y: Data.createStringMap(props, "y")
    };
    this.datasets = Data.consolidateData(props);
    this.range = {
      x: Chart.getRange(props, "x"),
      y: Chart.getRange(props, "y")
    };
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
  }

  getStyles(props) {
    const style = props.style || defaultStyles;
    const {data, labels, parent} = style;
    return {
      parent: _.merge({height: props.height, width: props.width}, parent),
      data: _.merge({}, defaultStyles.data, data),
      labels: _.merge({}, defaultStyles.labels, labels)
    };
  }

  getScale(props, axis) {
    const scale = Scale.getBaseScale(props, axis);
    scale.range(this.range[axis]);
    scale.domain(this.domain[axis]);
    return scale;
  }

  getDomain(props, axis) {
    let domain;
    const categoryDomain = this.getDomainFromCategories(props, axis);
    if (props.domain && props.domain[axis]) {
      domain = props.domain[axis];
    } else if (props.domain && _.isArray(props.domain)) {
      domain = props.domain;
    } else if (categoryDomain) {
      domain = categoryDomain;
    } else {
      domain = Chart.getDomainFromGroupedData(props, axis);
    }
    return Chart.padDomain(domain, axis);
  }

  getDomainFromCategories(props, axis) {
    if (axis !== "x" || !props.categories || Collection.containsStrings(props.categories)) {
      return undefined;
    }
    const categories = _.flatten(props.categories);
    return [Math.min(...categories), Math.max(...categories)];
  }

  pixelsToValue(pixels, axis) {
    const domainExtent = Math.max(...this.domain[axis]) - Math.min(...this.domain[axis]);
    const rangeExtent = Math.max(...this.range[axis]) - Math.min(...this.range[axis]);
    return domainExtent / rangeExtent * pixels;
  }

  adjustX(data, index, options) {
    const x = data.x;
    const stacked = options && options.stacked;
    const center = this.datasets.length % 2 === 0 ?
      this.datasets.length / 2 : (this.datasets.length - 1) / 2;
    const centerOffset = index - center;
    const totalWidth = this.pixelsToValue(this.style.data.padding, "x") +
      this.pixelsToValue(this.style.data.width, "x");
    if (data.category !== undefined) {
      // if this is category data, shift x to the center of its category
      const rangeBand = this.props.categories[data.category];
      const bandCenter = (Math.max(...rangeBand) + Math.min(...rangeBand)) / 2;
      return stacked ? bandCenter : bandCenter + (centerOffset * totalWidth);
    }
    return stacked ? x : x + (centerOffset * totalWidth);
  }

  getYOffset(data, index, barIndex) {
    const minY = Math.min(...this.domain.y);
    if (index === 0) {
      return Math.max(minY, 0);
    }
    const y = data.y;
    const previousDataSets = _.take(this.datasets, index);
    const previousBars = _.map(previousDataSets, (dataset) => {
      return _.pluck(dataset.data, "y");
    });
    return _.reduce(previousBars, (memo, bar) => {
      const barValue = bar[barIndex];
      const sameSign = (y < 0 && barValue < 0) || (y >= 0 && barValue >= 0);
      return sameSign ? memo + barValue : memo;
    }, 0);
  }

  getLabelIndex(data) {
    if (data.category !== undefined) {
      return data.category;
    } else if (this.stringMap.x) {
      return (data.x - 1);
    } else {
      const allX = this.datasets.map((dataset) => {
        return dataset.data.map((datum) => datum.x);
      });
      const uniqueX = _.uniq(_.flatten(allX));
      return (_.findIndex(_.sortBy(uniqueX), (n) => n === data.x));
    }
  }

  getBarPosition(data, index, barIndex) {
    const stacked = this.props.stacked;
    const yOffset = this.getYOffset(data, index, barIndex);
    const y0 = stacked ? yOffset : Math.max(Math.min(...this.domain.y), 0);
    const y1 = stacked ? yOffset + data.y : data.y;
    const x = this.adjustX(data, index, {stacked});
    return {
      independent: this.scale.x.call(this, x),
      dependent0: this.scale.y.call(this, y0),
      dependent1: this.scale.y.call(this, y1)
    };
  }

  renderBars(dataset, index) {
    const isCenter = Math.floor(this.datasets.length / 2) === index;
    const isLast = this.datasets.length === index + 1;
    const stacked = this.props.stacked;
    const plotGroupLabel = (stacked && isLast) || (!stacked && isCenter);
    return _.map(dataset.data, (data, barIndex) => {
      const position = this.getBarPosition(data, index, barIndex);
      const styleData = _.omit(data, [
        "xName", "yName", "x", "y", "label", "category"
      ]);
      const style = _.merge({}, this.style.data, _.omit(dataset.attrs, "name"), styleData);
      const barComponent = (
        <Bar key={`series-${index}-bar-${barIndex}`}
          horizontal={this.props.horizontal}
          style={style}
          position={position}
          data={data}
        />
      );
      const plotLabel = (plotGroupLabel && (this.props.labels || this.props.labelComponents));
      if (plotLabel) {
        const labelIndex = this.getLabelIndex(data);
        const labelText = this.props.labels ?
          this.props.labels[labelIndex] || this.props.labels[0] : "";
        const labelComponent = this.props.labelComponents ?
          this.props.labelComponents[index] || this.props.labelComponents[0] : undefined;
        return (
          <g key={`series-${index}-bar-${barIndex}`}>
            {barComponent}
            <BarLabel key={`label-series-${index}-bar-${barIndex}`}
              horizontal={this.props.horizontal}
              style={this.style.labels}
              position={position}
              data={data}
              labelText={labelText}
              labelComponent={labelComponent}
            />
          </g>
        );
      }
      return barComponent;
    });
  }

  renderData() {
    return _.map(this.datasets, (dataset, index) => {
      return this.renderBars(dataset, index);
    });
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryBar` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, [
        "data", "dataAttributes", "categories", "colorScale", "domain", "height",
        "padding", "style", "width"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryBar {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    const style = this.style.parent;
    const group = <g style={style}>{this.renderData()}</g>;
    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
