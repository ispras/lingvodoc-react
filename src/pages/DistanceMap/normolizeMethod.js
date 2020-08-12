const normolizeMethod = (distanceList) => {
    let maxDistance = 0;
    distanceList.forEach(element => {
        if (element.distanceDict > maxDistance) {
            maxDistance = element.distanceDict
        }
    });
    const ratio = maxDistance / 255;
    const newDistanceList = distanceList.map(element => {
        let normolizeDistanceList = 255-(element.distanceDict / ratio);

        return {
            ...element,
            normolizeDistanceList
        }
    });

    return newDistanceList

}
export default normolizeMethod