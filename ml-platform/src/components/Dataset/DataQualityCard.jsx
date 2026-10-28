import React, { useState } from 'react';
import { api } from '../../api/client';

const DataQualityCard = ({ qualityReport, medallion }) => {
  const [downloading, setDownloading] = useState(null);

  if (!qualityReport && !medallion) return null;

  const score = qualityReport?.score ?? 100;
  const verdictLabel = qualityReport?.verdict_label ?? 'Passed Data Quality Gate';
  const assertions = qualityReport?.assertions ?? [];
  const summary = qualityReport?.summary ?? {};
  const bronze = medallion?.bronze;
  const silver = medallion?.silver;
  const gold = medallion?.gold;

  const handleDownload = async (tier) => {
    setDownloading(tier);
    try {
      await api.downloadParquet(tier);
    } finally {
      setDownloading(null);
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s >= 55) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e3e8ee] shadow-sm p-6 space-y-6">
      {/* Top Banner: Score & Medallion Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#e3e8ee]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-[#ede9fe] text-[#635bff] rounded-md">
              Data Engineering
            </span>
            <span className="text-xs font-semibold text-[#8792a2]">
              Medallion Lakehouse & Schema Contract
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1a1f36]">
            Automated Data Quality & Lakehouse Gate
          </h2>
          <p className="text-sm text-[#4f566b] mt-0.5">
            Incoming batch verified against 5 data engineering contract assertions before promotion.
          </p>
        </div>

        {/* Quality Score Badge */}
        <div className="flex items-center gap-4 bg-[#f8fafc] px-5 py-3 rounded-xl border border-[#e3e8ee]">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8792a2]">Quality Score</div>
            <div className="text-xs font-semibold text-[#4f566b]">{verdictLabel}</div>
          </div>
          <div className={`px-4 py-2 rounded-xl border font-black text-2xl tracking-tight ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>
      </div>

      {/* Medallion Tier Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bronze Tier */}
        <div className="p-4 rounded-xl border border-[#e3e8ee] bg-[#fafbfc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#b45309] flex items-center gap-1.5">
                <span>🥉</span> Bronze (Raw Ingestion)
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                Immutable
              </span>
            </div>
            <p className="text-xs text-[#4f566b] mb-3">
              Raw payload saved with cryptographic SHA-256 integrity hash.
            </p>
            <div className="space-y-1 text-xs text-[#1a1f36] font-medium">
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Size:</span>
                <span className="font-bold">{bronze?.raw_size_human || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Records:</span>
                <span className="font-bold">{summary.total_rows?.toLocaleString() || bronze?.rows || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Checksum:</span>
                <span className="font-mono text-[10px] text-[#635bff] truncate max-w-[120px]" title={bronze?.checksum_sha256}>
                  {bronze?.checksum_sha256 ? `${bronze.checksum_sha256.slice(0, 10)}…` : 'Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Silver Tier */}
        <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#334155] flex items-center gap-1.5">
                <span>🥈</span> Silver (Cleaned Parquet)
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Columnar
              </span>
            </div>
            <p className="text-xs text-[#4f566b] mb-3">
              Deduplicated and serialized into Snappy-compressed Apache Parquet.
            </p>
            <div className="space-y-1 text-xs text-[#1a1f36] font-medium">
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Parquet Size:</span>
                <span className="font-bold">{silver?.parquet_size_human || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Compression Ratio:</span>
                <span className="font-bold text-emerald-600">
                  {silver?.compression_ratio_pct ? `${silver.compression_ratio_pct}% saved` : 'Optimized'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Duplicates Pruned:</span>
                <span className="font-bold">{summary.duplicate_rows ?? (silver?.deduped_rows_removed || 0)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload('silver')}
            disabled={downloading === 'silver'}
            className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#0e6245] text-white hover:bg-[#0b4d36] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {downloading === 'silver' ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>⚡ Download Silver (.parquet)</span>
            )}
          </button>
        </div>

        {/* Gold Tier */}
        <div className="p-4 rounded-xl border border-[#fef08a] bg-[#fefce8]/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#854d0e] flex items-center gap-1.5">
                <span>🥇</span> Gold (Feature Store)
              </span>
              <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded font-bold">
                Curated
              </span>
            </div>
            <p className="text-xs text-[#4f566b] mb-3">
              Normalized feature tensors and one-hot encodings prepared for downstream ML or BI.
            </p>
            <div className="space-y-1 text-xs text-[#1a1f36] font-medium">
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Status:</span>
                <span className="font-bold text-[#854d0e]">
                  {gold ? 'Ready in Lakehouse' : 'Auto-generated on Training'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Format:</span>
                <span className="font-bold">PyArrow Snappy Parquet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8792a2]">Features:</span>
                <span className="font-bold">{gold?.features_count || summary.total_columns || '—'}</span>
              </div>
            </div>
          </div>

          {gold ? (
            <button
              onClick={() => handleDownload('gold')}
              disabled={downloading === 'gold'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#b45309] text-white hover:bg-[#92400e] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {downloading === 'gold' ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>📦 Download Gold Feature Parquet</span>
              )}
            </button>
          ) : (
            <div className="mt-4 py-2 px-3 text-[11px] text-center font-semibold text-[#854d0e] bg-yellow-100/60 rounded-lg">
              Populates after Feature Prep / Train
            </div>
          )}
        </div>
      </div>

      {/* Quality Assertions Checklist */}
      {assertions.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#8792a2]">
            Data Quality Contract Assertions ({summary.passed_assertions || `${assertions.filter(a => a.passed).length}/${assertions.length}`})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assertions.map((a, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  a.passed ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#fff1f2] border-[#fecdd3]'
                }`}
              >
                <span className={`text-base leading-none ${a.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {a.passed ? '✅' : '⚠️'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#1a1f36]">{a.rule}</div>
                  <div className="text-[11px] text-[#4f566b] mt-0.5">{a.details}</div>
                  <div className="text-[10px] text-[#8792a2] font-semibold mt-0.5">{a.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityCard;
