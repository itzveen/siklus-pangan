import React, { useState, useRef, useEffect } from 'react';
import { fetchFromBackend } from '../../config/api.js';

// Figma assets
import imgReceiptCapture from '../../assets/figma/187d8.png';
import imgBackArrow from '../../assets/figma/4d9b8.svg';
import imgCloseIcon from '../../assets/figma/2e009.svg';
import imgFlashIcon from '../../assets/figma/4353b.svg';
import imgGalleryIcon from '../../assets/figma/7c0c3.svg';
import imgPlusIcon from '../../assets/figma/27d8b.svg';
import imgCheckWhite from '../../assets/figma/aa63c.svg';
import imgReceiptTexture from '../../assets/figma/24d5f.png';
import imgFileMetaIcon from '../../assets/figma/60b97.svg';
import imgMinusIcon from '../../assets/figma/d4d77.svg';
import imgPlusDarkIcon from '../../assets/figma/40b90.svg';
import imgChevronUpIcon from '../../assets/figma/8f603.svg';
import imgCrossRedIcon from '../../assets/figma/77c09.svg';
import imgCameraGreenIcon from '../../assets/figma/4bab2.svg';
import imgPlusGreenIcon from '../../assets/figma/5ebd5.svg';
import imgFailedBackIcon from '../../assets/figma/c0667.svg';
import imgSunTipIcon from '../../assets/figma/55f1b.svg';
import imgReceiptTipIcon from '../../assets/figma/6af21.svg';
import imgCameraTipIcon from '../../assets/figma/c18b2.svg';
import imgDialogCheckIcon from '../../assets/figma/c4268.svg';

/**
 * ScanModal — Slicing Section "Scan & Input" (AI Scan Flow)
 * Mencakup layar Figma:
 * - 22:2306 (Langkah 1 dari 3: Ambil Foto)
 * - 23:2426 (Langkah 2 dari 3: Memindai Struk)
 * - 45:615  (Langkah 2 dari 3: Scan Gagal)
 * - 22:1954 (Hasil Scan Struk Belanja & Filter Non-Makanan)
 * - 66:16   (Dialog makanan berhasil disimpan)
 */
export default function ScanModal({
  initialStep = 'capture', // 'capture' | 'scanning' | 'result' | 'failed'
  onClose,
  onOpenManual,
  onSavedToFridge
}) {
  const [step, setStep] = useState(initialStep);
  const [scanMode, setScanMode] = useState('receipt'); // 'receipt' | 'fridge'
  const [flashOn, setFlashOn] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('Struk_Superindo_18May.jpg');
  const [showIgnored, setShowIgnored] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedCount, setSavedCount] = useState(3);

  const [foodItems, setFoodItems] = useState([]);
  const [ignoredItems, setIgnoredItems] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    if (step !== 'capture') {
      stopCamera();
      return;
    }

    let cancelled = false;
    async function startRearCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      try {
        let stream = null;
        try {
          // Prioritaskan kamera belakang (environment) secara eksplisit
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' } },
            audio: false
          });
        } catch {
          // Cari label kamera belakang bila tersedia, jika tidak gunakan facingMode environment
          const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
          const rearCam = devices.find(
            (d) => d.kind === 'videoinput' && /back|rear|environment|belakang/i.test(d.label || '')
          );
          stream = await navigator.mediaDevices.getUserMedia({
            video: rearCam ? { deviceId: { exact: rearCam.deviceId } } : { facingMode: 'environment' },
            audio: false
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        setCameraReady(false);
      }
    }

    startRearCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step]);

  const handleToggleFlash = async () => {
    const next = !flashOn;
    setFlashOn(next);
    const track = streamRef.current?.getVideoTracks?.()?.[0];
    if (track?.applyConstraints) {
      try {
        await track.applyConstraints({ advanced: [{ torch: next }] });
      } catch {
        // Torch tidak didukung di semua perangkat
      }
    }
  };

  const handleCaptureFromCamera = () => {
    if (!cameraReady || !videoRef.current || videoRef.current.videoWidth === 0) {
      // Fallback ke kamera belakang native perangkat bila WebRTC tidak aktif
      cameraInputRef.current?.click();
      return;
    }
    let capturedBase64 = null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setUploadedPreview(dataUrl);
      setUploadedFileName('Foto_Struk_Kamera.jpg');
      capturedBase64 = dataUrl.split(',')[1];
    }
    stopCamera();
    triggerScanProcess(capturedBase64, 'image/jpeg');
  };

  useEffect(() => {
    if (step !== 'scanning' || !scanComplete) return;
    const timer = setTimeout(() => {
      setStep('result');
    }, 1500);
    return () => clearTimeout(timer);
  }, [step, scanComplete]);

  const triggerScanProcess = async (base64Data = null, mimeType = 'image/jpeg') => {
    setScanComplete(false);
    setStep('scanning');
    try {
      // Hit API Backend POST /api/ai/scan sesuai kontrak BE (base64Data & mimeType)
      const apiRes = await fetchFromBackend('/ai/scan', {
        method: 'POST',
        body: JSON.stringify({
          base64Data: base64Data || '',
          mimeType
        })
      });

      const res = apiRes?.data || apiRes;
      if (res && Array.isArray(res.foodItems) && res.foodItems.length > 0) {
        setFoodItems(
          res.foodItems.map((item) => ({
            ...item,
            selected: item.selected !== false,
            expiryDays: Number(item.expiryDays ?? 5)
          }))
        );
        setIgnoredItems(Array.isArray(res.ignoredItems) ? res.ignoredItems : []);
        setScanComplete(true);
      } else {
        setStep('failed');
      }
    } catch {
      setStep('failed');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setUploadedPreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      triggerScanProcess(base64Data, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleItem = (index) => {
    setFoodItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleAdjustDays = (index, delta) => {
    setFoodItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, expiryDays: Math.max(1, Number(item.expiryDays || 1) + delta) } : item
      )
    );
  };

  const selectedItems = foodItems.filter((i) => i.selected !== false);

  const handleSaveSelected = async () => {
    const toSave = selectedItems.length > 0 ? selectedItems : foodItems;
    try {
      // Hit API Backend POST /api/foods/bulk
      await fetchFromBackend('/foods/bulk', {
        method: 'POST',
        body: JSON.stringify({ items: toSave })
      });
    } catch {
      // Tetap lanjutkan jika offline
    }
    setSavedCount(toSave.length);
    setShowSuccessDialog(true);
  };

  return (
    <div className="w-full max-w-[402px] mx-auto bg-[#f8fff4] min-h-screen overflow-hidden relative font-['Poppins']">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* =====================================================================
          STEP 1: AMBIL FOTO (Node 22:2306)
      ===================================================================== */}
      {step === 'capture' && (
        <div className="bg-[#f8fff4] relative w-full min-h-screen px-5 pt-5 pb-6 flex flex-col justify-between gap-4" data-node-id="22:2306">
          {/* TopHeader + Stepper + Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-[#e2e8f0] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full size-[42px] shrink-0 cursor-pointer hover:bg-slate-50"
              >
                <img alt="Kembali" className="size-[18px]" src={imgBackArrow} />
              </button>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[#0e7f3d] text-[11px] uppercase tracking-wide block">
                  Langkah 1 dari 3
                </span>
                <h1 className="font-extrabold text-[#11231b] text-[19px] leading-tight truncate">
                  {scanMode === 'receipt' ? 'Scan Struk Belanja' : 'Scan Isi Kulkas'}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleToggleFlash}
                title="Lampu Flash"
                className={`flex items-center justify-center rounded-full size-[42px] shrink-0 transition-all cursor-pointer ${
                  flashOn ? 'bg-[#16a34a] ring-2 ring-[#58d635]' : 'bg-[#0b6623]'
                }`}
              >
                <img alt="Flash" className="size-[18px]" src={imgFlashIcon} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex gap-2 items-center w-full">
              <div className="bg-[#16a34a] flex-1 h-[4px] rounded-full" />
              <div className="bg-[#d1fae5] flex-1 h-[4px] rounded-full" />
              <div className="bg-[#d1fae5] flex-1 h-[4px] rounded-full" />
            </div>

            {/* Segmented Tab Switcher */}
            <div className="bg-[#0b6623] flex items-center p-[5px] rounded-full w-full">
              <button
                type="button"
                onClick={() => setScanMode('receipt')}
                className={`flex-1 py-[8px] rounded-full text-[13.5px] leading-[20px] text-center transition-all cursor-pointer ${
                  scanMode === 'receipt'
                    ? 'bg-white text-[#198038] shadow-xs font-semibold'
                    : 'text-white/90 font-normal'
                }`}
              >
                Struk Belanja
              </button>
              <button
                type="button"
                onClick={() => setScanMode('fridge')}
                className={`flex-1 py-[8px] rounded-full text-[13.5px] leading-[20px] text-center transition-all cursor-pointer ${
                  scanMode === 'fridge'
                    ? 'bg-white text-[#198038] shadow-xs font-semibold'
                    : 'text-white/90 font-normal'
                }`}
              >
                Isi Kulkas
              </button>
            </div>
          </div>

          {/* Viewfinder Area */}
          <div className="bg-[#0b6623] flex flex-col h-[360px] items-center justify-between overflow-hidden p-5 relative rounded-[28px] w-full shadow-md">
            {/* Live Rear Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
                cameraReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Corner Brackets */}
            <div className="absolute border-[#58d635] border-l-[3px] border-t-[3px] left-6 top-6 rounded-tl-[12px] size-[32px] z-10 pointer-events-none" />
            <div className="absolute border-[#58d635] border-r-[3px] border-t-[3px] right-6 top-6 rounded-tr-[12px] size-[32px] z-10 pointer-events-none" />
            <div className="absolute border-[#58d635] border-b-[3px] border-l-[3px] bottom-20 left-6 rounded-bl-[12px] size-[32px] z-10 pointer-events-none" />
            <div className="absolute border-[#58d635] border-b-[3px] border-r-[3px] bottom-20 right-6 rounded-br-[12px] size-[32px] z-10 pointer-events-none" />

            {/* Clean Fallback when camera is loading or unavailable */}
            {!cameraReady && (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 gap-3 cursor-pointer"
              >
                {uploadedPreview ? (
                  <img
                    alt="Preview"
                    className="h-[220px] w-[180px] object-cover rounded-[14px] border border-white/30"
                    src={uploadedPreview}
                  />
                ) : (
                  <>
                    <div className="size-14 rounded-full bg-white/15 flex items-center justify-center">
                      <img alt="Kamera" className="size-7 brightness-0 invert" src={imgCameraGreenIcon} />
                    </div>
                    <p className="text-white font-semibold text-[13px] leading-snug">
                      Ketuk di sini atau tombol foto di bawah
                      <br />
                      <span className="text-white/75 font-normal text-[11.5px]">
                        untuk membuka kamera belakang
                      </span>
                    </p>
                  </>
                )}
              </button>
            )}
            {cameraReady && <div className="flex-1" />}

            {/* Instruction Banner */}
            <div className="backdrop-blur-[4px] bg-white/95 border border-white/20 flex flex-col items-center py-2.5 px-4 relative z-10 rounded-[14px] w-full">
              <p className="font-medium text-[12.5px] leading-snug text-[#11231b] text-center">
                {scanMode === 'receipt'
                  ? 'Posisikan seluruh struk di dalam bingkai hingga teks terlihat jelas.'
                  : 'Arahkan kamera belakang ke bahan makanan atau isi kulkasmu.'}
              </p>
            </div>
          </div>

          {/* Shutter Controls & Action Buttons */}
          <div className="flex items-center justify-around px-2 pt-1 pb-2 w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col gap-1.5 items-center group cursor-pointer"
            >
              <div className="bg-[#16a34a] flex items-center justify-center p-3.5 rounded-[16px] group-hover:bg-[#15803d] transition-colors shadow-xs">
                <img alt="Galeri" className="size-[22px]" src={imgGalleryIcon} />
              </div>
              <span className="font-bold text-[12px] text-[#374151]">
                Galeri
              </span>
            </button>

            <button
              type="button"
              onClick={handleCaptureFromCamera}
              aria-label="Ambil Foto"
              className="border-4 border-[#16a34a]/30 shadow-md flex items-center justify-center p-[6px] rounded-full size-[76px] active:scale-95 transition-transform bg-white cursor-pointer"
            >
              <div className="bg-[#0e7f3d] size-full rounded-full flex items-center justify-center">
                <div className="size-[22px] rounded-full border-2 border-white/80" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenManual?.('raw')}
              className="flex flex-col gap-1.5 items-center group cursor-pointer"
            >
              <div className="bg-[#16a34a] flex items-center justify-center p-3.5 rounded-[16px] group-hover:bg-[#15803d] transition-colors shadow-xs">
                <img alt="Manual" className="size-[22px]" src={imgPlusIcon} />
              </div>
              <span className="font-bold text-[12px] text-[#374151]">
                Manual
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: MEMINDAI STRUK (Node 23:2426)
      ===================================================================== */}
      {step === 'scanning' && (
        <div className="bg-[#f8fff4] relative w-full min-h-[925px] px-[26px] pt-[24px] pb-[32px]" data-node-id="23:2426">
          <style>{`
            @keyframes eatwiseScanLaser {
              0% { top: 14px; }
              50% { top: 196px; }
              100% { top: 14px; }
            }
          `}</style>
          {/* Step HeaderSection */}
          <div className="flex flex-col gap-[16px]">
            <div className="flex gap-[14px] items-center w-full">
              <button
                type="button"
                onClick={() => setStep('capture')}
                className="bg-white border border-[#e2e8f0] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full size-[44px] shrink-0 cursor-pointer"
              >
                <img alt="Kembali" className="size-[20px]" src={imgBackArrow} />
              </button>
              <div className="flex flex-col gap-px items-start font-['Plus_Jakarta_Sans']">
                <span className="font-medium text-[#64748b] text-[12px] leading-[15px] tracking-[-0.3px]">
                  Langkah 2 dari 3
                </span>
                <h2 className="font-bold text-[#0f172a] text-[18px] leading-[22.5px] tracking-[-0.45px]">
                  Memindai Struk
                </h2>
              </div>
            </div>

            {/* Segmented Step Progress Bar */}
            <div className="flex gap-[6px] h-[5px] items-start justify-center w-full">
              <div className="bg-[#0f8735] flex-1 h-full rounded-full" />
              <div className="bg-[#0f8735] flex-1 h-full rounded-full" />
              <div className="bg-[#cce8cd] flex-1 h-full rounded-full" />
            </div>
          </div>

          {/* ScanVisualCard */}
          <div className="bg-[#0b6623] flex flex-col h-[216px] items-center justify-end overflow-hidden rounded-[24px] shadow-md mt-[24px] relative">
            {/* AI Pill Tag */}
            <div className="absolute backdrop-blur-[4px] bg-[rgba(51,65,85,0.9)] border border-[rgba(71,85,105,0.5)] flex gap-[6px] items-center left-[14px] px-[11px] py-[5px] rounded-full top-[14px] z-20">
              <div className="bg-[#22c55e] rounded-full size-[8px]" />
              <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[11px] leading-[16.5px] text-white tracking-[0.275px]">
                Gemini Vision AI
              </span>
            </div>

            {/* Glowing Animated Laser Scan Line */}
            <div
              className="absolute bg-[#4be277] h-[3px] left-0 right-0 z-20 shadow-[0px_0px_14px_3px_rgba(75,226,119,0.85),0px_0px_6px_1px_#22c55e]"
              style={{ animation: 'eatwiseScanLaser 2.2s ease-in-out infinite' }}
            />

            {/* Captured Photo + Receipt Highlight Overlay Container */}
            <div className="bg-white flex flex-col h-[186px] items-center justify-center relative rounded-t-[12px] shadow-xl w-[220px] overflow-hidden">
              <img
                alt="Hasil Foto"
                className="absolute inset-0 size-full object-cover"
                src={uploadedPreview || imgReceiptCapture}
              />
              {/* Translucent Detection Lines Overlay on top of captured photo */}
              <div className="relative z-10 flex flex-col justify-between w-full h-full bg-black/15 p-[12px]">
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="bg-[rgba(240,253,244,0.75)] border border-[#10b981] flex flex-col gap-[4px] items-start px-[8px] py-[5px] rounded-[5px] w-full">
                    <div className="bg-[#22c55e] h-[4px] rounded-full w-[65%]" />
                    <div className="flex gap-[4px] items-start">
                      <div className="bg-[#86efac] h-[4px] rounded-full w-[35px]" />
                      <div className="bg-[#86efac] h-[4px] rounded-full w-[25px]" />
                    </div>
                  </div>
                  <div className="bg-[rgba(240,253,244,0.75)] border border-[#10b981] flex flex-col gap-[4px] items-start px-[8px] py-[5px] rounded-[5px] w-full">
                    <div className="bg-[#22c55e] h-[4px] rounded-full w-[75%]" />
                    <div className="flex gap-[4px] items-start">
                      <div className="bg-[#86efac] h-[4px] rounded-full w-[28px]" />
                      <div className="bg-[#86efac] h-[4px] rounded-full w-[36px]" />
                    </div>
                  </div>
                </div>
                <div className="bg-[rgba(254,242,242,0.75)] border border-[#ef4444] border-dashed flex gap-[4px] items-center px-[8px] py-[5px] rounded-[5px] w-full">
                  <div className="bg-[#f87171] h-[4px] rounded-full w-[55%]" />
                  <div className="bg-[#fca5a5] h-[4px] rounded-full w-[25%]" />
                </div>
              </div>
            </div>
          </div>

          {/* StatusHeading */}
          <div className="flex flex-col gap-[4px] items-start mt-[20px]">
            <h2 className="font-extrabold text-[#111827] text-[20px] leading-[27.5px] tracking-[-0.5px]">
              AI sedang memisahkan bahan
              <br />
              makanan...
            </h2>
            <p className="font-normal text-[#64748b] text-[14px] leading-[21px] pb-[8px]">
              Biasanya hanya butuh beberapa detik.
            </p>
            <div className="bg-[#e2e8f0] h-[6px] overflow-hidden rounded-full w-full">
              <div
                className={`bg-[#0f8735] h-full rounded-full transition-all duration-500 ${
                  scanComplete ? 'w-full' : 'w-2/3 animate-pulse'
                }`}
              />
            </div>
          </div>

          {/* ChecklistCard */}
          <div className="bg-white border border-[#d5ead8] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] items-start p-[21px] rounded-[24px] mt-[24px]">
            <div className="flex gap-[14px] items-start w-full">
              <div className="bg-[#16a34a] flex items-center justify-center rounded-full size-[32px] shrink-0 mt-[2px]">
                <img alt="Check" className="size-[16px]" src={imgCheckWhite} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[#0f172a] text-[14px] leading-[19.25px]">
                  Membaca teks struk
                </h3>
                <span className="font-normal text-[#64748b] text-[12px] leading-[16px] mt-[2px]">
                  {scanComplete ? `${foodItems.length + ignoredItems.length} baris terbaca` : 'Memproses gambar...'}
                </span>
              </div>
            </div>

            <div className="flex gap-[14px] items-start w-full">
              <div
                className={`flex items-center justify-center rounded-full size-[32px] shrink-0 mt-[2px] ${
                  scanComplete ? 'bg-[#16a34a]' : 'bg-[#dcfce7] animate-pulse'
                }`}
              >
                {scanComplete ? (
                  <img alt="Check" className="size-[16px]" src={imgCheckWhite} />
                ) : (
                  <span className="size-[10px] rounded-full bg-[#16a34a]" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[#0f172a] text-[14px] leading-[19.25px]">
                  Mengenali item belanja
                </h3>
                <span className="font-normal text-[#64748b] text-[12px] leading-[16px] mt-[2px]">
                  {scanComplete ? `${foodItems.length + ignoredItems.length} item ditemukan` : 'Mengenali daftar item...'}
                </span>
              </div>
            </div>

            <div className="flex gap-[14px] items-start w-full">
              <div
                className={`flex items-center justify-center rounded-full size-[32px] shrink-0 mt-[2px] ${
                  scanComplete ? 'bg-[#16a34a]' : 'bg-[#dcfce7] animate-pulse'
                }`}
              >
                {scanComplete ? (
                  <img alt="Check" className="size-[16px]" src={imgCheckWhite} />
                ) : (
                  <span className="size-[10px] rounded-full bg-[#16a34a]" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[#0f172a] text-[14px] leading-[19.25px]">
                  Memisahkan makanan dan non-
                  <br />
                  makanan
                </h3>
                <span className="font-normal text-[#64748b] text-[12px] leading-[16px] mt-[2px]">
                  {scanComplete
                    ? `${foodItems.length} bahan makanan, ${ignoredItems.length} diabaikan`
                    : 'Menyaring item non-makanan...'}
                </span>
              </div>
            </div>

            <div className="flex gap-[14px] items-start w-full">
              <div
                className={`flex items-center justify-center rounded-full size-[32px] shrink-0 mt-[2px] ${
                  scanComplete ? 'bg-[#16a34a]' : 'bg-[#dcfce7] animate-pulse'
                }`}
              >
                {scanComplete ? (
                  <img alt="Check" className="size-[16px]" src={imgCheckWhite} />
                ) : (
                  <span className="size-[10px] rounded-full bg-[#16a34a]" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[#0f172a] text-[14px] leading-[19.25px]">
                  Memperkirakan masa simpan
                </h3>
                <span className="font-normal text-[#64748b] text-[12px] leading-[16px] mt-[2px]">
                  Berdasarkan jenis bahan
                </span>
              </div>
            </div>
          </div>

          {/* Footer BottomAction */}
          <div className="pt-[24px] pb-[8px] mt-[8px]">
            <button
              type="button"
              disabled={!scanComplete}
              onClick={() => setStep('result')}
              className="bg-[#0e7f3d] hover:bg-[#0b6623] disabled:opacity-60 transition-colors drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex h-[56px] items-center justify-center rounded-[16px] w-full font-bold text-[16px] leading-[24px] text-white"
            >
              {scanComplete ? 'Lihat Hasil Scan' : 'Sedang Memindai...'}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2 ALT: SCAN GAGAL (Node 45:615)
      ===================================================================== */}
      {step === 'failed' && (
        <div className="bg-[#f8fff4] relative w-full min-h-[852px] px-[26px] pt-[36px] pb-[32px]" data-node-id="45:615">
          {/* NavigationHeader */}
          <div className="flex gap-[16px] items-center pb-[24px]">
            <button
              type="button"
              onClick={() => setStep('capture')}
              className="bg-white border border-[#f3f4f6] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full size-[46px] shrink-0"
            >
              <img alt="Kembali" className="size-[20px]" src={imgFailedBackIcon} />
            </button>
            <div className="flex flex-col items-start">
              <h1 className="font-extrabold text-[#111827] text-[20px] leading-[23.75px]">
                Scan Gagal
              </h1>
              <span className="font-medium text-[#6b7280] text-[13px] leading-[19.5px]">
                Langkah 2 dari 3
              </span>
            </div>
          </div>

          {/* CentralIllustration */}
          <div className="py-[12px] flex items-center justify-center w-full mt-[12px]">
            <div className="relative h-[142px] w-[116px]">
              <div className="bg-white border-2 border-[#bfe3c8] flex flex-col gap-[10px] h-[134px] items-start p-[14px] rounded-[14px] w-[96px]">
                <div className="bg-[#bfe3c8] h-[3.5px] rounded-full w-[54px]" />
                <div className="bg-[#bfe3c8] h-[3.5px] rounded-full w-[42px]" />
                <div className="bg-[#bfe3c8] h-[3.5px] rounded-full w-[60px]" />
                <div className="bg-[#bfe3c8] h-[3.5px] rounded-full w-[38px]" />
                <div className="bg-[#bfe3c8] h-[3.5px] rounded-full w-[48px]" />
              </div>
              <div className="absolute bg-[#fbf5e6] border-2 border-[#e89018] bottom-[-4px] right-[-2px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full size-[46px]">
                <span className="font-semibold text-[#ca7105] text-[27px] leading-[27px]">?</span>
              </div>
            </div>
          </div>

          {/* MainErrorHeading */}
          <div className="flex flex-col gap-[8px] items-center pt-[12px] pb-[24px]">
            <h2 className="font-extrabold text-[#111827] text-[20px] leading-[30px] text-center tracking-[-0.5px]">
              Struk belum terbaca jelas
            </h2>
            <p className="font-medium text-[#4b5563] text-[13px] leading-[21.13px] text-center max-w-[310px]">
              AI tidak menemukan cukup teks untuk
              <br />
              dipisahkan. Coba ambil foto ulang.
            </p>
          </div>

          {/* TipsContainer */}
          <div className="bg-white border border-[#d8edd9] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-[16px] items-start p-[21px] rounded-[24px]">
            <h3 className="font-bold text-[#4b5563] text-[11.5px] leading-[17.25px] tracking-[0.575px] uppercase">
              TIPS AGAR TERBACA
            </h3>

            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex gap-[14px] items-center w-full">
                <div className="bg-[#fef3c7] flex items-center justify-center rounded-[14px] size-[40px] shrink-0">
                  <img alt="Cahaya" className="size-[20px]" src={imgSunTipIcon} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[#111827] text-[14px] leading-[17.5px]">
                    Cahaya cukup
                  </h4>
                  <p className="font-normal text-[#6b7280] text-[12px] leading-[16.5px] mt-[2px]">
                    Hindari bayangan dan pantulan di atas
                    <br />
                    kertas struk.
                  </p>
                </div>
              </div>

              <div className="flex gap-[14px] items-center w-full">
                <div className="bg-[#fef3c7] flex items-center justify-center rounded-[14px] size-[40px] shrink-0">
                  <img alt="Struk rata" className="size-[20px]" src={imgReceiptTipIcon} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[#111827] text-[14px] leading-[17.5px]">
                    Struk rata dan utuh
                  </h4>
                  <p className="font-normal text-[#6b7280] text-[12px] leading-[16.5px] mt-[2px]">
                    Rapikan lipatan dan pastikan seluruh
                    <br />
                    struk masuk bingkai.
                  </p>
                </div>
              </div>

              <div className="flex gap-[14px] items-center w-full">
                <div className="bg-[#fef3c7] flex items-center justify-center rounded-[14px] size-[40px] shrink-0">
                  <img alt="Stabil" className="size-[20px]" src={imgCameraTipIcon} />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[#111827] text-[14px] leading-[17.5px]">
                    Tahan kamera stabil
                  </h4>
                  <p className="font-normal text-[#6b7280] text-[12px] leading-[16.5px] mt-[2px]">
                    Tunggu fokus sebelum menekan tombol
                    <br />
                    shutter.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ActionButtons */}
          <div className="flex flex-col gap-[12px] pt-[32px] w-full">
            <button
              type="button"
              onClick={() => setStep('capture')}
              className="bg-[#0e7f3d] hover:bg-[#0b6623] transition-colors drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex h-[52px] items-center justify-center rounded-full w-full font-bold text-[15px] leading-[22.5px] text-white"
            >
              Foto Ulang
            </button>
            <button
              type="button"
              onClick={() => onOpenManual?.('raw')}
              className="bg-white border border-[#0f7b38] flex h-[52px] items-center justify-center rounded-full w-full font-bold text-[#0f7b38] text-[15px] leading-[22.5px]"
            >
              Catat Manual Saja
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: HASIL SCAN STRUK BELANJA (Node 22:1954)
      ===================================================================== */}
      {step === 'result' && (
        <div className="bg-[#f8fff4] relative w-full min-h-[1371px] px-[22px] pt-[34px] pb-[36px]" data-node-id="22:1954">
          {/* TopHeader */}
          <div className="flex gap-[14px] items-center">
            <button
              type="button"
              onClick={() => setStep('capture')}
              className="bg-white border border-[#e2e8f0] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full size-[44px] shrink-0"
            >
              <img alt="Kembali" className="size-[20px]" src={imgBackArrow} />
            </button>
            <div className="flex flex-col items-start">
              <h1 className="font-extrabold text-[#111827] text-[20px] leading-[25px] tracking-[-0.5px]">
                Scan Struk Belanja
              </h1>
              <p className="font-medium text-[#6b7280] text-[13px] leading-[19.5px]">
                AI memisahkan makanan dari non-makanan
              </p>
            </div>
          </div>

          {/* Simulated Receipt Texture/Image */}
          <div className="bg-[#dee8ff] flex h-[270px] items-center justify-center overflow-hidden rounded-[15px] w-full mt-[24px] relative">
            <img
              alt="Struk Belanja"
              className="w-full h-[110.84%] object-cover opacity-85 pointer-events-none"
              src={uploadedPreview || imgReceiptTexture}
            />

            {/* FOOD Bounding Box */}
            <div className="absolute bg-[rgba(107,255,143,0.15)] border-2 border-[rgba(107,255,143,0.8)] flex h-[32px] items-center justify-center left-[24px] p-[2px] rounded-[4px] top-[16px] w-[64px]">
              <div className="bg-[#6bff8f] rounded-[2px] px-[4px]">
                <span className="font-['Manrope'] font-bold text-[#00210a] text-[9px] leading-[13.5px]">
                  FOOD
                </span>
              </div>
            </div>

            {/* NON-FOOD Bounding Box */}
            <div className="absolute bg-[rgba(186,26,26,0.15)] border-2 border-[rgba(186,26,26,0.7)] bottom-[24px] flex h-[28px] items-center justify-center p-[2px] right-[24px] rounded-[4px] w-[80px]">
              <div className="bg-[#ba1a1a] rounded-[2px] px-[4px]">
                <span className="font-['Manrope'] font-bold text-white text-[9px] leading-[13.5px]">
                  NON-FOOD
                </span>
              </div>
            </div>

            {/* Top Status Pill: AI Processing */}
            <div className="absolute flex items-center justify-between left-[12px] right-[12px] top-[12px]">
              <div className="backdrop-blur-[12px] bg-[rgba(17,28,45,0.8)] flex gap-[6px] items-center px-[10px] py-[4px] rounded-full">
                <div className="bg-[#6bff8f] rounded-full size-[8px]" />
                <span className="font-['Manrope'] font-semibold text-[#f9f9ff] text-[12px] leading-[16px] tracking-[0.3px]">
                  Gemini 1.5 Flash Vision
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.9)] px-[8px] py-[2px] rounded-full">
                <span className="font-['Manrope'] font-semibold text-[#111c2d] text-[10px] leading-[14px] tracking-[0.4px]">
                  Presisi 98.4%
                </span>
              </div>
            </div>

            {/* Bottom Scan Meta Indicator */}
            <div className="absolute bottom-[12px] flex items-center justify-between left-[12px] right-[12px]">
              <div className="flex gap-[6px] items-center">
                <img alt="" className="w-[13.33px] h-[14.67px]" src={imgFileMetaIcon} />
                <span className="font-['Manrope'] font-bold text-[#f9f9ff] text-[10px] leading-[14px] tracking-[0.4px]">
                  {uploadedFileName}
                </span>
              </div>
              <span className="font-['Manrope'] font-bold text-[#cfdaf2] text-[10px] leading-[14px] tracking-[0.4px]">
                {foodItems.length + ignoredItems.length} Item Terbaca
              </span>
            </div>
          </div>

          {/* DetectedFoodSection */}
          <div className="flex flex-col gap-[8px] items-start mt-[27px]">
            <div className="flex items-start justify-between w-full">
              <h2 className="font-bold text-[#111827] text-[17px] leading-[21.25px]">
                Bahan Makanan
                <br />
                Ditemukan
              </h2>
              <div className="bg-[#dcfce7] px-[12px] py-[4px] rounded-full">
                <span className="font-bold text-[#15803d] text-[12px] leading-[18px]">
                  {selectedItems.length} siap disimpan
                </span>
              </div>
            </div>

            <p className="font-normal text-[#6b7280] text-[13px] leading-[21.13px]">
              Ketuk kotak untuk memilih bahan. Atur perkiraan masa
              <br />
              simpan dengan tombol + dan -.
            </p>

            {/* Food Items List */}
            <div className="flex flex-col gap-[12px] pt-[8px] w-full">
              {foodItems.map((item, idx) => {
                const isWarning = Number(item.expiryDays) <= 2;
                const isChecked = item.selected !== false;
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="bg-white border border-[#e5e7eb] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[14px] items-start p-[17px] rounded-[16px] w-full"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div
                        onClick={() => handleToggleItem(idx)}
                        className="flex gap-[12px] items-center cursor-pointer select-none"
                      >
                        <div
                          className={`flex items-center justify-center rounded-[7px] size-[24px] transition-colors ${
                            isChecked
                              ? 'bg-[#16a34a]'
                              : 'bg-white border-2 border-[#cbd5e1]'
                          }`}
                        >
                          {isChecked && (
                            <img alt="Terpilih" className="size-[16px]" src={imgCheckWhite} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-[#111827] text-[15px] leading-[20.63px]">
                            {item.name}
                          </h3>
                          <span className="font-medium text-[#6b7280] text-[13px] leading-[19.5px]">
                            {item.storageLabel || `${item.quantityText || '1 porsi'} · Chiller`}
                          </span>
                        </div>
                      </div>

                      {isWarning ? (
                        <div className="bg-[rgba(254,215,170,0.6)] px-[10px] py-[4px] rounded-full shrink-0">
                          <span className="font-bold text-[#c2410c] text-[11px] leading-[16.5px]">
                            Segera dimasak
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#dcfce7] px-[10px] py-[4px] rounded-full shrink-0">
                          <span className="font-bold text-[#15803d] text-[11px] leading-[16.5px]">
                            Segar
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Shelf Life Adjustment Pill */}
                    <div className="bg-[#f0fdf4] flex items-center justify-between px-[14px] py-[8px] rounded-full w-full">
                      <span className="font-medium text-[#64748b] text-[12px] leading-[18px]">
                        Perkiraan masa simpan
                      </span>
                      <div className="flex gap-[12px] items-center">
                        <button
                          type="button"
                          onClick={() => handleAdjustDays(idx, -1)}
                          className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-full size-[28px] active:scale-95"
                        >
                          <img alt="Kurangi hari" className="size-[14px]" src={imgMinusIcon} />
                        </button>
                        <span className="font-extrabold text-[#111827] text-[13px] leading-[19.5px] min-w-[50px] text-center">
                          {item.expiryDays} hari
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustDays(idx, 1)}
                          className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-full size-[28px] active:scale-95"
                        >
                          <img alt="Tambah hari" className="size-[14px]" src={imgPlusDarkIcon} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EliminatedNonFoodSection */}
          <div className="mt-[24px] pb-[24px] w-full">
            <div className="bg-[rgba(237,242,249,0.7)] border border-[rgba(226,232,240,0.6)] flex flex-col gap-[16px] items-start p-[17px] rounded-[22px] w-full">
              <button
                type="button"
                onClick={() => setShowIgnored(!showIgnored)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="font-bold text-[#1e293b] text-[15px] leading-[22.5px]">
                  Non-Makanan Dieliminasi
                </h3>
                <div className="flex gap-[8px] items-center">
                  <div className="bg-white border border-[rgba(226,232,240,0.8)] px-[11px] py-[5px] rounded-full">
                    <span className="font-bold text-[#475569] text-[11px] leading-[16.5px]">
                      {ignoredItems.length} diabaikan
                    </span>
                  </div>
                  <img
                    alt="Toggle"
                    className={`size-[12px] transition-transform ${showIgnored ? '' : 'rotate-180'}`}
                    src={imgChevronUpIcon}
                  />
                </div>
              </button>

              {showIgnored && (
                <>
                  <div className="flex flex-col gap-[10px] items-start w-full">
                    {ignoredItems.map((ignored, idx) => (
                      <div
                        key={`${ignored.name}-${idx}`}
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex gap-[8px] items-center">
                          <img alt="Diabaikan" className="size-[14px]" src={imgCrossRedIcon} />
                          <span className="font-medium text-[#334155] text-[13px] leading-[19.5px] line-through">
                            {ignored.name}
                          </span>
                        </div>
                        <span className="font-bold text-[#64748b] text-[10px] leading-[15px] tracking-[0.5px] uppercase">
                          {ignored.tag || 'NON-FOOD'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-[rgba(226,232,240,0.8)] p-[13px] rounded-[12px] w-full">
                    <p className="font-normal text-[#64748b] text-[12px] leading-[19.5px]">
                      Item kebutuhan rumah tangga disaring otomatis agar
                      <br />
                      database kulkas tetap rapi tanpa sampah log.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer - BottomActionButtons */}
          <div className="flex flex-col gap-[12px] items-start w-full">
            <button
              type="button"
              onClick={handleSaveSelected}
              className="bg-[#0e7f3d] hover:bg-[#0b6623] transition-colors shadow-md flex h-[48px] items-center justify-center rounded-full w-full font-bold text-[15px] leading-[22.5px] text-white"
            >
              Simpan {selectedItems.length} Bahan Terpilih ke Kulkas
            </button>

            <div className="flex gap-[12px] items-start w-full">
              <button
                type="button"
                onClick={() => setStep('capture')}
                className="bg-white border border-[#0e7f3d] flex-1 h-[44px] rounded-full flex items-center justify-center gap-[8px]"
              >
                <img alt="Foto Ulang" className="size-[16px]" src={imgCameraGreenIcon} />
                <span className="font-bold text-[#0e7f3d] text-[13px] leading-[19.5px]">
                  Foto Ulang
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenManual?.('raw')}
                className="bg-white border border-[#0e7f3d] flex-1 h-[44px] rounded-full flex items-center justify-center gap-[8px]"
              >
                <img alt="Tambah Manual" className="size-[16px]" src={imgPlusGreenIcon} />
                <span className="font-bold text-[#0e7f3d] text-[13px] leading-[19.5px]">
                  Tambah Manual
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DIALOG MAKANAN BERHASIL DISIMPAN (Node 66:16)
      ===================================================================== */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 bg-[rgba(16,39,29,0.5)] flex items-center justify-center p-4">
          <div
            className="bg-white flex flex-col gap-[24px] items-center overflow-hidden pb-[16px] pt-[28px] px-[24px] relative rounded-[28px] shadow-[0px_12px_36px_0px_rgba(22,59,34,0.08)] w-full max-w-[358px]"
            data-node-id="66:16"
          >
            <div className="flex flex-col gap-[12px] items-center w-full">
              <div className="bg-[#d7f5e4] flex items-center justify-center rounded-full size-[60px]">
                <div className="relative size-[30px]">
                  <img alt="Berhasil" className="size-full object-contain" src={imgDialogCheckIcon} />
                </div>
              </div>
              <div className="font-bold text-[#111827] text-[22px] leading-[29px] text-center tracking-[-0.4px]">
                <p>Makanan berhasil</p>
                <p>disimpan!</p>
              </div>
              <p className="font-normal text-[#6b7280] text-[14px] leading-[22px] text-center">
                {savedCount} bahan makanan sudah ditambahkan ke kulkasmu.
              </p>
            </div>

            <div className="flex flex-col gap-[8px] items-start w-full">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessDialog(false);
                  onSavedToFridge?.();
                }}
                className="bg-[#0e7f3d] hover:bg-[#0b6623] transition-colors flex h-[48px] items-center justify-center rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)] w-full font-bold text-[15px] leading-[22.5px] text-white"
              >
                Lihat Kulkas
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessDialog(false);
                  onClose?.();
                }}
                className="flex h-[44px] items-center justify-center rounded-full w-full font-semibold text-[#0e7f3d] text-[14px] leading-[21px]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
