// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


interface ISoulboundNeighborhoodBadge {
    function safeMint(address to, uint256 _neighborhoodId) external;
}
