// Reletter the shipped UI atlases; cells, silhouettes and hit boxes stay native.
import { translateUI } from './strings-ar.js';
export const ART_COVERAGE = [];
const rules = new Map();
function add(path, rect, label, options = {}) {
  if (!rules.has(path)) rules.set(path, []);
  const key = rect?.join(',') || 'all';
  if (!rules.get(path).some(rule => rule.key === key)) rules.get(path).push({ key, rect, label, ...options });
}
function textGrid(path, xs, ys, width, height, labels, options = {}) {
  ys.forEach((y, row) => xs.forEach((x, col) => add(path, [x,y,width,height], labels[row], { colour:col===0?'#fff':'#7ffaff', glow:col>0, ...options })));
}
function clean(g, [x,y,w,h], mode) {
  if(mode==='soft-fill') {
    const im=g.getImageData(x,y,w,h),src=new Uint8ClampedArray(im.data),d=im.data;
    const sample=(xx,yy,c)=>{let sum=0,count=0;for(let n=-6;n<=6;n++){const a=Math.max(0,Math.min(w-1,xx+n)),b=Math.max(0,Math.min(h-1,yy+n));sum+=src[(yy*w+a)*4+c]+src[(b*w+xx)*4+c];count+=2;}return sum/count;};
    const left=[],right=[],top=[],bottom=[];
    for(let yy=0;yy<h;yy++)for(let c=0;c<3;c++){left[yy*3+c]=sample(0,yy,c);right[yy*3+c]=sample(w-1,yy,c);}
    for(let xx=0;xx<w;xx++)for(let c=0;c<3;c++){top[xx*3+c]=sample(xx,0,c);bottom[xx*3+c]=sample(xx,h-1,c);}
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const blend=Math.min(1,xx/18,(w-1-xx)/18,yy/18,(h-1-yy)/18);
      for(let c=0;c<3;c++){
        const hor=left[yy*3+c]+(right[yy*3+c]-left[yy*3+c])*xx/(w-1),ver=top[xx*3+c]+(bottom[xx*3+c]-top[xx*3+c])*yy/(h-1),i=(yy*w+xx)*4+c;
        d[i]=src[i]*(1-blend)+(hor*.5+ver*.5)*blend;
      }
    }
    g.putImageData(im,x,y);return;
  }
  if(mode==='keep')return;
  if(mode==='black'){g.fillStyle='#000';g.fillRect(x,y,w,h);return;}
  if (mode === 'horizontal') { const im=g.getImageData(x,y,w,h),p=im.data;for(let yy=0;yy<h;yy++)for(let c=0;c<4;c++){const a=p[(yy*w)*4+c],b=p[(yy*w+w-1)*4+c];for(let xx=1;xx<w-1;xx++)p[(yy*w+xx)*4+c]=a+(b-a)*xx/(w-1);}g.putImageData(im,x,y);return;}
  if (mode === 'clear') { g.clearRect(x,y,w,h); return; }
  const data=g.getImageData(x,y,w,h), p=data.data;
  for(let xx=0;xx<w;xx++) for(let c=0;c<4;c++) {
    const top=p[xx*4+c],bottom=p[((h-1)*w+xx)*4+c];
    for(let yy=1;yy<h-1;yy++) p[(yy*w+xx)*4+c]=top+(bottom-top)*yy/(h-1);
  }
  g.putImageData(data,x,y);
}
function ink(g, rect, text, options) {
  const [x,y,w,h]=rect, padding=options.padding??8;
  let size=options.size||Math.min(36,Math.round(h*.53));
  text=translateUI(text);
  g.save();g.font=`400 ${size}px "Tsuki Plex"`;
  const measured=g.measureText(text).width, inset=options.startInset??padding;
  const room=options.textWidth??w;
  const ratio=Math.min(1,(room-inset-padding)/(measured||1));
  // Native left becomes the right edge of the reflected Arabic interface.
  // Keep config labels in their own column instead of centring long words into the controls.
  const centre=options.align==='start'?x+inset+measured*ratio/2:x+w/2;
  g.translate(centre,y+h/2+(options.baseline??size*.28));g.scale(-ratio,1);
  g.direction='rtl';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle=options.colour||'#fff';
  if(options.glow){g.shadowColor='#53ecff';g.shadowBlur=5;}
  if(options.outline){g.strokeStyle='#24385a';g.lineWidth=2;g.lineJoin='round';g.strokeText(text,0,0);}
  g.fillText(text,0,0);g.restore();
  return {text,left:centre-measured*ratio/2,right:centre+measured*ratio/2,top:y,bottom:y+h,scale:ratio};
}
function configure(system) {
  textGrid('TITLE_PARTS_JA/titlemenu.webp',[24,336,648],[24,112,200,288,376],296,72,['لعبة جديدة','تحميل','الإعدادات','المعرض','متابعة'],{erase:'clear',size:34});
  add('TITLE_PARTS_JA/press_start.webp',[0,0,472,88],'اضغط أي زر',{erase:'clear',size:38});
  textGrid('TITLE_PARTS_JA/extra_menu_ja.webp',[8,320],[8,88,168,248,360,440,520,600],296,72,['معرض الصور','مشغّل الموسيقى','مخطط القصة','رجوع','معرض الصور','مشغّل الموسيقى','مخطط القصة','رجوع'],{erase:'clear',size:30});
  textGrid('MENU_PARTS_JA/menu_btn_ja.webp',[24,264,504],[24,128,232,336,440],224,88,['حفظ','تحميل','الإعدادات','مخطط القصة','القائمة الرئيسية'],{erase:'clear',size:32});
  textGrid('GALLERY_PARTS_JA/gallerymenu_btn.webp',[8,272,536],[8,112,216,320,424,528],256,96,['معرض الصور','مشغّل الموسيقى','مخطط القصة','الأفلام','قائمة النهايات','القائمة الرئيسية'],{erase:'clear',size:30});
  for(const pack of ['DIALOG_PARTS_JA','DISP_PARTS_JA']) {
    for(const x of [0,224]) for(const [y,label] of [[0,'نعم'],[67,'لا'],[135,'نعم'],[202,'لا']]) add(`${pack}/dialog_btn_ja.webp`,[x+4,y+2,208,42],label,{erase:'clear',size:30,glow:y>100});
  }
  for(const [id,label] of [[51,'النظام'],[52,'الصوت'],[53,'التحكم'],[54,'استعادة الافتراضي']]) {
    for(const state of system.config.buttons[id].states) for(const part of state) {
      const [a,b,c,d]=part.rect;const inset=id===54?15:4;
      add(`CONF_PARTS_JA/${part.tex}.webp`,[a+inset,b+9,c-a-inset*2,d-b-18],label,{erase:id===54?'shade':'clear',size:28,glow:b>100});
    }
  }
  for(const definition of Object.values(system.config.buttons)) for(const state of definition.states) for(const part of state) {
    if(!['btn_mute','btn_test'].includes(part.tex))continue;
    const [a,b,c,d]=part.rect;
    if(part.tex==='btn_test') {
      // Sample only the plate's interior, and include the original T in the wipe.
      // Its arrow and border occupy the rest of this small native button.
      add('CONF_PARTS_JA/btn_test.webp',[a+38,b+15,c-a-50,d-b-28],'تجربة',{erase:'shade',size:22,padding:1});
    } else add('CONF_PARTS_JA/btn_mute.webp',[a+42,b+7,c-a-52,d-b-14],'كتم',{erase:'clear',size:27});
  }
  const names=['شيكي','آركويد','سِيل','أكيها','هيسوي','كوهاكو','ساتسوكي','أريهيكو','ميو','نويل','البروفيسورة آراخ','سايكي غوتو','أندو','ماريو','كاريوس','فلوف','روا','آوكو','شيكي','آخرون','؟؟؟؟'];
  system.voices.names.forEach((r,i)=>{const[a,b,c,d]=r;if(c<=504&&d<=496)add('CONF_PARTS_JA/conf_name.webp',[a,b,c-a,d-b],names[i]||'؟؟؟؟',{erase:'clear',size:24});});
  for(const y of [78,144,211])add('CONF_PARTS_JA/sound_bg.webp',[1244,y+15,42,35],'٪',{erase:'shade',size:27});
  const backgrounds={
    'CONF_PARTS_JA/sound_bg.webp':[[[36,20,430,35],'إعدادات الصوت'],[[36,86,400,47],'مستوى الموسيقى'],[[36,152,400,49],'مستوى المؤثرات'],[[36,220,400,55],'صوت القوائم']],
    'CONF_PARTS_JA/effect_bg.webp':[[[36,20,430,35],'المؤثرات البصرية'],[[24,76,420,94],'إخفاء النص عند^تبديل الصور']],
    'CONF_PARTS_JA/voice_bg.webp':[[[36,20,430,35],'إعدادات الأصوات'],[[24,80,430,68],'تشغيل أصوات^الشخصيات'],[[24,233,430,100],'إيقاف الصوت عند^متابعة النص']],
    'MENU_PARTS_JA/system_scenebg.webp':[[[980,8,160,27],'ملاحظة']],
    'MENU_PARTS_JA/flow_infobase.webp':[[[40,266,140,18],'ملاحظة']],
    'DISP_PARTS_JA/qload_frame_ja.webp':[[[80,10,230,29],'انتقال سريع']],
  };
  for(const[path,entries]of Object.entries(backgrounds))for(const[rect,label]of entries)add(path,rect,label,{erase:path.includes('flow_infobase')?'horizontal':'shade',size:path.includes('flow_infobase')?14:26,...(path.startsWith('CONF_PARTS_JA/')?{align:'start',textWidth:300,startInset:44-rect[0]}:{})});
  for(const[file,label]of [['movie_title','معرض الأفلام'],['cg_title','معرض الصور'],['music_title','مشغّل الموسيقى'],['ending_title','قائمة النهايات']])add(`GALLERY_PARTS_JA/${file}.webp`,null,label,{erase:'clear',size:42});
  add('MENU_PARTS_JA/flow_info.webp',null,'هذا المشهد',{erase:'shade',size:28});
  add('SAVE_PARTS_JA/savescenelabel.webp',null,'المشهد',{erase:'clear',size:24});
  add('SAVE_PARTS_JA/saveauto.webp',null,'حفظ تلقائي',{erase:'shade',size:26});
  add('DISP_PARTS_JA/back_title_ja.webp',[0,0,400,40],'سجل الحوار',{erase:'clear',size:28});
  for(const y of [8,168])add('DISP_PARTS_JA/back_btn.webp',[20,y+20,250,90],'رجوع',{erase:'clear',size:42});
  for(const[y,label]of [[8,'حفظ تلقائي'],[72,'حفظ سريع'],[136,'الوضع التلقائي'],[200,'تخطٍّ']])add('DISP_PARTS_JA/popup_ja.webp',[12,y+5,390,49],label,{erase:'shade',size:29});
  add('GALLERY_PARTS_JA/music_btnbg.webp',[176,361,110,29],'الوقت',{erase:'shade',size:18});
  add('GALLERY_PARTS_JA/music_btnbg.webp',[170,738,110,28],'الصوت',{erase:'shade',size:18});
  for(const file of ['saveinfobg_arc','saveinfobg_ciel','saveinfobg_unknown']){
    add(`SAVE_PARTS_JA/${file}.webp`,[276,25,176,24],'مسار هذا الحفظ',{erase:'horizontal',size:18});
    add(`SAVE_PARTS_JA/${file}.webp`,[30,488,420,15],'ملاحظة',{erase:'horizontal',size:13});
    if(file!=='saveinfobg_unknown') {
      add(`SAVE_PARTS_JA/${file}.webp`,[32,30,62,416],'',{erase:'shade'});
      add(`SAVE_PARTS_JA/${file}.webp`,[40,452,320,31],file==='saveinfobg_arc'?'مسار آركويد برونستاد':'مسار سِيل',{erase:'shade',size:20,colour:'#162a3a'});
    }
  }
  for(const[file,label]of [['ending_icon_Arcueid','أميرة القمر^نهاية آركويد'],['ending_icon_Ciel_1','قَوْسُ قُزَحَ تَحْتَ جُنْحِ اللَّيْلِ^نهاية سِيل العادية'],['ending_icon_Ciel_2','زُرْقَةُ النَّهَارِ^نهاية سِيل الحقيقية']]){
    add(`GALLERY_PARTS_JA/${file}.webp`,[32,205,368,150],label,{erase:'keep',patches:[[30,180,372,230]],size:28,outline:true});
  }
  add('GALLERY_PARTS_JA/music_btnbg.webp',[232,778,35,32],'٪',{erase:'shade',size:24});
  add('CONF_PARTS_JA/voice_bg.webp',[1244,418,42,35],'٪',{erase:'shade',size:27});
  const helpers=['رجوع','اختيار','تحريك','إلغاء','تشغيل','تغيير','إعادة ضبط','حفظ','تحميل','تسجيل الصوت','إعادة تشغيل الصوت','انتقال سريع','تحريك المؤشر','تغيير الصفحة','تغيير الشخصية','متواصل','حذف','اضغط مطولًا للاستمرار','نسخ البيانات','حذف البيانات','تغيير المقطع','إيقاف','تغيير التكرار','تبديل الصورة','تغيير الحجم','تحريك','تمرير'];
  system.help.labels.forEach((r,i)=>{const[a,b,c,d]=r;add('DISP_PARTS_JA/help_txt_ja.webp',[a,b,c-a,d-b],helpers[i],{erase:'clear',size:22,padding:0});});
  const manual=['تأكيد ومتابعة النص','إلغاء وإيقاف التخطي','قائمة النظام','سجل الحوار','شريط التحكم','متابعة النص وإغلاق الشريط','تشغيل التخطي أو إيقافه','تشغيل التلقائي أو إيقافه','تسريع','رجوع سريع'];
  manual.forEach((label,i)=>add('CONF_PARTS_JA/conf_manual0_ja.webp',[24,53+i*64,890,56],label,{erase:'shade',size:34}));
  for(let n=0;n<22;n++)for(const y of [8,296])add('GALLERY_PARTS_JA/ending_badend.webp',[180*(n%8)+90,96*Math.floor(n/8)+y+14,98,70],`النهاية^السيئة^${String(n+1).padStart(2,'0')}`,{erase:'clear',size:22,padding:5,colour:y===8?'#294453':'#fff'});

  const fiction='هذا عمل خيالي، وأي تشابه مع أشخاص حقيقيين، أحياءً أو أمواتًا،^أو مع أحداث واقعية هو محض مصادفة.^تتضمن اللعبة صورًا قد تكون مزعجة أو صادمة.';
  const copyright='هذا عمل محمي بحقوق النشر. باستخدامك هذه النسخة المعدّلة،^تؤكد أنك اشتريت نسخة أصلية من اللعبة بصورة قانونية.^يُرجى دعم المبدعين الأصليين.';
  for(const pack of ['TITLE_PARTS_JA','PARTS']) {
    add(`${pack}/caution_UpRGB__scale__x1_500000_.webp`,[180,440,1560,230],fiction,{erase:'black',size:35});
    add(`${pack}/caution1_1920x1080.webp`,[180,440,1560,200],copyright,{erase:'black',size:35});
  }
  add('PARTS/caution2_1920x1080.webp',[180,390,1560,350],fiction+'^'+copyright,{erase:'black',size:34});

  for(const pack of ['DIALOG_PARTS_JA','DISP_PARTS_JA']) {
    add(`${pack}/dialog_win.webp`,[340,351,145,30],'تسوكيهيمي^قطعة من القمر الزجاجي الأزرق',{erase:'clear',size:9,colour:'#b5b58a'});
  }

}
function load(path,baseURL){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error(path));img.src=baseURL+path;});}
export async function buildArabicArt({baseURL='/__original/assets/ui/'}={}) {
  const system=await(await fetch('/assets/system.json')).json();configure(system);
  await document.fonts.load('400 32px "Tsuki Plex"','الإعدادات');
  const output={};
  for(const[path,entries]of rules) {
    const image=await load(path,baseURL),canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
    for(const entry of entries){
      const rect=entry.rect||[0,0,canvas.width,canvas.height];const[x,y,w,h]=rect;
      if(x<0||y<0||x+w>canvas.width||y+h>canvas.height){ART_COVERAGE.push({path,label:entry.label,status:'rect-out-of-bounds',rect});continue;}
      if(entry.patches)for(const patch of entry.patches)clean(g,patch,'soft-fill');
      clean(g,rect,entry.erase||'clear');
      const lines=entry.label.split('^');
      const inkBounds=lines.map((line,i)=>ink(g,[x,y+i*h/lines.length,w,h/lines.length],line,entry));
      ART_COVERAGE.push({path,label:entry.label,status:'translated',rect,inkBounds});
    }
    output[path]=canvas;
  }
  // A reflected UI becomes a compositing group. Convert the native additive
  // light's black backdrop to alpha so it still blends over the title movie.
  const light=await load('TITLE_PARTS_JA/titlemenu_lumi.webp',baseURL);
  const canvas=document.createElement('canvas');canvas.width=light.naturalWidth;canvas.height=light.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(light,0,0);
  const data=ctx.getImageData(0,0,canvas.width,canvas.height),p=data.data;
  for(let i=0;i<p.length;i+=4){const peak=Math.max(p[i],p[i+1],p[i+2]);if(!peak){p[i+3]=0;continue;}p[i+3]=p[i+3]*peak/255;for(let c=0;c<3;c++)p[i+c]=p[i+c]*255/peak;}
  ctx.putImageData(data,0,0);output['TITLE_PARTS_JA/titlemenu_lumi.webp']=canvas;
  return output;
}


