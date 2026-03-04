import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ukPost = {
    slug: 'emergency-trade-fair-price-calculator-2026-gb',
    title: '2026 Emergency Trade Fair Price Calculator — UK Homeowner Guide',
    excerpt: 'Don\'t get overcharged during an emergency. Use our interactive calculator to benchmark fair pricing for all 11 emergency trades including plumbers, electricians, locksmiths, gas engineers, and more — based on 2026 UK market rates.',
    cover_image: '/images/blog/reliable-tradesmen/header.webp',
    published: true,
    published_at: new Date().toISOString(),
    content: `Use our interactive calculator below to get a fair-price benchmark for emergency trade services across the UK. All 11 trades are included with 2026 inflation-adjusted pricing, regional weightings, and time-of-day surcharges.

---

<!-- 2026 Emergency Trade Fair Price Calculator — UK Version -->
<style>
.calc-widget{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:960px;margin:0 auto}
.calc-widget *{box-sizing:border-box}
.calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}
@media(max-width:768px){.calc-grid{grid-template-columns:1fr}}
.calc-card{background:#fff;padding:32px;border-radius:8px;border:1px solid #dee2e6;box-shadow:0 4px 16px rgba(0,0,0,0.04)}
.calc-results{background:#2c3e50;color:#fff;padding:32px;border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.calc-widget .form-grp{margin-bottom:20px}
.calc-widget label{display:block;font-weight:700;margin-bottom:6px;font-size:0.92rem}
.calc-widget select,.calc-widget input[type="number"]{width:100%;padding:10px;border:1px solid #dee2e6;border-radius:4px;font-size:1rem;background:#fff}
.calc-widget .radio-grp{display:flex;flex-direction:column;gap:8px}
.calc-widget .radio-lbl{display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;padding:8px 10px;border:1px solid #dee2e6;border-radius:4px;transition:0.2s}
.calc-widget .radio-lbl:hover{background:#f0f0f0}
.calc-widget .hidden{display:none}
.calc-badge{background:#e67e22;padding:5px 14px;border-radius:20px;font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:16px}
.calc-price{font-size:3.5rem;font-weight:800;margin-bottom:16px}
.calc-price .cur{font-size:1.8rem;vertical-align:top;margin-top:10px;display:inline-block}
.calc-bkdn{width:100%;border-collapse:collapse;margin-bottom:16px}
.calc-bkdn td{padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);text-align:left}
.calc-bkdn td:last-child{text-align:right;font-weight:700}
.calc-bkdn .tot td{border-bottom:none;color:#e67e22;font-size:1.05rem;padding-top:16px}
.calc-disc{font-size:0.72rem;opacity:0.7;font-style:italic}
.calc-info{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:32px 0}
@media(max-width:768px){.calc-info{grid-template-columns:1fr}}
.calc-widget h3{color:#2c3e50;margin-bottom:16px;border-left:4px solid #e67e22;padding-left:12px}
.calc-stats{list-style:none;padding:0;margin-top:12px}
.calc-stats li{margin-bottom:8px;padding-left:18px;position:relative}
.calc-stats li::before{content:"→";position:absolute;left:0;color:#e67e22}
.calc-tip{background:#fff3cd;border:1px solid #ffeeba;padding:16px;border-radius:4px;margin-top:16px}
.calc-tbl{width:100%;border-collapse:collapse;background:#fff;margin-top:8px}
.calc-tbl th,.calc-tbl td{padding:12px;text-align:left;border:1px solid #dee2e6}
.calc-tbl th{background:#f1f1f1;color:#2c3e50;font-weight:600}
</style>

<div class="calc-widget">

<div class="calc-grid">
<div class="calc-card">
<form id="uk-calc-form">
<div class="form-grp">
<label for="uk-trade">Service Required</label>
<select id="uk-trade">
<option value="plumber">Plumber (Leaks, Bursts, Drainage)</option>
<option value="electrician">Electrician (Power Failure, Wiring)</option>
<option value="locksmith">Locksmith (Lockouts, Security)</option>
<option value="gas-engineer">Gas Engineer (Boiler, Heating, Gas Leak)</option>
<option value="drain-specialist">Drain Specialist (Blocked Drains, CCTV)</option>
<option value="glazier">Glazier (Broken Windows, Glass Repair)</option>
<option value="roofer">Roofer (Roof Leak, Storm Damage)</option>
<option value="builder">Builder (Structural, Walls, Ceiling)</option>
<option value="water-restoration">Water Restoration (Flood, Drying)</option>
<option value="breakdown">Breakdown Recovery (Tow, Jump Start)</option>
<option value="hvac">Air Conditioning / HVAC (Cooling, Heating)</option>
</select>
</div>

<div class="form-grp">
<label for="uk-region">Your Region</label>
<select id="uk-region">
<option value="national">UK National Average</option>
<option value="london">London &amp; South East (+30%)</option>
<option value="south">South West / East Anglia (+10%)</option>
<option value="midlands">Midlands / Wales</option>
<option value="north">Northern England (-10%)</option>
<option value="scotland">Scotland (-5%)</option>
<option value="nireland">Northern Ireland (-15%)</option>
</select>
</div>

<div class="form-grp">
<label>Time of Call</label>
<div class="radio-grp">
<label class="radio-lbl"><input type="radio" name="uk-time" value="standard" checked> Standard (8am–6pm weekdays)</label>
<label class="radio-lbl"><input type="radio" name="uk-time" value="evening"> Evening (6pm–10pm)</label>
<label class="radio-lbl"><input type="radio" name="uk-time" value="night"> Night / Bank Holiday (10pm–8am)</label>
</div>
</div>

<div class="form-grp" id="uk-complexity-grp">
<label for="uk-complexity">Job Complexity</label>
<select id="uk-complexity">
<option value="1">Simple (Up to 1 hour)</option>
<option value="2">Standard (1–2 hours)</option>
<option value="3">Major (3+ hours or multi-person)</option>
</select>
</div>

<div class="form-grp hidden" id="uk-mileage-grp">
<label for="uk-miles">Miles to be Towed</label>
<input type="number" id="uk-miles" value="10" min="0">
</div>
</form>
</div>

<div class="calc-results">
<div class="calc-badge">Fair Price Estimate</div>
<div class="calc-price"><span class="cur">£</span><span id="uk-total">0</span></div>
<table class="calc-bkdn">
<tr><td>Estimated Call-out Fee</td><td id="uk-callout">£0</td></tr>
<tr><td>Estimated Hourly Rate</td><td id="uk-hourly">£0</td></tr>
<tr class="tot"><td>Benchmark Range</td><td id="uk-range">£0 – £0</td></tr>
</table>
<div class="calc-disc">*Estimates include VAT @ 20% but exclude specialist parts or materials. Based on 2026 inflation-adjusted benchmarks.</div>
</div>
</div>

<div class="calc-info">
<div>
<h3>2026 UK Market Context</h3>
<p>Construction sector cost inflation for 2026 is projected at <strong>3.2%–5.1%</strong> (BCIS). This calculator accounts for the current 1.5× to 3× emergency multipliers used by accredited UK trade bodies.</p>
<ul class="calc-stats">
<li><strong>63%</strong> of consumers fail to get a written quote during emergencies</li>
<li><strong>25–30%</strong> London premium is standard across all trades</li>
<li><strong>120%</strong> peak surcharge for Bank Holiday call-outs</li>
<li><strong>74%</strong> of homeowners check online reviews before hiring</li>
</ul>
</div>
<div>
<h3>Your Consumer Rights (UK)</h3>
<p>Under the <strong>Consumer Rights Act 2015</strong>, if a price isn't agreed upfront, you are only legally required to pay a "reasonable price." This tool helps define that benchmark.</p>
<p>Under <strong>Section 51</strong>, services must be performed with reasonable care and skill. Under <strong>Section 52</strong>, they must be performed within a reasonable time.</p>
<div class="calc-tip"><strong>Pro Tip:</strong> Always ask if the call-out fee includes the first 30–60 minutes of labour. Many premium 'Fair Price' trades bundle this in. Request a written quote before work begins.</div>
</div>
</div>

<h3>Standard Emergency Benchmarks — All 11 Trades (2026 UK)</h3>
<div style="overflow-x:auto">
<table class="calc-tbl">
<thead>
<tr><th>Trade</th><th>Call-out Fee</th><th>Day Rate</th><th>Night Rate</th><th>Response Goal</th></tr>
</thead>
<tbody>
<tr><td>Plumber</td><td>£125</td><td>£110/hr</td><td>£185/hr</td><td>60–90 mins</td></tr>
<tr><td>Electrician</td><td>£135</td><td>£125/hr</td><td>£210/hr</td><td>45–60 mins</td></tr>
<tr><td>Locksmith</td><td>£110</td><td>£95/hr</td><td>£160/hr</td><td>30–45 mins</td></tr>
<tr><td>Gas Engineer</td><td>£180</td><td>£160/hr</td><td>£270/hr</td><td>60–90 mins</td></tr>
<tr><td>Drain Specialist</td><td>£140</td><td>£120/hr</td><td>£200/hr</td><td>60–90 mins</td></tr>
<tr><td>Glazier</td><td>£95</td><td>£75/hr</td><td>£125/hr</td><td>90–120 mins</td></tr>
<tr><td>Roofer</td><td>£150</td><td>£85/hr</td><td>£145/hr</td><td>90–120 mins</td></tr>
<tr><td>Builder</td><td>£150</td><td>£90/hr</td><td>£150/hr</td><td>120+ mins</td></tr>
<tr><td>Water Restoration</td><td>£200</td><td>£145/hr</td><td>£245/hr</td><td>60–90 mins</td></tr>
<tr><td>Breakdown Recovery</td><td>£65</td><td>£2.50/mile</td><td>£4.50/mile</td><td>30–60 mins</td></tr>
<tr><td>Air Conditioning (HVAC)</td><td>£130</td><td>£100/hr</td><td>£170/hr</td><td>60–90 mins</td></tr>
</tbody>
</table>
</div>

<p style="font-size:0.82rem;color:#888;margin-top:24px">Data sources: BCIS 2026 Forecasts, Gas Safe Register, Master Locksmiths Association (MLA), Checkatrade, Federation of Master Builders. All figures include VAT @ 20%.</p>

</div>

<script>
(function(){
var td={
'plumber':{base:125,hourly:110},
'electrician':{base:135,hourly:125},
'locksmith':{base:110,hourly:95},
'gas-engineer':{base:180,hourly:160},
'drain-specialist':{base:140,hourly:120},
'glazier':{base:95,hourly:75},
'roofer':{base:150,hourly:85},
'builder':{base:150,hourly:90},
'water-restoration':{base:200,hourly:145},
'breakdown':{base:65,hourly:2.5},
'hvac':{base:130,hourly:100}
};
var rm={'national':1,'london':1.3,'south':1.1,'midlands':1,'north':0.9,'scotland':0.95,'nireland':0.85};
var tm={'standard':1,'evening':1.5,'night':2.2};
function calc(){
var t=document.getElementById('uk-trade').value;
var r=document.getElementById('uk-region').value;
var c=parseInt(document.getElementById('uk-complexity').value);
var m=parseFloat(document.getElementById('uk-miles').value)||0;
var sv='standard';
var radios=document.getElementsByName('uk-time');
for(var i=0;i<radios.length;i++){if(radios[i].checked){sv=radios[i].value;break;}}
var rMul=rm[r]||1;
var tMul=tm[sv]||1;
var d=td[t];
var callout=Math.round(d.base*rMul*tMul);
var total=0;var hrLabel='';
if(t==='breakdown'){
var ppm=d.hourly*rMul*(sv==='night'?1.8:sv==='evening'?1.3:1);
total=callout+(m*ppm);
hrLabel='£'+ppm.toFixed(2)+' / mile';
}else{
var hr=Math.round(d.hourly*rMul*tMul);
total=callout+(hr*(c-0.5));
hrLabel='£'+hr;
}
var f=Math.round(total);
document.getElementById('uk-total').textContent=f.toLocaleString();
document.getElementById('uk-callout').textContent='£'+callout;
document.getElementById('uk-hourly').textContent=hrLabel;
document.getElementById('uk-range').textContent='£'+Math.round(f*0.9)+' – £'+Math.round(f*1.15);
}
document.getElementById('uk-trade').addEventListener('change',function(){
var v=this.value;
document.getElementById('uk-mileage-grp').className=v==='breakdown'?'form-grp':'form-grp hidden';
document.getElementById('uk-complexity-grp').className=v==='breakdown'?'form-grp hidden':'form-grp';
calc();
});
document.getElementById('uk-calc-form').addEventListener('input',calc);
calc();
})();
</script>

---

**Need help right now?** [Find a Verified Tradesman Near You →](https://emergencytradesmen.net/)
`
};

async function insertPost() {
    console.log('Upserting UK Fair Price Calculator post...');
    const { data, error } = await supabase
        .from('posts')
        .upsert(ukPost, { onConflict: 'slug' })
        .select();
    if (error) {
        console.error('Error upserting UK post:', error);
    } else {
        console.log('Successfully upserted UK post:', data[0].slug);
    }
}

insertPost();
