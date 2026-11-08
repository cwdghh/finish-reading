import { HistoryIcon } from "./icons";

interface SiteHeaderProps {
  historyCount: number;
  onHome: () => void;
  onHistory: () => void;
  onSources: () => void;
}

export function SiteHeader({ historyCount, onHome, onHistory, onSources }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button type="button" className="brand" onClick={onHome} aria-label="读完，回到首页">
        <span className="brand__mark">读完</span>
        <span className="brand__en">FINISH READING</span>
      </button>
      <nav className="site-nav" aria-label="站点导航">
        <button
          type="button"
          className="nav-button"
          onClick={onHistory}
          aria-label={`处方笺，查看读过的卡片${historyCount > 0 ? `，共 ${historyCount} 张` : ""}`}
          title="处方笺 · 读过的卡片"
        >
          <HistoryIcon />
          <span>处方笺</span>
          {historyCount > 0 && <span className="nav-count">{historyCount}</span>}
        </button>
        <button type="button" className="nav-button" onClick={onSources}>
          文本来源
        </button>
      </nav>
    </header>
  );
}
