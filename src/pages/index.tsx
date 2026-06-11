import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Images, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { useFaceCoach } from "@/hooks/useFaceCoach";
import { CoachingOverlay } from "@/components/CoachingOverlay";
import { StatusBanner } from "@/components/StatusBanner";
import { ModeSelector } from "@/components/ModeSelector";
import { ScoreRing } from "@/components/ScoreRing";
import { GallerySheet } from "@/components/GallerySheet";
import { MODES, type Mode } from "@/lib/coaching";
import { savePhoto } from "@/lib/gallery";
import { toast } from "sonner";

const PortraitCoachApp = () => {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("headshot");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [lastCapture, setLastCapture] = useState<{ dataUrl: string; score: number } | null>(null);
  const beforeScoreRef = useRef<number | null>(null);

  const { videoRef, ready, loading, error, result, landmarks, capture, fps } =
    useFaceCoach({ mode, enabled: started });

  // Track "before" score the first frame we see a face after starting.
  useEffect(() => {
    if (!ready || beforeScoreRef.current != null) return;
    if (result.status !== "noface" && result.scoreOverall > 0) {
      beforeScoreRef.current = result.scoreOverall;
    }
  }, [ready, result]);

  const handleCapture = async () => {
    const dataUrl = await capture();
    if (!dataUrl) {
      toast.error("Fotoğraf alınamadı");
      return;
    }
    setFlashing(true);
    setTimeout(() => setFlashing(false), 220);

    const entry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      mode,
      scoreOverall: result.scoreOverall,
      scoreFraming: result.scoreFraming,
      scoreLighting: result.scoreLighting,
      scoreComposition: result.scoreComposition,
      dataUrl,
      beforeScore: beforeScoreRef.current ?? undefined,
    };
    try {
      await savePhoto(entry);
      setLastCapture({ dataUrl, score: result.scoreOverall });
      toast.success(`Kaydedildi • Skor ${result.scoreOverall}`, {
        description: beforeScoreRef.current != null
          ? `Başlangıçtan +${result.scoreOverall - beforeScoreRef.current} iyileşme`
          : undefined,
      });
    } catch (e) {
      console.error(e);
      toast.error("Fotoğraf kaydedilemedi");
    }
  };

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  const activeMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-foreground select-none">
      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)]"
      />

      {/* Loading / error overlays */}
      {(loading || error) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-background/95 px-6 text-center">
          {error ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-lg font-bold">Kamera Hatası</h2>
              <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => location.reload()}
                className="mt-2 rounded-full bg-amber-gradient px-6 py-3 font-semibold text-primary-foreground shadow-amber"
              >
                Tekrar Dene
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Kamera ve yapay zeka hazırlanıyor…</p>
            </>
          )}
        </div>
      )}

      {/* Overlays */}
      {ready && (
        <>
          <CoachingOverlay result={result} landmarks={landmarks} />
          <StatusBanner result={result} />
        </>
      )}

      {/* Flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute inset-0 z-40 bg-white"
          />
        )}
      </AnimatePresence>

      {/* Mode + scores */}
      <div className="absolute inset-x-0 bottom-0 z-20 safe-bottom">
        <div className="bg-dark-fade-bottom pb-3 pt-10">
          {/* Mode description */}
          <div className="px-4 pb-2 text-center">
            <p className="text-[11px] uppercase tracking-[0.15em] text-primary/90">{activeMode.label}</p>
            <p className="text-xs text-white/70">{activeMode.description}</p>
          </div>

          <ModeSelector value={mode} onChange={setMode} />

          {/* Action row */}
          <div className="mt-3 flex items-end justify-between px-6">
            {/* Gallery */}
            <button
              onClick={() => setGalleryOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur transition-colors hover:bg-white/15"
              aria-label="Galeri"
            >
              {lastCapture ? (
                <img src={lastCapture.dataUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <Images className="h-6 w-6" />
              )}
            </button>

            {/* Shutter */}
            <button
              onClick={handleCapture}
              disabled={!ready}
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur disabled:opacity-50"
              aria-label="Fotoğraf çek"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
                  result.status === "perfect"
                    ? "bg-[hsl(var(--success))] shadow-[0_0_40px_hsl(var(--success)/0.6)] animate-pulse-amber"
                    : "bg-amber-gradient shadow-amber"
                } group-active:scale-90`}
              >
                <Camera className="h-7 w-7 text-primary-foreground" />
              </span>
            </button>

            {/* Reset baseline */}
            <button
              onClick={() => { beforeScoreRef.current = result.scoreOverall; toast("Başlangıç skoru sıfırlandı"); }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur transition-colors hover:bg-white/15"
              aria-label="Sıfırla"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>

          {/* Score rings */}
          <div className="mt-3 flex items-center justify-center gap-5 px-4">
            <ScoreRing value={result.scoreFraming} label="Çerçeve" />
            <ScoreRing value={result.scoreComposition} label="Komp." />
            <ScoreRing value={result.scoreLighting} label="Işık" />
            <ScoreRing value={result.scoreOverall} label="Genel" size={64} />
          </div>

          {/* FPS / before */}
          <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-white/40">
            <span>{fps} FPS</span>
            {beforeScoreRef.current != null && <span>• Başlangıç: {beforeScoreRef.current}</span>}
          </div>
        </div>
      </div>

      <GallerySheet open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </div>
  );
};

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 safe-top safe-bottom">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

        <header className="relative pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Portre Koçu</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight">
            Profesyonel <span className="bg-amber-gradient bg-clip-text text-transparent">portreler</span> için yapay zeka koçunuz
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Telefonunuzla headshot, oyuncu, yazar ve sinematik portreler çekin.
            Gerçek zamanlı yönlendirme ve sahne analiziyle.
          </p>
        </header>

        <section className="relative mt-8 flex-1 space-y-3">
          {[
            { title: "Canlı yüz analizi", desc: "468 noktalı yüz haritası ile pozisyon takibi" },
            { title: "Akıllı yönlendirme", desc: "Türkçe sesli ve görsel ipuçlarıyla kadrajı düzeltin" },
            { title: "Işık ve kompozisyon skoru", desc: "Her karede 0-100 anlık puanlama" },
            { title: "Cihazda saklama", desc: "Fotoğraflar sadece sizin telefonunuzda kalır" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="flex items-start gap-3 rounded-2xl bg-card/60 p-3 backdrop-blur border border-border"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-gradient text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </section>

        <footer className="relative pb-6 pt-6">
          <button
            onClick={onStart}
            className="group relative w-full overflow-hidden rounded-2xl bg-amber-gradient px-6 py-4 font-bold text-primary-foreground shadow-amber transition-transform active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Camera className="h-5 w-5" /> Kamerayı Başlat
            </span>
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Devam ederek kamera erişimine izin vermiş olursunuz. Görüntüler cihazınızdan çıkmaz.
          </p>
        </footer>
      </div>
    </main>
  );
}

const Index = PortraitCoachApp;
export default Index;
