/** A deterministic isometric massing sketch, NOT an AI-generated or approved plan. */
export default function BuildingMassing({ buildingType = 'Residential', cityTier = 'Tier 2' }) {
  const industrial = buildingType === 'Industrial'
  const floors = industrial ? 1 : buildingType === 'Commercial' ? 5 : 3
  const height = 37 + floors * 24
  const top = 196 - height
  const colors = industrial ? ['#b2cee7','#7ca3c8','#d3e5f3'] : buildingType === 'Commercial' ? ['#91c3ed','#5a93c6','#badcf7'] : ['#e0c8ad','#c09d80','#f6e7d7']
  return <div className="massing-visual">
    <svg viewBox="0 0 440 255" role="img" aria-label={`Illustrative isometric massing for a ${buildingType.toLowerCase()} building in a ${cityTier} city`}>
      <defs><linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#edf6fc"/><stop offset="1" stopColor="#dcecf8"/></linearGradient></defs>
      <rect width="440" height="255" rx="14" fill="url(#ground)"/>
      <path d="M0 224 L220 116 L440 226 V255 H0Z" fill="#d4e4e8" opacity=".4"/>
      <polygon points="67,204 220,128 373,205 220,246" fill="#bdd2d9"/>
      <polygon points="118,177 223,126 320,177 219,225" fill="#eef2ed"/>
      <polygon points={`145,${top+16} 241,${top-25} 324,${top+15} 222,${top+58}`} fill={colors[2]}/>
      <polygon points={`145,${top+16} 222,${top+58} 222,215 145,177`} fill={colors[0]}/>
      <polygon points={`222,${top+58} 324,${top+15} 324,177 222,215`} fill={colors[1]}/>
      {Array.from({length:floors},(_,floor) => {
        const y = top+57 + floor*(154-top)/floors
        return <g key={floor}>
          {Array.from({length:3},(_,j)=><polygon key={j} points={`${234+j*27},${y-j*11} ${249+j*27},${y-j*11-6} ${249+j*27},${y-j*11+5} ${234+j*27},${y-j*11+11}`} fill="#376a96" opacity=".75" />)}
          {Array.from({length:2},(_,j)=><polygon key={`a${j}`} points={`${154+j*29},${y-j*0+4} ${171+j*29},${y+12} ${171+j*29},${y+24} ${154+j*29},${y+16}`} fill="#5480a5" opacity=".7"/>)}
        </g>
      })}
      <polygon points="118,178 145,177 222,215 219,225" fill="#92bfc7" opacity=".7"/>
      <path d="M46 232 L130 194 M293 199 L396 244" stroke="#8aaeb8" strokeWidth="2" strokeDasharray="6 5" fill="none"/>
      <g fill="#519882"><circle cx="88" cy="202" r="10"/><circle cx="95" cy="196" r="8"/><circle cx="355" cy="210" r="10"/><circle cx="362" cy="207" r="8"/></g>
      <g fontFamily="Arial, sans-serif" fontSize="10" fill="#4d6c82"><text x="18" y="27" fontWeight="700">CONCEPTUAL MASSING STUDY</text><text x="18" y="43">Not to scale • No engineering approval</text><text x="343" y="29">{floors} {floors === 1 ? 'LEVEL' : 'LEVELS'}</text></g>
    </svg>
    <div className="massing-caption">Illustrative geometry only. Floor count and appearance are mockups, not an approved design or AI-generated render.</div>
  </div>
}
