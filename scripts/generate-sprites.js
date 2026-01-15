const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const FRAME_SIZE = 32;
const PADDING = 2;
const CELL_SIZE = FRAME_SIZE + PADDING * 2;
const COLS = 4;
const ROWS = 4;
const SHEET_WIDTH = COLS * CELL_SIZE;
const SHEET_HEIGHT = ROWS * CELL_SIZE;

const COLORS = {
  base: '#8B6914',
  highlight: '#A07818',
  shadow: '#6B4E10',
  darkShadow: '#5A4210',
  ear: '#A07818',
  earInner: '#C49020',
  eye: '#1A1A1A',
  nose: '#5A4210',
  snout: '#C49020'
};

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 255 };
}

function setPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function drawCapybaraDown(ctx, offsetX, offsetY, walkFrame = 0) {
  const ox = offsetX;
  const oy = offsetY;

  for (let y = 8; y <= 22; y++) {
    for (let x = 6; x <= 25; x++) {
      const dx = x - 15.5;
      const dy = y - 15;
      const rx = 10;
      const ry = 7;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        if (dy < -3) {
          setPixel(ctx, ox + x, oy + y, COLORS.highlight);
        } else if (dy > 3) {
          setPixel(ctx, ox + x, oy + y, COLORS.shadow);
        } else {
          setPixel(ctx, ox + x, oy + y, COLORS.base);
        }
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    const earX = i < 2 ? 8 + i * 2 : 20 + (i - 2) * 2;
    setPixel(ctx, ox + earX, oy + 6, COLORS.ear);
    setPixel(ctx, ox + earX + 1, oy + 6, COLORS.ear);
    setPixel(ctx, ox + earX, oy + 7, COLORS.ear);
    setPixel(ctx, ox + earX + 1, oy + 7, COLORS.ear);
    if (i === 0 || i === 2) {
      setPixel(ctx, ox + earX + 1, oy + 7, COLORS.earInner);
    }
  }

  setPixel(ctx, ox + 14, oy + 21, COLORS.darkShadow);
  setPixel(ctx, ox + 15, oy + 21, COLORS.darkShadow);
  setPixel(ctx, ox + 16, oy + 21, COLORS.darkShadow);
  setPixel(ctx, ox + 17, oy + 21, COLORS.darkShadow);

  const legPositions = [
    { x: 8, front: true, left: true },
    { x: 12, front: true, left: false },
    { x: 18, front: false, left: true },
    { x: 22, front: false, left: false }
  ];

  legPositions.forEach((leg, idx) => {
    let legOffset = 0;
    if (walkFrame === 1) {
      legOffset = (idx === 0 || idx === 3) ? -1 : 1;
    } else if (walkFrame === 2) {
      legOffset = 0;
    } else if (walkFrame === 3) {
      legOffset = (idx === 1 || idx === 2) ? -1 : 1;
    }

    const baseY = 22 + legOffset;
    for (let ly = 0; ly < 5; ly++) {
      setPixel(ctx, ox + leg.x, oy + baseY + ly, COLORS.shadow);
      setPixel(ctx, ox + leg.x + 1, oy + baseY + ly, COLORS.base);
      setPixel(ctx, ox + leg.x + 2, oy + baseY + ly, COLORS.shadow);
    }
  });
}

function drawCapybaraUp(ctx, offsetX, offsetY, walkFrame = 0) {
  const ox = offsetX;
  const oy = offsetY;

  for (let y = 8; y <= 22; y++) {
    for (let x = 6; x <= 25; x++) {
      const dx = x - 15.5;
      const dy = y - 15;
      const rx = 10;
      const ry = 7;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        if (dy < -3) {
          setPixel(ctx, ox + x, oy + y, COLORS.highlight);
        } else if (dy > 3) {
          setPixel(ctx, ox + x, oy + y, COLORS.shadow);
        } else {
          setPixel(ctx, ox + x, oy + y, COLORS.base);
        }
      }
    }
  }

  for (let i = 0; i < 2; i++) {
    const earX = i === 0 ? 8 : 21;
    setPixel(ctx, ox + earX, oy + 6, COLORS.ear);
    setPixel(ctx, ox + earX + 1, oy + 6, COLORS.ear);
    setPixel(ctx, ox + earX + 2, oy + 6, COLORS.ear);
    setPixel(ctx, ox + earX, oy + 7, COLORS.ear);
    setPixel(ctx, ox + earX + 1, oy + 7, COLORS.earInner);
    setPixel(ctx, ox + earX + 2, oy + 7, COLORS.ear);
  }

  setPixel(ctx, ox + 11, oy + 12, COLORS.eye);
  setPixel(ctx, ox + 12, oy + 12, COLORS.eye);
  setPixel(ctx, ox + 19, oy + 12, COLORS.eye);
  setPixel(ctx, ox + 20, oy + 12, COLORS.eye);

  setPixel(ctx, ox + 14, oy + 16, COLORS.nose);
  setPixel(ctx, ox + 15, oy + 16, COLORS.nose);
  setPixel(ctx, ox + 16, oy + 16, COLORS.nose);
  setPixel(ctx, ox + 17, oy + 16, COLORS.nose);
  setPixel(ctx, ox + 15, oy + 15, COLORS.snout);
  setPixel(ctx, ox + 16, oy + 15, COLORS.snout);

  const legPositions = [
    { x: 8, idx: 0 },
    { x: 12, idx: 1 },
    { x: 18, idx: 2 },
    { x: 22, idx: 3 }
  ];

  legPositions.forEach((leg) => {
    let legOffset = 0;
    if (walkFrame === 1) {
      legOffset = (leg.idx === 0 || leg.idx === 3) ? -1 : 1;
    } else if (walkFrame === 2) {
      legOffset = 0;
    } else if (walkFrame === 3) {
      legOffset = (leg.idx === 1 || leg.idx === 2) ? -1 : 1;
    }

    const baseY = 22 + legOffset;
    for (let ly = 0; ly < 5; ly++) {
      setPixel(ctx, ox + leg.x, oy + baseY + ly, COLORS.shadow);
      setPixel(ctx, ox + leg.x + 1, oy + baseY + ly, COLORS.base);
      setPixel(ctx, ox + leg.x + 2, oy + baseY + ly, COLORS.shadow);
    }
  });
}

function drawCapybaraSide(ctx, offsetX, offsetY, facingLeft, walkFrame = 0) {
  const ox = offsetX;
  const oy = offsetY;

  let bodyDip = walkFrame === 2 ? 1 : 0;

  for (let y = 9; y <= 21; y++) {
    for (let x = 4; x <= 27; x++) {
      const dx = x - 15.5;
      const dy = (y + bodyDip) - 15;
      const rx = 12;
      const ry = 6;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        let color = COLORS.base;
        if (dy < -2) {
          color = COLORS.highlight;
        } else if (dy > 2) {
          color = COLORS.shadow;
        }
        setPixel(ctx, ox + x, oy + y, color);
      }
    }
  }

  const headX = facingLeft ? 3 : 22;
  const headDir = facingLeft ? 1 : -1;

  for (let y = 10; y <= 19; y++) {
    for (let x = 0; x < 8; x++) {
      const px = headX + x * headDir;
      const dx = x - 4;
      const dy = y - 14.5;
      const rx = 5;
      const ry = 5;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        let color = COLORS.base;
        if (dy < -2) color = COLORS.highlight;
        else if (dy > 2) color = COLORS.shadow;
        setPixel(ctx, ox + px, oy + y, color);
      }
    }
  }

  const snoutX = facingLeft ? 2 : 28;
  for (let y = 14; y <= 17; y++) {
    for (let sx = 0; sx < 3; sx++) {
      const px = facingLeft ? snoutX + sx : snoutX - sx;
      setPixel(ctx, ox + px, oy + y, COLORS.snout);
    }
  }
  const noseX = facingLeft ? 1 : 29;
  setPixel(ctx, ox + noseX, oy + 15, COLORS.nose);
  setPixel(ctx, ox + noseX, oy + 16, COLORS.nose);

  const eyeX = facingLeft ? 5 : 26;
  setPixel(ctx, ox + eyeX, oy + 12, COLORS.eye);
  setPixel(ctx, ox + eyeX, oy + 13, COLORS.eye);

  const earBaseX = facingLeft ? 7 : 24;
  setPixel(ctx, ox + earBaseX, oy + 7 + bodyDip, COLORS.ear);
  setPixel(ctx, ox + earBaseX + (facingLeft ? 1 : -1), oy + 7 + bodyDip, COLORS.ear);
  setPixel(ctx, ox + earBaseX, oy + 8 + bodyDip, COLORS.ear);
  setPixel(ctx, ox + earBaseX + (facingLeft ? 1 : -1), oy + 8 + bodyDip, COLORS.earInner);
  setPixel(ctx, ox + earBaseX, oy + 6 + bodyDip, COLORS.ear);

  const tailX = facingLeft ? 26 : 5;
  setPixel(ctx, ox + tailX, oy + 17 + bodyDip, COLORS.shadow);
  setPixel(ctx, ox + tailX + (facingLeft ? 1 : -1), oy + 17 + bodyDip, COLORS.shadow);
  setPixel(ctx, ox + tailX, oy + 18 + bodyDip, COLORS.shadow);

  const frontLegX = facingLeft ? 8 : 21;
  const backLegX = facingLeft ? 20 : 9;

  let frontLegOffset = 0;
  let backLegOffset = 0;

  if (walkFrame === 1) {
    frontLegOffset = -2;
    backLegOffset = 2;
  } else if (walkFrame === 2) {
    frontLegOffset = 0;
    backLegOffset = 0;
  } else if (walkFrame === 3) {
    frontLegOffset = 2;
    backLegOffset = -2;
  }

  const drawLeg = (baseX, yOffset) => {
    const baseY = 20 + bodyDip;
    for (let ly = 0; ly < 6; ly++) {
      const adjustedY = baseY + ly + Math.floor(yOffset / 2);
      if (adjustedY >= 20 && adjustedY <= 27) {
        setPixel(ctx, ox + baseX, oy + adjustedY, COLORS.shadow);
        setPixel(ctx, ox + baseX + 1, oy + adjustedY, COLORS.base);
        setPixel(ctx, ox + baseX + 2, oy + adjustedY, COLORS.shadow);
      }
    }
  };

  drawLeg(backLegX, backLegOffset);
  drawLeg(frontLegX, frontLegOffset);
}

function extrudeFrame(ctx, frameX, frameY) {
  const imageData = ctx.getImageData(frameX, frameY, CELL_SIZE, CELL_SIZE);
  const data = imageData.data;

  const getPixel = (x, y) => {
    const idx = (y * CELL_SIZE + x) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3]
    };
  };

  const setPixelData = (x, y, color) => {
    const idx = (y * CELL_SIZE + x) * 4;
    data[idx] = color.r;
    data[idx + 1] = color.g;
    data[idx + 2] = color.b;
    data[idx + 3] = color.a;
  };

  for (let x = PADDING; x < CELL_SIZE - PADDING; x++) {
    const topColor = getPixel(x, PADDING);
    const bottomColor = getPixel(x, CELL_SIZE - PADDING - 1);
    for (let p = 0; p < PADDING; p++) {
      setPixelData(x, p, topColor);
      setPixelData(x, CELL_SIZE - 1 - p, bottomColor);
    }
  }

  for (let y = PADDING; y < CELL_SIZE - PADDING; y++) {
    const leftColor = getPixel(PADDING, y);
    const rightColor = getPixel(CELL_SIZE - PADDING - 1, y);
    for (let p = 0; p < PADDING; p++) {
      setPixelData(p, y, leftColor);
      setPixelData(CELL_SIZE - 1 - p, y, rightColor);
    }
  }

  const topLeft = getPixel(PADDING, PADDING);
  const topRight = getPixel(CELL_SIZE - PADDING - 1, PADDING);
  const bottomLeft = getPixel(PADDING, CELL_SIZE - PADDING - 1);
  const bottomRight = getPixel(CELL_SIZE - PADDING - 1, CELL_SIZE - PADDING - 1);

  for (let py = 0; py < PADDING; py++) {
    for (let px = 0; px < PADDING; px++) {
      setPixelData(px, py, topLeft);
      setPixelData(CELL_SIZE - 1 - px, py, topRight);
      setPixelData(px, CELL_SIZE - 1 - py, bottomLeft);
      setPixelData(CELL_SIZE - 1 - px, CELL_SIZE - 1 - py, bottomRight);
    }
  }

  ctx.putImageData(imageData, frameX, frameY);
}

function generateSpritesheet() {
  const canvas = createCanvas(SHEET_WIDTH, SHEET_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

  const drawFunctions = {
    down: (ctx, ox, oy, frame) => drawCapybaraDown(ctx, ox, oy, frame),
    up: (ctx, ox, oy, frame) => drawCapybaraUp(ctx, ox, oy, frame),
    left: (ctx, ox, oy, frame) => drawCapybaraSide(ctx, ox, oy, true, frame),
    right: (ctx, ox, oy, frame) => drawCapybaraSide(ctx, ox, oy, false, frame)
  };

  const directions = ['down', 'up', 'left', 'right'];

  directions.forEach((dir, row) => {
    for (let col = 0; col < 4; col++) {
      const frameX = col * CELL_SIZE;
      const frameY = row * CELL_SIZE;

      const walkFrame = col === 0 ? 0 : col;

      drawFunctions[dir](ctx, frameX + PADDING, frameY + PADDING, walkFrame);
    }
  });

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      extrudeFrame(ctx, col * CELL_SIZE, row * CELL_SIZE);
    }
  }

  const outputPath = path.join(__dirname, '../client/public/assets/capybara.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Spritesheet generated: ${outputPath}`);
  console.log(`Dimensions: ${SHEET_WIDTH}x${SHEET_HEIGHT} (${COLS}x${ROWS} cells of ${CELL_SIZE}x${CELL_SIZE})`);
  console.log(`Frame size: ${FRAME_SIZE}x${FRAME_SIZE} with ${PADDING}px padding`);
}

generateSpritesheet();
