import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Point2D, Edge } from '../types';

interface VisualizationProps {
  vertices: Point2D[];
  edges: Edge[];
}

export const Visualization: React.FC<VisualizationProps> = ({ vertices, edges }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || vertices.length === 0) return;

    const width = 350;
    const height = 350;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    svg.selectAll('*').remove(); // Clear previous render

    // Create a data structure for links that includes the coordinates of the source and target points.
    const linkData = edges.map(({ source, target }) => ({
      source: vertices[source],
      target: vertices[target],
    }));

    // Draw the edges (links)
    const link = svg.append('g')
      .selectAll('line')
      .data(linkData)
      .join('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#4a5568')
      .attr('stroke-width', 1.5);

    // Draw the vertices (nodes)
    const node = svg.append('g')
      .selectAll('circle')
      .data(vertices)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('fill', '#4fd1c5');

    node.append('title').text((_, i) => `Vertex ${i}`);
    
  }, [vertices, edges]);

  return <svg ref={svgRef}></svg>;
};
