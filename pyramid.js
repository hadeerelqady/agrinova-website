(function(){
  var el=document.getElementById('stage'); if(!el||!window.THREE) return;
  function init(){
  var W=el.clientWidth,H=el.clientHeight;
  var r=new THREE.WebGLRenderer({antialias:true,alpha:false});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.setSize(W,H);
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.82;
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  el.prepend(r.domElement);
  var s=new THREE.Scene();

  // ---- sky (gradient dome) + environment reflections ----
  var skyGeo=new THREE.SphereGeometry(90,32,16);
  var skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x6f9fc4)},mid:{value:new THREE.Color(0xf3d6a8)},bot:{value:new THREE.Color(0xd9b98a)}},
    vertexShader:'varying vec3 vP;void main(){vP=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 mid;uniform vec3 bot;varying vec3 vP;void main(){float h=normalize(vP).y;vec3 c=h>0.0?mix(mid,top,pow(h,0.55)):mix(mid,bot,min(1.0,-h*4.0));gl_FragColor=vec4(c,1.0);}'});
  var sky=new THREE.Mesh(skyGeo,skyMat);s.add(sky);
  var ec=document.createElement('canvas');ec.width=256;ec.height=128;var ex=ec.getContext('2d');var eg=ex.createLinearGradient(0,0,0,128);eg.addColorStop(0,'#6f9fc4');eg.addColorStop(.48,'#f3d6a8');eg.addColorStop(.52,'#d9b98a');eg.addColorStop(1,'#8a6f4c');ex.fillStyle=eg;ex.fillRect(0,0,256,128);
  var et=new THREE.CanvasTexture(ec);et.mapping=THREE.EquirectangularReflectionMapping;et.encoding=THREE.sRGBEncoding;
  try{var pm=new THREE.PMREMGenerator(r);s.environment=pm.fromEquirectangular(et).texture;pm.dispose()}catch(e){}
  s.fog=new THREE.Fog(0xf0d3a4,70,140);

  var cam=new THREE.PerspectiveCamera(34,W/H,.1,200);cam.position.set(16.5,7.8,18.5);
  var c=new THREE.OrbitControls(cam,r.domElement);c.target.set(0.8,1.3,0);c.enableDamping=true;c.autoRotate=true;c.autoRotateSpeed=.4;c.enableZoom=false;c.enablePan=false;c.maxPolarAngle=Math.PI*0.47;c.minPolarAngle=Math.PI*0.22;

  s.add(new THREE.HemisphereLight(0xfff3e0,0x8a6f4c,.3));
  var sun=new THREE.DirectionalLight(0xffdcae,1.7);sun.position.set(-14,13,9);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);var sc=sun.shadow.camera;sc.left=-18;sc.right=18;sc.top=18;sc.bottom=-18;sc.near=1;sc.far=60;sun.shadow.bias=-.0005;s.add(sun);

  // ---- sand ground with procedural texture ----
  var cv=document.createElement('canvas');cv.width=cv.height=256;var cx=cv.getContext('2d');cx.fillStyle='#c9a978';cx.fillRect(0,0,256,256);
  for(var n=0;n<9000;n++){var v=Math.random();cx.fillStyle=v>.5?'rgba(255,240,210,'+(Math.random()*.18)+')':'rgba(120,90,55,'+(Math.random()*.16)+')';cx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2)}
  var tex=new THREE.CanvasTexture(cv);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(26,26);tex.encoding=THREE.sRGBEncoding;
  var ground=new THREE.Mesh(new THREE.CircleGeometry(80,64),new THREE.MeshStandardMaterial({map:tex,roughness:1,envMapIntensity:.35}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;s.add(ground);

  // ---- materials ----
  var glass=new THREE.MeshPhysicalMaterial({color:0xeaf6f0,metalness:0,roughness:.04,transparent:true,opacity:.2,envMapIntensity:1.6,reflectivity:.6,clearcoat:1,clearcoatRoughness:.05,side:THREE.DoubleSide,depthWrite:false});
  var alu=new THREE.MeshStandardMaterial({color:0xb7bdc2,metalness:.9,roughness:.3,envMapIntensity:.9});
  var concrete=new THREE.MeshStandardMaterial({color:0x9e9a92,roughness:.9,envMapIntensity:.4});
  var floorM=new THREE.MeshStandardMaterial({color:0xcfccc2,roughness:.85,envMapIntensity:.3});
  var leafA=new THREE.MeshStandardMaterial({flatShading:true,color:0x2f6a36,roughness:.85,envMapIntensity:.4}),leafB=new THREE.MeshStandardMaterial({flatShading:true,color:0x1d4a24,roughness:.85,envMapIntensity:.4});
  var fruitM=new THREE.MeshStandardMaterial({color:0xc8442c,roughness:.5});
  var UP=new THREE.Vector3(0,1,0);
  function V(x,y,z){return new THREE.Vector3(x,y,z)}
  function bar(a,b,rad,mat){var d=b.clone().sub(a),len=d.length();var m=new THREE.Mesh(new THREE.BoxGeometry(rad*2,len,rad*2),mat||alu);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,d.normalize());m.castShadow=true;s.add(m);return m}
  function glassTris(tris){var a=[];tris.forEach(function(t){t.forEach(function(p){a.push(p.x,p.y,p.z)})});var gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(a,3));gm.computeVertexNormals();var m=new THREE.Mesh(gm,glass);m.renderOrder=2;s.add(m)}
  function kerb(x0,z0,x1,z1,h){var t=.22;[[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,x0,z1],[x0,z1,x0,z0]].forEach(function(e){var dx=e[2]-e[0],dz=e[3]-e[1];var len=Math.hypot(dx,dz)+t;var m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(dx)>0?len:t,h,Math.abs(dz)>0?len:t),concrete);m.position.set((e[0]+e[2])/2,h/2,(e[1]+e[3])/2);m.castShadow=m.receiveShadow=true;s.add(m)});
    var f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),floorM);f.rotation.x=-Math.PI/2;f.position.set((x0+x1)/2,.02,(z0+z1)/2);f.receiveShadow=true;s.add(f)}
  var leafGeo=new THREE.IcosahedronGeometry(.16,0);
  function vine(x,z,hgt){var g=new THREE.Group();
    var stem=new THREE.Mesh(new THREE.CylinderGeometry(.015,.02,hgt,4),leafB);stem.position.y=hgt/2;g.add(stem);
    var n=Math.max(3,Math.round(hgt/.22));
    for(var k=0;k<n;k++){var lf=new THREE.Mesh(leafGeo,Math.random()>.45?leafA:leafB);var a=Math.random()*6.28,rr=.06+Math.random()*.1;lf.position.set(Math.cos(a)*rr,.15+k*(hgt/n),Math.sin(a)*rr);var sc=.7+Math.random()*.6;lf.scale.set(sc,sc*.8,sc);lf.rotation.set(Math.random()*3,Math.random()*3,0);lf.castShadow=true;g.add(lf)}
    for(k=0;k<2;k++){var fr=new THREE.Mesh(new THREE.SphereGeometry(.055,6,5),fruitM);var a2=Math.random()*6.28;fr.position.set(Math.cos(a2)*.14,.25+Math.random()*(hgt*.5),Math.sin(a2)*.14);g.add(fr)}
    g.position.set(x,.02,z);s.add(g)}

  // ---- Pyramid module ----
  var PX=-5.4,PZ=.6,hw=2.7,ph=4.1,kh=.4;
  kerb(PX-hw,PZ-hw,PX+hw,PZ+hw,kh);
  var ap=V(PX,ph,PZ),b=[V(PX-hw,kh,PZ-hw),V(PX+hw,kh,PZ-hw),V(PX+hw,kh,PZ+hw),V(PX-hw,kh,PZ+hw)];
  glassTris([[ap,b[0],b[1]],[ap,b[1],b[2]],[ap,b[2],b[3]],[ap,b[3],b[0]]]);
  for(var i=0;i<4;i++){var b0=b[i],b1=b[(i+1)%4];bar(ap,b0,.06);bar(b0,b1,.05);
    for(var k=1;k<5;k++){bar(ap,b0.clone().lerp(b1,k/5),.025)}
    for(k=1;k<4;k++){var t=k/4;bar(ap.clone().lerp(b0,t),ap.clone().lerp(b1,t),.022)}}
  var cap=new THREE.Mesh(new THREE.ConeGeometry(.3,.42,4),new THREE.MeshStandardMaterial({color:0xE09A2D,metalness:.6,roughness:.35}));cap.rotation.y=Math.PI/4;cap.position.set(PX,ph+.12,PZ);cap.castShadow=true;s.add(cap);
  for(var x=-1.8;x<=1.81;x+=.6){for(var z=-1.8;z<=1.81;z+=.9){if(Math.abs(x)+Math.abs(z)>2.5)continue;vine(PX+x,PZ+z,.6+Math.random()*.3)}}

  // ---- Production houses: hipped ridge (elongated pyramid) ----
  function house(X,Z,w,l,h){
    var hx=w/2,hz=l/2,rz=hz-hx,kh=.45;
    kerb(X-hx,Z-hz,X+hx,Z+hz,kh);
    var c0=V(X-hx,kh,Z-hz),c1=V(X+hx,kh,Z-hz),c2=V(X+hx,kh,Z+hz),c3=V(X-hx,kh,Z+hz),r0=V(X,h,Z-rz),r1=V(X,h,Z+rz);
    glassTris([[c0,c1,r0],[c2,c3,r1],[c1,c2,r1],[c1,r1,r0],[c3,c0,r0],[c3,r0,r1]]);
    // perimeter, ridge and hips
    bar(c0,c1,.05);bar(c1,c2,.05);bar(c2,c3,.05);bar(c3,c0,.05);bar(r0,r1,.07);bar(c0,r0,.055);bar(c1,r0,.055);bar(c2,r1,.055);bar(c3,r1,.055);
    // rafters along long sides
    var nr=Math.round(l/.9);
    for(var i=1;i<nr;i++){var zz=Z-hz+i*(l/nr),dz=Math.abs(zz-Z);
      var sp=dz<=rz?1:(hz-dz)/hx; var topY=kh+(h-kh)*sp;
      bar(V(X-hx,kh,zz),V(X-hx+hx*sp,topY,zz),.022);bar(V(X+hx,kh,zz),V(X+hx-hx*sp,topY,zz),.022)}
    // hip-end rafters
    for(var k=1;k<4;k++){var t=k/4;bar(c0.clone().lerp(c1,t),r0,.022);bar(c3.clone().lerp(c2,t),r1,.022)}
    // purlins (horizontal) on long sides
    for(k=1;k<3;k++){t=k/3;bar(c0.clone().lerp(r0,t),c3.clone().lerp(r1,t),.02);bar(c1.clone().lerp(r0,t),c2.clone().lerp(r1,t),.02)}
    // ridge vents (open panels)
    var vm=new THREE.MeshPhysicalMaterial({color:0xeaf6f0,transparent:true,opacity:.35,roughness:.05,envMapIntensity:1.6,side:THREE.DoubleSide,depthWrite:false});
    var vl=new THREE.LineBasicMaterial({color:0xd8dde0});
    for(var v=-rz+1;v<=rz-1;v+=2.2){var vg=new THREE.BoxGeometry(.9,.03,1.4);var pnl=new THREE.Mesh(vg,vm);pnl.position.set(X+.46,h-.02,Z+v);pnl.rotation.z=-.5;s.add(pnl);
      var ed=new THREE.LineSegments(new THREE.EdgesGeometry(vg),vl);ed.position.copy(pnl.position);ed.rotation.copy(pnl.rotation);s.add(ed)}
    // crop rows on trellis
    for(var xx=-hx+.55;xx<=hx-.54;xx+=.72){bar(V(X+xx,kh+.0,Z-hz+.6),V(X+xx,kh+.0,Z+hz-.6),.012);
      for(var zz2=-hz+.7;zz2<=hz-.69;zz2+=.45){vine(X+xx,Z+zz2,1.1+Math.random()*.35)}}
  }
  house(1.4,0,4.4,13,3.1);
  house(6.4,0,4.4,13,3.1);

  // ---- date palms + orchard around ----
  var trunk=new THREE.MeshStandardMaterial({color:0x6b5139,roughness:1}),frond=new THREE.MeshStandardMaterial({color:0x2c5a2e,roughness:.9,side:THREE.DoubleSide,envMapIntensity:.4}),leaf=new THREE.MeshStandardMaterial({color:0x234f30,roughness:.9,envMapIntensity:.4}),orange=new THREE.MeshStandardMaterial({color:0xE0902a,roughness:.6});
  function palm(x,z,hgt){var t=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,hgt,7),trunk);t.position.set(x,hgt/2,z);t.castShadow=true;s.add(t);
    for(var f=0;f<9;f++){var a=f/9*6.28;var fg=new THREE.Mesh(new THREE.PlaneGeometry(.35,1.8),frond);fg.position.set(x+Math.cos(a)*.8,hgt-.15,z+Math.sin(a)*.8);fg.lookAt(x+Math.cos(a)*3,hgt-1.4,z+Math.sin(a)*3);fg.rotateX(Math.PI/2);fg.castShadow=true;s.add(fg)}}
  function tree(x,z){var t=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.6,6),trunk);t.position.set(x,.3,z);s.add(t);var c2=new THREE.Mesh(new THREE.IcosahedronGeometry(.6,1),leaf);c2.position.set(x,1,z);c2.castShadow=true;s.add(c2);for(var f=0;f<5;f++){var fr=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),orange);var an=Math.random()*6.28;fr.position.set(x+Math.cos(an)*.52,.85+Math.random()*.35,z+Math.sin(an)*.52);s.add(fr)}}
  for(var j=-7;j<=7;j++){tree(j*1.7,-10.2);tree(j*1.7+.85,-12)}
  for(j=-2;j<=4;j++){tree(-11.2,j*1.8-2)}
  [[-13,7],[-15,-4],[14,-6],[16,2],[-6,-14],[6,-15]].forEach(function(p){palm(p[0],p[1],3.6+Math.random()*1.2)});

  // ---- labels ----
  var labels=[{p:V(PX,ph+1,PZ),t:'Pyramid module'},{p:V(3.9,4.3,-5),t:'Production houses'}].map(function(l){var d=document.createElement('span');d.className='stage-label';d.textContent=l.t;el.appendChild(d);l.el=d;return l});
  function place(){labels.forEach(function(l){var v=l.p.clone().project(cam);l.el.style.transform='translate(-50%,-100%) translate('+((v.x+1)/2*W)+'px,'+((1-v.y)/2*H)+'px)';l.el.style.opacity=v.z<1?1:0})}

  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduce)c.autoRotate=false;
  function loop(){c.update();r.render(s,cam);place();requestAnimationFrame(loop)}
  loop();
  window.addEventListener('resize',function(){W=el.clientWidth;H=el.clientHeight;r.setSize(W,H);cam.aspect=W/H;cam.updateProjectionMatrix()});
  }
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();init()}},{rootMargin:'200px'});io.observe(el)}else init();
})();
