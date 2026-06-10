/* ===== تهيئة فيربيز ===== */
firebase.initializeApp({
    apiKey:"AIzaSyDMpGKS3hm7FqFI8twabti1aHAqksvSZME",
    databaseURL:"https://yarmouk-booking-default-rtdb.firebaseio.com/",
    projectId:"yarmouk-booking",
    storageBucket:"yarmouk-booking.firebasestorage.app"
});
const db = firebase.database();

/* ===== الحالة العامة ===== */
let LS = JSON.parse(localStorage.getItem('ymk6') || 'null') || {
    pass:'991278', cart:[], sizes:{}, cust:{name:'',phone:''}, favs:[], theme:'light'
};
const saveLS = () => localStorage.setItem('ymk6', JSON.stringify(LS));
let cart = LS.cart || [], selPay='', selAcc='', aTab='a-rpt', tailorSel={}, readySel={}, readyFilter='', searchQ='', cache={};

/* ===== الإعدادات الافتراضية ===== */
let cfg = {
    name:'اليرموك الحديث',
    logo:'https://i.ibb.co/C3YFp0k7/688339f4-1296-48c0-bc66-3be039832675.png',
    contacts:[
        {number:'967773463560',label:'واتساب 1',icon:'fa-brands fa-whatsapp',color:'#25d366'},
        {number:'967772349997',label:'اتصال',icon:'fa-solid fa-phone',color:'#3b82f6'},
        {number:'967776090624',label:'واتساب 2',icon:'fa-brands fa-whatsapp',color:'#25d366'}
    ],
    links:[
        {name:'موقعنا',url:'https://alyarmouk.com',icon:'fa-solid fa-globe'},
        {name:'فيسبوك',url:'https://facebook.com/alyarmouk',icon:'fa-brands fa-facebook'},
        {name:'تيك توك',url:'https://tiktok.com/@alyarmouk',icon:'fa-brands fa-tiktok'}
    ],
    socials:[
        {name:'واتساب',url:'https://wa.me/967773463560',icon:'fa-brands fa-whatsapp'},
        {name:'إنستغرام',url:'https://instagram.com/alyarmouk',icon:'fa-brands fa-instagram'}
    ],
    address:'صنعاء - اليمن', currency:'ر.ي',
    szFields:[{l:'الطول'},{l:'الكتف'},{l:'اليد'},{l:'الصدر'},{l:'الرقبة'},{l:'وسع اليد'},{l:'الكبك'},{l:'الخطوة'}],
    tailorGroups:[
        {name:'الياقة',opts:['قلاب ملكي','صيني','سادة','كول']},
        {name:'الكم',opts:['كبك حشو','سادة','فرنسي','دراع عادي']},
        {name:'الجيب',opts:['بدون جيب','جيب واحد','جيبين']},
        {name:'الشريط',opts:['بدون شريط','شريط عادي','شريط مطرز']}
    ],
    readyGroups:[{name:'المقاس',opts:['S','M','L','XL','XXL','3XL']},{name:'اللون',opts:['أسود','أبيض','كحلي','بني','رمادي']}],
    categories:['ثياب شتوية','ثياب صيفية','مشالح','إكسسوارات'],
    pages:[{title:'من نحن',content:'متجر اليرموك الحديث\n\nوجهتكم الأولى للأزياء اليمنية الأصيلة بلمسة عصرية.\n\nنقدم لكم أفضل الأقمشة والتفاصيل اليدوية بأيدي أمهر الخياطين.\n\nزيارتكم تشرفنا.'}],
    payments:[{name:'الكريمي',acc:'3005374854',icon:'fa-building-columns',color:'#1a5eb8'},{name:'جيب',acc:'595720',icon:'fa-wallet',color:'#f39c12'}],
    maintenance:false
};
const STS=[
    {k:'new',l:'جديد',c:'st-new',icon:'fa-plus'},
    {k:'accepted',l:'مقبول',c:'st-accepted',icon:'fa-check'},
    {k:'progress',l:'قيد العمل',c:'st-progress',icon:'fa-spinner'},
    {k:'ready',l:'جاهز',c:'st-ready',icon:'fa-truck-fast'},
    {k:'delivered',l:'تم التسليم',c:'st-delivered',icon:'fa-circle-check'},
    {k:'cancel',l:'ملغي',c:'st-cancel',icon:'fa-ban'}
];

/* ===== أدوات مساعدة ===== */
function $(id){ return document.getElementById(id); }
function getPage(){ return document.body.dataset.page || 'home'; }

/* ===== تحميل المكونات ===== */
async function loadComponent(elId, url){
    const el = $(elId);
    if(!el) return;
    try{
        const res = await fetch(url);
        el.innerHTML = await res.text();
    }catch(e){
        console.warn('فشل تحميل المكون:', url, e);
    }
}
async function loadComponents(){
    await Promise.all([
        loadComponent('navbar', 'components/navbar.html'),
        loadComponent('footer', 'components/footer.html')
    ]);
}

/* ===== الثيم ===== */
function toggleTheme(){
    LS.theme = LS.theme==='dark' ? 'light' : 'dark';
    saveLS();
    document.documentElement.setAttribute('data-theme', LS.theme==='dark' ? 'dark' : '');
    const icon = $('themeIcon');
    if(icon) icon.className = LS.theme==='dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
function initTheme(){
    if(LS.theme==='dark'){
        document.documentElement.setAttribute('data-theme','dark');
        const icon = $('themeIcon');
        if(icon) icon.className = 'fa-solid fa-sun';
    }
}

/* ===== الشريط العلوي ===== */
function renderTopMarquee(){
    const el = $('topMarquee');
    if(!el) return;
    let txt = cfg.name+' — ';
    if(cfg.contacts && cfg.contacts.length) txt += cfg.contacts.map(c=>c.label+': '+c.number).join('  |  ')+'  |  ';
    txt += cfg.address || '';
    el.textContent = txt;
}

/* ===== التذييل ===== */
function renderFooter(){
    const fc = $('footerContacts');
    if(fc) fc.innerHTML = (cfg.contacts||[]).map(c=>{
        const isWA = c.icon && c.icon.includes('whatsapp');
        const href = isWA ? 'https://wa.me/'+c.number.replace(/^0+/,'') : 'tel:'+c.number;
        return '<a href="'+href+'" target="_blank"><i class="'+c.icon+'" style="color:'+c.color+'"></i>'+c.label+': '+c.number+'</a>';
    }).join('');
    const fl = $('footerLinks');
    if(fl) fl.innerHTML = (cfg.links||[]).map(l=>'<a href="'+l.url+'" target="_blank"><i class="'+(l.icon||'fa-solid fa-link')+'" style="color:var(--gold)"></i>'+l.name+'</a>').join('');
    const fs = $('footerSocials');
    if(fs) fs.innerHTML = (cfg.socials||[]).map(s=>'<a href="'+s.url+'" target="_blank"><i class="'+(s.icon||'fa-solid fa-link')+'"></i></a>').join('');
}

/* ===== تطبيق الإعدادات ===== */
function applyCfg(){
    const n1=$('mainName'); if(n1) n1.textContent=cfg.name;
    const l1=$('mainLogo'); if(l1) l1.src=cfg.logo;
    const n2=$('footerName'); if(n2) n2.textContent=cfg.name;
    const l2=$('footerLogo'); if(l2) l2.src=cfg.logo;
    renderTopMarquee();
    renderFooter();
    if($('szGrid')) renderSzFields();
    if($('tailorOpts')) renderTailorOpts();
    if($('payGrid')) renderPayGrid();
    if($('pagesDisp')) renderPages();
    if($('szCount')) updateSzProgress();
}

/* ===== مراقبة الإعدادات من فيربيز ===== */
function watchConfig(){
    db.ref('storeConfig').on('value', s=>{
        const d = s.val();
        if(!d) return;
        cfg = {...cfg, ...d};
        applyCfg();
        if(getPage()==='admin-settings') renderASet();
    });
}

/* ===== الجزيئات ===== */
function initParticles(){
    const el = $('heroParticles');
    if(!el) return;
    let h='';
    for(let i=0;i<14;i++){
        const x=Math.random()*100, y=Math.random()*100, sz=Math.random()*3+2, d=Math.random()*5+3, dl=Math.random()*4;
        h+='<span style="left:'+x+'%;top:'+y+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+dl+'s;animation-duration:'+d+'s"></span>';
    }
    el.innerHTML = h;
}

/* ===== التبويبات (الصفحة الرئيسية فقط) ===== */
function swTab(t){
    document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));
    document.querySelectorAll('.bnav-item').forEach(b=>b.classList.remove('on'));
    const sec=$('sec_'+t); if(sec) sec.classList.add('on');
    const nav=document.querySelector('.bnav-item[data-t="'+t+'"]'); if(nav) nav.classList.add('on');
    window.scrollTo({top:0,behavior:'smooth'});
    const cb=$('cartBar');
    if(cb) cb.classList.toggle('hidden', t==='account'||!cart.length);
}

/* ===== المقاسات ===== */
function renderSzFields(){
    const g=$('szGrid'); if(!g) return;
    g.innerHTML = cfg.szFields.map(f=>'<div class="mi"><label>'+f.l+'</label><input type="number" step="0.1" class="sz-inp" data-l="'+f.l+'" value="'+(LS.sizes[f.l]||'')+'" oninput="onSzInp(this)"></div>').join('');
    updateSzProgress();
}
function onSzInp(el){
    if(el.value){el.classList.add('filled');LS.sizes[el.dataset.l]=el.value;}
    else{el.classList.remove('filled');delete LS.sizes[el.dataset.l];}
    saveLS(); updateSzProgress();
}
function updateSzProgress(){
    const t=cfg.szFields.length, f=Object.keys(LS.sizes).length;
    const c=$('szCount'); if(c) c.textContent=f+' / '+t;
    const b=$('szBar'); if(b) b.style.width=(t?Math.round(f/t*100):0)+'%';
}

/* ===== خيارات الخياطة ===== */
function renderTailorOpts(){
    const el=$('tailorOpts'); if(!el) return;
    el.innerHTML = cfg.tailorGroups.map(g=>{
        if(!tailorSel[g.name]) tailorSel[g.name]=g.opts[0]||'';
        return '<div class="opt-grp"><div class="opt-lbl"><i class="fa-solid fa-tag"></i>'+g.name+'</div><div class="filter-row">'+g.opts.map(o=>'<button class="chip '+(tailorSel[g.name]===o?'on':'')+'" onclick="pickChip(\'tailor\',\''+g.name+'\',\''+o+'\',this)">'+o+'</button>').join('')+'</div></div>';
    }).join('');
}
function pickChip(type,g,v,el){
    if(type==='ready') readySel[g]=v; else tailorSel[g]=v;
    el.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
    el.classList.add('on');
}

/* ===== طرق الدفع ===== */
function renderPayGrid(){
    const el=$('payGrid'); if(!el) return;
    el.innerHTML = cfg.payments.map(p=>'<div class="pay-opt" onclick="selPM(\''+p.name+'\',\''+p.acc+'\',this)"><i class="fa-solid '+(p.icon||'fa-credit-card')+'" style="color:'+(p.color||'var(--t2)')+'"></i><div class="pn">'+p.name+'</div><div class="ps">'+(p.acc?'تحويل':'مباشر')+'</div></div>').join('');
}
function selPM(n,a,el){
    document.querySelectorAll('.pay-opt').forEach(c=>c.classList.remove('on'));
    el.classList.add('on'); selPay=n; selAcc=a;
    const pd=$('payDet'); if(pd) pd.style.display='block';
    const an=$('accNum'); if(an) an.textContent=a;
}
function prevRcpt(inp){
    const f=inp.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=e=>{const p=$('rcptPrev');if(p){p.src=e.target.result;p.style.display='block';}toast('تم رفع الإيصال','ok');};
    r.readAsDataURL(f);
}

/* ===== الصفحات المخصصة ===== */
function renderPages(){
    const d=$('pagesDisp'); if(!d) return;
    if(!cfg.pages||!cfg.pages.length){d.innerHTML='';return;}
    d.innerHTML = cfg.pages.map((p,i)=>'<div class="page-card afu" onclick="openPageModal('+i+')" style="animation-delay:'+i*.07+'s"><h4><i class="fa-solid fa-file-lines"></i>'+p.title+'</h4><p>'+(p.content||'')+'</p></div>').join('');
}
function openPageModal(i){
    const p=cfg.pages[i]; if(!p) return;
    const sc=$('sheetCont'); if(!sc) return;
    sc.innerHTML='<div class="page-full"><button onclick="closeModal()" style="display:flex;align-items:center;gap:6px;margin-bottom:14px;font-size:12px;color:var(--t3)"><i class="fa-solid fa-arrow-right"></i>رجوع</button><h2><i class="fa-solid fa-file-lines"></i>'+p.title+'</h2><div class="pf-content">'+(p.content||'')+'</div></div>';
    openSheet();
}

/* ===== البحث التلقائي عن العميل ===== */
let sT=null;
function searchClient(ph){
    const pt=$('phoneTag'); if(pt) pt.classList.remove('show');
    const nt=$('nameTag'); if(nt) nt.classList.remove('show');
    clearTimeout(sT);
    if(ph.length<9) return;
    sT=setTimeout(()=>{
        db.ref('clients').orderByChild('phone').equalTo(ph).once('value',s=>{
            let found=false;
            s.forEach(c=>{
                const d=c.val();
                const cn=$('cName'); if(cn) cn.value=d.name||'';
                if(d.measurements) Object.entries(d.measurements).forEach(([k,v])=>{
                    const inp=document.querySelector('.sz-inp[data-l="'+k+'"]');
                    if(inp){inp.value=v;inp.classList.add('filled');}
                    LS.sizes[k]=v;
                });
                saveLS(); updateSzProgress();
                if(nt) nt.classList.add('show');
                if(pt) pt.classList.add('show');
                found=true;
            });
            if(!found) toast('لا توجد بيانات سابقة','wn');
        });
    },500);
}

/* ===== استعادة البيانات المحفوظة ===== */
function restore(){
    if(LS.sizes) document.querySelectorAll('.sz-inp').forEach(i=>{
        if(LS.sizes[i.dataset.l]){i.value=LS.sizes[i.dataset.l];i.classList.add('filled');}
    });
    if(LS.cust){
        const c1=$('cName'); if(c1 && LS.cust.name) c1.value=LS.cust.name;
        const c2=$('cName2'); if(c2 && LS.cust.name) c2.value=LS.cust.name;
        const p1=$('cPhone'); if(p1 && LS.cust.phone) p1.value=LS.cust.phone;
        const p2=$('cPhone2'); if(p2 && LS.cust.phone) p2.value=LS.cust.phone;
    }
}

/* ===== البحث ===== */
function doSearch(q){
    searchQ = q.toLowerCase().trim();
    if(getPage()==='home'){renderFabrics();renderReady();}
    else if(searchQ) window.location.href='index.html?search='+encodeURIComponent(q);
}

/* ===== بطاقة المنتج ===== */
function prodCard(p,k){
    const nm=p.name||'';
    if(searchQ && !nm.toLowerCase().includes(searchQ) && !(p.category||'').toLowerCase().includes(searchQ)) return '';
    const hd=p.oldPrice && +p.oldPrice>+p.price;
    const pc=hd?Math.round((1-+p.price/+p.oldPrice)*100):0;
    const stk=p.stock||0;
    const isFav=(LS.favs||[]).includes(k);
    return '<div class="pc afu" onclick="openPM(\''+k+'\')"><div class="pc-img">'+(hd?'<span class="pc-tag sale">-'+pc+'%</span>':'')+'<button class="pc-fav '+(isFav?'liked':'')+'" onclick="event.stopPropagation();togFav(\''+k+'\',this)"><i class="fa-'+(isFav?'solid':'regular')+' fa-heart"></i></button><img src="'+p.img+'" alt="'+nm+'" loading="lazy"></div><div class="pc-body"><h3>'+nm+'</h3><div class="pc-price">'+(hd?'<span class="was">'+Number(p.oldPrice).toLocaleString()+'</span>':'')+'<span class="now">'+Number(p.price).toLocaleString()+' '+cfg.currency+'</span></div>'+(stk>0?'<div style="font-size:9px;color:var(--t3);margin-bottom:6px"><i class="fa-solid fa-box-open" style="margin-left:3px"></i>المتاح: '+stk+'</div>':'')+'<button class="pc-add" onclick="event.stopPropagation();addC(\''+k+'\')"><i class="fa-solid fa-plus"></i>أضف للسلة</button></div></div>';
}

/* ===== عرض المنتجات ===== */
function renderFabrics(){
    const g=$('fabGrid'); if(!g) return;
    let h='';
    Object.entries(cache).forEach(([k,p])=>{
        if(p.cat!=='fabric'||p.isVisible===false) return;
        const c=prodCard(p,k); if(c) h+=c;
    });
    g.innerHTML = h||'<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-scissors"></i><p>لا توجد أقمشة حالياً</p></div>';
    const fc=$('fabCount'); if(fc) fc.textContent=h?Object.keys(cache).filter(k=>cache[k].cat==='fabric'&&cache[k].isVisible!==false).length+' قماش':'';
}
function renderReadyFilter(){
    const el=$('readyFilter'); if(!el) return;
    el.innerHTML = cfg.readyGroups.map(g=>g.opts.map(o=>'<button class="chip '+(readyFilter===o?'on':'')+'" onclick="readyFilter=\''+(readyFilter===o?'':o)+'\';renderReady();renderReadyFilter()">'+o+'</button>').join('')).join('');
}
function renderReady(){
    const g=$('rdyGrid'); if(!g) return;
    let h='';
    Object.entries(cache).forEach(([k,p])=>{
        if(p.cat!=='ready'||p.isVisible===false) return;
        if(readyFilter && !p.name.includes(readyFilter)) return;
        const c=prodCard(p,k); if(c) h+=c;
    });
    g.innerHTML = h||'<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-shirt"></i><p>لا توجد منتجات جاهزة</p></div>';
    const rc=$('rdyCount'); if(rc) rc.textContent=h?Object.keys(cache).filter(k=>cache[k].cat==='ready'&&cache[k].isVisible!==false).length+' قطعة':'';
}

/* ===== المفضلة ===== */
function togFav(k,el){
    if(!LS.favs) LS.favs=[];
    const i=LS.favs.indexOf(k);
    if(i>-1){LS.favs.splice(i,1);el.classList.remove('liked');el.innerHTML='<i class="fa-regular fa-heart"></i>';}
    else{LS.favs.push(k);el.classList.add('liked');el.innerHTML='<i class="fa-solid fa-heart"></i>';}
    saveLS();
}

/* ===== مراقبة المنتجات ===== */
function watchProducts(){
    db.ref('products').on('value',s=>{
        cache={};
        s.forEach(c=>{cache[c.key]=c.val();});
        if(getPage()==='home'){renderFabrics();renderReady();renderReadyFilter();}
        if(getPage()==='admin-products') renderAProd();
    });
}

/* ===== مودال المنتج ===== */
function openPM(k){
    const p=cache[k]; if(!p) return;
    const sc=$('sheetCont'); if(!sc) return;
    const isFab=p.cat==='fabric';
    let optsHtml=isFab?cfg.tailorGroups.map(g=>{if(!tailorSel[g.name])tailorSel[g.name]=g.opts[0]||'';return'<div class="opt-grp"><div class="opt-lbl"><i class="fa-solid fa-tag"></i>'+g.name+'</div><div class="filter-row">'+g.opts.map(o=>'<button class="chip '+(tailorSel[g.name]===o?'on':'')+'" onclick="pickChip(\'tailor\',\''+g.name+'\',\''+o+'\',this)">'+o+'</button>').join('')+'</div></div>';}).join(''):cfg.readyGroups.map(g=>{if(!readySel[g.name])readySel[g.name]=g.opts[0]||'';return'<div class="opt-grp"><div class="opt-lbl"><i class="fa-solid fa-tag"></i>'+g.name+'</div><div class="filter-row">'+g.opts.map(o=>'<button class="chip '+(readySel[g.name]===o?'on':'')+'" onclick="pickChip(\'ready\',\''+g.name+'\',\''+o+'\',this)">'+o+'</button>').join('')+'</div></div>';}).join('');
    sc.innerHTML='<img src="'+p.img+'" style="width:100%;height:260px;object-fit:cover"><div style="padding:18px"><h2 style="font-size:16px;font-weight:900;color:var(--brn);margin-bottom:8px">'+p.name+'</h2><div style="margin-bottom:12px">'+(p.oldPrice&&+p.oldPrice>+p.price?'<span style="color:var(--t3);text-decoration:line-through;font-size:13px;margin-left:8px">'+Number(p.oldPrice).toLocaleString()+'</span>':'')+'<span style="color:var(--gn);font-size:20px;font-weight:900">'+Number(p.price).toLocaleString()+' '+cfg.currency+'</span></div>'+(p.desc?'<p style="font-size:12px;color:var(--t2);line-height:1.8;margin-bottom:14px">'+p.desc+'</p>':'')+'<div style="border-top:1px solid var(--bdr);padding-top:14px;margin-top:4px"><div style="font-size:13px;font-weight:700;color:var(--brn);margin-bottom:10px"><i class="fa-solid '+(isFab?'fa-scissors':'fa-sliders')+'" style="margin-left:6px;color:var(--gold)"></i>'+(isFab?'تفاصيل الخياطة':'الخيارات')+'</div>'+optsHtml+'</div><div style="display:flex;align-items:center;gap:10px;margin-top:16px"><span style="font-size:11px;color:var(--t3)">الكمية:</span><div class="qty-ctrl"><button onclick="document.getElementById(\'pmQty\').value=Math.max(1,+document.getElementById(\'pmQty\').value-1)">-</button><span id="pmQty">1</span><button onclick="document.getElementById(\'pmQty\').value=+document.getElementById(\'pmQty\').value+1">+</button></div></div><button class="send-btn" onclick="addCModal(\''+k+'\')" style="margin-top:14px"><i class="fa-solid fa-cart-plus"></i>إضافة للسلة</button></div>';
    openSheet();
}

/* ===== السلة ===== */
function addC(k){
    const p=cache[k]; if(!p) return;
    const opts=p.cat==='fabric'?{...tailorSel}:{...readySel};
    const ex=cart.find(c=>c.id===k&&JSON.stringify(c.opts)===JSON.stringify(opts));
    if(ex) ex.qty++; else cart.push({cid:Date.now()+Math.random(),id:k,name:p.name,price:+p.price,cat:p.cat,img:p.img,qty:1,opts});
    pCart(); renderCart(); updCartBar(); toast('تمت الإضافة للسلة','ok');
}
function addCModal(k){
    const p=cache[k]; if(!p) return;
    const qEl=$('pmQty');
    const qty=Math.min(+(qEl?qEl.value:1)||1, p.stock||999);
    const opts=p.cat==='fabric'?{...tailorSel}:{...readySel};
    const ex=cart.find(c=>c.id===k&&JSON.stringify(c.opts)===JSON.stringify(opts));
    if(ex) ex.qty+=qty; else cart.push({cid:Date.now()+Math.random(),id:k,name:p.name,price:+p.price,cat:p.cat,img:p.img,qty,opts});
    pCart(); renderCart(); updCartBar(); closeModal(); toast('تمت الإضافة للسلة','ok');
}
function rmC(cid){cart=cart.filter(c=>c.cid!==cid);pCart();renderCart();updCartBar();}
function chgQ(cid,d){const it=cart.find(c=>c.cid===cid);if(!it)return;it.qty=Math.max(1,it.qty+d);pCart();renderCart();updCartBar();}
function pCart(){LS.cart=cart;saveLS();}

function renderCart(){
    const l=$('cartList'); const ps=$('cartPay');
    if(!l) return;
    if(!cart.length){l.innerHTML='<div class="empty"><i class="fa-solid fa-bag-shopping"></i><p>السلة فارغة</p></div>';if(ps)ps.style.display='none';const tp=$('totalPrice');if(tp)tp.textContent='0';return;}
    if(ps) ps.style.display='block';
    let tot=0;
    l.innerHTML=cart.map((it,i)=>{
        const sub=it.price*(it.qty||1); tot+=sub;
        const oStr=it.opts?Object.entries(it.opts).map(([k,v])=>'<span>'+v+'</span>').join(''):'';
        return'<div class="ci" style="animation-delay:'+i*.04+'s"><button class="rm" onclick="rmC('+it.cid+')"><i class="fa-solid fa-xmark"></i></button><div style="display:flex;gap:10px;align-items:flex-start"><img src="'+it.img+'" style="width:52px;height:52px;border-radius:var(--rs);object-fit:cover;flex-shrink:0" loading="lazy"><div style="flex:1;min-width:0"><span class="ci-tag">'+(it.cat==='fabric'?'تفصيل':'جاهز')+'</span><h4>'+it.name+'</h4>'+(oStr?'<div class="ci-opts">'+oStr+'</div>':'')+'<div class="sub">'+sub.toLocaleString()+' '+cfg.currency+'</div></div></div><div style="display:flex;align-items:center;gap:8px;margin-top:8px"><div class="qty-ctrl"><button onclick="chgQ('+it.cid+',-1)">-</button><span>'+it.qty+'</span><button onclick="chgQ('+it.cid+',1)">+</button></div></div></div>';
    }).join('');
    const tp=$('totalPrice'); if(tp) tp.textContent=tot.toLocaleString();
}
function updCartBar(){
    const n=cart.reduce((s,c)=>s+(c.qty||1),0);
    const cc=$('cartCnt'); if(cc) cc.textContent=n;
    const cb=$('cartBar');
    if(cb) cb.classList.toggle('hidden', document.querySelector('.bnav-item.on')?.dataset.t==='account'||!cart.length);
}

/* ===== إرسال الطلب ===== */
function sendOrder(){
    const nm=($('cName')?.value||$('cName2')?.value||'').trim();
    const ph=($('cPhone')?.value||$('cPhone2')?.value||'').trim();
    if(!nm){toast('أدخل اسمك','er');return;}
    if(!ph){toast('أدخل رقم هاتفك','er');return;}
    if(!cart.length){toast('السلة فارغة','er');return;}
    if(!selPay){toast('اختر طريقة الدفع','wn');return;}
    let msg='*طلب جديد - '+cfg.name+'*\n\n*العميل:* '+nm+'\n*الهاتف:* '+ph+'\n\n';
    const ms=[];
    document.querySelectorAll('.sz-inp').forEach(i=>{if(i.value)ms.push(i.dataset.l+': '+i.value);});
    if(ms.length) msg+='*المقاسات:*\n'+ms.join(' | ')+'\n\n';
    let tot=0; msg+='*الطلبات:*\n';
    cart.forEach((it,i)=>{const sub=it.price*(it.qty||1);tot+=sub;msg+=(i+1)+'. '+it.name+' ×'+(it.qty||1)+' = '+sub.toLocaleString()+' '+cfg.currency+'\n';});
    msg+='\n*الإجمالي:* '+tot.toLocaleString()+' '+cfg.currency+'\n*الدفع:* '+selPay+'\n';
    const notes=$('orderNotes')?.value.trim(); if(notes) msg+='*ملاحظات:* '+notes+'\n';
    const waContact=(cfg.contacts||[]).find(c=>c.icon&&c.icon.includes('whatsapp'));
    const waPhone=waContact?waContact.number.replace(/^0+/,''):cfg.contacts?.[0]?.number?.replace(/^0+/,'')||'';
    window.open('https://wa.me/'+waPhone+'?text='+encodeURIComponent(msg),'_blank');
    db.ref('orders').push({name:nm,phone:ph,items:cart.map(c=>({name:c.name,qty:c.qty,price:c.price,opts:c.opts})),total:tot,measurements:ms,pay:selPay,notes:notes||'',status:'new',ts:Date.now()});
    const cd={name:nm,phone:ph,measurements:LS.sizes,lastOrder:Date.now()};
    db.ref('clients').orderByChild('phone').equalTo(ph).once('value',s=>{
        let f=false;s.forEach(c=>{db.ref('clients/'+c.key).update(cd);f=true;});if(!f)db.ref('clients').push(cd);
    });
    cart=[];pCart();renderCart();updCartBar();toast('تم إرسال الطلب بنجاح!','ok');
    selPay='';selAcc='';document.querySelectorAll('.pay-opt').forEach(c=>c.classList.remove('on'));
    const pd=$('payDet'); if(pd) pd.style.display='none';
}

/* ===== تتبع الطلبات ===== */
function trackOrder(){
    const phEl=$('trackPhone'); if(!phEl) return;
    const ph=phEl.value.trim();
    if(ph.length<9){toast('أدخل رقم هاتف صحيح','er');return;}
    const res=$('trackRes'); if(!res) return;
    res.innerHTML='<div class="empty" style="padding:20px"><i class="fa-solid fa-spinner fa-spin"></i><p>جاري البحث...</p></div>';
    db.ref('orders').orderByChild('phone').equalTo(ph).once('value',s=>{
        const orders=[];s.forEach(c=>orders.push({k:c.key,...c.val()}));orders.reverse();
        if(!orders.length){res.innerHTML='<div class="empty" style="padding:20px"><i class="fa-solid fa-magnifying-glass"></i><p>لا توجد طلبات</p></div>';return;}
        res.innerHTML=orders.map((o,i)=>{
            const st=STS.find(x=>x.k===o.status)||STS[0];
            const ci=STS.findIndex(x=>x.k===o.status);
            const tl=STS.filter(x=>x.k!=='cancel').map((s2,j)=>{
                const d=j<ci,c=j===ci;
                return'<div class="tl-step '+(d?'done':'')+' '+(c?'cur':'')+'"><div class="tl-dot">'+(d?'<i class="fa-solid fa-check" style="font-size:9px"></i>':c?'<i class="fa-solid '+s2.icon+'" style="font-size:9px"></i>':'')+'</div><div class="tl-line"></div><span>'+s2.l+'</span></div>';
            }).join('');
            return'<div class="track-ord" style="animation-delay:'+i*.06+'s"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:800;color:var(--brn)">#'+o.k.slice(-6)+'</span><span class="to-status '+st.c+'">'+st.l+'</span></div><div style="font-size:11px;color:var(--t2);margin-bottom:4px">'+(o.items||[]).map(x=>x.name+' ×'+x.qty).join(' ، ')+'</div><div style="font-size:14px;font-weight:900;color:var(--gn);margin-bottom:10px">'+Number(o.total||0).toLocaleString()+' '+cfg.currency+'</div><div class="timeline">'+tl+'</div></div>';
        }).join('');
    });
}

/* ===== المودال ===== */
function openSheet(){
    const o=$('overlay'); if(o) o.classList.add('show');
    const s=$('sheet'); if(s) s.classList.add('show');
    document.body.style.overflow='hidden';
}
function closeModal(){
    const o=$('overlay'); if(o) o.classList.remove('show');
    const s=$('sheet'); if(s) s.classList.remove('show');
    document.body.style.overflow='';
}
let sy=0;
document.addEventListener('touchstart',e=>{
    const sh=$('sheet');
    if(sh && sh.classList.contains('show')) sy=e.touches[0].clientY;
},{passive:true});
document.addEventListener('touchmove',e=>{
    const sh=$('sheet');
    if(sh && sh.classList.contains('show') && e.touches[0].clientY-sy>80) closeModal();
},{passive:true});

/* ===== ياقوت (المساعد الذكي) ===== */
const yR={
    'صيف':'للصيف ننصح بالقطن أو الكتّان الخفيف — مريح ويتهوى في الجو الحار.',
    'شتاء':'الصوف والتريكو السميك هو الأنسب للشتاء. تشكيلتنا الشتوية تدفّيك وتمنحك إطلالة أنيقة.',
    'مدة':'مدة التنفيذ من 3 لـ 7 أيام عمل. في المواسم والأعياد يفضل الحجز المبكر.',
    'دفع':'طرق الدفع: تحويل عبر الكريمي أو محفظة جيب أو الدفع عند الاستلام.',
    'مقاس':'أدخل رقم هاتفك في صفحة التفصيل وسيتم ملء مقاساتك تلقائياً إن كنت عميلاً سابقاً.',
    'default':'أنا ياقوت، مساعدك في متجر اليرموك. تقدر تسألني عن الأقمشة، المقاسات، أو طرق الدفع.'
};
function toggleY(){
    const p=$('yPanel'); if(p) p.classList.toggle('show');
    const b=$('yBtn'); if(b) b.classList.toggle('hide');
}
function yAsk(q){
    const b=$('yBody'); if(!b) return;
    b.innerHTML+='<div class="y-msg user"><div class="bubble">'+q+'</div></div><div class="typing" id="yTyping"><span></span><span></span><span></span></div>';
    b.scrollTop=b.scrollHeight;
    let r=yR.default;
    for(const k in yR) if(k!=='default'&&q.includes(k)){r=yR[k];break;}
    setTimeout(()=>{
        const t=$('yTyping'); if(t) t.remove();
        b.innerHTML+='<div class="y-msg bot"><div class="bubble">'+r+'</div></div>';
        b.scrollTop=b.scrollHeight;
    },900);
}
function sendY(){
    const i=$('yInp'); if(!i) return;
    const q=i.value.trim(); if(!q) return;
    yAsk(q); i.value='';
}

/* ===== التوست ===== */
function toast(msg,t){
    const w=$('toastWrap'); if(!w) return;
    const el=document.createElement('div');
    el.className='toast '+(t||'ok');
    const icons={ok:'fa-check-circle',er:'fa-times-circle',wn:'fa-exclamation-triangle'};
    const colors={ok:'var(--gn)',er:'var(--rd)',wn:'#F59E0B'};
    el.innerHTML='<i class="fa-solid '+(icons[t]||icons.ok)+'" style="color:'+(colors[t]||colors.ok)+';font-size:14px"></i><span>'+msg+'</span>';
    w.appendChild(el);
    setTimeout(()=>{el.style.opacity='0';el.style.transition='.3s';setTimeout(()=>el.remove(),300);},3000);
}

/* ===== تسجيل الدخول ===== */
function openLogin(){
    const o=$('loginOvl'); if(o) o.classList.add('show');
    const c=$('loginCard'); if(c){c.classList.add('show');const p=$('aPass');if(p){p.value='';p.focus();}}
}
function closeLogin(){
    const o=$('loginOvl'); if(o) o.classList.remove('show');
    const c=$('loginCard'); if(c) c.classList.remove('show');
}
function doLogin(){
    const p=$('aPass'); if(!p) return;
    if(p.value===LS.pass){closeLogin(); openAdmin();}
    else toast('كلمة المرور خاطئة','er');
}

/* ===== الإدارة - عام ===== */
function openAdmin(){
    if(getPage()==='home'){
        const a=$('adminP'); if(a){a.classList.add('show');document.body.style.overflow='hidden';}
        swAT(aTab, document.querySelector('.atab[data-at="'+aTab+'"]'));
    } else {
        window.location.href='admin-dashboard.html';
    }
}
function closeAdmin(){
    const a=$('adminP'); if(a){a.classList.remove('show');document.body.style.overflow='';}
}
function swAT(t,btn){
    aTab=t;
    document.querySelectorAll('.atab').forEach(b=>b.classList.remove('on'));
    if(btn) btn.classList.add('on');
    if(t==='a-prod') renderAProd();
    else if(t==='a-ord') renderAOrd();
    else if(t==='a-cli') renderACli();
    else if(t==='a-set') renderASet();
    else if(t==='a-rpt') renderARpt();
}
function togAS(el){el.classList.toggle('open');el.nextElementSibling?.classList.toggle('open');}

/* ===== الإدارة - التقارير ===== */
let chartInst=null;
function renderARpt(){
    const ab=$('aBody'); if(!ab) return;
    ab.innerHTML='<div style="text-align:center;margin-bottom:16px"><h3 style="font-size:16px;font-weight:900;color:var(--brn)">ملخص المتجر</h3></div><div style="height:220px;background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--r);padding:14px;margin-bottom:16px"><canvas id="rptChart"></canvas></div><div class="rpt-grid"><div class="rpt-card afu"><div class="rn" id="rp1">-</div><div class="rl">إجمالي الطلبات</div></div><div class="rpt-card afu" style="animation-delay:.05s"><div class="rn" id="rp2">-</div><div class="rl">الإيرادات</div></div><div class="rpt-card afu" style="animation-delay:.1s"><div class="rn" id="rp3">-</div><div class="rl">المنتجات</div></div><div class="rpt-card afu" style="animation-delay:.15s"><div class="rn" id="rp4">-</div><div class="rl">العملاء</div></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">'+STS.map(st=>'<div class="rpt-card" style="padding:10px"><div class="rn" style="font-size:20px" id="rp_'+st.k+'">0</div><div class="rl">'+st.l+'</div></div>').join('')+'</div>';
    db.ref('orders').once('value',s=>{
        let tot=0,cnt=0;const sc={};const daily={};
        s.forEach(c=>{const o=c.val();cnt++;tot+=+(o.total||0);sc[o.status]=(sc[o.status]||0)+1;const day=new Date(o.ts).toLocaleDateString('ar-YE',{weekday:'short'});daily[day]=(daily[day]||0)+1;});
        const r1=$('rp1');if(r1)r1.textContent=cnt;
        const r2=$('rp2');if(r2)r2.textContent=tot.toLocaleString();
        Object.keys(sc).forEach(k=>{const el=$('rp_'+k);if(el)el.textContent=sc[k];});
        const ctx=$('rptChart'); if(!ctx) return;
        if(chartInst)chartInst.destroy();
        const grad=ctx.getContext('2d').createLinearGradient(0,0,0,200);
        grad.addColorStop(0,'rgba(201,168,76,0.3)');grad.addColorStop(1,'rgba(201,168,76,0.0)');
        chartInst=new Chart(ctx,{type:'line',data:{labels:Object.keys(daily),datasets:[{label:'الطلبات',data:Object.values(daily),borderColor:'#c9a84c',backgroundColor:grad,fill:true,tension:.4,pointBackgroundColor:'#c9a84c',pointBorderColor:'#1a1a30',pointBorderWidth:3,pointRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(42,42,69,.35)'},ticks:{color:'#7778aa',font:{family:'Cairo',size:10}}},y:{grid:{color:'rgba(42,42,69,.35)'},ticks:{color:'#7778aa',font:{family:'Cairo',size:10}},beginAtZero:true}}}});
    });
    db.ref('products').once('value',s=>{let c=0;s.forEach(ch=>{if(ch.val().isVisible!==false)c++;});const r3=$('rp3');if(r3)r3.textContent=c;});
    db.ref('clients').once('value',s=>{const r4=$('rp4');if(r4)r4.textContent=s.numChildren();});
}

/* ===== الإدارة - المنتجات ===== */
let editKey=null;
function renderAProd(){
    const ab=$('aBody'); if(!ab) return;
    ab.innerHTML='<button class="abtn g full" onclick="openPF()" style="margin-bottom:14px"><i class="fa-solid fa-plus"></i>إضافة منتج جديد</button><div class="aset"><div class="aset-h open" onclick="togAS(this)"><i class="fa-solid fa-folder" style="color:var(--gold)"></i>التصنيفات<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b open"><div id="catList">'+cfg.categories.map(c=>'<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><span style="flex:1;font-size:12px;padding:9px 12px;background:var(--bg3);border-radius:var(--rs)">'+c+'</span><button onclick="rmCat(\''+c+'\')" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px"><i class="fa-solid fa-trash"></i></button></div>').join('')+'</div><div style="display:flex;gap:6px"><input id="newCat" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="تصنيف جديد"><button class="abtn g" onclick="addCat()" style="padding:9px 14px"><i class="fa-solid fa-plus"></i></button></div></div></div><div id="apList"></div>';
}
function addCat(){const v=$('newCat')?.value.trim();if(!v)return;cfg.categories.push(v);db.ref('storeConfig/categories').set(cfg.categories);const nc=$('newCat');if(nc)nc.value='';toast('تمت الإضافة','ok');renderAProd();}
function rmCat(c){cfg.categories=cfg.categories.filter(x=>x!==c);db.ref('storeConfig/categories').set(cfg.categories);renderAProd();}
function openPF(key){
    editKey=key||null;const p=key?cache[key]:{};
    const catOpts=cfg.categories.map(c=>'<option value="'+c+'" '+(p.category===c?'selected':'')+'>'+c+'</option>').join('');
    const sc=$('sheetCont'); if(!sc) return;
    sc.innerHTML='<div style="padding:18px"><h3 style="font-size:16px;font-weight:900;color:var(--brn);margin-bottom:16px">'+(key?'تعديل':'إضافة')+' منتج</h3><div class="af"><label>اسم المنتج</label><input id="pf_name" value="'+(p.name||'')+'"></div><div class="ag"><div class="af"><label>السعر</label><input type="number" id="pf_price" value="'+(p.price||'')+'"></div><div class="af"><label>قبل الخصم</label><input type="number" id="pf_old" value="'+(p.oldPrice||'')+'"></div></div><div class="ag"><div class="af"><label>المخزون</label><input type="number" id="pf_stock" value="'+(p.stock||0)+'"></div><div class="af"><label>النوع</label><select id="pf_cat"><option value="fabric" '+(p.cat==='fabric'?'selected':'')+'>تفصيل</option><option value="ready" '+(p.cat==='ready'?'selected':'')+'>جاهز</option></select></div></div><div class="af"><label>التصنيف</label><select id="pf_category"><option value="">بدون</option>'+catOpts+'</select></div><div class="af"><label>الوصف</label><textarea id="pf_desc" rows="2">'+(p.desc||'')+'</textarea></div><div class="af"><label>رابط الصورة</label><input id="pf_img" value="'+(p.img||'')+'"><div style="margin-top:6px"><label style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;background:var(--bg3);border-radius:var(--rs);font-size:10px;color:var(--t2);cursor:pointer"><i class="fa-solid fa-upload"></i>رفع صورة<input type="file" accept="image/*" style="display:none" onchange="hProdImg(this)"></label></div></div><div style="display:flex;gap:8px;margin-top:16px"><button class="abtn o" style="flex:1;justify-content:center" onclick="closeModal()">إلغاء</button><button class="abtn g" style="flex:1;justify-content:center" onclick="saveProd()"><i class="fa-solid fa-save"></i>حفظ</button></div></div>';
    openSheet();
}
function hProdImg(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const el=$('pf_img');if(el)el.value=e.target.result;};r.readAsDataURL(f);}
function saveProd(){
    const nm=$('pf_name')?.value.trim();const pr=+$('pf_price')?.value;
    if(!nm||!pr){toast('أدخل الاسم والسعر','er');return;}
    const data={name:nm,price:pr,oldPrice:+($('pf_old')?.value||0),desc:$('pf_desc')?.value.trim()||'',img:$('pf_img')?.value||'https://picsum.photos/seed/'+Date.now()+'/400/400',cat:$('pf_cat')?.value||'fabric',category:$('pf_category')?.value||'',stock:+($('pf_stock')?.value||0),showStock:true,isVisible:true};
    if(editKey) db.ref('products/'+editKey).update(data); else db.ref('products').push(data);
    closeModal(); toast(editKey?'تم التحديث':'تمت الإضافة','ok'); editKey=null;
}
function delProd(k){if(!confirm('حذف هذا المنتج؟'))return;db.ref('products/'+k).remove();toast('تم الحذف','ok');}

/* تحديث قائمة المنتجات في الإدارة */
function updateAProdList(){
    const l=$('apList'); if(!l) return;
    let h='';
    Object.entries(cache).forEach(([k,p])=>{
        h+='<div class="sl-item afu"><img src="'+p.img+'"><div class="si"><h5>'+p.name+'</h5><span>'+Number(p.price).toLocaleString()+' '+cfg.currency+' · '+(p.cat==='fabric'?'تفصيل':'جاهز')+'</span></div><div style="display:flex;gap:4px"><button style="width:30px;height:30px;border-radius:8px;background:rgba(201,168,76,.1);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:11px" onclick="openPF(\''+k+'\')"><i class="fa-solid fa-pen"></i></button><button style="width:30px;height:30px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:11px" onclick="delProd(\''+k+'\')"><i class="fa-solid fa-trash"></i></button></div></div>';
    });
    l.innerHTML=h||'<div class="empty"><p>لا توجد منتجات</p></div>';
}

/* ===== الإدارة - الطلبات ===== */
function renderAOrd(){
    const ab=$('aBody'); if(!ab) return;
    ab.innerHTML='<div id="aoList"></div>';
    db.ref('orders').orderByChild('ts').limitToLast(50).once('value',s=>{
        const l=$('aoList'); if(!l) return;
        const orders=[];s.forEach(c=>orders.push({k:c.key,...c.val()}));orders.reverse();
        l.innerHTML=orders.length?orders.map(o=>{
            const st=STS.find(x=>x.k===o.status)||STS[0];
            const ci=STS.findIndex(x=>x.k===o.status);
            const nx=STS.filter(x=>x.k!=='cancel'&&x.k!=='delivered')[ci+1];
            return'<div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--r);padding:14px;margin-bottom:10px;animation:fu .3s ease both"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:14px;font-weight:900;color:var(--brn)">#'+o.k.slice(-6)+'</span><span class="to-status '+st.c+'"><i class="fa-solid '+st.icon+'" style="margin-left:3px"></i>'+st.l+'</span></div><div style="font-size:11px;color:var(--t2);margin-bottom:4px"><i class="fa-solid fa-user" style="margin-left:4px"></i>'+(o.name||'-')+' · <i class="fa-solid fa-phone" style="margin-left:4px"></i>'+(o.phone||'-')+'</div><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--gn);font-weight:900;font-size:15px">'+Number(o.total||0).toLocaleString()+' '+cfg.currency+'</span><div style="display:flex;gap:4px">'+(nx?'<button class="abtn g" style="font-size:9px;padding:6px 10px" onclick="updSt(\''+o.k+'\',\''+nx.k+'\')"><i class="fa-solid '+nx.icon+'" style="margin-left:3px"></i>'+nx.l+'</button>':'')+'<button class="abtn o" style="font-size:9px;padding:6px 10px" onclick="shareOrd(\''+o.k+'\')"><i class="fa-brands fa-whatsapp"></i></button>'+(o.status!=='delivered'&&o.status!=='cancel'?'<button class="abtn r" style="font-size:9px;padding:6px 10px" onclick="updSt(\''+o.k+'\',\'cancel\')"><i class="fa-solid fa-ban"></i></button>':'')+'</div></div></div>';
        }).join(''):'<div class="empty"><p>لا توجد طلبات</p></div>';
    });
}
function updSt(k,st){db.ref('orders/'+k+'/status').set(st);toast('تم تحديث الحالة','ok');if(getPage()==='admin-orders')setTimeout(renderAOrd,500);}
function shareOrd(k){
    db.ref('orders/'+k).once('value',s=>{
        const o=s.val();if(!o)return;
        const st=STS.find(x=>x.k===o.status)||STS[0];
        window.open('https://wa.me/'+(o.phone||'')+'?text='+encodeURIComponent('*تحديث طلب #'+k.slice(-6)+'*\n\nالحالة: '+st.l+'\nالمبلغ: '+Number(o.total||0).toLocaleString()+' '+cfg.currency),'_blank');
    });
}

/* ===== الإدارة - العملاء ===== */
function renderACli(){
    const ab=$('aBody'); if(!ab) return;
    ab.innerHTML='<div style="display:flex;gap:6px;margin-bottom:14px"><div class="fld" style="flex:1"><i class="fa-solid fa-magnifying-glass ic"></i><input id="cliSrch" placeholder="ابحث بالاسم أو الهاتف..." oninput="srchCli(this.value)"></div></div><div id="cliList"></div>';
    loadCli('');
}
function loadCli(q){
    const l=$('cliList'); if(!l) return;
    db.ref('clients').once('value',s=>{
        const qw=(q||'').trim().toLowerCase();let h='';
        s.forEach(c=>{
            const d=c.val();
            if(qw&&!((d.phone||'').includes(qw)||(d.name||'').toLowerCase().includes(qw))) return;
            h+='<div class="sl-item afu"><div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--goldD));display:flex;align-items:center;justify-content:center;color:var(--brnD);font-weight:800;font-size:15px;flex-shrink:0">'+(d.name||'?').charAt(0)+'</div><div class="si"><h5>'+(d.name||'-')+'</h5><span dir="ltr">'+(d.phone||'-')+'</span></div></div>';
        });
        l.innerHTML=h||'<div class="empty"><p>لا يوجد عملاء</p></div>';
    });
}
let cliT=null;
function srchCli(v){clearTimeout(cliT);cliT=setTimeout(()=>loadCli(v),300);}

/* ===== الإدارة - الإعدادات ===== */
function renderASet(){
    const ab=$('aBody'); if(!ab) return;
    const s=cfg;
    ab.innerHTML=
    '<div class="aset"><div class="aset-h open" onclick="togAS(this)"><i class="fa-solid fa-store" style="color:var(--gold)"></i>بيانات المتجر<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b open"><div><div class="af"><label>اسم المتجر</label><input id="s_name" value="'+s.name+'"></div><div class="af"><label>رابط الشعار</label><input id="s_logo" value="'+s.logo+'"><div style="margin-top:4px"><label style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--bg3);border-radius:var(--rs);font-size:10px;color:var(--t2);cursor:pointer"><i class="fa-solid fa-upload"></i>رفع<input type="file" accept="image/*" style="display:none" onchange="hLogo(this)"></label></div></div><div class="ag"><div class="af"><label>العملة</label><input id="s_curr" value="'+s.currency+'"></div><div class="af"><label>العنوان</label><input id="s_addr" value="'+s.address+'"></div></div><button class="abtn g full" onclick="saveStore()"><i class="fa-solid fa-save"></i>حفظ</button></div></div></div>'+
    '<div class="aset"><div class="aset-h open" onclick="togAS(this)"><i class="fa-solid fa-phone" style="color:var(--gold)"></i>أرقام التواصل<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b open"><div><p style="font-size:10px;color:var(--t3);margin-bottom:10px">أضف أرقام التواصل. الرقم الأول واتساب يُستخدم لإرسال الطلبات.</p><div id="contactsList">'+(s.contacts||[]).map(function(c){return'<div style="background:var(--bg3);padding:10px;border-radius:var(--rs);margin-bottom:8px"><div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><select class="c_icon" style="width:44px;padding:8px 4px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:11px;background:var(--bg2);color:var(--t1);text-align:center"><option value="fa-brands fa-whatsapp"'+(c.icon==='fa-brands fa-whatsapp'?' selected':'')+'>واتساب</option><option value="fa-solid fa-phone"'+(c.icon==='fa-solid fa-phone'?' selected':'')+'>اتصال</option><option value="fa-solid fa-mobile-screen"'+(c.icon==='fa-solid fa-mobile-screen'?' selected':'')+'>جوال</option><option value="fa-brands fa-telegram"'+(c.icon==='fa-brands fa-telegram'?' selected':'')+'>تلغرام</option></select><input class="c_label" value="'+(c.label||'')+'" style="flex:1;padding:8px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="التسمية"><button onclick="this.closest(\'div\').parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div><input class="c_number" value="'+(c.number||'')+'" style="width:100%;padding:8px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="967..." dir="ltr"></div>';}).join('')+'</div><button class="abtn o full" onclick="addContact()" style="font-size:10px;margin-bottom:8px"><i class="fa-solid fa-plus"></i>إضافة رقم جديد</button><button class="abtn g full" onclick="saveContacts()"><i class="fa-solid fa-save"></i>حفظ الأرقام</button></div></div></div>'+
    '<div class="aset"><div class="aset-h" onclick="togAS(this)"><i class="fa-solid fa-link" style="color:var(--gold)"></i>روابط مواقع مخصصة<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b"><div><div id="linksList">'+(s.links||[]).map(function(l){return'<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="lk_name" value="'+(l.name||'')+'" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="اسم الرابط"><input class="lk_url" value="'+(l.url||'')+'" style="flex:2;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="https://..." dir="ltr"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div>';}).join('')+'</div><button class="abtn o full" onclick="addLink()" style="font-size:10px;margin-bottom:8px"><i class="fa-solid fa-plus"></i>إضافة رابط</button><button class="abtn g full" onclick="saveLinks()"><i class="fa-solid fa-save"></i>حفظ الروابط</button></div></div></div>'+
    '<div class="aset"><div class="aset-h" onclick="togAS(this)"><i class="fa-solid fa-share-nodes" style="color:var(--gold)"></i>شبكات التواصل<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b"><div><div id="socList">'+(s.socials||[]).map(function(l){return'<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="soc_name" value="'+(l.name||'')+'" style="width:80px;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="المنصة"><input class="soc_url" value="'+(l.url||'')+'" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="الرابط" dir="ltr"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div>';}).join('')+'</div><button class="abtn o full" onclick="addSoc()" style="font-size:10px;margin-bottom:8px"><i class="fa-solid fa-plus"></i>إضافة</button><button class="abtn g full" onclick="saveSocs()"><i class="fa-solid fa-save"></i>حفظ</button></div></div></div>'+
    '<div class="aset"><div class="aset-h" onclick="togAS(this)"><i class="fa-solid fa-credit-card" style="color:var(--gold)"></i>طرق الدفع<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b"><div><div id="payList">'+(s.payments||[]).map(function(p){return'<div style="background:var(--bg3);padding:10px;border-radius:var(--rs);margin-bottom:8px"><div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="pay_n" value="'+p.name+'" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="اسم الطريقة"><input class="pay_a" value="'+(p.acc||'')+'" style="width:120px;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="رقم الحساب" dir="ltr"><button onclick="this.closest(\'div\').remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px"><i class="fa-solid fa-trash"></i></button></div></div>';}).join('')+'</div><button class="abtn o full" onclick="addPayM()" style="font-size:10px;margin-bottom:8px"><i class="fa-solid fa-plus"></i>إضافة طريقة</button><button class="abtn g full" onclick="savePays()"><i class="fa-solid fa-save"></i>حفظ</button></div></div></div>'+
    '<div class="aset"><div class="aset-h" onclick="togAS(this)"><i class="fa-solid fa-shield-halved" style="color:var(--gold)"></i>متقدم<i class="fa-solid fa-chevron-down chv"></i></div><div class="aset-b"><div><div class="tog-row"><span>وضع الصيانة</span><div class="tog-sw '+(s.maintenance?'on':'')+'" id="s_maint" onclick="this.classList.toggle(\'on\')"></div></div><div class="af" style="margin-top:12px"><label>كلمة المرور الجديدة</label><input type="password" id="s_pass" placeholder="اتركها فارغة للإبقاء"></div><button class="abtn g full" onclick="saveAdv()"><i class="fa-solid fa-save"></i>حفظ</button></div></div></div>';
}

function hLogo(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const el=$('s_logo');if(el)el.value=e.target.result;};r.readAsDataURL(f);}
function saveStore(){
    cfg.name=$('s_name')?.value.trim()||cfg.name;
    cfg.logo=$('s_logo')?.value||cfg.logo;
    cfg.currency=$('s_curr')?.value.trim()||cfg.currency;
    cfg.address=$('s_addr')?.value.trim()||cfg.address;
    db.ref('storeConfig').update({name:cfg.name,logo:cfg.logo,currency:cfg.currency,address:cfg.address});
    applyCfg(); toast('تم الحفظ','ok');
}
function addContact(){
    const cl=$('contactsList'); if(!cl) return;
    cl.insertAdjacentHTML('beforeend','<div style="background:var(--bg3);padding:10px;border-radius:var(--rs);margin-bottom:8px"><div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><select class="c_icon" style="width:44px;padding:8px 4px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:11px;background:var(--bg2);color:var(--t1);text-align:center"><option value="fa-brands fa-whatsapp">واتساب</option><option value="fa-solid fa-phone">اتصال</option><option value="fa-solid fa-mobile-screen">جوال</option><option value="fa-brands fa-telegram">تلغرام</option></select><input class="c_label" style="flex:1;padding:8px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="التسمية"><button onclick="this.closest(\'div\').parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div><input class="c_number" style="width:100%;padding:8px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="967..." dir="ltr"></div>');
}
function saveContacts(){
    const contacts=[];
    document.querySelectorAll('#contactsList > div').forEach(function(div){
        const icon=div.querySelector('.c_icon')?.value||'fa-solid fa-phone';
        const label=div.querySelector('.c_label')?.value?.trim()||'';
        const number=div.querySelector('.c_number')?.value?.trim()||'';
        if(number) contacts.push({number:number,label:label,icon:icon,color:icon.includes('whatsapp')?'#25d366':icon.includes('telegram')?'#0088cc':'#3b82f6'});
    });
    cfg.contacts=contacts; db.ref('storeConfig/contacts').set(contacts); applyCfg(); toast('تم حفظ الأرقام ('+contacts.length+' رقم)','ok');
}
function addLink(){const el=$('linksList');if(el)el.insertAdjacentHTML('beforeend','<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="lk_name" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="اسم الرابط"><input class="lk_url" style="flex:2;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="https://..." dir="ltr"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div>');}
function saveLinks(){
    const links=[];
    document.querySelectorAll('#linksList > div').forEach(function(div){
        const name=div.querySelector('.lk_name')?.value?.trim()||'';
        const url=div.querySelector('.lk_url')?.value?.trim()||'';
        if(name&&url) links.push({name:name,url:url,icon:'fa-solid fa-link'});
    });
    cfg.links=links; db.ref('storeConfig/links').set(links); applyCfg(); toast('تم حفظ الروابط','ok');
}
function addSoc(){const el=$('socList');if(el)el.insertAdjacentHTML('beforeend','<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="soc_name" style="width:80px;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="المنصة"><input class="soc_url" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="الرابط" dir="ltr"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0"><i class="fa-solid fa-trash"></i></button></div>');}
function saveSocs(){
    const ls=[];
    document.querySelectorAll('#socList > div').forEach(function(div){
        const name=div.querySelector('.soc_name')?.value?.trim()||'';
        const url=div.querySelector('.soc_url')?.value?.trim()||'';
        if(name&&url) ls.push({name:name,url:url,icon:'fa-solid fa-link'});
    });
    cfg.socials=ls; db.ref('storeConfig/socials').set(ls); applyCfg(); toast('تم الحفظ','ok');
}
function addPayM(){const el=$('payList');if(el)el.insertAdjacentHTML('beforeend','<div style="background:var(--bg3);padding:10px;border-radius:var(--rs);margin-bottom:8px"><div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><input class="pay_n" style="flex:1;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="اسم الطريقة"><input class="pay_a" style="width:120px;padding:9px 12px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:12px;background:var(--bg2);color:var(--t1)" placeholder="رقم الحساب" dir="ltr"><button onclick="this.closest(\'div\').remove()" style="width:28px;height:28px;border-radius:8px;background:rgba(231,76,60,.08);color:var(--rd);display:flex;align-items:center;justify-content:center;font-size:10px"><i class="fa-solid fa-trash"></i></button></div></div>');}
function savePays(){
    const ps=[];
    document.querySelectorAll('#payList > div').forEach(function(d){
        const n=d.querySelector('.pay_n')?.value?.trim()||'';
        if(n) ps.push({name:n,acc:d.querySelector('.pay_a')?.value?.trim()||'',icon:'fa-credit-card',color:''});
    });
    cfg.payments=ps; db.ref('storeConfig/payments').set(ps); toast('تم الحفظ','ok');
}
function saveAdv(){
    cfg.maintenance=$('s_maint')?.classList.contains('on');
    const np=$('s_pass')?.value.trim();
    if(np){LS.pass=np;saveLS();toast('تم تغيير كلمة المرور','ok');}
    db.ref('storeConfig/maintenance').set(cfg.maintenance);
    if(!np) toast('تم الحفظ','ok');
}

/* ===== تهيئة عامة عند تحميل أي صفحة ===== */
async function initApp(){
    initTheme();
    await loadComponents();
    watchConfig();
    watchProducts();
    restore();
    renderCart();
    updCartBar();
    
    const page = getPage();
    
    // الصفحة الرئيسية
    if(page === 'home'){
        initParticles();
        renderSzFields();
        renderTailorOpts();
        renderPayGrid();
        renderPages();
        renderReadyFilter();
        // التحقق من البحث في الرابط
        const params = new URLSearchParams(window.location.search);
        const q = params.get('search');
        if(q){ const si=$('searchInp'); if(si){si.value=q; doSearch(q);} }
    }
    
    // صفحات الإدارة المنفصلة
    if(page === 'admin-reports') renderARpt();
    if(page === 'admin-products') { renderAProd(); updateAProdList(); }
    if(page === 'admin-orders') renderAOrd();
    if(page === 'admin-users') renderACli();
    if(page === 'admin-settings') renderASet();

    // تحديث قائمة المنتجات في الإدارة إذا كانت الصفحة الرئيسية مفتوحة
    if(page === 'home'){
        db.ref('products').on('value', s=>{
            if(aTab === 'a-prod') { renderAProd(); updateAProdList(); }
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);
document.addEventListener('keydown', e=>{if(e.key==='Escape'){closeModal();closeAdmin();closeLogin();}});