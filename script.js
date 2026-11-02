// ---- Data: real GPS positions (Google Maps), converted to metres on a flat ground plane ----
// Origin = SMS. x = east(+)/west(-) of SMS in metres. z = south(+)/north(-) of SMS in metres.
// To reposition anything, change its lat/lng — right-click the spot in Google Maps and click
// the coordinates that pop up to copy them.
const ORIGIN = { lat: 10.0431095, lng: 76.3273828 };           // School of Management Studies, CUSAT
const M_PER_DEG_LAT = 110950;
const M_PER_DEG_LNG = 111320 * Math.cos(ORIGIN.lat * Math.PI/180);
const geo = (lat,lng) => ({ x:(lng-ORIGIN.lng)*M_PER_DEG_LNG, z:(ORIGIN.lat-lat)*M_PER_DEG_LAT });
const at = (lat,lng,o) => ({ ...geo(lat,lng), ...o });

const BUILDINGS = [
  at(10.0430195,76.3243768, {label:'Main Block (Admin)', w:30, d:16, h:9,  floors:3, color:0xf1ece0, roof:0x8a5a3c}),
  at(10.0431095,76.3273828, {label:'SMS',                w:11, d:11, h:7.5,floors:4, color:0xd6d6d6, roof:0x3a4658}),
  at(10.0427091,76.3280569, {label:'Hindi Dept',          w:40, d:9,  h:5,  floors:2, color:0xe8dcc0, roof:0x3a4658}),
  at(10.0421350,76.3284007, {label:'CUSAT Restaurant',    w:9,  d:6,  h:3.5,floors:1, color:0xd9c9a8, roof:0xb5523a}),
  at(10.0425759,76.3285328, {label:'Student Amenity Centre', w:16, d:10, h:6, floors:2, color:0xf4f4f0, roof:0x3a4658}),
  {x:-282.8, z:-50.6, label:'Seminar Complex', w:34, d:30, h:5, floors:1, color:0xece3cf, roof:0x8a5a3c},
];
const ROAD_W = 6;
// Road network traced from your two Google Maps screenshots, not guessed: roads were picked out by colour,
// centre-lines checked by overlaying them on the screenshots, then scaled to metres using known GPS pins
// (Main Block, SMS, CUSAT Restaurant). Accuracy is roughly 2-5 m. West of SMS comes from the map view,
// east of SMS from the (higher zoom) satellite view.
const UNIVERSITY_ROAD = [[-437.5,-259.5],[-411.8,-236.4],[-386.0,-215.6],[-355.0,-192.5],[-329.2,-169.3],[-303.4,-143.5],
  [-277.6,-120.3],[-257.0,-106.3],[-220.9,-96.0],[-184.8,-86.7],[-143.6,-73.8],[-97.1,-55.8],[-61.0,-32.6],[-39.8,-15.3],
  [-30.7,-2.8],[-22.1,10.2],[-14.6,21.2],[-3.6,34.0],[1.0,41.2],[30.2,59.9],[56,70],[82,76],[103,77]].map(([x,z])=>({x,z}));
const NS_ROAD = [[93.4,-12.9],[96,-2],[102,9],[105,36],[107,55],[105,72],[104,86],[101,108],[98,122],[95,135],[92,156],[87,167]].map(([x,z])=>({x,z}));
const SPUR_RD = [[104.6,74.8],[117.7,74.8],[128.1,74.5],[128.8,89.6]].map(([x,z])=>({x,z}));
const EAST_RD = [[98.7,157.6],[125.5,159.9],[129.4,158.6],[135.1,158.1],[136.7,159.6]].map(([x,z])=>({x,z}));
const CANTEEN_RD = [[-251.8,-85.1],[-241.9,-38.5],[-228.0,-0.9],[-205.2,36.8]].map(([x,z])=>({x,z}));
const ADMIN_RD = [[-327.1,-165.4],[-331.1,-100.0],[-331.1,-15.8],[-333.1,-2.9]].map(([x,z])=>({x,z}));
const VIDYANAGAR_RD = [[-343.0,175.5],[-333.1,181.5],[-320.2,175.5],[-306.3,156.7],[-274.6,124.0],[-262.7,117.0],[-250.8,99.2],
  [-211.2,62.5],[-185.4,44.7],[-148.7,23.9],[-127.9,18.9],[-105.1,20.9],[-95.2,28.8],[-64.3,46.2],[-56.0,60.2],[-47.1,73.7],
  [-44.0,85.7],[-33.8,94.0],[-28.4,102.6],[-28.9,113.8],[-36.2,118.5],[-44.3,121.6],[-54.1,131.0],[-59.3,137.0],[-63.5,143.5]].map(([x,z])=>({x,z}));
const ROAD_LINES = [UNIVERSITY_ROAD, NS_ROAD, SPUR_RD, EAST_RD, CANTEEN_RD, ADMIN_RD, VIDYANAGAR_RD];
const DRIVE_ROADS = [UNIVERSITY_ROAD, NS_ROAD, VIDYANAGAR_RD];     // roads that carry the animated cars
// Open Air Auditorium: footprint and position read from the satellite view. It sits on the west side of
// University Road, opposite CUSAT Restaurant, which is on the east side.
const AUDITORIUM = {x:43.5, z:139.1, w:56, d:44, h:3.2};
const EXTRA_LABELS = [
  {label:'University Road', x:-143.6, z:-73.8, y:1.5},
  {label:'University Road', x:107, z:40, y:1.5},
  {label:'Canteen Rd', x:-242, z:-38, y:1.5},
  {label:'Vidyanagar Rd', x:-211, z:62, y:1.5},
  {label:'University Computer Centre', x:-276.6, z:-283.3, y:1.5},
  {label:'Open Air Auditorium', x:AUDITORIUM.x, z:AUDITORIUM.z, y:7},
];

// helper: n equally spaced points along a polyline of {x,z} points
function along(pts,n){
  const seg=[]; let tot=0;
  for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);seg.push(l);tot+=l;}
  return Array.from({length:n},(_,k)=>{
    let d=n>1?tot*k/(n-1):0,i=0;
    while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++;}
    const t=seg[i]?d/seg[i]:0;
    return {x:pts[i].x+(pts[i+1].x-pts[i].x)*t, z:pts[i].z+(pts[i+1].z-pts[i].z)*t};
  });
}

function alongOffset(pts,n,off){
  const base=along(pts,n), segs=[]; let tot=0;
  for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);segs.push([l,pts[i-1],pts[i]]);tot+=l;}
  return base.map((p,k)=>{
    let d=n>1?tot*k/(n-1):0, j=0; while(j<segs.length-1&&d>segs[j][0]){d-=segs[j][0];j++;}
    const [l,a,b]=segs[j], dx=(b.x-a.x)/l, dz=(b.z-a.z)/l;
    return {x:p.x-dz*off, z:p.z+dx*off};
  });
}

// stalls: zone 0 = Food Court (1-11, by the Amenity Centre/Restaurant), zone 1 = Hindi Dept Junction (9,10),
// zone 2 = SMS front + Open Air Auditorium (14-25)
const L0 = ['Transform Gym','Tasty Nibbles','carybox','Maruti Suzuki','Choco Brown (Student)','Participants Food','Participants Food','Kiwi Icecream','Coco Shell','TBD','TBD'];
const P0 = [...along([geo(10.0427,76.32865),geo(10.04215,76.32865)], 6),
            ...along([geo(10.0427,76.32885),geo(10.04215,76.32885)], 5)]; // two rows between Amenity Centre and the Restaurant
const ZONE0 = L0.map((label,i)=>({num:String(i+1), label, ...P0[i], zone:0, na:label==='TBD'}));

// 9 and 10 stand on the west side of the north-south road, between the Hindi Dept and the junction.
const P1 = alongOffset(NS_ROAD.filter(p=>p.z>=55 && p.z<=80), 2, 10);
const ZONE1 = [{num:'9',label:'Vivo'},{num:'10',label:'Star Book House'}].map((s,i)=>({...s, ...P1[i], zone:1}));

const L2 = ['Maruti Suzuki','kerala Gramin Bank','CIASL','FIND MY hostel','TradeMax','Livelong Wealth','not yet','not yet','not yet','Maruti Suzuki Driving School','Royal Enfield','Epson printers'];
// 14-22 sit on both sides of University Road in front of SMS (odd-numbered on the SMS side, even-numbered
// across the road), following the road's real diagonal. 23-25 line the west side of the north-south road,
// in front of the Open Air Auditorium and opposite CUSAT Restaurant.
const SMS_STRETCH = UNIVERSITY_ROAD.filter(p=>p.x>=-40 && p.x<=31);
const ROW_NEAR = alongOffset(SMS_STRETCH, 5, -11);  // SMS side (north-east of the road)
const ROW_FAR  = alongOffset(SMS_STRETCH, 4,  11);  // far side (south-west of the road)
const AUD_STRETCH = NS_ROAD.filter(p=>p.z>=100 && p.z<=160);
const ROW_AUD  = alongOffset(AUD_STRETCH, 3, 10);   // west side of the north-south road
const P2 = [...Array.from({length:9},(_,i)=> i%2===0 ? ROW_NEAR[i/2] : ROW_FAR[(i-1)/2]), ...ROW_AUD];
const ZONE2 = L2.map((label,i)=>({num:String(14+i), label: label==='not yet'?'TBD':label, ...P2[i], zone:2, na:label==='not yet'}));

// ---- Pin categories & colours: edit CATS to match your sponsor types, and set `cat` on each stall below ----
const CATS = {
  food:    {label:'Food & drink',   color:0xff9d2e},
  auto:    {label:'Automotive',     color:0x3ad6ff},
  finance: {label:'Finance',        color:0x39ff8f},
  retail:  {label:'Retail / tech',  color:0xff2e9a},
  fitness: {label:'Fitness',        color:0xb24bff},
  other:   {label:'Other',          color:0x9a8cc2},
  tbd:     {label:'Not finalised',  color:0x5a5285},
};
function guessCat(label){
  const l = label.toLowerCase();
  if(/food|nibbles|ice ?cream|choco|shell|carybox/.test(l)) return 'food';
  if(/suzuki|enfield|driving school/.test(l)) return 'auto';
  if(/bank|wealth|trademax/.test(l)) return 'finance';
  if(/vivo|epson|book|ciasl/.test(l)) return 'retail';
  if(/gym/.test(l)) return 'fitness';
  return 'other';
}
const STALLS = [...ZONE0, ...ZONE1, ...ZONE2].map(s => ({...s, cat: s.na ? 'tbd' : (s.cat || guessCat(s.label))}));
// zone buttons: 0 Main Block, 1 Food Court, 2 Hindi Dept Junction, 3 SMS/Auditorium — each its own
// localized view; no combined overview.
const ZONE_TARGET = [
  {...geo(10.0430195,76.3243768), r:50},
  {...geo(10.04243,76.32875), r:40},
  {x:90, z:62, r:44},
  {x:40, z:70, r:90},
];

// scatter trees on the open ground (seeded, so the map looks the same every time)
function segDist(px,pz,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((px-a.x)*dx+(pz-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(px-(a.x+t*dx),pz-(a.z+t*dz));}
const ROAD_PTS = ROAD_LINES;
let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const TREES=[];
for(let n=0;n<900 && TREES.length<260;n++){
  const x=-460+rnd()*640, z=-300+rnd()*560;
  const nearRoad = ROAD_PTS.some(l=>l.some((pt,i)=>i&&segDist(x,z,l[i-1],pt)<ROAD_W));
  const nearBld  = BUILDINGS.some(b=>Math.abs(x-b.x)<b.w/2+3 && Math.abs(z-b.z)<b.d/2+3);
  const nearStall= STALLS.some(s=>Math.hypot(x-s.x,z-s.z)<3);
  const inAud    = Math.abs(x-AUDITORIUM.x)<AUDITORIUM.w/2+3 && Math.abs(z-AUDITORIUM.z)<AUDITORIUM.d/2+3;
  if(!nearRoad&&!nearBld&&!nearStall&&!inAud) TREES.push({x,z});
}

// ---- Three.js scene ----
let scene, camera, renderer, radius=ZONE_TARGET[0].r, azimuth=0.6, polar=1.0, target=new THREE.Vector3(ZONE_TARGET[0].x,0,ZONE_TARGET[0].z);
const el = document.getElementById('view3d');
function skyGradient(top,mid,bottom){
  const c=document.createElement('canvas'); c.width=1; c.height=128;
  const ctx=c.getContext('2d'), g=ctx.createLinearGradient(0,0,0,128);
  g.addColorStop(0,top); g.addColorStop(0.55,mid); g.addColorStop(1,bottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,1,128);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return tex;
}
function init(){
  scene = new THREE.Scene();
  scene.background = skyGradient('#1b0b3a','#6a1f7a','#ff5f87');
  scene.fog = new THREE.Fog(0x2a0f4a, 260, 640);
  camera = new THREE.PerspectiveCamera(42, el.clientWidth/el.clientHeight, 0.1, 900);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x6a3fb0, 0x2a1050, 0.65));
  const dl = new THREE.DirectionalLight(0xff8fc0, 1.1);
  dl.position.set(90,120,60); dl.castShadow = true;
  dl.shadow.mapSize.set(2048,2048);
  const sc = dl.shadow.camera; sc.left=-260; sc.right=260; sc.top=230; sc.bottom=-180; sc.near=1; sc.far=400;
  dl.shadow.bias = -0.0015;
  scene.add(dl); scene.add(dl.target);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(680,600), new THREE.MeshLambertMaterial({color:0x160a30}));
  ground.rotation.x=-Math.PI/2; ground.position.set(-150,0,0); ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(680,85,0xff2e9a,0x3a2060); grid.position.set(-150,0.02,0); scene.add(grid);

  const roadMat=new THREE.MeshLambertMaterial({color:0x241640});
  ROAD_PTS.forEach(l=>l.forEach((pt,i)=>{
    const j=new THREE.Mesh(new THREE.CircleGeometry(ROAD_W/2,14), roadMat);
    j.rotation.x=-Math.PI/2; j.position.set(pt.x,0.03,pt.z); j.receiveShadow=true; scene.add(j);
    if(!i) return;
    const a=l[i-1], dx=pt.x-a.x, dz=pt.z-a.z, len=Math.hypot(dx,dz);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,ROAD_W), roadMat);
    m.rotation.order='YXZ'; m.rotation.x=-Math.PI/2; m.rotation.y=Math.atan2(-dz,dx);
    m.position.set((a.x+pt.x)/2,0.03,(a.z+pt.z)/2); m.receiveShadow=true; scene.add(m);
  }));

  BUILDINGS.forEach(b=>{
    const body = new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,b.d), new THREE.MeshLambertMaterial({color:b.color}));
    body.position.set(b.x,b.h/2,b.z); body.castShadow=true; body.receiveShadow=true; scene.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(b.w+0.5,0.3,b.d+0.5), new THREE.MeshLambertMaterial({color:b.roof||0x6b4a35}));
    roof.position.set(b.x,b.h+0.15,b.z); roof.castShadow=true; scene.add(roof);
    const floors = b.floors||1;
    for(let f=1; f<floors; f++){
      const band = new THREE.Mesh(new THREE.BoxGeometry(b.w+0.06,0.18,b.d+0.06), new THREE.MeshBasicMaterial({color:(f%2)?0x05e8ff:0xff2e9a}));
      band.position.set(b.x,(b.h/floors)*f,b.z); scene.add(band);
    }
  });

  TREES.forEach(t=>{
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,1.2,6), new THREE.MeshLambertMaterial({color:0x6b4a2f}));
    trunk.position.set(t.x,0.6,t.z); trunk.castShadow=true; scene.add(trunk);
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.1,7), new THREE.MeshLambertMaterial({color:0x4a8f45}));
    leaf.position.set(t.x,2.1,t.z); leaf.castShadow=true; leaf.receiveShadow=true; scene.add(leaf);
  });

  const A=AUDITORIUM;
  const shed=new THREE.Mesh(new THREE.BoxGeometry(A.w,0.4,A.d), new THREE.MeshLambertMaterial({color:0xb5523a}));
  shed.position.set(A.x,A.h,A.z); scene.add(shed);
  [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]].forEach(([sx,sz])=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,A.h,6), new THREE.MeshLambertMaterial({color:0x8a8f99}));
    post.position.set(A.x+sx*(A.w/2-0.6),A.h/2,A.z+sz*(A.d/2-0.6)); scene.add(post);
  });
  const porch=new THREE.Mesh(new THREE.ConeGeometry(4.2,2.2,4), new THREE.MeshLambertMaterial({color:0x8a4a35}));
  porch.rotation.y=Math.PI/4; porch.position.set(A.x,A.h+1.4,A.z-A.d/2+2); scene.add(porch);

  STALLS.forEach(s=>{
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,1.7,12), new THREE.MeshLambertMaterial({color:CATS[s.cat].color}));
    pin.position.set(s.x,0.85,s.z); pin.castShadow=true; scene.add(pin); s._mesh=pin;
  });

  // ---- Traffic: a handful of cars on the road, people browsing near the stalls ----
  const CAR_COLORS=[0xff2e9a,0x05e8ff,0xffd166,0x3ad6ff,0xff5f87];
  CARS = DRIVE_ROADS.flatMap((pts,li)=> [0,1].map(k=>{
    const car=makeCar(CAR_COLORS[(li*2+k)%CAR_COLORS.length]);
    scene.add(car);
    const total=pathLen(pts);
    return {group:car, pts, s: total*(k? 0.65:0.1), dir: k?1:-1, speed: 3+rnd()*1.6, lane: k?1.5:-1.5};
  }));
  const PEOPLE_COLORS=[0x7B4B9E,0x2E7D6B,0xB2652E,0x2E577B,0x8E4E6B,0x4E6B2E];
  PEOPLE = STALLS.filter(s=>!s.na).slice(0,16).map((s,i)=>{
    const ang=rnd()*Math.PI*2, r=1.6+rnd()*1.4;
    const pts=[{x:s.x-Math.cos(ang)*r,z:s.z-Math.sin(ang)*r},{x:s.x+Math.cos(ang)*r,z:s.z+Math.sin(ang)*r}];
    const person=makePerson(PEOPLE_COLORS[i%PEOPLE_COLORS.length]);
    scene.add(person);
    const total=pathLen(pts);
    return {group:person, pts, s: rnd()*total, dir: rnd()<0.5?1:-1, speed:0.6+rnd()*0.5};
  });

  buildLabels();
  buildLegend();
  updateCamera();
  clock = new THREE.Clock();
  animate();
}
function updateCamera(){
  camera.position.set(target.x+radius*Math.sin(polar)*Math.sin(azimuth), radius*Math.cos(polar), target.z+radius*Math.sin(polar)*Math.cos(azimuth));
  camera.lookAt(target);
}

// ---- Simple low-poly car and pedestrian models, plus the path-following math that drives them ----
let CARS=[], PEOPLE=[], clock;
function makeCar(color){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.55,2.0), new THREE.MeshLambertMaterial({color}));
  body.position.y=0.45; body.castShadow=true; body.receiveShadow=true; g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(0.85,0.4,1.0), new THREE.MeshLambertMaterial({color:0x1b2430}));
  cabin.position.set(0,0.78,-0.1); cabin.castShadow=true; g.add(cabin);
  const wheelGeo=new THREE.CylinderGeometry(0.22,0.22,0.18,10), wheelMat=new THREE.MeshLambertMaterial({color:0x151515});
  [[0.5,0.65],[-0.5,0.65],[0.5,-0.65],[-0.5,-0.65]].forEach(([wx,wz])=>{
    const w=new THREE.Mesh(wheelGeo,wheelMat); w.rotation.x=Math.PI/2; w.position.set(wx,0.22,wz); w.castShadow=true; g.add(w);
  });
  return g;
}
function makePerson(shirt){
  const g=new THREE.Group();
  const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.9,8), new THREE.MeshLambertMaterial({color:0x33404a}));
  legs.position.y=0.45; legs.castShadow=true; g.add(legs);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.15,0.5,8), new THREE.MeshLambertMaterial({color:shirt}));
  torso.position.y=1.15; torso.castShadow=true; g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.14,10,10), new THREE.MeshLambertMaterial({color:0xe0b894}));
  head.position.y=1.54; head.castShadow=true; g.add(head);
  return g;
}
function pathLen(pts){ let t=0; for(let i=1;i<pts.length;i++) t+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z); return t; }
function posOnPath(pts,s){
  let d=Math.max(0,Math.min(pathLen(pts),s)), i=0;
  while(i<pts.length-2){ const segLen=Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].z-pts[i].z); if(d<=segLen) break; d-=segLen; i++; }
  const a=pts[i], b=pts[i+1]||pts[i], segLen=Math.hypot(b.x-a.x,b.z-a.z)||1, t=d/segLen;
  return {x:a.x+(b.x-a.x)*t, z:a.z+(b.z-a.z)*t, dx:(b.x-a.x)/segLen, dz:(b.z-a.z)/segLen};
}
function updateTraffic(dt){
  CARS.forEach(c=>{
    const total=pathLen(c.pts);
    c.s+=c.dir*c.speed*dt;
    if(c.s>total){c.s=total;c.dir=-1;} if(c.s<0){c.s=0;c.dir=1;}
    const p=posOnPath(c.pts,c.s), dx=p.dx*c.dir, dz=p.dz*c.dir;
    c.group.position.set(p.x-dz*c.lane, 0, p.z+dx*c.lane);
    c.group.rotation.y=Math.atan2(dx,dz);
  });
  PEOPLE.forEach(p=>{
    const total=pathLen(p.pts);
    p.s+=p.dir*p.speed*dt;
    if(p.s>total){p.s=total;p.dir=-1;} if(p.s<0){p.s=0;p.dir=1;}
    const pos=posOnPath(p.pts,p.s);
    p.group.position.set(pos.x,0,pos.z);
  });
}
function animate(){
  requestAnimationFrame(animate);
  const dt = clock ? Math.min(clock.getDelta(),0.1) : 0;
  updateTraffic(dt);
  renderer.render(scene,camera);
  positionLabels();
}

// ---- HTML overlay labels (billboard pins + building captions) ----
const labelsEl = document.getElementById('labels');
const pinEls = [], buildEls = [];
function buildLabels(){
  STALLS.forEach(s=>{
    const d=document.createElement('div');
    d.className='pin'+(s.na?' na':'');
    d.style.setProperty('--pin-c', '#'+CATS[s.cat].color.toString(16).padStart(6,'0'));
    d.dataset.cat = s.cat;
    d.innerHTML = '<span>'+s.num+'</span>';
    d.title = s.label + ' — ' + CATS[s.cat].label;
    d.addEventListener('click', ()=>select(s));
    labelsEl.appendChild(d);
    pinEls.push({el:d, s});
  });
  [...BUILDINGS.map(b=>({label:b.label,x:b.x,z:b.z,y:b.h+0.8})), ...EXTRA_LABELS].forEach(b=>{
    const d=document.createElement('div');
    d.className='blabel'; d.textContent=b.label;
    labelsEl.appendChild(d);
    buildEls.push({el:d, x:b.x, y:b.y, z:b.z});
  });
}
function project(x,y,z){
  const v=new THREE.Vector3(x,y,z).project(camera);
  return { left:(v.x*0.5+0.5)*el.clientWidth, top:(-(v.y*0.5)+0.5)*el.clientHeight, visible:v.z<1 };
}
function positionLabels(){
  pinEls.forEach(({el:d,s})=>{
    const p=project(s.x,1.8,s.z);
    d.style.display=p.visible?'flex':'none';
    d.style.left=p.left+'px'; d.style.top=p.top+'px';
  });
  buildEls.forEach(({el:d,x,y,z})=>{
    const p=project(x,y,z);
    d.style.display=p.visible?'block':'none';
    d.style.left=p.left+'px'; d.style.top=p.top+'px';
  });
}
function select(s){
  pinEls.forEach(p=>p.el.classList.toggle('active', p.s===s));
  document.getElementById('detail').innerHTML =
    '<span class="name">#'+s.num+' — '+(s.na?'Not finalised yet':s.label)+'</span>' +
    (s.na? 'Placeholder — sponsor to be confirmed.' : 'Sponsor stall near '+(s.zone===0?'the food court.':s.zone===1?'the Hindi Dept junction.':'the SMS / auditorium stretch.'));
}

function buildLegend(){
  const el = document.getElementById('legend');
  if(!el) return;
  el.innerHTML = Object.entries(CATS).map(([key,c]) =>
    '<span class="legend-item"><i style="--pin-c:#'+c.color.toString(16).padStart(6,'0')+'"></i>'+c.label+'</span>'
  ).join('');
}

// ---- orbit controls ----
let dragging=false,lastX=0,lastY=0;
el.addEventListener('pointerdown', e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;el.setPointerCapture(e.pointerId);});
el.addEventListener('pointerup', ()=>dragging=false);
el.addEventListener('pointerleave', ()=>dragging=false);
el.addEventListener('pointermove', e=>{
  if(!dragging) return;
  azimuth -= (e.clientX-lastX)*0.005;
  polar = Math.min(1.4, Math.max(0.3, polar-(e.clientY-lastY)*0.005));
  lastX=e.clientX; lastY=e.clientY; updateCamera();
});
el.addEventListener('wheel', e=>{ e.preventDefault(); radius=Math.min(140,Math.max(14,radius+e.deltaY*0.08)); updateCamera(); },{passive:false});
window.addEventListener('resize', ()=>{ camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); });

document.querySelectorAll('.zbtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.zbtn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentZone = +btn.getAttribute('data-zone');
    const t = ZONE_TARGET[currentZone];
    target.set(t.x,0,t.z); radius=t.r; updateCamera();
    if(svActive) renderSV();
  });
});

// ---- Street View (key-free: opens Google Maps Street View in a new tab, no API or billing needed) ----
// Fill in lat/lng: in Google Maps, right-click the spot -> click the numbers to copy.
// heading: direction to face (0 = north, 90 = east, 180 = south, 270 = west).
const SV_ZONES = [
  {name:'Main Block',          lat:10.044632, lng:76.324375, heading:90, query:''},
  {name:'Amenity Centre',          lat:10.042576, lng:76.328369, heading:160, query:''},
  {name:'Hindi Dept Junction', lat:10.042555, lng:76.328221, heading:45, query:''},
  {name:'SMS / Auditorium',    lat:10.043020, lng:76.327242, heading:0, query:'School of Management Studies CUSAT'},
];
let currentZone=0, svActive=false;
function svUrl(z){
  if(z.lat!=null && z.lng!=null)
    return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+z.lat+','+z.lng+'&heading='+z.heading+'&pitch=0';
  if(z.query) return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(z.query);
  return null;
}
function renderSV(){
  const box=document.getElementById('viewSV');
  box.innerHTML='<p class="svintro">Street View opens in a new tab so you can walk the road the stalls will line. It shows Google’s latest photos, so the stalls themselves won’t appear.</p>' +
    SV_ZONES.map((z,i)=>{
      const u=svUrl(z), exact=z.lat!=null;
      return '<div class="svcard'+(i===currentZone?' active':'')+'"><div><b>'+z.name+'</b><small>'+
        (exact?'Opens Street View at this spot':(u?'Opens Google Maps at this place — drag the yellow figure onto the road':'Add coordinates in SV_ZONES'))+
        '</small></div>'+(u?'<a class="svbtn" target="_blank" rel="noopener" href="'+u+'">Open</a>':'<span class="svbtn off">Not set</span>')+'</div>';
    }).join('');
}
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    svActive = btn.getAttribute('data-tab')==='sv';
    document.getElementById('view3d').style.display = svActive?'none':'block';
    document.getElementById('viewSV').style.display = svActive?'block':'none';
    document.getElementById('hint3d').style.display = svActive?'none':'block';
    if(svActive) renderSV();
  });
});

init();