// treePlacement.ts
interface TreeCluster {
  alignment: 'flex-start' | 'center' | 'flex-end';
  largeCount: number;
  mediumCount: number;
  smallCount: number;
  largeSize: number;   // icon pixel size for large trees
  mediumSize: number;
  smallSize: number;
}

/**
 * Generate tree cluster layout based on window dimensions.
 * @param width  Window width in pixels
 * @param height Window height in pixels
 * @returns Array of TreeCluster objects defining placement and sizes
 */
export function generateTreeClusters(width: number, height: number): TreeCluster[] {
  // Determine number of clusters based on size (more for very large screens)
  let clusterCount = Math.floor(Math.random() * 5) + 4;  // 4-8 clusters for small screens
  if (width > 1200) clusterCount = Math.floor(Math.random() * 10) + 10;  // 10-19 clusters for wide screens
  if (width > 1600) clusterCount = 5;  // dense forest mode for extremely wide screens

  // Determine scaling for icon sizes (larger for bottom cluster, smaller for top)
  let minScale = 0.5;
  if (clusterCount === 4) minScale = 0.3;
  if (clusterCount >= 5) minScale = 0.2;
  const scaleStep = (1 - minScale) / (clusterCount - 1);

  // Base icon sizes (you can tweak these values for desired absolute sizes)
  const baseLarge = height / 15;   // base large tree size ~1/15 of screen height
  const baseMedium = baseLarge * 0.7;
  const baseSmall = baseLarge * 0.5;

  const clusters: TreeCluster[] = [];
  for (let i = 0; i < clusterCount; i++) {
    // Calculate scale for this cluster (0 = top, clusterCount-1 = bottom)
    const scale = minScale + scaleStep * i;
    const largeSize = Math.round(baseLarge * scale);
    const mediumSize = Math.round(baseMedium * scale);
    const smallSize = Math.round(baseSmall * scale);

    // Determine tree counts for this cluster
    const isDense = clusterCount >= 5;
    const mediumCount = isDense ? 3 : 2;
    const smallCount = isDense ? 3 : 2;
    const largeCount = 1;  // one dominant large tree per cluster

    // Alternate alignment: left, right, center pattern for organic feel
    let alignment: TreeCluster["alignment"];
    const patternIndex = i % Math.floor(Math.random() * 10);
    if (patternIndex === 0) alignment = 'flex-start';      // left
    else if (patternIndex === 1) alignment = 'flex-end';   // right
    else alignment = 'center';                             // center

    clusters.push({
      alignment,
      largeCount,
      mediumCount,
      smallCount,
      largeSize,
      mediumSize,
      smallSize
    });
  }
  return clusters;
}
