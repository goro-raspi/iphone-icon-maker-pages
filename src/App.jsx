import { useMemo, useState } from 'react'

const SIZE_PRESETS = [1024, 512, 180]

function App() {
  const [file, setFile] = useState(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [busy, setBusy] = useState(false)

  const canDownload = !!iconUrl && !busy

  const info = useMemo(() => {
    if (!file) return 'PNG / JPEG / WebP を1枚選択してください'
    return `${file.name} (${Math.round(file.size / 1024)} KB)`
  }, [file])

  const loadFile = async (picked) => {
    if (!picked) return
    if (!/^image\/(png|jpeg|webp)$/.test(picked.type)) {
      alert('対応形式は PNG / JPEG / WebP のみです。')
      return
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (iconUrl) URL.revokeObjectURL(iconUrl)

    const src = URL.createObjectURL(picked)
    setFile(picked)
    setSourceUrl(src)
    await generateIcon(src, 1024)
  }

  const generateIcon = async (src, size = 1024) => {
    setBusy(true)
    try {
      const img = await readImage(src)
      const blob = await renderSquare(img, size, bgColor)
      const url = URL.createObjectURL(blob)
      if (size === 1024) {
        if (iconUrl) URL.revokeObjectURL(iconUrl)
        setIconUrl(url)
      } else {
        downloadBlob(blob, `app-icon-${size}.png`)
        URL.revokeObjectURL(url)
      }
    } finally {
      setBusy(false)
    }
  }

  const regenerate = async () => {
    if (!sourceUrl) return
    await generateIcon(sourceUrl, 1024)
  }

  const downloadMain = async () => {
    if (!sourceUrl) return
    const img = await readImage(sourceUrl)
    const blob = await renderSquare(img, 1024, bgColor)
    downloadBlob(blob, 'app-icon-1024.png')
  }

  const downloadPreset = async (size) => {
    if (!sourceUrl) return
    const img = await readImage(sourceUrl)
    const blob = await renderSquare(img, size, bgColor)
    downloadBlob(blob, `app-icon-${size}.png`)
  }

  return (
    <main className="wrap">
      <header className="app-header">
        <div className="logo-dot" />
        <div className="app-title">
          <h1>iPhone アイコン作成ツール</h1>
          <p>画像を中央トリミングして 1024x1024 PNG を生成</p>
        </div>
      </header>

      <section className="card drop-card">
        <label className="drop">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => loadFile(e.target.files?.[0])}
            hidden
          />
          <span className="drop-title">画像を選択</span>
          <span className="muted">ドラッグ&ドロップ or クリック</span>
          <span className="muted small">{info}</span>
        </label>
      </section>

      <section className="card controls">
        <div className="row">
          <label>透過背景の塗りつぶし色</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          <button onClick={regenerate} disabled={!sourceUrl || busy}>プレビュー更新</button>
        </div>
      </section>

      <section className="preview-grid">
        <div className="card preview-card">
          <div className="section-title">入力画像</div>
          {sourceUrl ? <img src={sourceUrl} className="preview" alt="input" /> : <div className="placeholder">未選択</div>}
        </div>
        <div className="card preview-card">
          <div className="section-title">出力（1024x1024）</div>
          {iconUrl ? <img src={iconUrl} className="preview" alt="output" /> : <div className="placeholder">未生成</div>}
        </div>
      </section>

      <section className="card actions">
        <button onClick={downloadMain} disabled={!canDownload}>1024x1024 を保存</button>
        {SIZE_PRESETS.filter((s) => s !== 1024).map((size) => (
          <button key={size} className="ghost" onClick={() => downloadPreset(size)} disabled={!canDownload}>
            {size}x{size} を保存
          </button>
        ))}
      </section>
    </main>
  )
}

function readImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function renderSquare(img, size, bgColor) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas初期化失敗'))

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    const side = Math.min(img.width, img.height)
    const sx = (img.width - side) / 2
    const sy = (img.height - side) / 2

    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('PNG生成失敗'))
      resolve(blob)
    }, 'image/png')
  })
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default App
