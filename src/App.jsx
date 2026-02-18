import { useEffect, useMemo, useState } from "react";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function App() {
  const [paras, setParas] = useState(4);
  const [format, setFormat] = useState("text"); // "text" | "html"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]); // text: string[], html: string (or string[])

  const url = useMemo(() => {
    // Bacon Ipsum API
    // format=text -> JSON array of strings
    // format=html -> JSON array (often contains HTML strings) or HTML string; biz normalize edeceğiz
    return `https://baconipsum.com/api/?type=all-meat&paras=${paras}&format=${format}`;
  }, [paras, format]);

  const normalize = (res) => {
    // çoğu zaman array geliyor: ["p1", "p2"...] veya html stringler
    if (Array.isArray(res)) return res;
    if (typeof res === "string") return [res];
    return [];
  };

  const fetchParas = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await fetch(url);
      if (!r.ok) throw new Error("API isteği başarısız oldu.");
      const json = await r.json();
      setData(normalize(json));
    } catch (e) {
      setError(e?.message || "Bir hata oluştu.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // başlangıçta 4 paragraf
    fetchParas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // paras veya format değişince otomatik güncelle
  useEffect(() => {
    fetchParas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const onParasChange = (e) => {
    const val = clamp(Number(e.target.value || 1), 1, 20);
    setParas(val);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#222", color: "#fff", padding: 32 }}>
      <h1 style={{ fontSize: 64, margin: 0, fontWeight: 300 }}>
        React sample text generator app
      </h1>

      <hr style={{ margin: "24px 0", borderColor: "#444" }} />

      <div style={{ display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>Paragraphs</label>
          <input
            type="number"
            min={1}
            max={20}
            value={paras}
            onChange={onParasChange}
            style={{
              width: 320,
              padding: 12,
              fontSize: 20,
              borderRadius: 6,
              border: "1px solid #555",
            }}
          />
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Min 1 paragraf seçilmelidir.
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>Include HTML</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{
              width: 140,
              padding: 12,
              fontSize: 18,
              borderRadius: 6,
              border: "1px solid #555",
              background: "#fff",
            }}
          >
            <option value="text">No</option>
            <option value="html">Yes</option>
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          background: "#333",
          borderRadius: 12,
          padding: 24,
          minHeight: 360,
        }}
      >
        {loading && <div style={{ opacity: 0.8 }}>Yükleniyor...</div>}
        {error && <div style={{ color: "#ffb4b4" }}>{error}</div>}

        {!loading && !error && (
          <div style={{ fontSize: 22, lineHeight: 1.8 }}>
            {format === "text" &&
              data.map((p, i) => (
                <p key={i} style={{ marginTop: i === 0 ? 0 : 18 }}>
                  {p}
                </p>
              ))}

            {format === "html" && (
              <div
                // API'den gelen HTML’yi render eder
                // Güvenlik notu: Bu API güvenilir kabul ediliyor, rastgele kullanıcı inputu değil.
                dangerouslySetInnerHTML={{ __html: data.join("\n") }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
