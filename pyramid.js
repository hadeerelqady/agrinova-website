(function(){
  var el=document.getElementById('stage'); if(!el||!window.THREE) return;
  function init(){ 
  var W=el.clientWidth,H=el.clientHeight;
  var r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.setSize(W,H);el.prepend(r.domElement);
  var s=new THREE.Scene(); s.background=new THREE.Color(0x1c3c30); s.fog=new THREE.Fog(0x1c3c30,13,30);
  var cam=new THREE.PerspectiveCamera(38,W/H,.1,100);cam.position.set(8.6,4.4,9.4);
  var c=new THREE.OrbitControls(cam,r.domElement);c.target.set(0,1.9,0);c.enableDamping=true;c.autoRotate=true;c.autoRotateSpeed=.6;c.enableZoom=false;c.maxPolarAngle=Math.PI*0.48;c.minPolarAngle=Math.PI*0.22;
  s.add(new THREE.HemisphereLight(0xfff1d6,0x173a2c,.6));
  var sun=new THREE.DirectionalLight(0xffc27a,1.0);sun.position.set(-8,6,4);s.add(sun);
  // ground
  var g=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshLambertMaterial({color:0x8f7a58}));g.rotation.x=-Math.PI/2;s.add(g);
  var pad=new THREE.Mesh(new THREE.CircleGeometry(4.6,4),new THREE.MeshLambertMaterial({color:0x6e5d43}));pad.rotation.x=-Math.PI/2;pad.rotation.z=Math.PI/4;pad.position.y=.01;s.add(pad);
  // pyramid glass
  var h=4.6,rad=4.2;
  var geo=new THREE.ConeGeometry(rad,h,4,1,true);geo.rotateY(Math.PI/4);geo.translate(0,h/2,0);
  var glass=new THREE.MeshPhongMaterial({color:0xbfe3cf,transparent:true,opacity:.28,shininess:120,specular:0xffffff,side:THREE.DoubleSide,depthWrite:false});
  s.add(new THREE.Mesh(geo,glass));
  // frame: edges + panel grid
  var lm=new THREE.LineBasicMaterial({color:0xE09A2D,transparent:true,opacity:.95});
  var apex=new THREE.Vector3(0,h,0),base=[];for(var i=0;i<4;i++){var a=Math.PI/4+i*Math.PI/2+Math.PI/4;base.push(new THREE.Vector3(Math.cos(a-Math.PI/4)*rad,0,Math.sin(a-Math.PI/4)*rad))}
  var pts=[];
  for(i=0;i<4;i++){var b0=base[i],b1=base[(i+1)%4];pts.push(apex,b0,b0,b1);
    for(var k=1;k<4;k++){var t=k/4;var p0=apex.clone().lerp(b0,t),p1=apex.clone().lerp(b1,t);pts.push(p0,p1)}
    for(k=1;k<3;k++){var u=k/3;var q=b0.clone().lerp(b1,u);pts.push(apex,q)}}
  var lg=new THREE.BufferGeometry().setFromPoints(pts);s.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xEEF0E7,transparent:true,opacity:.35})));
  var eg=new THREE.BufferGeometry().setFromPoints([apex,base[0],apex,base[1],apex,base[2],apex,base[3],base[0],base[1],base[1],base[2],base[2],base[3],base[3],base[0]]);
  s.add(new THREE.LineSegments(eg,lm));
  // vent cap
  var cap=new THREE.Mesh(new THREE.ConeGeometry(.28,.4,4),new THREE.MeshLambertMaterial({color:0xE09A2D}));cap.rotation.y=Math.PI/4;cap.position.y=h+.05;s.add(cap);
  // crops inside
  var cm=new THREE.MeshLambertMaterial({color:0x3e8a66}),cm2=new THREE.MeshLambertMaterial({color:0x2f6b4f});
  for(var x=-2.4;x<=2.41;x+=.6){for(var z=-2.2;z<=2.21;z+=1.1){if(Math.abs(x)+Math.abs(z)>3.1)continue;var b=new THREE.Mesh(new THREE.SphereGeometry(.22+Math.random()*.06,10,8),Math.random()>.5?cm:cm2);b.position.set(x,.22,z);b.scale.y=.8;s.add(b)}}
  // orchard trees outside
  var trunk=new THREE.MeshLambertMaterial({color:0x5a4632}),leaf=new THREE.MeshLambertMaterial({color:0x1f5845}),fruit=new THREE.MeshLambertMaterial({color:0xE09A2D});
  function tree(x,z){var t=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.6,6),trunk);t.position.set(x,.3,z);s.add(t);var c2=new THREE.Mesh(new THREE.SphereGeometry(.55,12,10),leaf);c2.position.set(x,.95,z);s.add(c2);for(var f=0;f<4;f++){var fr=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),fruit);var an=Math.random()*6.28;fr.position.set(x+Math.cos(an)*.45,.9+Math.random()*.3,z+Math.sin(an)*.45);s.add(fr)}}
  for(var j=-4;j<=4;j++){tree(j*1.6,-7.2);tree(j*1.6+0.8,-9)}
  for(j=-3;j<=1;j++){tree(-7.4,j*1.7);tree(7.4,j*1.7)}
  function loop(){c.update();r.render(s,cam);requestAnimationFrame(loop)}
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)c.autoRotate=false;
  loop();
  window.addEventListener('resize',function(){W=el.clientWidth;H=el.clientHeight;r.setSize(W,H);cam.aspect=W/H;cam.updateProjectionMatrix()});
  }
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();init()}},{rootMargin:'200px'});io.observe(el)}else init();
})();
