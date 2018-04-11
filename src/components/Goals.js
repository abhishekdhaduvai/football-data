import React from 'react';
import axios from 'axios';

class Goals extends React.Component {

  componentDidMount() {
    this.fetchAndDraw();
  }

  fetchAndDraw = () => {
    let data;
    axios.get('/prem/goals')
    .then(res => {
      data = res.data.slice(1,);
    })
    .then(() => {
      data.forEach((table, matchday) => {
        this.renderChart(matchday, table)
      })
    });
  }

  renderChart = (matchday, table) => {
    setTimeout(() => {
      this.draw(table, matchday);
    }, matchday * 1500);
  }

  draw = (data, week) => {

    var width = window.innerWidth - 100;
    var height = window.innerHeight - 200;
    var xMax = 120;
    var yMax = 80;

    const x = d3.scaleLinear()
        .domain([0, 120])
        .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 80])
      .range([0, height]);

    const xAxis = d3.axisBottom(x)
      .ticks(20);

    const yAxis = d3.axisLeft(y)
      .ticks(10);

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

    if(canvas.select('#yAxis').nodes().length === 0) {
      canvas.append('g')
        .attr('id', 'yAxis')
        .call(yAxis);
    }

    if(canvas.select('#xAxisLabel').nodes().length === 0) {
      canvas.append('g')
        .append('text')
        .text('Goals Scored')
        .attr('id', 'xAxisLabel')
        .attr('x', x(xMax/2))
        .attr('y', height + 50)
        .style("text-anchor", "middle")
    }

    if(canvas.select('#yAxisLabel').nodes().length === 0) {
      canvas.append('g')
        .append('text')
        .text('Goals Conceded')
        .attr('id', 'yAxisLabel')
        .attr('x', x(25))
        .attr('y', 45)
        .style('text-anchor', 'middle')
    }

    if(canvas.select('#prem').nodes().length === 0) {
      canvas.append('image')
        .attr('xlink:href','https://vignette.wikia.nocookie.net/logopedia/images/6/6c/Premier_League_Lion_Crown_%282016%29.svg/revision/latest?cb=20171215054726')
        .attr('id', 'prem')
        .attr('width', '30%')
        .attr('x', '35%')
        .attr('y', '1%')
        .style('opacity', 0.05);
    }

    var matchday = d3.select('.matchday');
    if(matchday.nodes().length === 0) {
      canvas.append('g')
        .append('text')
        .attr('class', 'matchday')
        .attr('id', 'quad')
        .attr('x', '60%')
        .attr('y', '85%')
        .text(() => `Matchday ${week}`);
    } else {
      canvas.select('text.matchday')
        .text(`Matchday ${week}`);
    }

    var avgScoredLine = canvas.selectAll('line#avgScored');
    if(avgScoredLine.nodes().length === 0) {
      avgScoredLine = canvas.append('line')
        .attr('id', 'avgScored')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('x1', x(0))
        .attr('x2', x(0))
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
    } else {
      avgScoredLine.nodes()
        .map((node, i ) => {
          node.setAttribute('x1', x(data.avgGoalsScored))
          node.setAttribute('x2', x(data.avgGoalsScored))
          return node;
        });
    }

    var avgScoredLabel = canvas.selectAll('#avgScoredLabel')
    if(avgScoredLabel.nodes().length === 0) {
      avgScoredLabel = canvas.append('g')
        .append('text')
        .attr('id', 'avgScoredLabel')
        .text('Average No. of Goals scored')
        .attr('x', x(1))
        .attr('y', y(yMax - 1))
    } else {
      avgScoredLabel.nodes()
        .map((node, i) => node.setAttribute('x', x(data.avgGoalsScored+1)))
    }

    var avgConcededLine = canvas.selectAll('line#avgConceded');
    if(avgConcededLine.nodes().length === 0) {
      avgConcededLine = canvas.append('line')
        .attr('id', 'avgConceded')
        .attr('y1', y(0))
        .attr('y2', y(0))
        .attr('x1', 0)
        .attr('x2', x(width))
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
    } else {
      avgConcededLine.nodes()
        .map((node, i ) => {
          node.setAttribute('y1', y(data.avgGoalsConceded))
          node.setAttribute('y2', y(data.avgGoalsConceded))
          return node;
        });
    }

    var avgConcededLabel = canvas.selectAll('#avgConcededLabel')
    if(avgConcededLabel.nodes().length === 0) {
      avgConcededLabel = canvas.append('g')
        .append('text')
        .attr('id', 'avgConcededLabel')
        .text('Average No. of Goals conceded')
        .attr('x', x(1))
        .attr('y', y(-1))
    } else {
      avgConcededLabel.nodes()
        .map((node, i) => node.setAttribute('y', y(data.avgGoalsConceded-1)))
    }

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
          .attr('x', (d) => x(d.goalsScored) - 12)
          .attr('y', (d) => y(d.goalsConceded))
          .attr('height', (d) => {
            if(d.team === 'Tottenham Hotspur FC')
              return 50;
            else
              return 40;
          })
          // Create event handlers to show the team's tooltip
          .on('mouseover', (d) => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0.9);
            tooltip.html(`
              <div>${d.team}</div>
              <div>Scored ${d.goalsScored}</div>
              <div>Conceded ${d.goalsConceded}</div>
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
          node.setAttribute('x', x(data.table[i].goalsScored) - 12)
          node.setAttribute('y', y(data.table[i].goalsConceded))
          return node;
        });
      // Update the event handler
      canvas.selectAll('image.crest')
        .data(data.table)
        .enter()
          .on('mouseover', (d) => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0.9);
            tooltip.html(`
              <div>${d.team}</div>
              <div>Scored ${d.goalsScored}</div>
              <div>Conceded ${d.goalsConceded}</div>
            `)
              .style('left', (d3.event.pageX + 10) + "px")
              .style('top', (d3.event.pageY) + "px");
          })
          .on('mouseout', (d) => {
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
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

export default Goals;