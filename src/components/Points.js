import React from 'react';
import axios from 'axios';

class Points extends React.Component {

  state = {
    data: null,
    gameweek: null,
    toggle: 'PAUSE'
  }

  componentDidMount() {
    this.fetchAndDraw();
  }

  fetchAndDraw = () => {
    let data;
    axios.get('/prem')
    .then(res => {
      data = res.data.slice(1,);
      this.setState({data});
    })
    .then(() => {
      this.renderChart();
    });
  }

  renderChart = () => {
    this.timeouts = [];
    this.state.data.forEach((table, matchday) => {
      this.timeouts.push(setTimeout(() => {
        this.draw(table, matchday);
      }, matchday * 1000));
    });
  }

  draw = (data, week) => {
    this.setState({gameweek: week});
    var width = window.innerWidth - 100;
    var height = window.innerHeight - 140;
    var xMax = 110;
    var yMax = 20;

    const x = d3.scaleLinear()
        .domain([0, 110])
        .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 20])
      .range([0, height]);

    const xAxis = d3.axisBottom(x)
      .ticks(20);

    var canvas = d3.select('#chart')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(5, 0)');

    var tooltip = d3.select('.tooltip');
    if(tooltip.nodes().length === 0) {
      var tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    }

    if(canvas.select('#xAxis').nodes().length === 0) {
      canvas.append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

      canvas.selectAll('.tick line')
        .nodes()
        .map(node => node.setAttribute('y2', -height));
    }

    if(canvas.select('#xAxisLabel').nodes().length === 0) {
      canvas.append('g')
        .append('text')
        .text('Points')
        .attr('id', 'xAxisLabel')
        .attr('x', x(xMax/2))
        .attr('y', height + 50)
        .style("text-anchor", "middle");
    }

    if(canvas.select('#prem').nodes().length === 0) {
      canvas.append('image')
        .attr('xlink:href','https://vignette.wikia.nocookie.net/logopedia/images/6/6c/Premier_League_Lion_Crown_%282016%29.svg/revision/latest?cb=20171215054726')
        .attr('id', 'prem')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('transform', `translate(${-x(xMax/2)}, ${-y(yMax/2)})`)
        .style('opacity', 0.05);
    }

    var matchday = d3.select('.matchday');
    if(matchday.nodes().length === 0) {
      canvas.append('g')
        .append('text')
        .attr('class', 'matchday')
        .attr('x', x(72))
        .attr('y', y(yMax-1))
        .text(() => `Matchday ${week}`)
        .style('font-size', window.innerWidth/15);
    } else {
      canvas.select('text.matchday')
        .text(`Matchday ${week}`);
    }

    // var bars = canvas.selectAll('rect.bar');
    // if(bars.nodes().length === 0) {
    //   bars = canvas.append('g')
    //     .selectAll('rect.bar')
    //     .data(data.table)
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'bar')
    //     .attr('x', x(0))
    //     .attr('y', (d, i) => y(i))
    //     .attr('stroke', '#000')
    //     .attr('fill', '#faa')
    //     .attr('height', 10)
    //     .attr('width', (d) => x(d.points))
    // } else {
    //   canvas.selectAll('rect.bar')
    //     .nodes()
    //     .map((node, i) => {
    //       node.setAttribute('width', x(data.table[i].points))
    //     });
    // }

    var icons = canvas.selectAll('image.crest');
    // Check if there are icons on the chart already
    if(icons.nodes().length === 0) {
      icons = canvas.append('g')
        .selectAll('image.crest')
        .data(data.table)
        .enter()
          .append('image')
          .attr('class', 'crest')
          .attr('xlink:href', d => d.crest)
          .attr('x', (d) => x(d.points) - 12)
          .attr('y', (d, i) => y(i))
          .attr('height', (d) => {
            if(d.team === 'Tottenham Hotspur FC')
              // return window.innerWidth/40 + 10;
              return window.innerHeight/20 + 10;
            else
              // return window.innerWidth/40;
              return window.innerHeight/20;
          })
          // Create event handlers to show the team's tooltip
          .on('mouseover', (d) => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0.9);
            tooltip.html(`
              <div><strong>${d.team}</strong></div>
              <div>Points: ${d.points}</div>
            `)
              .style('left', (d3.event.pageX + 10) + "px")
              .style('top', (d3.event.pageY) + "px");
          })
          .on('mouseout', (d) => {
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });
    } else {
      icons = canvas.selectAll('.crest')
        .nodes()
        .map((node, i) => {
          node.setAttribute('x', x(data.table[i].points) - 12)
          node.setAttribute('y', y(i))
          return node;
        });
      // Update the event handler
      canvas.selectAll('image.crest')
        .data(data.table)
        .enter()
          .on('mouseover', (d) => {
            tooltip.html(`
              <div><strong>${d.team}</strong></div>
              <div>Points: ${d.points}</div>
            `)
              .style('left', (d3.event.pageX + 10) + "px")
              .style('top', (d3.event.pageY) + "px");
          });
    }
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.chartContainer}>
          <svg id='chart'>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="repeat">
                <stop offset="0%" ref='offset1' />
                <stop offset="100%" ref='offset2' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    background: 'white',
  },
  chartContainer: {
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.1)',
    overflow: 'scroll',
    margin: '1em'
  }
}

export default Points;