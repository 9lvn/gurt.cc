// ===== Utility RNG =====
class RNG {
  constructor(seed = Math.floor(Math.random()*2**31)) { this.s = seed >>> 0; }
  next() { let x = this.s >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.s = x >>> 0; return this.s; }
  float() { return this.next() / 2**32; }
  int(min, max) { return Math.floor(this.float() * (max - min + 1)) + min; }
  pick(arr) { return arr[this.int(0, arr.length-1)]; }
  chance(p) { return this.float() < p; }
}

// ===== Constants =====
const TILE = 1;
const LANES_VISIBLE = 16;
const WORLD_WIDTH = 11;

const LaneType = { GRASS: 'grass', ROAD: 'road', WATER: 'water', RAIL: 'rail' };

const COLORS = {
  bg: '#172031',
  grass1: '#2c7a4b', grass2: '#2a6e45',
  road: '#24262c', roadEdge: '#2e3139', laneMark: '#b9c2d9',
  water1: '#1e4d7a', water2: '#1a436b',
  rail: '#3a332d', track: '#6b5847',
  tree: '#1d4b2a', trunk: '#70431f',
  car1: '#ff6b6b', car2: '#ffd166', car3: '#4dabf7',
  log: '#8b5a2b',
  player: '#e9ff6b', playerShadow: 'rgba(0,0,0,0.35)'
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const uiScore = document.getElementById('score');
const uiBest = document.getElementById('best');
const uiMsg = document.getElementById('message');
const uiMsgTitle = document.getElementById('msg-title');
const uiMsgSub = document.getElementById('msg-sub');

let bestScore = Number(localStorage.getItem('crossy-best')||0);
uiBest.textContent = `Best: ${bestScore}`;

const state = { seed: Math.floor(Math.random()*2**31), rng: null, lanes: [], offsetY: 0, player: { x: Math.floor(WORLD_WIDTH/2), y: 1, alive: false, onLog: null }, score: 0, tick: 0, paused: false, started: false };

function reset() {
  state.rng = new RNG(state.seed);
  state.lanes = [];
  state.offsetY = 0;
  state.player = { x: Math.floor(WORLD_WIDTH/2), y: 1, alive: true, onLog: null };
  state.score = 0;
  state.tick = 0;
  state.started = true;
  state.paused = false;
  for (let i=0;i<LANES_VISIBLE+8;i++) addLane();
  showMessage('Go!', 'Hop forward. Avoid cars. Use logs over water.');
  setTimeout(hideMessage, 900);
}

function addLane() {
  const i = state.lanes.length;
  let type;
  if (i < 2) type = LaneType.GRASS;
  else {
    const r = state.rng.float();
    if (r < 0.45) type = LaneType.ROAD;
    else if (r < 0.70) type = LaneType.GRASS;
    else if (r < 0.92) type = LaneType.WATER;
    else type = LaneType.RAIL;
  }
  const lane = { type, items: [], dir: state.rng.pick([-1,1]), speed: 0 };
  if (type === LaneType.ROAD) {
    const carCount = state.rng.int(1, 3);
    for (let c=0;c<carCount;c++) lane.items.push({ kind:'car', x: state.rng.int(0, WORLD_WIDTH-1), w: state.rng.int(1,2) });
    lane.speed = 0.006 + state.rng.float()*0.012;  // slowed
  } else if (type === LaneType.WATER) {
    const logCount = state.rng.int(2, 4);
    for (let l=0;l<logCount;l++) lane.items.push({ kind:'log', x: state.rng.int(0, WORLD_WIDTH-1), w: state.rng.int(2,3) });
    lane.speed = 0.004 + state.rng.float()*0.008;  // slowed
  } else if (type === LaneType.RAIL) {
    lane.train = { x: state.rng.int(-20, -5), length: state.rng.int(6, 12) };
    lane.speed = 0.012 + state.rng.float()*0.015;  // slowed
  } else if (type === LaneType.GRASS) {
    for (let x=0;x<WORLD_WIDTH;x++) if (state.rng.chance(0.18) && !(x===state.player.x && i<3)) lane.items.push({kind:'tree', x});
  }
  state.lanes.push(lane);
}

// ===== Input =====
const input = { up:false, down:false, left:false, right:false };
document.addEventListener('keydown', e=>{
  if (['ArrowUp','w','W'].includes(e.key)) input.up = true;
  if (['ArrowDown','s','S'].includes(e.key)) input.down = true;
  if (['ArrowLeft','a','A'].includes(e.key)) input.left = true;
  if (['ArrowRight','d','D'].includes(e.key)) input.right = true;
  if (e.code==='Space') {
    if (!state.started) reset();
    else if (!state.player.alive) reset();
    else state.paused = !state.paused;
  }
});
document.addEventListener('keyup', e=>{
  if (['ArrowUp','w','W'].includes(e.key)) input.up = false;
  if (['ArrowDown','s','S'].includes(e.key)) input.down = false;
  if (['ArrowLeft','a','A'].includes(e.key)) input.left = false;
  if (['ArrowRight','d','D'].includes(e.key)) input.right = false;
});

// On-screen dpad
document.querySelectorAll('#dpad button[data-dir]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const dir = btn.dataset.dir;
    if (dir==='up') input.up=true;
    if (dir==='down') input.down=true;
    if (dir==='left') input.left=true;
    if (dir==='right') input.right=true;
    setTimeout(()=>{ input.up=input.down=input.left=input.right=false; }, 100);
  });
});

// ===== Game Loop =====
function update(dt) {
  if (!state.player.alive || state.paused) return;
  state.tick += dt;

  // move hazards/logs
  for (let i=0;i<state.lanes.length;i++) {
    const lane = state.lanes[i];
    if (lane.type===LaneType.ROAD||lane.type===LaneType.WATER) {
      for (const item of lane.items) {
        item.x += lane.dir * lane.speed * dt * 60;
        if (item.x < -item.w-2) item.x = WORLD_WIDTH+2;
        if (item.x > WORLD_WIDTH+2) item.x = -item.w-2;
      }
    } else if (lane.type===LaneType.RAIL) {
      lane.train.x += lane.dir * lane.speed * dt * 60;
      if (lane.dir>0 && lane.train.x > WORLD_WIDTH+5) lane.train.x = -20;
      if (lane.dir<0 && lane.train.x < -20) lane.train.x = WORLD_WIDTH+5;
    }
  }

  // handle input
  if (input.up) { state.player.y++; input.up=false; state.score++; if (state.score>bestScore) {bestScore=state.score; localStorage.setItem('crossy-best',bestScore);} }
  if (input.down) { if (state.player.y>1) state.player.y--; input.down=false; }
  if (input.left) { if (state.player.x>0) state.player.x--; input.left=false; }
  if (input.right) { if (state.player.x<WORLD_WIDTH-1) state.player.x++; input.right=false; }

  // extend lanes
  while (state.player.y+LANES_VISIBLE>=state.lanes.length) addLane();

  // collisions
  const lane = state.lanes[state.player.y];
  if (lane.type===LaneType.ROAD) {
    for (const car of lane.items) {
      if (state.player.x>=Math.floor(car.x) && state.player.x<Math.floor(car.x+car.w)) {
        die('Hit by car!');
      }
    }
  } else if (lane.type===LaneType.WATER) {
    let onLog=false;
    for (const log of lane.items) {
      if (state.player.x>=Math.floor(log.x) && state.player.x<Math.floor(log.x+log.w)) {
        onLog=true;
        state.player.x += lane.dir * lane.speed * dt * 60;
      }
    }
    if (!onLog) die('Drowned!');
  } else if (lane.type===LaneType.RAIL) {
    const t = lane.train;
    if (state.player.x>=Math.floor(t.x) && state.player.x<Math.floor(t.x+t.length)) {
      die('Hit by train!');
    }
  } else if (lane.type===LaneType.GRASS) {
    for (const tree of lane.items) {
      if (tree.x===state.player.x) die('Smashed into tree!');
    }
  }

  state.offsetY = state.player.y-2;
}

function die(reason) {
  state.player.alive=false;
  showMessage('Game Over', `${reason} — Press Space/Tap to restart`);
}

// ===== Rendering =====
function render() {
  ctx.fillStyle=COLORS.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  const laneHeight = canvas.height / LANES_VISIBLE;
  const laneWidth = canvas.width / WORLD_WIDTH;

  for (let i=0;i<LANES_VISIBLE;i++) {
    const laneIndex=i+state.offsetY;
    const lane=state.lanes[laneIndex];
    if (!lane) continue;
    const y = canvas.height - (i+1)*laneHeight;

    if (lane.type===LaneType.GRASS) {
      ctx.fillStyle = (laneIndex%2?COLORS.grass1:COLORS.grass2);
      ctx.fillRect(0,y,canvas.width,laneHeight);
      ctx.fillStyle=COLORS.tree;
      for (const t of lane.items) {
        ctx.fillRect(t.x*laneWidth+laneWidth*0.2, y+laneHeight*0.2, laneWidth*0.6, laneHeight*0.6);
      }
    } else if (lane.type===LaneType.ROAD) {
      ctx.fillStyle=COLORS.road;
      ctx.fillRect(0,y,canvas.width,laneHeight);
      ctx.strokeStyle=COLORS.laneMark;
      ctx.lineWidth=2;
      ctx.setLineDash([10,10]);
      ctx.beginPath();
      ctx.moveTo(0,y+laneHeight/2); ctx.lineTo(canvas.width,y+laneHeight/2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const car of lane.items) {
        ctx.fillStyle=state.rng.pick([COLORS.car1,COLORS.car2,COLORS.car3]);
        ctx.fillRect(car.x*laneWidth, y, car.w*laneWidth, laneHeight);
      }
    } else if (lane.type===LaneType.WATER) {
      ctx.fillStyle=(laneIndex%2?COLORS.water1:COLORS.water2);
      ctx.fillRect(0,y,canvas.width,laneHeight);
      ctx.fillStyle=COLORS.log;
      for (const log of lane.items) {
        ctx.fillRect(log.x*laneWidth, y+laneHeight*0.2, log.w*laneWidth, laneHeight*0.6);
      }
    } else if (lane.type===LaneType.RAIL) {
      ctx.fillStyle=COLORS.rail;
      ctx.fillRect(0,y,canvas.width,laneHeight);
      ctx.fillStyle=COLORS.track;
      ctx.fillRect(0,y+laneHeight*0.3,canvas.width,4);
      ctx.fillRect(0,y+laneHeight*0.7,canvas.width,4);
      const t=lane.train;
      ctx.fillStyle=COLORS.car1;
      ctx.fillRect(t.x*laneWidth, y, t.length*laneWidth, laneHeight);
    }
  }

  // player
  if (state.player.alive) {
    const px = state.player.x*laneWidth;
    const py = canvas.height - (state.player.y-state.offsetY+1)*laneHeight;
    ctx.fillStyle=COLORS.playerShadow;
    ctx.fillRect(px+laneWidth*0.2, py+laneHeight*0.1, laneWidth*0.6, laneHeight*0.15);
    ctx.fillStyle=COLORS.player;
    ctx.fillRect(px+laneWidth*0.2, py+laneHeight*0.25, laneWidth*0.6, laneHeight*0.6);
  }

  uiScore.textContent=`Score: ${state.score}`;
  uiBest.textContent=`Best: ${bestScore}`;
}

// ===== UI =====
function showMessage(title,sub) {
  uiMsg.hidden=false; uiMsgTitle.textContent=title; uiMsgSub.textContent=sub;
}
function hideMessage(){ uiMsg.hidden=true; }

// Buttons
document.getElementById('btnPause').onclick=()=>{
  if (!state.started) return;
  state.paused=!state.paused;
  showMessage(state.paused?'Paused':'','');
  if (!state.paused) hideMessage();
};
document.getElementById('btnRestart').onclick=()=>{ reset(); };

// ===== Loop =====
let last=performance.now();
function loop(now){
  const dt=(now-last)/1000; last=now;
  if (state.started) update(dt);
  render();
  requestAnimationFrame(loop);
}
loop(last);

showMessage('Crossy Road','Press Space or Tap to start');
