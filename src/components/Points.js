import React from 'react';
import axios from 'axios';

class Points extends React.Component {
  componentDidMount() {
    this.refs.offset1.setAttribute('style', 'stop-color:#fff;stop-opacity:0.5');
    this.refs.offset2.setAttribute('style', 'stop-color:#faa;stop-opacity:1');
  }

  render(){
    var i = 1;
    function draw(data) {
      const x = d3.scaleLinear()
        .domain([0, 110])
        .range([0, window.innerWidth - 100]);

      const y = d3.scaleLinear()
        .domain([0,20])
        .range([0,550]);

      const xAxis = d3.axisBottom(x)
        .ticks(20);

      var canvas = d3.select('#chart')
        .attr('width', window.innerWidth - 100)
        .attr('height', 600);

      if(canvas.select('#prem').nodes().length === 0) {
        canvas.append('image')
          .attr('xlink:href','https://vignette.wikia.nocookie.net/logopedia/images/6/6c/Premier_League_Lion_Crown_%282016%29.svg/revision/latest?cb=20171215054726')
          .attr('id', 'prem')
          .attr('width', '30%')
          .attr('x', '35%')
          .attr('y', y(1))
          .style('opacity', 0.1);
      }

      if(canvas.select('#xAxis').nodes().length === 0) {
        canvas.append('g')
          .attr('id', 'xAxis')
          .attr('transform', 'translate(0, 550)')
          .call(xAxis);

        canvas.selectAll('.tick line')
          .nodes()
          .map(node => node.setAttribute('y2', -550));
      }

      var tooltip = d3.select('.tooltip');
      if(tooltip.nodes().length === 0) {
        var tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
      }

      var matchday = d3.select('.matchday');
      if(matchday.nodes().length === 0) {
        canvas.append('g')
          .append('text')
          .attr('class', 'matchday')
          .attr('x', x(85))
          .attr('y', y(19))
          .text(() => `Matchday ${i}`);
          i++;
      } else {
        canvas.select('text.matchday')
          .text(`Matchday ${i}`);
          i++;
      }

      var bars = canvas.selectAll('rect');
      if(bars.nodes().length === 0) {
        bars = canvas.append('g')
          .selectAll('rect')
          .data(data)
          .enter()
            .append('rect')
            .attr('width', (d) => x(d.points))
            .attr('height', 20)
            .attr('fill', 'url(#grad1)')
            .attr('y', (d, i) => y(i));
      } else {
        bars = canvas.selectAll('rect')
          .nodes()
          .map((node, i) => node.setAttribute("width", x(data[i].points)))
      }

      var icons = canvas.selectAll('.crest');
      /*
       * If the team crest does not exist already,
       * append a new 'image' to draw it.
       */
      if(icons.nodes().length === 0) {
        icons = canvas.append('g')
          .selectAll('.crest')
          .data(data)
          .enter()
            .append('image')
            .attr('class', 'crest')
            .attr('xlink:href', d => d.crest)
            .attr('width', (d) => {
              if(d.team === 'Liverpool FC' ||
                d.team === 'Crystal Palace FC')
                return 25;
              else if(d.team === 'Huddersfield Town' ||
                      d.team === 'West Bromwich Albion FC' ||
                      d.team === 'Tottenham Hotspur FC')
                return 23;
              else
                return 28;
            })
            .attr('x', (d) => x(d.points) - 12)
            .attr('y', (d, i) => {
              if(d.team === 'Huddersfield Town' ||
                d.team === 'Liverpool FC' ||
                d.team === 'Crystal Palace FC')
                return y(i) - 13;
              else
                return y(i) - 5;
            })
            // Create event handlers to show the team's tooltip
            .on('mouseover', (d) => {
              tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
              tooltip.html(`${d.team} ${d.points} Pts`)
                .style('left', (d3.event.pageX + 10) + "px")
                .style('top', (d3.event.pageY) + "px");
            })
            .on('mouseout', (d) => {
              tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            });
      } else {
        /*
         * If the team crest exists already,
         * Update its position.
         */
        icons = canvas.selectAll('.crest')
          .nodes()
          .map((node, i) => node.setAttribute('x', x(data[i].points) - 12));

        // Update the event handler
        canvas.selectAll('.crest')
          .data(data)
          .enter()
            .on('mouseover', (d) => {
              tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
              tooltip.html(`${d.team} ${d.points} Pts`)
                .style('left', (d3.event.pageX + 10) + "px")
                .style('top', (d3.event.pageY) + "px");
            })
            .on('mouseout', (d) => {
              tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            })
          .exit();
      }

    } // Draw function ends

    var data;
    axios.get('/prem')
    .then(res => {
      data = res.data.slice(1,);
      console.log('data ', data);
    })
    .then(() => {
      data.forEach((table, matchday) => {
        renderChart(matchday, table)
      })
    });

    function renderChart(matchday, table) {
      setTimeout(() => {
        draw(table);
      }, matchday * 1500);
    }

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