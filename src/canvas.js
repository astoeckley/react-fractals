import { scaleLinear, interpolateViridis } from 'd3-scale';

const DIRECTION = { CENTER: -1, LEFT: 0, RIGHT: 1 };
const MAX_LEVEL = 11;
const BASE_WIDTH = 80;

const canvas = document.createElement('canvas');
canvas.width = 1280;
canvas.height = 600;
document.getElementById('canvas').appendChild(canvas);
const context = canvas.getContext('2d');

function pythagoras({ x, y, w, level, direction, lean, heightFactor }) {
  if (level > MAX_LEVEL) { return; }
  if (w <= 1) { return; }

  const trigH = heightFactor * w;
  const nextRight = Math.sqrt(trigH ** 2 + (w * (.5 + lean)) ** 2);
  const nextLeft = Math.sqrt(trigH ** 2 + (w * (.5 - lean)) ** 2);

  context.save();
  context.fillStyle = interpolateViridis(level / MAX_LEVEL);

  switch (direction) {
    case DIRECTION.LEFT:
      context.translate(x, y + w);
      context.rotate(-Math.atan(trigH / ((.5 - lean) * w)));
      context.fillRect(0, 0, w, -w);
      context.translate(0, -w);
      break;
    case DIRECTION.RIGHT:
      context.translate(x + w, y + w);
      context.rotate(Math.atan(trigH / ((.5 + lean) * w)));
      context.fillRect(0, 0, -w, -w);
      context.translate(-w, -w);
      break;
    default:
      context.translate(x - w / 2, y);
      context.fillRect(0, 0, w, w);
  }

  pythagoras({
    direction: DIRECTION.LEFT,
    x: 0,
    y: -nextLeft,
    w: nextLeft,
    level: level + 1,
    heightFactor,
    lean
  });
  pythagoras({
    direction: DIRECTION.RIGHT,
    x: w - nextRight,
    y: -nextRight,
    w: nextRight,
    level: level + 1,
    heightFactor,
    lean
  });
  context.restore();
}

function render({ heightFactor, lean }) {
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  pythagoras({
    x: canvas.width / 2,
    y: canvas.height - BASE_WIDTH,
    w: BASE_WIDTH,
    level: 0,
    direction: DIRECTION.CENTER,
    lean,
    heightFactor,
  });
}

canvas.addEventListener('mousemove', event => {
  const { offsetX: x, offsetY: y } = event;
  const scaleFactor = scaleLinear().domain([canvas.height, 0]).range([0, .8]);
  const scaleLean = scaleLinear().domain([0, canvas.width / 2, canvas.width]).range([.5, 0, -.5]);

  render({
    heightFactor: scaleFactor(y),
    lean: scaleLean(x)
  });
});

// initial render
render({
  heightFactor: 0.4,
  lean: 0,
});