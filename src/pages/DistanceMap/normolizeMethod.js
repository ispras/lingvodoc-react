const normolizeMethod = (distanceList, number) => {
  let maxDistance = 0;
  distanceList.forEach(element => {
    if (element.distanceDict > maxDistance) {
      maxDistance = element.distanceDict;
    }
  });
  const ratio = maxDistance / number;
  const newDistanceList = distanceList.map(element => {
    const normolizeDistanceNumber = number - element.distanceDict / ratio;

    return {
      ...element,
      normolizeDistanceNumber
    };
  });

  return newDistanceList;
};
export default normolizeMethod;
