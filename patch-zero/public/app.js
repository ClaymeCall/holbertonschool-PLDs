(function(){
  'use strict';

  const h = React.createElement;

  const NAV = [
    ['liveops','centre','CENTRE LIVEOPS'],
    ['incidents','alert','INCIDENTS'],
    ['traces','trace','TRACES'],
    ['team','agents','ÉQUIPE IA'],
    ['gate','shield','VALIDATION HUMAINE'],
    ['architecture','network','INFRASTRUCTURE']
  ];

  // UI labels only. The actual permissions come from working/governance/tool-permissions.js
  // through /api/bootstrap so the screen reflects the student's code after a check.
  const TOOL_LABELS = {
    read_ticket:'Lire les tickets', read_player:'Lire l’historique joueur',
    read_reports:'Lire les signalements', read_telemetry:'Lire la télémétrie gameplay',
    score_player:'Calculer un score', propose_sanction:'Proposer une sanction',
    read_market:'Lire la marketplace', read_transactions:'Lire les transactions',
    detect_anomaly:'Détecter une anomalie', read_manifest:'Lire le manifeste',
    read_shards:'Lire la santé des shards', propose_rollback:'Proposer un rollback',
    ban_player:'Bannir un compte', rollback_global:'Rollback global', market_write:'Modifier le marché'
  };
  const PERMISSION_VIEW = {
    support:['read_ticket','read_player','ban_player','rollback_global','market_write'],
    anticheat:['read_reports','read_telemetry','score_player','propose_sanction','ban_player','rollback_global'],
    economy:['read_market','read_transactions','detect_anomaly','market_write','rollback_global'],
    release:['read_manifest','read_shards','propose_rollback','rollback_global','market_write']
  };

  function fmt(n){ return new Intl.NumberFormat('fr-FR').format(n); }
  function money(n){ return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n); }
  function cls(){ return Array.prototype.slice.call(arguments).filter(Boolean).join(' '); }
  async function api(url,opts){
    const r=await fetch(url,opts);
    if(!r.ok){
      const raw=await r.text(); let message=raw;
      try{ message=JSON.parse(raw).error||raw; }catch(e){}
      throw new Error(message||('HTTP '+r.status));
    }
    return r.json();
  }

  function Icon({name,size=18}){
    const common={fill:'none',stroke:'currentColor',strokeWidth:'1.8',strokeLinecap:'round',strokeLinejoin:'round'};
    const paths={
      centre:[h('path',{...common,d:'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',key:1})],
      alert:[h('path',{...common,d:'M12 3 2.8 19h18.4L12 3Z',key:1}),h('path',{...common,d:'M12 9v4 M12 17h.01',key:2})],
      trace:[h('path',{...common,d:'M4 18V6m0 6h5m0 0V5m0 7h6m0 0v7m0-7h5',key:1}),h('circle',{...common,cx:4,cy:6,r:1.6,key:2}),h('circle',{...common,cx:9,cy:5,r:1.6,key:3}),h('circle',{...common,cx:15,cy:19,r:1.6,key:4}),h('circle',{...common,cx:20,cy:12,r:1.6,key:5})],
      shield:[h('path',{...common,d:'M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z',key:1}),h('path',{...common,d:'M9 12l2 2 4-5',key:2})],
      agents:[h('circle',{...common,cx:9,cy:8,r:3,key:1}),h('circle',{...common,cx:17,cy:9,r:2.4,key:2}),h('path',{...common,d:'M3.5 20c.5-4 2.6-6 5.5-6s5 2 5.5 6 M14 15c2.8-.5 5.5 1 6.2 4',key:3})],
      network:[h('rect',{...common,x:3,y:4,width:7,height:5,rx:1,key:1}),h('rect',{...common,x:14,y:4,width:7,height:5,rx:1,key:2}),h('rect',{...common,x:8.5,y:15,width:7,height:5,rx:1,key:3}),h('path',{...common,d:'M6.5 9v3h11V9 M12 12v3',key:4})],
      play:[h('path',{...common,d:'m8 5 11 7-11 7V5Z',key:1})],
      check:[h('path',{...common,d:'m5 12 4 4L19 6',key:1})],
      chevron:[h('path',{...common,d:'m9 18 6-6-6-6',key:1})],
      code:[h('path',{...common,d:'m8 9-4 3 4 3 M16 9l4 3-4 3 M14 5l-4 14',key:1})],
      terminal:[h('path',{...common,d:'m4 6 5 5-5 5 M11 18h9',key:1})],
      clock:[h('circle',{...common,cx:12,cy:12,r:9,key:1}),h('path',{...common,d:'M12 7v5l3 2',key:2})],
      lock:[h('rect',{...common,x:5,y:10,width:14,height:10,rx:2,key:1}),h('path',{...common,d:'M8 10V7a4 4 0 0 1 8 0v3',key:2})],
      eye:[h('path',{...common,d:'M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z',key:1}),h('circle',{...common,cx:12,cy:12,r:2.7,key:2})],
      cpu:[h('rect',{...common,x:7,y:7,width:10,height:10,rx:2,key:1}),h('path',{...common,d:'M9 2v3 M15 2v3 M9 19v3 M15 19v3 M2 9h3 M2 15h3 M19 9h3 M19 15h3',key:2})],
      users:[h('circle',{...common,cx:9,cy:8,r:3,key:1}),h('path',{...common,d:'M3 20c.5-4 2.6-6 6-6s5.5 2 6 6',key:2}),h('path',{...common,d:'M16 5.5a3 3 0 0 1 0 5.5 M17 14c2.3.4 3.7 2 4 5',key:3})],
      coin:[h('ellipse',{...common,cx:12,cy:7,rx:7,ry:3,key:1}),h('path',{...common,d:'M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7 M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5',key:2})]
    };
    return h('svg',{viewBox:'0 0 24 24',width:size,height:size,'aria-hidden':'true'},...(paths[name]||paths.centre));
  }

  function MiniBadge({children,tone='neutral'}){return h('span',{className:'mini-badge '+tone},children)}
  function Divider(){return h('div',{className:'soft-divider'})}

  class Intro extends React.Component {
    constructor(props){super(props);this.state={step:0};this.timers=[];}
    componentDidMount(){
      this.timers=[
        setTimeout(()=>this.setState({step:1}),450),
        setTimeout(()=>this.setState({step:2}),1000),
        setTimeout(()=>this.setState({step:3}),1600)
      ];
    }
    componentWillUnmount(){this.timers.forEach(clearTimeout);}
    render(){
      const {onEnter,data}=this.props, step=this.state.step;
      return h('div',{className:'intro-screen'},
        h('div',{className:'intro-stars'}),
        h('div',{className:'intro-orbit orbit-a'}),h('div',{className:'intro-orbit orbit-b'}),
        h('div',{className:'intro-grid'}),
        h('div',{className:'intro-content'},
          h('div',{className:cls('intro-kicker',step>=1&&'show')},'NORTHSTAR STUDIOS · LIVE OPERATIONS'),
          h('div',{className:cls('intro-logo',step>=1&&'show')},'ECLIPSE REALMS'),
          h('div',{className:cls('intro-season',step>=1&&'show')},'SAISON 7 — LIVE'),
          h('div',{className:cls('intro-stats',step>=2&&'show')},
            h('div',null,h('b',null,'248 319'),h('span',null,'joueurs connectés')),
            h('div',null,h('b',null,'12'),h('span',null,'régions actives'))
          ),
          h('h1',{className:cls('intro-title',step>=2&&'show')},'Vous prenez la garde LiveOps.'),
          h('p',{className:cls('intro-copy',step>=2&&'show')},'Les agents IA opèrent déjà en production. Votre mission n’est pas de les construire : c’est d’empêcher qu’ils prennent de mauvaises décisions quand le système commence à dériver.'),
          h('div',{className:cls('intro-statuses',step>=3&&'show')},
            h('span',null,h('i',{className:'status-dot ok'}),'Build 7.4.2'),
            h('span',null,h('i',{className:'status-dot ok'}),'PATCH//ZERO en ligne'),
            h('span',null,h('i',{className:'status-dot ai'}),data&&data.provider&&data.provider.live?'Lien IA actif':'Mode IA sécurisé')
          ),
          h('button',{className:cls('enter-btn',step>=3&&'show'),onClick:onEnter},h('span',null,'ENTRER DANS LE CENTRE D’OPÉRATIONS'),h(Icon,{name:'chevron',size:18}))
        ),
        h('div',{className:'intro-foot'},'NORTHSTAR STUDIOS · LIVE OPERATIONS · ACCÈS LEAD ENGINEER')
      );
    }
  }

  function Sidebar({view,onView,data}){
    return h('aside',{className:'sidebar'},
      h('div',{className:'side-brand'},
        h('div',{className:'side-emblem'},'PZ'),
        h('div',null,h('div',{className:'side-brand-name'},'PATCH',h('span',null,'//ZERO')),h('div',{className:'side-brand-sub'},'ECLIPSE REALMS'))
      ),
      h('nav',{className:'side-nav'},NAV.map(item=>h('button',{key:item[0],className:cls('side-link',view===item[0]&&'active'),onClick:()=>onView(item[0])},h('span',{className:'side-icon'},h(Icon,{name:item[1],size:18})),h('span',{className:'side-label'},item[2]),view===item[0]&&h('span',{className:'active-line'})))) ,
      h('div',{className:'side-spacer'}),
      h('div',{className:'side-system'},
        h('div',{className:'system-row'},h('i',{className:'status-dot ok'}),h('span',null,'CONTROL PLANE'),h('b',null,'ONLINE')),
        h('div',{className:'system-row'},h('i',{className:'status-dot '+(data.provider.live?'ai':'fixture')}),h('span',null,'LIEN IA'),h('b',null,data.provider.live?'LIVE':'SAFE')),
        h('div',{className:'system-provider'},data.provider.provider.toUpperCase()+' · '+data.provider.model)
      )
    );
  }

  function Header({view,data,clock,onOpenMission}){
    const label=(NAV.find(n=>n[0]===view)||NAV[0])[2];
    const next=data.missions.find(m=>m.tier==='CORE'&&!m.passed);
    return h('header',{className:'app-header'},
      h('div',{className:'header-left'},h('div',{className:'header-section'},label),h('div',{className:'header-sep'}),h('div',{className:'header-season'},h('i',{className:'live-pulse'}),'SAISON 7 · LIVE')),
      h('div',{className:'header-center'},next&&h('button',{className:'next-incident',onClick:()=>onOpenMission(next.id)},h('span',{className:'next-label'},'PROCHAIN INCIDENT'),h('span',{className:'next-id'},next.id),h('span',{className:'next-title'},next.title),h(Icon,{name:'chevron',size:14}))),
      h('div',{className:'header-right'},
        h('div',{className:'header-chip'},'BUILD 7.4.2'),
        h('div',{className:'header-chip'},h(Icon,{name:'clock',size:13}),clock),
        h('div',{className:'operator'},h('span',{className:'operator-avatar'},'LE'),h('span',null,h('b',null,'LEAD ENGINEER'),h('small',null,'Garde LiveOps')))
      )
    );
  }

  function StatusRail({data}){
    const p=data.ops.corePassed, t=data.ops.coreTotal;
    const gauges=[
      ['STABILITÉ',Math.round(data.ops.serverHealth),'ok'],
      ['CONFIANCE',Math.min(98,61+p*6),'cyan'],
      ['BUDGET IA',Math.min(96,68+p*4),'violet'],
      ['GOUVERNANCE',Math.min(100,43+p*9.5),'amber']
    ];
    return h('div',{className:'status-rail'},
      h('div',{className:'rail-progress'},h('span',null,'GARDE LIVEOPS'),h('strong',null,p+' / '+t,' CORE STABILISÉS'),h('div',{className:'rail-bar'},h('i',{style:{width:(p/t*100)+'%'}}))),
      h('div',{className:'rail-gauges'},gauges.map(g=>h('div',{className:'rail-gauge',key:g[0]},h('div',{className:'rail-gauge-top'},h('span',null,g[0]),h('b',{className:g[2]},g[1]+'%')),h('div',{className:'micro-bar'},h('i',{className:g[2],style:{width:g[1]+'%'}})))))
    );
  }

  function Metric({icon,label,value,foot,tone='cyan',trend}){
    return h('div',{className:'metric-card'},
      h('div',{className:'metric-icon '+tone},h(Icon,{name:icon,size:18})),
      h('div',{className:'metric-main'},h('span',{className:'metric-label'},label),h('strong',{className:'metric-value'},value),h('small',{className:'metric-foot'},foot)),
      trend&&h('div',{className:'metric-trend '+(trend[0]>0?'up':'down')},(trend[0]>0?'+':'')+trend[0]+'%',h('small',null,trend[1]))
    );
  }

  function Panel({title,kicker,children,className='',action}){
    return h('section',{className:'panel '+className},
      h('div',{className:'panel-head'},h('div',null,kicker&&h('div',{className:'panel-kicker'},kicker),h('h3',{className:'panel-title'},title)),action||null),
      h('div',{className:'panel-body'},children)
    );
  }

  const SHARD_GEO = {
    'EU-01':[48.8,2.3],'EU-02':[52.5,13.4],'EU-03':[41.9,12.5],
    'US-01':[40.7,-74.0],'US-02':[37.8,-122.4],'AS-01':[35.7,139.7]
  };
  const SHARD_LABEL = {
    'EU-01':'EU-OUEST-01','EU-02':'EU-CENTRE-02','EU-03':'EU-SUD-03',
    'US-01':'US-EST-01','US-02':'US-OUEST-02','AS-01':'ASIE-01'
  };
  function statusFr(s){
    return s==='healthy'?'STABLE':s==='degraded'?'CRITIQUE':'DÉGRADÉ';
  }
  function latLngToVec(THREE, lat, lng, r){
    const phi=(90-lat)*(Math.PI/180), theta=(lng+180)*(Math.PI/180);
    return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
  }

  class WorldAtlas extends React.Component {
    componentDidMount(){
      // Three.js is enhancement, not a hard requirement. Some school laptops, VMs or
      // browsers disable WebGL; in that case the LiveOps screen must stay usable.
      if(window.THREE){
        try { this.startThree(); }
        catch(err){ console.warn('[PATCH//ZERO] WebGL unavailable, Canvas fallback enabled.', err); this.startCanvas(); }
      } else this.startCanvas();
    }
    startThree(){
      const THREE=window.THREE, c=this.canvas;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(40,1,0.1,100);
      const renderer=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});
      renderer.setClearColor(0x000000,0);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
      if(renderer.outputEncoding!==undefined) renderer.outputEncoding=THREE.sRGBEncoding;

      const starsGeo=new THREE.BufferGeometry();
      const starPos=new Float32Array(2400);
      for(let i=0;i<800;i++){
        const r=16+Math.random()*30, phi=Math.acos(2*Math.random()-1), theta=Math.random()*Math.PI*2;
        starPos[i*3]=r*Math.sin(phi)*Math.cos(theta);
        starPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
        starPos[i*3+2]=r*Math.cos(phi);
      }
      starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
      scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({color:0xdde6f2,size:0.04,transparent:true,opacity:0.65})));

      const group=new THREE.Group(); group.rotation.y=0.85; scene.add(group);
      const globeMat=new THREE.MeshPhongMaterial({color:0xffffff,shininess:18,specular:new THREE.Color(0x334466)});
      const globe=new THREE.Mesh(new THREE.SphereGeometry(1,96,64), globeMat);
      group.add(globe);
      const loader=new THREE.TextureLoader();
      loader.load('/vendor/earth/earth.jpg', tex=>{
        if(tex.encoding!==undefined) tex.encoding=THREE.sRGBEncoding;
        tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
        globeMat.map=tex; globeMat.needsUpdate=true;
      });
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.08,64,48),
        new THREE.ShaderMaterial({
          vertexShader:'varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
          fragmentShader:'varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0.,0.,1.)),2.2); gl_FragColor=vec4(0.32,0.55,0.95,1.0)*i; }',
          blending:THREE.AdditiveBlending, side:THREE.BackSide, transparent:true, depthWrite:false
        })
      ));
      scene.add(new THREE.AmbientLight(0x1a2433,0.6));
      const sun=new THREE.DirectionalLight(0xfff2e0,1.55); sun.position.set(4.2,1.2,2.6); scene.add(sun);
      const fill=new THREE.DirectionalLight(0x4a6a9a,0.3); fill.position.set(-3,-0.5,-2); scene.add(fill);

      const markers=[];
      (this.props.shards||[]).forEach(s=>{
        const ll=SHARD_GEO[s.id]||[20,0];
        const pos=latLngToVec(THREE, ll[0], ll[1], 1.02);
        const color=s.status==='healthy'?0x59e4a4:s.status==='degraded'?0xff667b:0xffc65e;
        const pin=new THREE.Mesh(new THREE.SphereGeometry(0.018,16,12), new THREE.MeshBasicMaterial({color}));
        pin.position.copy(pos); group.add(pin);
        const halo=new THREE.Mesh(new THREE.SphereGeometry(0.036,16,12), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.28}));
        halo.position.copy(pos); group.add(halo); markers.push(halo);
      });

      const frame=()=>{
        const rect=c.getBoundingClientRect(); if(!rect.width||!rect.height) return;
        camera.aspect=rect.width/rect.height;
        const fov=(camera.fov*Math.PI)/180;
        const dist=1.55/Math.tan(fov/2)/Math.min(1,camera.aspect);
        camera.position.set(0.02,0.02,dist); camera.lookAt(0,0,0); camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height, false);
      };
      const ro=new ResizeObserver(frame); ro.observe(c.parentElement||c); frame();
      let raf=0;
      const draw=()=>{
        group.rotation.y+=0.0009;
        markers.forEach((m,i)=>{ const p=0.9+Math.sin(performance.now()*0.002+i)*0.18; m.scale.setScalar(p); });
        renderer.render(scene,camera); raf=requestAnimationFrame(draw);
      };
      draw();
      this.stop=()=>{ cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
    }
    startCanvas(){
      const c=this.canvas, ctx=c.getContext('2d'), img=new Image();
      if(!ctx){ console.warn('[PATCH//ZERO] Canvas 2D unavailable: atlas disabled.'); return; }
      img.src='/vendor/earth/earth.jpg';
      let raf,t=0, DPR=Math.min(2,window.devicePixelRatio||1);
      const draw=()=>{
        const rect=c.getBoundingClientRect();
        if(c.width!==rect.width*DPR){ c.width=rect.width*DPR; c.height=rect.height*DPR; }
        ctx.setTransform(DPR,0,0,DPR,0,0);
        const w=rect.width, hg=rect.height; ctx.clearRect(0,0,w,hg); t+=0.004;
        const cx=w*0.5, cy=hg*0.5, R=Math.min(w,hg)*0.38;
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle='#0b1c38'; ctx.fill();
        if(img.complete&&img.naturalWidth){
          ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
          const shift=(t*40)%img.naturalWidth; ctx.drawImage(img, cx-R-shift, cy-R, R*2, R*2); ctx.restore();
        }
        raf=requestAnimationFrame(draw);
      };
      draw(); this.stop=()=>cancelAnimationFrame(raf);
    }
    componentWillUnmount(){ this.stop&&this.stop(); }
    render(){
      const shards=this.props.shards||[];
      return h('div',{className:'atlas-wrap',ref:el=>{this.wrap=el}},
        h('canvas',{ref:el=>{this.canvas=el},className:'atlas-canvas'}),
        h('div',{className:'atlas-overlay'},
          h('div',{className:'atlas-title'},'ECLIPSE REALMS · ATLAS DES SHARDS'),
          h('div',{className:'atlas-legend'},
            h('span',null,h('i',{className:'legend-dot healthy'}),'STABLE'),
            h('span',null,h('i',{className:'legend-dot warn'}),'DÉGRADÉ'),
            h('span',null,h('i',{className:'legend-dot bad'}),'CRITIQUE')
          )
        ),
        h('div',{className:'atlas-bottom'}, shards.map(s=>
          h('div',{className:'shard-chip '+(s.status!=='healthy'?'warn':''),key:s.id},
            h('span',null,SHARD_LABEL[s.id]||s.id),
            h('b',null,s.load+'%'),
            h('small',null,statusFr(s.status))
          )
        ))
      );
    }
  }

  function OpsFeed({events}){
    return h('div',{className:'ops-feed'},events.slice(0,7).map((e,i)=>h('div',{className:'feed-row '+(e.tone||'ok'),key:e.id||i},
      h('div',{className:'feed-time'},e.time||'--:--:--'),
      h('div',{className:'feed-beacon'}),
      h('div',{className:'feed-copy'},h('b',null,e.title),h('span',null,e.detail))
    )));
  }

  function LiveOps({data,events,onView,onMission}){
    const next=data.missions.find(m=>m.tier==='CORE'&&!m.passed);
    const agentActivity=[['PLAYER SUPPORT',1248,72,'support'],['ANTI-CHEAT',318,48,'anticheat'],['ECONOMY WATCH',102,28,'economy'],['RELEASE GUARD',24,18,'release']];
    const health=[
      ['Stabilité',Math.round(data.ops.serverHealth),'stable'],
      ['Confiance IA',Math.min(98,61+data.ops.corePassed*6),'confidence'],
      ['Budget restant',Math.min(96,68+data.ops.corePassed*4),'budget'],
      ['Gouvernance',Math.min(100,43+data.ops.corePassed*9.5),'governance']
    ];
    const healthCards=health.map(x=>h('div',{className:'health-item',key:x[0]},
      h('div',{className:'health-ring',style:{'--p':x[1]+'%'}},h('b',null,x[1]+'%')),
      h('span',null,x[0])
    ));
    const activityRows=agentActivity.map(a=>h('div',{className:'activity-row',key:a[0]},
      h('div',{className:'activity-name'},h('i',{className:'agent-dot '+a[3]}),a[0]),
      h('div',{className:'activity-bar'},h('i',{style:{width:a[2]+'%'}})),
      h('b',null,fmt(a[1]))
    ));
    return h('div',{className:'page page-liveops'},
      h('div',{className:'page-hero compact'},
        h('div',null,
          h('div',{className:'eyebrow'},'CENTRE D’OPÉRATIONS · SAISON 7'),
          h('h1',null,'Le jeu est en ligne. ',h('span',null,'Les agents aussi.')),
          h('p',null,'Vous supervisez un MMO en production. Surveillez les shards, les décisions IA, le budget et les actions à fort impact avant qu’un incident ne touche les joueurs.')
        ),
        h('div',{className:'hero-live'},h('i',{className:'live-pulse'}),h('span',null,'GARDE ACTIVE'),h('strong',null,'14:00 → 17:00'))
      ),
      h('div',{className:'metrics-row'},
        h(Metric,{icon:'users',label:'JOUEURS CONNECTÉS',value:fmt(data.ops.playersOnline),foot:'pic Saison 7 · +2,7 %',tone:'cyan',trend:[2.7,'5 min']}),
        h(Metric,{icon:'cpu',label:'SANTÉ SERVEURS',value:data.ops.serverHealth+'%',foot:'12 régions · 6 shards majeurs',tone:'green'}),
        h(Metric,{icon:'coin',label:'COÛT IA DE LA GARDE',value:money(data.ops.aiCost),foot:'budget opérationnel · temps réel',tone:'violet'}),
        h(Metric,{icon:'alert',label:'INCIDENTS CORE',value:data.ops.openIncidents+' ouverts',foot:data.ops.corePassed+' / '+data.ops.coreTotal+' stabilisés',tone:data.ops.openIncidents?'red':'green'})
      ),
      h('div',{className:'command-grid'},
        h(Panel,{title:'Carte des shards',kicker:'ÉTAT MONDE · TEMPS RÉEL',className:'atlas-panel'},h(WorldAtlas,{shards:data.ops.shards})),
        h(Panel,{title:'Flux opérationnel',kicker:'LIVE FEED',className:'feed-panel',action:h('span',{className:'stream-live'},h('i',{className:'live-pulse'}),'LIVE')},h(OpsFeed,{events}))
      ),
      next&&h('button',{className:'incident-banner',onClick:()=>onMission(next.id)},
        h('div',{className:'incident-banner-sev'},next.severity),
        h('div',{className:'incident-banner-copy'},h('span',null,'INCIDENT ACTIF · '+next.time),h('strong',null,next.title),h('p',null,next.subtitle)),
        h('div',{className:'incident-banner-action'},'OUVRIR L’INCIDENT',h(Icon,{name:'chevron',size:16}))
      ),
      h('div',{className:'lower-grid'},
        h(Panel,{title:'Santé LiveOps',kicker:'SYSTÈME'},h('div',{className:'health-grid'},healthCards)),
        h(Panel,{title:'Activité des agents',kicker:'DERNIÈRES 10 MIN'},h('div',{className:'agent-activity'},activityRows))
      )
    );
  }

  function MissionList({missions,selected,onSelect,corePassed,coreTotal}){
    const core=missions.filter(m=>m.tier==='CORE'),bonus=missions.filter(m=>m.tier==='BONUS'),locked=corePassed<coreTotal;
    function row(m){return h('button',{className:cls('mission-nav-row',selected===m.id&&'active',m.passed&&'passed'),key:m.id,onClick:()=>onSelect(m.id)},
      h('span',{className:'mission-nav-state'},m.passed?h(Icon,{name:'check',size:12}):m.severity),
      h('span',{className:'mission-nav-copy'},h('small',null,m.id+' · '+m.time),h('b',null,m.title),h('em',null,m.agent)),
      h(Icon,{name:'chevron',size:14})
    )}
    return h('div',{className:'mission-nav'},
      h('div',{className:'mission-nav-head'},h('span',null,'INCIDENTS CORE'),h('b',null,corePassed+' / '+coreTotal)),core.map(row),
      h('div',{className:'mission-nav-head bonus'},h('span',null,'INCIDENTS BONUS'),locked&&h(MiniBadge,{tone:'locked'},h(Icon,{name:'lock',size:11}),' VERROUILLÉS')),
      locked?h('div',{className:'locked-copy'},'Stabilisez les 6 incidents CORE pour débloquer les scénarios avancés.'):bonus.map(row)
    );
  }

  function Replay({evidence,replayKey}){
    if(!evidence)return h('div',{className:'replay-empty'},h(Icon,{name:'play',size:20}),h('b',null,'Aucune preuve chargée'),h('span',null,'Lancez le replay pour rejouer le comportement actuel du système.'));
    const rows=evidence.timeline||[];
    return h('div',{className:'replay-view',key:replayKey},
      h('div',{className:'replay-top'},
        h('div',{className:'replay-state '+(evidence.passed?'pass':'fail')},h('i'),evidence.passed?'COMPORTEMENT STABLE':'PROBLÈME REPRODUIT'),
        evidence.metric&&h('div',{className:'replay-metric'},h('small',null,evidence.metric.label),h('strong',null,fmt(evidence.metric.value),evidence.metric.unit||''))
      ),
      h('div',{className:'replay-flow'},rows.slice(0,10).map((r,i)=>h('div',{className:'replay-step',key:i,style:{animationDelay:(i*.11)+'s'}},h('div',{className:'replay-index'},String(i+1).padStart(2,'0')),h('div',{className:'replay-line'},h('i')),h('div',{className:'replay-step-copy'},h('b',null,r.label),h('span',null,r.value))))),
      h('div',{className:'replay-compare'},
        h('div',{className:'compare-card observed'},h('span',null,'OBSERVÉ'),h('code',null,evidence.observed)),
        h('div',{className:'compare-arrow'},'→'),
        h('div',{className:'compare-card expected'},h('span',null,'ATTENDU'),h('code',null,evidence.expected))
      ),
      evidence.detail&&h('div',{className:'replay-detail'},evidence.detail)
    );
  }


  const MISSION_SCENES = {
    'PX-101': {
      kind:'context',
      confidence:99,
      risk:'Fuite de contexte joueur',
      impacted:'2 confirmés',
      left:{id:'TICKET #4418',player:'Ragnar89',guild:'Night Owls'},
      right:{id:'TICKET #8832',player:'Luma',guild:'??????'},
      note:'L’agent est très sûr de lui… et pourtant il se trompe.'
    },
    'PX-102': {
      kind:'loop',
      confidence:74,
      risk:'Boucle multi-agent sans arrêt',
      impacted:'Budget IA · tokens',
      note:'ANTI-CHEAT et REVIEWER se renvoient la décision sans jamais s’arrêter.'
    },
    'PX-105': {
      kind:'gate',
      confidence:71,
      risk:'Rollback global autonome',
      impacted:'248 319 joueurs',
      note:'Une recommandation n’est jamais une autorisation.'
    }
  };

  function MissionScene({mission}){
    const scene=MISSION_SCENES[mission.id];
    if(!scene) return null;
    if(scene.kind==='context'){
      return h('div',{className:'mission-scene'},
        h('div',{className:'scene-flow'},
          h('div',{className:'scene-ticket'},
            h('small',null,scene.left.id),
            h('b',null,'Player: '+scene.left.player),
            h('span',null,'Guild: '+scene.left.guild)
          ),
          h('div',{className:'scene-arrow'},h('span',null,'contexte résiduel'),h('i',null,'↓')),
          h('div',{className:'scene-ticket hot'},
            h('small',null,scene.right.id),
            h('b',null,'Player: '+scene.right.player),
            h('span',null,'Guild: '+scene.right.guild)
          )
        ),
        h('aside',{className:'scene-meta'},
          h('div',null,h('span',null,'RISQUE'),h('b',null,scene.risk)),
          h('div',null,h('span',null,'JOUEURS IMPACTÉS'),h('b',null,scene.impacted)),
          h('div',null,h('span',null,'AGENT'),h('b',null,mission.agent)),
          h('div',{className:'scene-confidence'},h('span',null,'CONFIANCE'),h('b',null,scene.confidence+' %'),h('small',null,scene.note))
        )
      );
    }
    return h('div',{className:'mission-scene compact'},
      h('div',{className:'scene-meta wide'},
        h('div',null,h('span',null,'RISQUE'),h('b',null,scene.risk)),
        h('div',null,h('span',null,'IMPACT'),h('b',null,scene.impacted)),
        h('div',null,h('span',null,'AGENT'),h('b',null,mission.agent)),
        h('div',{className:'scene-confidence'},h('span',null,'CONFIANCE'),h('b',null,scene.confidence+' %'),h('small',null,scene.note))
      )
    );
  }

  class MissionDetail extends React.Component {
    constructor(props){super(props);this.state={evidence:null,hints:[],busy:false,replayKey:0,copied:false,error:null};this.replay=this.replay.bind(this);this.check=this.check.bind(this);this.hint=this.hint.bind(this);this.copy=this.copy.bind(this);}
    componentDidUpdate(prev){if(prev.mission.id!==this.props.mission.id)this.setState({evidence:null,hints:[],replayKey:0,copied:false,error:null});}
    async replay(){this.setState({busy:true,error:null});try{const evidence=await api('/api/evidence/'+this.props.mission.id);this.setState(s=>({evidence,replayKey:s.replayKey+1}));}catch(e){this.setState({error:e.message});}finally{this.setState({busy:false});}}
    async check(){this.setState({busy:true,error:null});try{const r=await api('/api/check/'+this.props.mission.id,{method:'POST'});const evidence=await api('/api/evidence/'+this.props.mission.id);this.setState(s=>({evidence,replayKey:s.replayKey+1}));await this.props.onRefresh();return r;}catch(e){this.setState({error:e.message});}finally{this.setState({busy:false});}}
    async hint(){const lvl=Math.min(3,this.state.hints.length+1);if(lvl<=this.state.hints.length)return;try{const r=await api('/api/hint/'+this.props.mission.id+'/'+lvl);this.setState(s=>({hints:s.hints.concat(r.text),error:null}));}catch(e){this.setState({error:e.message});}}
    copy(){const m=this.props.mission;navigator.clipboard&&navigator.clipboard.writeText(m.startFile);this.setState({copied:true});setTimeout(()=>this.setState({copied:false}),1200);}
    render(){const mission=this.props.mission,{evidence,hints,busy,replayKey,copied,error}=this.state;return h('article',{className:'mission-detail'},
      h('div',{className:'mission-hero'},h('div',{className:'mission-hero-main'},h('div',{className:'mission-meta'},h(MiniBadge,{tone:mission.severity==='SEV-0'||mission.severity==='SEV-1'?'danger':'warn'},mission.severity),h(MiniBadge,{tone:mission.tier==='CORE'?'core':'bonus'},mission.tier),h('span',null,mission.time+' · '+mission.agent)),h('div',{className:'mission-code'},mission.id),h('h1',null,mission.title),h('p',{className:'mission-sub'},mission.subtitle)),h('div',{className:'mission-agent-seal'},h('span',null,'AGENT'),h('b',null,mission.agent),h('small',null,'ECLIPSE REALMS LIVEOPS'))),
      h('section',{className:'story-section'},h('div',{className:'story-index'},'01'),h('div',{className:'story-content'},h('span',{className:'section-kicker'},'CE QUI SE PASSE'),h('p',null,mission.story),h('div',{className:'impact-line'},h('b',null,'IMPACT'),h('span',null,mission.impact)))),
      h(MissionScene,{mission}),
      h('section',{className:'mission-work'},h('div',{className:'work-main'},h('span',{className:'section-kicker'},'VOTRE MISSION'),h('h2',null,mission.goal),h('div',{className:'start-here'},h('div',{className:'start-icon'},h(Icon,{name:'code',size:20})),h('div',null,h('span',null,'COMMENCEZ ICI'),h('code',null,mission.startFile)),h('button',{onClick:this.copy},copied?'COPIÉ':'COPIER')),h('div',{className:'look-here'},h('b',null,'CE QUE VOUS DEVEZ OBSERVER'),h('p',null,mission.lookAt))),h('div',{className:'work-side'},h('div',{className:'concept-card'},h('span',null,'NOTION DE LA SEMAINE'),h('b',null,mission.concept),h('p',null,mission.weekLink)),h('div',{className:'done-card'},h(Icon,{name:'check',size:17}),h('div',null,h('span',null,'TERMINÉ QUAND'),h('b',null,mission.doneWhen))))),
      h('section',{className:'replay-section'},h('div',{className:'replay-section-head'},h('div',null,h('span',{className:'section-kicker'},'PREUVE VISUELLE'),h('h2',null,'Rejouez l’incident avant de corriger.')),h('div',{className:'mission-actions'},h('button',{className:'btn ghost',disabled:busy,onClick:this.replay},h(Icon,{name:'play',size:14}),busy?'REPLAY…':'REJOUER L’INCIDENT'),h('button',{className:'btn primary',disabled:busy,onClick:this.check},h(Icon,{name:'check',size:14}),'LANCER LE CONTRÔLE')),error&&h('div',{className:'student-code-error'},h(Icon,{name:'alert',size:18}),h('div',null,h('b',null,'Le fichier étudiant ne peut pas être exécuté.'),h('span',null,error),h('small',null,'Corrigez d’abord l’erreur de syntaxe/runtime dans le fichier indiqué par COMMENCEZ ICI, puis relancez le Replay.'))),h(Replay,{evidence,replayKey})),
      h('section',{className:'hint-section'},h('div',null,h('span',{className:'section-kicker'},'BESOIN D’UN COUP DE POUCE ?'),h('p',null,'Les indices deviennent progressivement plus précis. Utilisez-les seulement si vous êtes réellement bloqué.')),h('div',{className:'hint-actions'},h('button',{className:'btn subtle',disabled:hints.length>=3,onClick:this.hint},'AFFICHER INDICE '+Math.min(3,hints.length+1)+' / 3')),hints.map((x,i)=>h('div',{className:'hint-row',key:i},h('span',null,'INDICE '+(i+1)),h('p',null,x)))))
    );}
  }

  class Incidents extends React.Component {
    constructor(props){super(props);const first=props.data.missions.find(m=>m.tier==='CORE'&&!m.passed)||props.data.missions[0];this.state={selected:props.initialId||first.id};}
    componentDidUpdate(prev){if(this.props.initialId&&prev.initialId!==this.props.initialId)this.setState({selected:this.props.initialId});}
    render(){const {data,onRefresh}=this.props,firstOpen=data.missions.find(m=>m.tier==='CORE'&&!m.passed)||data.missions[0],selected=this.state.selected,mission=data.missions.find(m=>m.id===selected)||firstOpen;return h('div',{className:'page incidents-page'},h('div',{className:'page-hero incident-head'},h('div',null,h('div',{className:'eyebrow'},'RÉPONSE AUX INCIDENTS'),h('h1',null,'On ne corrige pas à l’aveugle.'),h('p',null,'Comprenez le symptôme, rejouez la preuve, ouvrez le fichier indiqué, corrigez puis vérifiez. Vous ne devez jamais chercher au hasard dans tout le projet.'))),h('div',{className:'incident-workspace'},h(MissionList,{missions:data.missions,selected,onSelect:id=>this.setState({selected:id}),corePassed:data.ops.corePassed,coreTotal:data.ops.coreTotal}),h(MissionDetail,{mission,onRefresh})));}
  }

  function TraceTree({trace}){
    let spans=[];
    if(trace.agent==='ANTI-CHEAT' && trace.status==='warning'){
      spans=[['ROUTER','12 ms','ok',0],['ANTI-CHEAT','488 ms','warn',1],['REVIEWER','612 ms','warn',2],['ANTI-CHEAT · TOUR 2','521 ms','warn',3],['REVIEWER · TOUR 2','603 ms','warn',4],['ANTI-CHEAT · TOUR 3','504 ms','danger',5]];
    }else if(trace.status==='incomplete'){
      spans=[['ROUTER','11 ms','ok',0],['ECONOMY WATCH','921 ms','danger',1],['TRACE EXPORT','champs manquants','danger',2]];
    }else{
      spans=[['ROUTER','9 ms','ok',0],[trace.agent,trace.latency+' ms','ok',1],['POST-HOOK','14 ms','ok',2]];
    }
    return h('div',{className:'trace-tree'},spans.map((s,i)=>h('div',{className:'trace-span '+s[2],style:{marginLeft:(s[3]*34)+'px'},key:i},h('i',{className:'trace-node'}),h('div',null,h('b',null,s[0]),h('span',null,s[1])),h('small',null,i===0?'SPAN RACINE':'ENFANT'))));
  }

  class Traces extends React.Component {
    constructor(props){super(props);this.state={id:(props.data.traces[3]&&props.data.traces[3].id)||props.data.traces[0].id};}
    render(){const data=this.props.data,id=this.state.id,trace=data.traces.find(t=>t.id===id)||data.traces[0],tokens=trace.tokens||0,cost=(tokens*0.000018).toFixed(3);return h('div',{className:'page'},
      h('div',{className:'page-hero compact'},h('div',null,h('div',{className:'eyebrow'},'OBSERVABILITÉ COGNITIVE'),h('h1',null,'Ne regardez pas seulement si le serveur répond.'),h('p',null,'Une réponse HTTP 200 peut cacher une décision catastrophique. Ici vous inspectez le chemin exact, les spans, la latence, les tokens et les décisions produites par les agents.'))),
      h('div',{className:'trace-workspace'},
        h('aside',{className:'trace-list-panel'},h('div',{className:'trace-list-head'},h('span',null,'TRACES RÉCENTES'),h('b',null,data.traces.length)),data.traces.map(t=>h('button',{className:cls('trace-list-row',id===t.id&&'active'),onClick:()=>this.setState({id:t.id}),key:t.id},h('i',{className:'trace-health '+t.status}),h('div',null,h('small',null,t.time+' · '+t.id),h('b',null,t.agent),h('span',null,(t.tokens?fmt(t.tokens)+' tokens':'télémétrie incomplète'))),h(Icon,{name:'chevron',size:13})))),
        h('section',{className:'trace-detail'},h('div',{className:'trace-detail-head'},h('div',null,h('span',{className:'section-kicker'},'TRACE '+trace.id),h('h2',null,trace.agent),h('p',null,trace.status==='warning'?'Le workflow continue de rebondir entre les agents. La requête fonctionne, mais l’architecture ne sait pas s’arrêter.':trace.status==='incomplete'?'L’exécution a réussi, mais il manque assez de télémétrie pour rendre la décision réellement auditable.':'La trace suit un chemin attendu et exploitable.')),h(MiniBadge,{tone:trace.status==='ok'?'pass':'danger'},trace.status.toUpperCase())),h('div',{className:'trace-stats'},h('div',null,h('span',null,'MODÈLE'),h('b',null,trace.model)),h('div',null,h('span',null,'LATENCE'),h('b',null,trace.latency+' ms')),h('div',null,h('span',null,'TOKENS'),h('b',null,trace.tokens?fmt(trace.tokens):'—')),h('div',null,h('span',null,'COÛT EST.'),h('b',null,trace.tokens?cost+' €':'—'))),h('div',{className:'trace-canvas'},h('div',{className:'trace-axis'},'DÉBUT'),h(TraceTree,{trace}),h('div',{className:'trace-axis end'},'FIN')),trace.agent==='ANTI-CHEAT'&&trace.status==='warning'&&h('div',{className:'trace-warning'},h(Icon,{name:'alert',size:18}),h('div',null,h('b',null,'Boucle agentique détectée'),h('span',null,'ANTI-CHEAT et REVIEWER se renvoient la décision. Aucune erreur serveur : le risque est économique et opérationnel.'))))
      )
    );}
  }

  class HumanGate extends React.Component {
    constructor(props){super(props);this.state={decision:null};}
    render(){const {data,onOpenMission}=this.props,a=data.approvals[0],safe=a.status==='awaiting-human',decision=this.state.decision;return h('div',{className:'page gate-page'},
      h('div',{className:'page-hero gate-head'},h('div',null,h('div',{className:'eyebrow danger-text'},'GOUVERNANCE · ACTION À FORT IMPACT'),h('h1',null,safe?'L’IA propose. L’humain décide.':'Le garde-fou est contourné.'),h('p',null,safe?'RELEASE GUARD a préparé une action globale. Le système est maintenant capable de suspendre l’exécution jusqu’à une décision humaine explicite.':'RELEASE GUARD recommande un rollback global et la politique actuelle traite cette recommandation comme une autorisation. C’est précisément ce que vous devez empêcher.'))),
      h('div',{className:'gate-stage '+(safe?'safe':'unsafe')},h('div',{className:'gate-glow'}),h('div',{className:'gate-titlebar'},h('span',null,h('i',{className:'gate-beacon'}),safe?'VALIDATION HUMAINE REQUISE':'ACTION CRITIQUE NON BLOQUÉE'),h('strong',null,a.id)),h('div',{className:'gate-content'},h('div',{className:'gate-left'},h('div',{className:'gate-action-label'},'ACTION PROPOSÉE'),h('h2',null,'ROLLBACK GLOBAL'),h('div',{className:'rollback-path'},h('span',null,'SEASON 7 · 7.4.2'),h('i'),h('span',null,'7.4.1 STABLE')),h('p',null,a.reason),h('div',{className:'gate-impact-grid'},h('div',null,h('span',null,'JOUEURS IMPACTÉS'),h('b',null,fmt(a.playersAffected))),h('div',null,h('span',null,'RÉGIONS'),h('b',null,'12 / 12')),h('div',null,h('span',null,'CONFIANCE AGENT'),h('b',null,Math.round(a.confidence*100)+' %')))),h('div',{className:'gate-right'},h('div',{className:'gate-agent'},h('span',{className:'agent-avatar release'},'RG'),h('div',null,h('small',null,'DEMANDEUR'),h('b',null,a.requestedBy),h('span',null,'Release & mitigation'))),safe?h('div',{className:'human-decision'},h('span',{className:'section-kicker'},'DÉCISION LEAD ENGINEER'),decision?h('div',{className:'decision-result '+decision},h(Icon,{name:decision==='deny'?'shield':'check',size:28}),h('b',null,decision==='deny'?'ROLLBACK REFUSÉ':'ROLLBACK AUTORISÉ · SIMULATION'),h('span',null,'Aucune action réelle n’est exécutée dans le TP.')):h('div',{className:'gate-buttons'},h('button',{className:'gate-deny',onClick:()=>this.setState({decision:'deny'})},'REFUSER'),h('button',{className:'gate-approve',onClick:()=>this.setState({decision:'approve'})},'AUTORISER · SIMULATION'))):h('div',{className:'gate-bypass'},h(Icon,{name:'alert',size:28}),h('b',null,'HUMAN GATE BYPASS'),h('span',null,'Policy actuelle : '+a.policy),h('button',{className:'btn danger',onClick:()=>onOpenMission('PX-105')},'OUVRIR PX-105'))))),
      h('div',{className:'gate-explainer'},h('div',null,h('span',{className:'section-kicker'},'PRINCIPE'),h('h3',null,'Une recommandation n’est jamais une autorisation.'),h('p',null,'Le modèle peut analyser, proposer et préparer l’action. La frontière déterministe décide si l’action peut continuer. Pour un rollback global, cette frontière doit toujours exiger un humain.')),h('div',{className:'gate-flow-mini'},['AGENT','POLICY','HUMAN GATE','EXECUTOR'].map((x,i)=>h('span',{className:'gate-flow-unit',key:x},h('span',{className:i===2?'hot':''},x),i<3&&h('i',null,'→')))))
    );}
  }

  class AgentTeam extends React.Component {
    constructor(props){super(props);this.state={id:(props.data.agents[0]&&props.data.agents[0].id)||'support',input:'Explique ton rôle, ta limite la plus importante et ce que tu ferais si la décision est incertaine.',answer:null,busy:false};this.run=this.run.bind(this);}
    async run(){this.setState({busy:true,answer:null});try{const r=await api('/api/agent/test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({agentId:this.state.id,input:this.state.input})});this.setState({answer:r.out});}catch(e){this.setState({answer:{text:'Erreur : '+e.message,provider:'error'}});}finally{this.setState({busy:false});}}
    render(){const data=this.props.data,{id,input,answer,busy}=this.state,agent=data.agents.find(a=>a.id===id)||data.agents[0],allowed=(data.permissions&&data.permissions[agent.id])||[],perms=(PERMISSION_VIEW[agent.id]||Object.keys(TOOL_LABELS)).map(tool=>[TOOL_LABELS[tool]||tool,allowed.includes(tool)]);return h('div',{className:'page'},
      h('div',{className:'page-hero compact'},h('div',null,h('div',{className:'eyebrow'},'ÉQUIPE IA · RÔLES & LIMITES'),h('h1',null,'Des spécialistes. Pas des super-agents.'),h('p',null,'Chaque agent possède une mission, un contexte et des permissions limitées. C’est cette spécialisation qui rend le système gouvernable et auditable.'))),
      h('div',{className:'agent-team-grid'},h('div',{className:'agent-roster'},data.agents.map(a=>h('button',{className:cls('agent-card',a.id===id&&'active'),onClick:()=>this.setState({id:a.id,answer:null}),key:a.id},h('div',{className:'agent-card-top'},h('span',{className:'agent-avatar '+a.id},a.name.split(' ').map(x=>x[0]).join('').slice(0,2)),h('div',null,h('b',null,a.name),h('span',null,'● ACTIF'))),h('p',null,a.role),h('div',{className:'agent-card-foot'},h('span',null,'BUDGET'),h('b',null,a.id==='anticheat'?'ÉLEVÉ':'NORMAL'))))),h('div',{className:'agent-console'},h('div',{className:'agent-console-head'},h('div',null,h('span',{className:'section-kicker'},'SERVICE AGENTIQUE'),h('h2',null,agent.name),h('p',null,agent.role)),h(MiniBadge,{tone:'pass'},'ACTIF')),h('div',{className:'agent-detail-grid'},h('div',{className:'agent-boundary'},h('span',null,'FRONTIÈRE CRITIQUE'),h('p',null,agent.boundaries)),h('div',{className:'permission-panel'},h('span',{className:'section-kicker'},'AUTORISATIONS'),data.permissionLoadError&&h('div',{className:'permission-error'},'Impossible de lire tool-permissions.js : '+data.permissionLoadError),perms.map((p,i)=>h('div',{className:'perm-row',key:i},h('span',null,p[0]),h('b',{className:p[1]?'yes':'no'},p[1]?'AUTORISÉ':'INTERDIT'))))),h('div',{className:'agent-test'},h('div',{className:'agent-test-head'},h('div',null,h('span',{className:'section-kicker'},'TEST DU RÔLE'),h('h3',null,'Interroger l’agent sans lui donner les clés de la prod.')),h(MiniBadge,{tone:data.provider.live?'core':'neutral'},data.provider.live?'API DISTANTE':'FIXTURE SAFE MODE')),h('textarea',{value:input,onChange:e=>this.setState({input:e.target.value})}),h('button',{className:'btn primary',onClick:this.run,disabled:busy},busy?'EXÉCUTION...':'TESTER LE RÔLE'),answer&&h('div',{className:'agent-answer'},h('div',{className:'answer-meta'},(answer.provider||data.provider.provider).toUpperCase()+' · '+(answer.model||data.provider.model)+(answer.fallback&&answer.requestedProvider?' · FALLBACK DE '+answer.requestedProvider.toUpperCase():'')),answer.warning&&h('div',{className:'permission-error'},answer.warning),h('pre',null,answer.text||answer.output||JSON.stringify(answer,null,2))))))
    );}
  }

  class ArchitectureGraph extends React.Component {
    constructor(props){
      super(props);
      this.state = {paths: [], vb: {w: 1000, h: 620}};
      this.canvasEl = null;
      this.ro = null;
      this.setCanvas = this.setCanvas.bind(this);
      this.rebuild = this.rebuild.bind(this);
    }
    setCanvas(el){
      this.canvasEl = el;
      if (el) requestAnimationFrame(() => requestAnimationFrame(this.rebuild));
    }
    componentDidMount(){
      if (typeof ResizeObserver !== 'undefined' && this.canvasEl) {
        this.ro = new ResizeObserver(this.rebuild);
        this.ro.observe(this.canvasEl);
      }
      window.addEventListener('resize', this.rebuild);
      this.rebuild();
    }
    componentWillUnmount(){
      if (this.ro) this.ro.disconnect();
      window.removeEventListener('resize', this.rebuild);
    }
    rebuild(){
      const canvas = this.canvasEl;
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const cw = Math.max(1, cr.width);
      const ch = Math.max(1, cr.height);
      const byKey = {};
      const els = canvas.querySelectorAll('.arch-node[data-arch]');
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const r = el.getBoundingClientRect();
        byKey[el.getAttribute('data-arch')] = {
          L: r.left - cr.left,
          R: r.right - cr.left,
          cx: r.left - cr.left + r.width / 2,
          cy: r.top - cr.top + r.height / 2,
        };
      }
      const src = byKey.source, pol = byKey.policy, hum = byKey.human;
      const agents = ['support','anticheat','economy','release'].map(function(k){ return byKey[k]; }).filter(Boolean);
      if (!src || !pol || !hum || agents.length < 4) {
        this.setState({vb: {w: cw, h: ch}, paths: []});
        return;
      }
      function curve(x1,y1,x2,y2){
        const mx = x1 + (x2 - x1) * 0.45;
        return 'M '+x1.toFixed(1)+' '+y1.toFixed(1)+' C '+mx.toFixed(1)+' '+y1.toFixed(1)+' '+mx.toFixed(1)+' '+y2.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1);
      }
      const next = agents.map(function(a){ return curve(src.R, src.cy, a.L, a.cy); })
        .concat(agents.map(function(a){ return curve(a.R, a.cy, pol.L, pol.cy); }))
        .concat(['M '+pol.R.toFixed(1)+' '+pol.cy.toFixed(1)+' L '+hum.L.toFixed(1)+' '+hum.cy.toFixed(1)]);
      this.setState({vb: {w: cw, h: ch}, paths: next});
    }
    render(){
      const nodes = [
        {key:'source', cls:'arch-node source', x:14, y:50, small:'ENTRÉE', title:'PLAYER / LIVE EVENT', sub:'Donnée non fiable'},
        {key:'support', cls:'arch-node agent support', x:38, y:14, small:'AGENT', title:'PLAYER SUPPORT', sub:'Tickets & triage'},
        {key:'anticheat', cls:'arch-node agent anticheat', x:38, y:37, small:'AGENT', title:'ANTI-CHEAT', sub:'Détection & score'},
        {key:'economy', cls:'arch-node agent economy', x:38, y:63, small:'AGENT', title:'ECONOMY WATCH', sub:'Marché & monnaie'},
        {key:'release', cls:'arch-node agent release', x:38, y:86, small:'AGENT', title:'RELEASE GUARD', sub:'Build & mitigation'},
        {key:'policy', cls:'arch-node policy', x:64, y:50, small:'FRONTIÈRE', title:'POLICY / REVIEWER', sub:'Contrats · budget · SSOT'},
        {key:'human', cls:'arch-node human', x:88, y:50, small:'HITL', title:'HUMAN GATE', sub:'Autorisation humaine'},
      ];
      const vb = this.state.vb;
      const paths = this.state.paths;
      return h('div',{className:'arch-canvas',ref:this.setCanvas},
        h('svg',{className:'arch-lines',viewBox:'0 0 '+vb.w+' '+vb.h,preserveAspectRatio:'none',width:'100%',height:'100%'},
          h('defs',null,h('marker',{id:'arch-arrow',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto',markerUnits:'userSpaceOnUse'},h('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'rgba(150,190,220,.95)'}))),
          paths.map(function(d,i){ return h('path',{d:d,className:'flow-line',markerEnd:'url(#arch-arrow)',key:i}); })
        ),
        nodes.map(function(n){
          return h('div',{
            key:n.key,
            'data-arch':n.key,
            className:n.cls,
            style:{left:n.x+'%', top:n.y+'%'}
          }, h('small',null,n.small), h('b',null,n.title), h('span',null,n.sub));
        })
      );
    }
  }

  function Architecture({data}){
    return h('div',{className:'page'},
      h('div',{className:'page-hero compact'},h('div',null,h('div',{className:'eyebrow'},'INFRASTRUCTURE · FLUX DE DÉCISION'),h('h1',null,'Le modèle n’est qu’une pièce du système.'),h('p',null,'Le comportement fiable vient des frontières déterministes : routage, budgets, contrats, permissions, Human Gate et tests de régression. Les agents restent probabilistes ; le contrôle ne doit pas l’être.'))),
      h('div',{className:'architecture-layout'},
        h(Panel,{title:'Graphe d’exécution LiveOps',kicker:'FLUX PRINCIPAL',className:'arch-graph-panel'},
          h(ArchitectureGraph,null)
        ),
        h('aside',{className:'arch-side'},
          h(Panel,{title:'Carte du projet',kicker:'ZONE ÉTUDIANTE'},h('div',{className:'path-list'},
            [['working/context/','Isolation du contexte'],['working/orchestration/','Boucles & budgets'],['working/knowledge/','SSOT & runbooks'],['working/observability/','Tracing & redaction'],['working/governance/','Policies & permissions'],['working/evals/','Gates & régressions']].map(function(x){ return h('div',{className:'path-row',key:x[0]},h('code',null,x[0]),h('span',null,x[1])); })
          )),
          h(Panel,{title:'Frontières de confiance',kicker:'À RETENIR'},h('div',{className:'trust-stack'},
            h('div',{className:'trust-row untrusted'},h('span',null,'01'),h('div',null,h('b',null,'Données externes'),h('small',null,'Tickets, logs, réponses modèles'))),
            h('div',{className:'trust-arrow'},'↓'),
            h('div',{className:'trust-row controlled'},h('span',null,'02'),h('div',null,h('b',null,'Contrôles déterministes'),h('small',null,'Contrats, budgets, permissions, SSOT'))),
            h('div',{className:'trust-arrow'},'↓'),
            h('div',{className:'trust-row trusted'},h('span',null,'03'),h('div',null,h('b',null,'Action autorisée'),h('small',null,'Avec Human Gate si impact fort')))
          ))
        )
      )
    );
  }

  class App extends React.Component {
    constructor(props){super(props);const qp=new URLSearchParams(location.search),initialView=NAV.some(n=>n[0]===qp.get('view'))?qp.get('view'):'liveops';let entered=false;try{entered=localStorage.getItem('patchzero-entered')==='1';}catch(e){}this.state={data:null,view:initialView,clock:'',events:[],intro:qp.get('skip')==='1'?false:!entered,missionId:qp.get('mission'),error:null};this.timer=null;this.es=null;this.load=this.load.bind(this);this.enter=this.enter.bind(this);this.openMission=this.openMission.bind(this);this.changeView=this.changeView.bind(this);}
    componentDidMount(){this.load();this.tickClock();this.timer=setInterval(()=>this.tickClock(),1000);try{this.es=new EventSource('/api/events');this.es.addEventListener('ops',ev=>{try{const x=JSON.parse(ev.data);this.setState(s=>({events:[x].concat(s.events).slice(0,12)}));}catch(e){}});}catch(e){}}
    componentWillUnmount(){if(this.timer)clearInterval(this.timer);if(this.es)this.es.close();}
    tickClock(){this.setState({clock:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})});}
    async load(){try{const data=await api('/api/bootstrap');this.setState(s=>({data,error:null,events:s.events.length?s.events:[{id:1,time:'14:00:02',tone:'ok',title:'Saison 7 déployée',detail:'Build 7.4.2 · 12 régions synchronisées'},{id:2,time:'14:01:18',tone:'ai',title:'PLAYER SUPPORT en ligne',detail:'27 tickets actifs · délai médian 42 s'},{id:3,time:'14:02:09',tone:'ok',title:'EU-OUEST-01 stable',detail:'62 481 joueurs · 18 ms · 0,00 % packet loss'}]}));}catch(e){this.setState({error:e.message});}}
    enter(){try{localStorage.setItem('patchzero-entered','1');}catch(e){}this.setState({intro:false});}
    openMission(id){this.setState({missionId:id,view:'incidents'});}
    changeView(view){this.setState({view,missionId:null});}
    render(){const {data,view,clock,events,intro,missionId,error}=this.state;if(error)return h('div',{className:'fatal'},h('b',null,'PATCH//ZERO indisponible'),h('span',null,error),h('button',{onClick:this.load},'RÉESSAYER'));if(!data)return h('div',{className:'boot-loader'},h('div',{className:'boot-mark'},'PZ'),h('b',null,'Connexion au centre LiveOps…'));if(intro)return h(Intro,{onEnter:this.enter,data});let page;if(view==='liveops')page=h(LiveOps,{data,events,onView:this.changeView,onMission:this.openMission});else if(view==='incidents')page=h(Incidents,{data,initialId:missionId,onRefresh:this.load,onView:this.changeView});else if(view==='traces')page=h(Traces,{data});else if(view==='gate')page=h(HumanGate,{data,onOpenMission:this.openMission});else if(view==='team')page=h(AgentTeam,{data});else page=h(Architecture,{data});return h('div',{className:'app-shell'},h(Sidebar,{view,onView:this.changeView,data}),h('div',{className:'app-main'},h(Header,{view,data,clock,onOpenMission:this.openMission}),h(StatusRail,{data}),h('main',{className:'app-content'},page)),data.ops.corePassed===data.ops.coreTotal&&h('div',{className:'core-complete-toast'},h(Icon,{name:'shield',size:18}),h('div',null,h('b',null,'LIVEOPS STABILISÉ'),h('span',null,'Les incidents BONUS sont maintenant disponibles.'))));}
  }

  ReactDOM.render(h(App),document.getElementById('root'));
})();
