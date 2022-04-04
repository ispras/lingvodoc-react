import { BSplineShapeGenerator, BubbleSet, PointPath, ShapeSimplifier } from "bubblesets-js";

const getRectangles = (width, height, pointX, pointY) => ({
  width,
  height,
  x: pointX,
  y: pointY
});

const getAreaOutline = (points, itemWidth, itemHeight) => {
  const pad = 5;
  const rectangles = points.map(pointItem => getRectangles(itemWidth, itemHeight, pointItem.x, pointItem.y));
  const bubbles = new BubbleSet();
  const list = bubbles.createOutline(BubbleSet.addPadding(rectangles, pad), []);

  const outline = new PointPath(list).transform([
    new ShapeSimplifier(0.0),
    new BSplineShapeGenerator(),
    new ShapeSimplifier(0.0)
  ]);

  return outline;
};

export default getAreaOutline;
