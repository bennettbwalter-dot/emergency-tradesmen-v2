import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const authorityMap = {
  "Plumber": {
    "UK": [
      { name: "Water Regs UK", url: "https://www.waterregsuk.co.uk/", keywords: ["water regulations", "plumbing standards"] },
      { name: "CIPHE", url: "https://www.ciphe.org.uk/", keywords: ["qualified plumbers", "heating engineering"] },
      { name: "UK Building Regs (Part G)", url: "https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g", keywords: ["Building Regulations", "Part G"] },
      { name: "APHC", url: "https://www.aphc.co.uk/", keywords: ["Association of Plumbing & Heating Contractors", "licensed plumbers"] }
    ],
    "US": [
      { name: "IPC (International Code Council)", url: "https://www.iccsafe.org/", keywords: ["International Plumbing Code", "safety codes"] },
      { name: "UPC (IAPMO)", url: "https://www.iapmo.org/", keywords: ["Uniform Plumbing Code", "plumbing compliance"] },
      { name: "ASSE", url: "https://www.asse-plumbing.org/", keywords: ["ASSE International", "safety standards"] },
      { name: "PHCC", url: "https://www.phccweb.org/", keywords: ["Plumbing-Heating-Cooling Contractors Association", "proufessional plumbers"] }
    ]
  },
  "Electrician": {
    "UK": [
      { name: "BS 7671 (IET)", url: "https://www.theiet.org/", keywords: ["Wiring Regulations", "IET"] },
      { name: "NICEIC", url: "https://www.niceic.com/", keywords: ["NICEIC", "government-approved"] },
      { name: "NAPIT", url: "https://www.napit.org.uk/", keywords: ["NAPIT", "certified electricians"] },
      { name: "UK Building Regs (Part P)", url: "https://www.gov.uk/government/publications/electrical-safety-approved-document-p", keywords: ["Building Regulations", "Part P"] },
      { name: "ECA", url: "https://www.eca.co.uk/", keywords: ["Electrical Contractors' Association", "industry standards"] }
    ],
    "US": [
      { name: "NEC / NFPA", url: "https://www.nfpa.org/", keywords: ["National Electrical Code", "NFPA"] },
      { name: "OSHA", url: "https://www.osha.gov/", keywords: ["OSHA", "workplace safety"] },
      { name: "NECA", url: "https://www.necanet.org/", keywords: ["National Electrical Contractors Association", "industry excellence"] }
    ]
  },
  "Air Conditioning (HVAC)": {
    "UK": [
      { name: "REFCOM", url: "https://www.refcom.org.uk/", keywords: ["REFCOM", "F-gas"] },
      { name: "BESA", url: "https://www.thebesa.com/", keywords: ["BESA", "Building Engineering Services Association"] },
      { name: "CIBSE", url: "https://www.cibse.org/", keywords: ["CIBSE", "building services engineers"] }
    ],
    "US": [
      { name: "EPA Section 608", url: "https://www.epa.gov/section608", keywords: ["EPA Section 608", "refrigerant handling"] },
      { name: "ASHRAE", url: "https://www.ashrae.org/", keywords: ["ASHRAE", "heating and cooling standards"] },
      { name: "ACCA", url: "https://www.acca.org/", keywords: ["Air Conditioning Contractors of America", "performance standards"] },
      { name: "AHRI", url: "https://www.ahrinet.org/", keywords: ["AHRI", "certified efficiency"] }
    ]
  },
  "Locksmith": {
    "UK": [
      { name: "MLA", url: "https://www.locksmiths.co.uk/", keywords: ["Master Locksmiths Association", "vetted"] },
      { name: "British Standards (BSI)", url: "https://www.bsigroup.com/", keywords: ["British Standards", "security compliance"] }
    ],
    "US": [
      { name: "ALOA", url: "https://www.aloa.org/", keywords: ["Associated Locksmiths of America", "security professional"] },
      { name: "BHMA", url: "https://buildershardware.com/", keywords: ["BHMA", "hardware standards"] },
      { name: "SAVTA", url: "https://www.savta.org/", keywords: ["Safe and Vault Technicians Association", "specialist"] }
    ]
  },
  "Gas Engineer": {
    "UK": [
      { name: "Gas Safe Register", url: "https://www.gassaferegister.co.uk/", keywords: ["Gas Safe Register", "legal requirement"] },
      { name: "HSE Gas Safety", url: "https://www.hse.gov.uk/gas/", keywords: ["Health and Safety Executive", "HSE"] }
    ],
    "US": [
      { name: "NFPA", url: "https://www.nfpa.org/", keywords: ["NFPA", "fire prevention"] },
      { name: "AGA", url: "https://www.aga.org/", keywords: ["American Gas Association", "safety protocol"] }
    ]
  },
  "Drain Specialist": {
    "UK": [
      { name: "NADC", url: "https://nadc.org.uk/", keywords: ["National Association of Drainage Contractors", "NADC"] },
      { name: "UK Building Regs (Part H)", url: "https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h", keywords: ["Building Regulations", "Part H"] }
    ],
    "US": [
      { name: "NASSCO", url: "https://www.nassco.org/", keywords: ["NASSCO", "underground infrastructure"] }
    ]
  },
  "Glazier": {
    "UK": [
      { name: "FENSA", url: "https://www.fensa.org.uk/", keywords: ["FENSA", "certified installation"] },
      { name: "CERTASS", url: "https://www.certass.co.uk/", keywords: ["CERTASS", "glazing standards"] },
      { name: "GGF", url: "https://www.ggf.org.uk/", keywords: ["Glass and Glazing Federation", "industry body"] }
    ],
    "US": [
      { name: "NGA", url: "https://www.glass.org/", keywords: ["National Glass Association", "glazing professional"] },
      { name: "FGIA (Formerly IGMA)", url: "https://fgiaonline.org/", keywords: ["FGIA", "installation standards"] }
    ]
  },
  "Roofer": {
    "UK": [
      { name: "NFRC", url: "https://www.nfrc.co.uk/", keywords: ["National Federation of Roofing Contractors", "NFRC"] },
      { name: "CompetentRoofer", url: "https://competentroofer.co.uk/", keywords: ["CompetentRoofer", "self-certificate"] }
    ],
    "US": [
      { name: "NRCA", url: "https://www.nrca.net/", keywords: ["National Roofing Contractors Association", "excellence"] }
    ]
  },
  "Builder": {
    "UK": [
      { name: "FMB", url: "https://www.fmb.org.uk/", keywords: ["Federation of Master Builders", "FMB"] },
      { name: "NHBC", url: "https://www.nhbc.co.uk/", keywords: ["NHBC", "new home warranty"] },
      { name: "CIOB", url: "https://www.ciob.org/", keywords: ["Chartered Institute of Building", "construction standard"] }
    ],
    "US": [
      { name: "NAHB", url: "https://www.nahb.org/", keywords: ["National Association of Home Builders", "NAHB"] },
      { name: "AGC", url: "https://www.agc.org/", keywords: ["Associated General Contractors", "construction industry"] }
    ]
  },
  "Water Restoration": {
    "UK": [
      { name: "BDMA", url: "https://www.bdma.org.uk/", keywords: ["British Damage Management Association", "recovery"] }
    ],
    "US": [
      { name: "IICRC", url: "https://iicrc.org/", keywords: ["IICRC", "restoration certification"] },
      { name: "RIA", url: "https://www.restorationindustry.org/", keywords: ["Restoration Industry Association", "professional standards"] }
    ]
  },
  "Breakdown Recovery": {
    "UK": [
      { name: "IVR", url: "https://www.theivrgroup.com/", keywords: ["Institute of Vehicle Recovery", "IVR"] },
      { name: "SURVIVE Group", url: "https://www.survivegroup.org/", keywords: ["SURVIVE Group", "roadside safety"] },
      { name: "DVSA", url: "https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency", keywords: ["DVSA", "enforcement"] },
      { name: "RRRA", url: "https://www.rrra-recovery.co.uk/", keywords: ["RRRA", "recovery assistance"] }
    ],
    "US": [
      { name: "TRAA", url: "https://traaonline.com/", keywords: ["Towing and Recovery Association of America", "safety"] },
      { name: "FMCSA", url: "https://www.fmcsa.dot.gov/", keywords: ["FMCSA", "federal oversight"] }
    ]
  }
};

async function processPosts() {
  const { data: posts, error } = await supabase.from('posts').select('*');
  if (error) return;

  for (const post of posts) {
    const region = (post.title.includes('(UK') || post.slug.includes('-uk-')) ? 'UK' : 'US';
    
    let tradeLabel = null;
    const tradeMatch = post.content.match(/\*\*Trade:\*\*\s*(.*?)\s*(?:❄️|⚡|💧|🧱|🛠️|🪟|🏠|🚗)/);
    if (tradeMatch) tradeLabel = tradeMatch[1].trim();

    // Mapping fixes
    if (tradeLabel === 'HVAC' || tradeLabel === 'HVAC system' || post.title.includes('AC')) tradeLabel = "Air Conditioning (HVAC)";
    if (post.title.includes('Drain')) tradeLabel = 'Drain Specialist';
    if (post.title.includes('Plumb')) tradeLabel = 'Plumber';
    if (post.title.includes('Electric')) tradeLabel = 'Electrician';

    const authorities = authorityMap[tradeLabel]?.[region];
    if (authorities) {
      let content = post.content;

      // 1. Natural Integration (Sprinkling)
      authorities.forEach(a => {
        if (!content.includes(a.url)) {
          // Find matching keywords to anchor the link
          for (const kw of a.keywords) {
              const regex = new RegExp(`\\b${kw}\\b`, 'i');
              if (regex.test(content)) {
                content = content.replace(regex, `**[${kw}](${a.url})**`);
                break; // Only link each authority once in flow
              }
          }
        }
      });

      // 2. Fallback: Systematic Industry Standards Section
      if (!content.includes('### Industry Standards') && !content.includes('### Technical Compliance')) {
        const section = `\n\n### Technical Compliance & Professional Standards\nFor ${tradeLabel.toLowerCase()} services, we recommend verified specialists who adhere to the following professional bodies:\n` +
          authorities.map(a => `- **[${a.name}](${a.url})**`).join('\n') + '\n';
          
        if (content.includes('**[Find a Verified')) {
          content = content.replace('**[Find a Verified', section + '\n**[Find a Verified');
        } else if (content.includes('## Fun Fact')) {
          content = content.replace('## Fun Fact', section + '\n## Fun Fact');
        } else {
          content += section;
        }
      }

      // 3. Specific fix for US Heatwave Infographic
      if (post.slug === 'ac-heatwave-preparation-signs-repair-us-2026' && !content.includes('short-cycling-infographic.png')) {
        content = content.replace('Does your AC turn on and off Every 5-10 minutes? This is known as short-cycling.', 
          'Does your AC turn on and off Every 5-10 minutes? This is known as short-cycling.\n\n![Short-cycling infographic: Why the 5-10 minute cycle causes system damage](/blog/ac-heatwave-preparation-signs-repair-us-2026/short-cycling-infographic.png)');
      }

      if (content !== post.content) {
        const { error: updateError } = await supabase.from('posts').update({ content }).eq('id', post.id);
        if (!updateError) console.log(`Updated flow/assets: ${post.title}`);
      }
    }
  }
}

processPosts();
