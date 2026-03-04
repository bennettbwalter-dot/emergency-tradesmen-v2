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

const usPost = {
    slug: 'emergency-trade-fair-price-calculator-2026-us',
    title: '2026 Emergency Trade Fair Price Calculator — US Homeowner Guide',
    excerpt: 'Don\'t get overcharged during an emergency. Use our interactive calculator to benchmark fair pricing for all 11 emergency trades including plumbers, electricians, locksmiths, HVAC technicians, and more — based on 2026 US market rates.',
    cover_image: '/images/blog/reliable-tradesmen/header.webp',
    published: true,
    published_at: new Date().toISOString(),
    content: `Use our interactive calculator below to get a fair-price benchmark for emergency trade services across the United States. All 11 trades are included with 2026 inflation-adjusted pricing, regional weightings, and time-of-day surcharges.

---

<!-- 2026 Emergency Trade Fair Price Calculator — US Version -->
<style>
.calc-widget-us{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:960px;margin:0 auto}
.calc-widget-us *{box-sizing:border-box}
.calc-grid-us{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}
@media(max-width:768px){.calc-grid-us{grid-template-columns:1fr}}
.calc-card-us{background:#fff;padding:32px;border-radius:8px;border:1px solid #dee2e6;box-shadow:0 4px 16px rgba(0,0,0,0.04)}
.calc-results-us{background:#1a3a5c;color:#fff;padding:32px;border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.calc-widget-us .form-grp{margin-bottom:20px}
.calc-widget-us label{display:block;font-weight:700;margin-bottom:6px;font-size:0.92rem}
.calc-widget-us select,.calc-widget-us input[type="number"]{width:100%;padding:10px;border:1px solid #dee2e6;border-radius:4px;font-size:1rem;background:#fff}
.calc-widget-us .radio-grp{display:flex;flex-direction:column;gap:8px}
.calc-widget-us .radio-lbl{display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;padding:8px 10px;border:1px solid #dee2e6;border-radius:4px;transition:0.2s}
.calc-widget-us .radio-lbl:hover{background:#f0f0f0}
.calc-widget-us .hidden{display:none}
.us-badge{background:#2e86de;padding:5px 14px;border-radius:20px;font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:16px}
.us-price{font-size:3.5rem;font-weight:800;margin-bottom:16px}
.us-price .cur{font-size:1.8rem;vertical-align:top;margin-top:10px;display:inline-block}
.us-bkdn{width:100%;border-collapse:collapse;margin-bottom:16px}
.us-bkdn td{padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);text-align:left}
.us-bkdn td:last-child{text-align:right;font-weight:700}
.us-bkdn .tot td{border-bottom:none;color:#2e86de;font-size:1.05rem;padding-top:16px}
.us-disc{font-size:0.72rem;opacity:0.7;font-style:italic}
.us-info{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:32px 0}
@media(max-width:768px){.us-info{grid-template-columns:1fr}}
.calc-widget-us h3{color:#1a3a5c;margin-bottom:16px;border-left:4px solid #2e86de;padding-left:12px}
.us-stats{list-style:none;padding:0;margin-top:12px}
.us-stats li{margin-bottom:8px;padding-left:18px;position:relative}
.us-stats li::before{content:"→";position:absolute;left:0;color:#2e86de}
.us-tip{background:#e3f2fd;border:1px solid #bbdefb;padding:16px;border-radius:4px;margin-top:16px}
.us-tbl{width:100%;border-collapse:collapse;background:#fff;margin-top:8px}
.us-tbl th,.us-tbl td{padding:12px;text-align:left;border:1px solid #dee2e6}
.us-tbl th{background:#f1f1f1;color:#1a3a5c;font-weight:600}
</style>

<div class="calc-widget-us">

<div class="calc-grid-us">
<div class="calc-card-us">
<form id="us-calc-form">
<div class="form-grp">
<label for="us-trade">Service Required</label>
<select id="us-trade">
<option value="plumber">Plumber (Leaks, Bursts, Water Heater)</option>
<option value="electrician">Electrician (Power Outage, Panel Upgrade)</option>
<option value="locksmith">Locksmith (Lockouts, Rekeying)</option>
<option value="hvac-gas">HVAC / Gas Engineer (Furnace, Gas Leak)</option>
<option value="drain-specialist">Drain Specialist (Clogged Drains, Sewer)</option>
<option value="glazier">Glazier / Glass Repair (Windows, Storefronts)</option>
<option value="roofer">Roofer / Roof Repair (Leak, Storm Damage)</option>
<option value="builder">Builder / Construction (Structural, Drywall)</option>
<option value="water-restoration">Water Damage &amp; Restoration (Flood, Mold)</option>
<option value="tow">Tow Truck / Roadside Assistance</option>
<option value="hvac">Heating &amp; Cooling / AC Repair</option>
</select>
</div>

<div class="form-grp">
<label for="us-region">Your Region</label>
<select id="us-region">
<option value="national">US National Average</option>
<option value="nyc">New York City / Tri-State (+35%)</option>
<option value="la">Los Angeles / Bay Area (+30%)</option>
<option value="chicago">Chicago / Great Lakes (+10%)</option>
<option value="dallas">Dallas–Fort Worth / Texas</option>
<option value="south">Southeast / Deep South (-10%)</option>
<option value="midwest">Midwest / Plains (-15%)</option>
<option value="mountain">Mountain West / Rural (-20%)</option>
</select>
</div>

<div class="form-grp">
<label>Time of Call</label>
<div class="radio-grp">
<label class="radio-lbl"><input type="radio" name="us-time" value="standard" checked> Standard (8am–6pm weekdays)</label>
<label class="radio-lbl"><input type="radio" name="us-time" value="evening"> After-Hours (6pm–10pm)</label>
<label class="radio-lbl"><input type="radio" name="us-time" value="night"> Overnight / Federal Holiday (10pm–8am)</label>
</div>
</div>

<div class="form-grp" id="us-complexity-grp">
<label for="us-complexity">Job Complexity</label>
<select id="us-complexity">
<option value="1">Minor (Under 1 hour)</option>
<option value="2">Standard (1–2 hours)</option>
<option value="3">Major (3+ hours or crew required)</option>
</select>
</div>

<div class="form-grp hidden" id="us-mileage-grp">
<label for="us-miles">Miles to be Towed</label>
<input type="number" id="us-miles" value="10" min="0">
</div>
</form>
</div>

<div class="calc-results-us">
<div class="us-badge">Fair Price Estimate</div>
<div class="us-price"><span class="cur">$</span><span id="us-total">0</span></div>
<table class="us-bkdn">
<tr><td>Estimated Service Call Fee</td><td id="us-callout">$0</td></tr>
<tr><td>Estimated Hourly Rate</td><td id="us-hourly">$0</td></tr>
<tr class="tot"><td>Benchmark Range</td><td id="us-range">$0 – $0</td></tr>
</table>
<div class="us-disc">*Estimates exclude sales tax (varies by state), specialist parts, and permits. Based on 2026 BLS and HomeAdvisor data.</div>
</div>
</div>

<div class="us-info">
<div>
<h3>2026 US Market Context</h3>
<p>The Bureau of Labor Statistics projects skilled trade labor costs to increase <strong>3.8%–6.2%</strong> in 2026. Emergency call-outs typically carry a <strong>1.5× to 2.5×</strong> multiplier over standard rates, and after-hours premiums of 50–100% are considered industry standard.</p>
<ul class="us-stats">
<li><strong>71%</strong> of Americans can't cover a $1,000 emergency repair without financing</li>
<li><strong>30–35%</strong> NYC/LA metro premium is standard across all trades</li>
<li><strong>100%</strong> surcharge is common for overnight and Federal Holiday call-outs</li>
<li><strong>78%</strong> of homeowners are more likely to hire if pricing is listed online</li>
</ul>
</div>
<div>
<h3>Your Consumer Protection (US)</h3>
<p>Under the <strong>FTC Act (Section 5)</strong>, contractors cannot engage in unfair or deceptive practices. Many states require licensed contractors to provide <strong>written estimates</strong> before beginning work.</p>
<p>If a contractor's bill significantly exceeds the estimate without prior authorization, you may have grounds for a dispute under your state's <strong>Home Improvement Act</strong> or <strong>Consumer Protection Statute</strong>.</p>
<div class="us-tip"><strong>Pro Tip:</strong> Always ask for a licensed contractor's state license number and proof of insurance. In most states, unlicensed work over $500 is a misdemeanor. Get a written estimate before any work begins.</div>
</div>
</div>

<h3>Standard Emergency Benchmarks — All 11 Trades (2026 US)</h3>
<div style="overflow-x:auto">
<table class="us-tbl">
<thead>
<tr><th>Trade</th><th>Service Call Fee</th><th>Day Rate</th><th>Night Rate</th><th>Response Goal</th></tr>
</thead>
<tbody>
<tr><td>Plumber</td><td>$150</td><td>$135/hr</td><td>$225/hr</td><td>60–90 mins</td></tr>
<tr><td>Electrician</td><td>$165</td><td>$155/hr</td><td>$260/hr</td><td>45–60 mins</td></tr>
<tr><td>Locksmith</td><td>$95</td><td>$115/hr</td><td>$195/hr</td><td>20–45 mins</td></tr>
<tr><td>HVAC / Gas Engineer</td><td>$175</td><td>$165/hr</td><td>$280/hr</td><td>60–90 mins</td></tr>
<tr><td>Drain Specialist</td><td>$160</td><td>$145/hr</td><td>$240/hr</td><td>60–90 mins</td></tr>
<tr><td>Glazier / Glass Repair</td><td>$120</td><td>$95/hr</td><td>$160/hr</td><td>90–120 mins</td></tr>
<tr><td>Roofer / Roof Repair</td><td>$185</td><td>$110/hr</td><td>$185/hr</td><td>90–120 mins</td></tr>
<tr><td>Builder / Construction</td><td>$175</td><td>$115/hr</td><td>$190/hr</td><td>120+ mins</td></tr>
<tr><td>Water Damage &amp; Restoration</td><td>$250</td><td>$175/hr</td><td>$295/hr</td><td>60–90 mins</td></tr>
<tr><td>Tow Truck / Roadside</td><td>$85</td><td>$3.50/mile</td><td>$5.75/mile</td><td>30–60 mins</td></tr>
<tr><td>Heating &amp; Cooling (AC)</td><td>$155</td><td>$125/hr</td><td>$210/hr</td><td>60–90 mins</td></tr>
</tbody>
</table>
</div>

<p style="font-size:0.82rem;color:#888;margin-top:24px">Data sources: Bureau of Labor Statistics (BLS) 2026 Projections, HomeAdvisor, Angi, ALOA Security Professionals Association, ACCA (Air Conditioning Contractors of America). Prices exclude state/local sales tax.</p>

</div>

<script>
(function(){
var td={
'plumber':{base:150,hourly:135},
'electrician':{base:165,hourly:155},
'locksmith':{base:95,hourly:115},
'hvac-gas':{base:175,hourly:165},
'drain-specialist':{base:160,hourly:145},
'glazier':{base:120,hourly:95},
'roofer':{base:185,hourly:110},
'builder':{base:175,hourly:115},
'water-restoration':{base:250,hourly:175},
'tow':{base:85,hourly:3.5},
'hvac':{base:155,hourly:125}
};
var rm={'national':1,'nyc':1.35,'la':1.3,'chicago':1.1,'dallas':1,'south':0.9,'midwest':0.85,'mountain':0.8};
var tm={'standard':1,'evening':1.5,'night':2.0};
function calc(){
var t=document.getElementById('us-trade').value;
var r=document.getElementById('us-region').value;
var c=parseInt(document.getElementById('us-complexity').value);
var m=parseFloat(document.getElementById('us-miles').value)||0;
var sv='standard';
var radios=document.getElementsByName('us-time');
for(var i=0;i<radios.length;i++){if(radios[i].checked){sv=radios[i].value;break;}}
var rMul=rm[r]||1;
var tMul=tm[sv]||1;
var d=td[t];
var callout=Math.round(d.base*rMul*tMul);
var total=0;var hrLabel='';
if(t==='tow'){
var ppm=d.hourly*rMul*(sv==='night'?1.65:sv==='evening'?1.3:1);
total=callout+(m*ppm);
hrLabel='$'+ppm.toFixed(2)+' / mile';
}else{
var hr=Math.round(d.hourly*rMul*tMul);
total=callout+(hr*(c-0.5));
hrLabel='$'+hr;
}
var f=Math.round(total);
document.getElementById('us-total').textContent=f.toLocaleString();
document.getElementById('us-callout').textContent='$'+callout;
document.getElementById('us-hourly').textContent=hrLabel;
document.getElementById('us-range').textContent='$'+Math.round(f*0.9)+' – $'+Math.round(f*1.15);
}
document.getElementById('us-trade').addEventListener('change',function(){
var v=this.value;
document.getElementById('us-mileage-grp').className=v==='tow'?'form-grp':'form-grp hidden';
document.getElementById('us-complexity-grp').className=v==='tow'?'form-grp hidden':'form-grp';
calc();
});
document.getElementById('us-calc-form').addEventListener('input',calc);
calc();
})();
</script>

---

**Need help right now?** [Find a Verified Contractor Near You →](https://emergencytradesmen.net/)
`
};

async function insertPost() {
    console.log('Upserting US Fair Price Calculator post...');
    const { data, error } = await supabase
        .from('posts')
        .upsert(usPost, { onConflict: 'slug' })
        .select();
    if (error) {
        console.error('Error upserting US post:', error);
    } else {
        console.log('Successfully upserted US post:', data[0].slug);
    }
}

insertPost();
