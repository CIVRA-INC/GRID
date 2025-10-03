export interface NeighborhoodFeature extends GeoJSON.Feature {
  properties: {
    name: string;
    id: number;
  };
}

export interface NeighborhoodCollection extends GeoJSON.FeatureCollection {
  features: NeighborhoodFeature[];
}

export const mockNeighborhoodData: NeighborhoodCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Sunset Valley', id: 101 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-74.0, 40.7],
            [-74.0, 40.75],
            [-73.95, 40.75],
            [-73.95, 40.7],
            [-74.0, 40.7],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Maple Creek', id: 102 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.95, 40.75],
            [-73.95, 40.8],
            [-73.9, 40.8],
            [-73.9, 40.75],
            [-73.95, 40.75],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Oakwood Heights', id: 103 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-74.05, 40.7],
            [-74.05, 40.75],
            [-74.0, 40.75],
            [-74.0, 40.7],
            [-74.05, 40.7],
          ],
        ],
      },
    },
  ],
};
