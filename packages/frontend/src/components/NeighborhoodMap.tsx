'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngExpression, Layer, PathOptions, Feature } from 'leaflet';
import { ethers } from 'ethers';
import NeighborhoodHubFactoryABI from '../lib/NeighborhoodHubFactory.json';
const FACTORY_CONTRACT_ADDRESS = '0xYourFactoryContractAddressHere';

import { mockNeighborhoodData, NeighborhoodFeature } from '../lib/map-data';

type NeighborhoodMapProps = {
  userNeighborhoodId: number | null;
};

const defaultStyle: PathOptions = {
  fillColor: '#3388ff',
  weight: 2,
  opacity: 1,
  color: 'white',
  fillOpacity: 0.5,
};

const highlightedStyle: PathOptions = {
  fillColor: '#ff7800',
  weight: 3,
  opacity: 1,
  color: '#ff7800',
  fillOpacity: 0.7,
};

const getMockMemberCount = async (neighborhoodId: number): Promise<number> => {
  console.log(
    `Fetching mock member count for neighborhood ${neighborhoodId}...`
  );

  return new Promise((resolve) =>
    setTimeout(() => resolve(Math.floor(Math.random() * 250) + 50), 500)
  );
};

const getMemberCount = async (neighborhoodId: number): Promise<number> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask is not installed.');
      return 0;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      FACTORY_CONTRACT_ADDRESS,
      NeighborhoodHubFactoryABI.abi,
      provider
    );

    const count = await contract.getMemberCount(neighborhoodId);
    return Number(count);
  } catch (error) {
    console.error(
      `Failed to fetch member count for neighborhood ${neighborhoodId}:`,
      error
    );
    return 0;
  }
};

export const NeighborhoodMap = ({
  userNeighborhoodId,
}: NeighborhoodMapProps) => {
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});
  const mapCenter: LatLngExpression = [40.75, -73.98];

  useEffect(() => {
    const fetchAllMemberCounts = async () => {
      const counts: Record<number, number> = {};

      const promises = mockNeighborhoodData.features.map(async (feature) => {
        const neighborhoodId = feature.properties.id;

        const count = await getMockMemberCount(neighborhoodId);

        counts[neighborhoodId] = count;
      });

      await Promise.all(promises);
      setMemberCounts(counts);
    };

    fetchAllMemberCounts();
  }, []);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (
      feature.properties &&
      feature.properties.name &&
      feature.properties.id
    ) {
      const neighborhoodId = feature.properties.id;
      const memberCount = memberCounts[neighborhoodId] || 'Loading...';

      const popupContent = `
        <h3>${feature.properties.name}</h3>
        <p>Verified Members: <strong>${memberCount}</strong></p>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const getStyleForFeature = (feature?: Feature): PathOptions => {
    if (feature && feature.properties.id === userNeighborhoodId) {
      return highlightedStyle;
    }
    return defaultStyle;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {mockNeighborhoodData && (
        <GeoJSON
          data={mockNeighborhoodData}
          style={getStyleForFeature}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
};
