import './SourceBadge.css';

const SOURCE_CONFIG = {
  // Indian Retailers (via Google Shopping)
  Flipkart: { color: '#2874f0', label: 'Flipkart' },
  'Amazon India': { color: '#ff9900', label: 'Amazon' },
  Amazon: { color: '#ff9900', label: 'Amazon' },
  BigBasket: { color: '#84c225', label: 'BigBasket' },
  Blinkit: { color: '#f8cb46', label: 'Blinkit' },
  'Swiggy Instamart': { color: '#fc8019', label: 'Swiggy' },
  Zepto: { color: '#8b5cf6', label: 'Zepto' },
  JioMart: { color: '#0078ad', label: 'JioMart' },
  Myntra: { color: '#ff3f6c', label: 'Myntra' },
  Nykaa: { color: '#fc2779', label: 'Nykaa' },
  Meesho: { color: '#570741', label: 'Meesho' },
  Snapdeal: { color: '#e40046', label: 'Snapdeal' },
  'Tata CLiQ': { color: '#6c3f96', label: 'Tata CLiQ' },
  Croma: { color: '#0f7d1c', label: 'Croma' },
  'Reliance Digital': { color: '#003d79', label: 'Reliance' },
  PharmEasy: { color: '#10847e', label: 'PharmEasy' },
  Netmeds: { color: '#24aeb1', label: 'Netmeds' },
  '1mg': { color: '#ff6f61', label: '1mg' },
  'Apollo Pharmacy': { color: '#00529b', label: 'Apollo' },
  // Original sources
  'Google Shopping': { color: '#4285f4', label: 'Google' },
  eBay: { color: 'var(--source-ebay)', label: 'eBay' },
  openFDA: { color: 'var(--source-fda)', label: 'FDA' },
  OpenFoodFacts: { color: 'var(--source-off)', label: 'OFF' },
  UPCItemDB: { color: 'var(--source-upc)', label: 'UPC' },
};

export default function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || { color: 'var(--text-muted)', label: source };

  return (
    <span
      className="source-badge"
      style={{ '--badge-color': cfg.color }}
      title={`Data from ${source}`}
    >
      <span className="source-dot" />
      {cfg.label}
    </span>
  );
}
