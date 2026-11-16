import { useEffect, useRef, useState } from 'react';
import { Activity, Clock, Eye, Layers, Maximize2, Navigation, Play, Pause, RotateCw, ShieldAlert, Waves } from 'lucide-react';
import { AREAS, HYDRO_TELEMETRY } from '../geo';

// 4D Temporal simulation scenarios for Lahore's Ravi River belt
const TIMELINE_STAGES = [
  {
    step: 0,
    timeLabel: 'T - 00h (Baseline)',
    phase: 'Normal River Discharge',
    discharge: '48,500 cusecs',
    riverLevel: 4.2,
    severity: 'Normal',
    color: '#15966B',
    summary: 'Water discharge within safe carrying capacity at Shahdara Railway Bridge. Pre-emptive monitoring active across all 8 riverfront sectors.',
  },
  {
    step: 1,
    timeLabel: 'T + 06h (Upstream Surge)',
    phase: 'Surge Inflow Detected',
    discharge: '64,200 cusecs',
    riverLevel: 5.6,
    severity: 'Alert',
    color: '#D97706',
    summary: 'Upstream surge wave passing Kala Shah Kaku corridor into Rana Town riverbank. Early alerts dispatched to registered field volunteers.',
  },
  {
    step: 2,
    timeLabel: 'T + 12h (Shahdara High Inundation)',
    phase: 'Critical Bank Overflow',
    discharge: '82,400 cusecs',
    riverLevel: 6.9,
    severity: 'Critical',
    color: '#EA580C',
    summary: 'Ravi River reaches high flood warning at Shahdara Town. Low-lying riverine settlements advised to initiate planned relocation to high-ground camps.',
  },
  {
    step: 3,
    timeLabel: 'T + 24h (Saggian & Babu Sabu Peak)',
    phase: 'Peak Corridor Inundation',
    discharge: '96,800 cusecs',
    riverLevel: 7.4,
    severity: 'Severe',
    color: '#DC2626',
    summary: 'Backwater surge reaching Babu Sabu Bund Road outfalls and Saggian logistics corridor. Active NGO relief dispatch and community boat response engaged.',
  },
  {
    step: 4,
    timeLabel: 'T + 48h (Controlled Subsidence)',
    phase: 'Relief Delivery & Water Receding',
    discharge: '58,300 cusecs',
    riverLevel: 5.1,
    severity: 'Stabilizing',
    color: '#258BCB',
    summary: 'Downstream flow regulating toward Balloki Barrage. Last-mile relief distribution, clean water filtration, and damage assessments underway in Chung and Manga Mandi.',
  },
];

export default function RaviRiver3D({ onSelectArea }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(AREAS[0]);
  const [stageIndex, setStageIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewAngle, setViewAngle] = useState({ pitch: 42, yaw: -18 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [gaugeIndex, setGaugeIndex] = useState(1);

  const currentStage = TIMELINE_STAGES[stageIndex];

  // Auto-advance 4D temporal simulation when playing
  useEffect(() => {
    if (!isPlaying) return undefined;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % TIMELINE_STAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    // Handle high DPI
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // River Spline 3D Control Nodes relative to canvas center
    const river3DPoints = [
      { x: -180, z: -140, yOffset: 0, label: 'Kala Shah Kaku Corridor' },
      { x: -110, z: -90, yOffset: 2, label: 'Rana Town' },
      { x: -40, z: -40, yOffset: 5, label: 'Shahdara Town' },
      { x: 20, z: 10, yOffset: 8, label: 'Saggian & Ravi Bridge' },
      { x: 70, z: 65, yOffset: 6, label: 'Babu Sabu Floodplain' },
      { x: 120, z: 110, yOffset: 3, label: 'Chung & Mohlanwal' },
      { x: 165, z: 155, yOffset: 1, label: 'Park View City Belt' },
      { x: 215, z: 205, yOffset: 0, label: 'Manga Mandi Downstream' },
    ];

    // Project 3D (x, y, z) into 2D isometric/perspective viewport
    const project = (x, y, z, width, height) => {
      const radPitch = (viewAngle.pitch * Math.PI) / 180;
      const radYaw = (viewAngle.yaw * Math.PI) / 180;

      // Rotate around Y-axis (Yaw)
      const x1 = x * Math.cos(radYaw) - z * Math.sin(radYaw);
      const z1 = x * Math.sin(radYaw) + z * Math.cos(radYaw);

      // Rotate around X-axis (Pitch)
      const y2 = y * Math.cos(radPitch) - z1 * Math.sin(radPitch);
      const z2 = y * Math.sin(radPitch) + z1 * Math.cos(radPitch);

      // Camera distance & perspective factor
      const fov = 480;
      const scale = fov / (fov + z2 + 200);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
        scale,
        depth: z2,
      };
    };

    const render = () => {
      tick += 0.035;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      // Deep Navy Backdrop with Subtle Depth Fog
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0C1F33');
      bgGrad.addColorStop(1, '#102A43');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Perspective Terrain Grid along the Ravi floodplain
      ctx.lineWidth = 1;
      const gridCols = 9;
      const gridRows = 9;
      const gridStep = 45;

      for (let i = -gridCols / 2; i <= gridCols / 2; i++) {
        const start = project(i * gridStep, 25, (-gridRows / 2) * gridStep, width, height);
        const end = project(i * gridStep, 25, (gridRows / 2) * gridStep, width, height);
        ctx.strokeStyle = 'rgba(37, 139, 203, 0.08)';
        ctx.beginPath();
        ctx.moveTo(start.px, start.py);
        ctx.lineTo(end.px, end.py);
        ctx.stroke();
      }

      for (let j = -gridRows / 2; j <= gridRows / 2; j++) {
        const start = project((-gridCols / 2) * gridStep, 25, j * gridStep, width, height);
        const end = project((gridCols / 2) * gridStep, 25, j * gridStep, width, height);
        ctx.strokeStyle = 'rgba(37, 139, 203, 0.08)';
        ctx.beginPath();
        ctx.moveTo(start.px, start.py);
        ctx.lineTo(end.px, end.py);
        ctx.stroke();
      }

      // Calculate water surge level from temporal stage
      const surgeMultiplier = 1 + (stageIndex * 0.22);
      const riverWaterLevel = -6 + Math.sin(tick * 1.5) * 2 - (stageIndex * 5);

      // Render 3D Water Volume Bed (Meandering River Ribbon)
      const projectedRiver = river3DPoints.map((pt, idx) => {
        const wave = Math.sin(tick * 2 + idx * 0.8) * 3;
        return {
          ...pt,
          proj: project(pt.x, riverWaterLevel + wave, pt.z, width, height),
        };
      });

      // Draw River Inundation Ribbon (Outer boundary)
      ctx.beginPath();
      const ribbonWidth = (28 * surgeMultiplier);
      for (let i = 0; i < projectedRiver.length; i++) {
        const p = projectedRiver[i].proj;
        if (i === 0) ctx.moveTo(p.px, p.py - ribbonWidth * p.scale);
        else ctx.lineTo(p.px, p.py - ribbonWidth * p.scale);
      }
      for (let i = projectedRiver.length - 1; i >= 0; i--) {
        const p = projectedRiver[i].proj;
        ctx.lineTo(p.px, p.py + ribbonWidth * p.scale);
      }
      ctx.closePath();

      // Water Surface Gradient
      const waterGrad = ctx.createLinearGradient(0, 0, width, height);
      if (stageIndex >= 3) {
        waterGrad.addColorStop(0, 'rgba(234, 88, 12, 0.55)');
        waterGrad.addColorStop(0.5, 'rgba(37, 139, 203, 0.7)');
        waterGrad.addColorStop(1, 'rgba(21, 150, 107, 0.6)');
      } else {
        waterGrad.addColorStop(0, 'rgba(37, 139, 203, 0.75)');
        waterGrad.addColorStop(0.5, 'rgba(23, 105, 170, 0.85)');
        waterGrad.addColorStop(1, 'rgba(16, 42, 67, 0.8)');
      }
      ctx.fillStyle = waterGrad;
      ctx.fill();

      // Flowing 3D Vector Wave Lines (Hydraulic Current)
      for (let waveOffset = -ribbonWidth + 8; waveOffset <= ribbonWidth - 8; waveOffset += 14) {
        ctx.beginPath();
        for (let i = 0; i < projectedRiver.length; i++) {
          const p = projectedRiver[i].proj;
          const streamY = p.py + (waveOffset * p.scale) + Math.sin(tick * 3 + i * 1.2) * 2;
          if (i === 0) ctx.moveTo(p.px, streamY);
          else ctx.lineTo(p.px, streamY);
        }
        ctx.strokeStyle = `rgba(180, 230, 255, ${0.18 + Math.sin(tick + waveOffset) * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Hydraulic Flow Vector Particles (4D dynamic velocity)
      const particleCount = 18;
      for (let k = 0; k < particleCount; k++) {
        const progress = ((tick * (0.15 + stageIndex * 0.05) + (k / particleCount)) % 1);
        const segIdx = Math.floor(progress * (projectedRiver.length - 1));
        const subT = (progress * (projectedRiver.length - 1)) % 1;
        const pA = projectedRiver[segIdx].proj;
        const pB = projectedRiver[Math.min(segIdx + 1, projectedRiver.length - 1)].proj;

        const partX = pA.px + (pB.px - pA.px) * subT;
        const partY = pA.py + (pB.py - pA.py) * subT;
        const partScale = pA.scale + (pB.scale - pA.scale) * subT;

        ctx.fillStyle = '#6EE7B7';
        ctx.beginPath();
        ctx.arc(partX, partY, 2.8 * partScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render 3D Area Nodes along the River corridor
      AREAS.forEach(([name, lat, lng, risk], idx) => {
        const pt = river3DPoints[idx % river3DPoints.length];
        const elevation = -18 - (idx % 3) * 6;
        const projected = project(pt.x + (idx % 2 === 0 ? -22 : 22), elevation, pt.z, width, height);

        const isSelected = selectedNode && selectedNode[0] === name;
        const pulse = Math.sin(tick * 3 + idx) * 0.5 + 0.5;

        // Elevation Stem Line linking terrain to aerial node
        const groundPt = project(pt.x + (idx % 2 === 0 ? -22 : 22), 25, pt.z, width, height);
        ctx.strokeStyle = isSelected ? 'rgba(37, 139, 203, 0.65)' : 'rgba(255, 255, 255, 0.18)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(groundPt.px, groundPt.py);
        ctx.lineTo(projected.px, projected.py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground Target Circle
        ctx.beginPath();
        ctx.arc(groundPt.px, groundPt.py, 4 * groundPt.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();

        // 3D Telemetry Sphere / Pin
        const nodeColor = risk.includes('Critical')
          ? '#EA580C'
          : risk.includes('High')
          ? '#D97706'
          : '#15966B';

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(projected.px, projected.py, (10 + pulse * 6) * projected.scale, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}33`;
        ctx.fill();

        // Core Pin Sphere
        ctx.beginPath();
        ctx.arc(projected.px, projected.py, (isSelected ? 7.5 : 5.5) * projected.scale, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Node Label
        ctx.font = `600 ${Math.max(10, Math.round(11 * projected.scale))}px Inter, sans-serif`;
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#CBD5E1';
        ctx.textAlign = 'center';
        ctx.fillText(name.split('&')[0].trim(), projected.px, projected.py - 12 * projected.scale);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewAngle, stageIndex, selectedNode]);

  // Mouse drag handlers for interactive 3D rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    setViewAngle((prev) => ({
      yaw: prev.yaw + deltaX * 0.45,
      pitch: Math.max(15, Math.min(75, prev.pitch + deltaY * 0.45)),
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="ravi-3d-container">
      {/* 3D Viewport Controls & Header */}
      <div className="ravi-3d-header">
        <div className="flex items-center gap-3">
          <div className="ravi-status-beacon" style={{ background: currentStage.color }}>
            <span className="beacon-ping" style={{ background: currentStage.color }} />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
              DEMONSTRATION SIMULATION · NOT LIVE TELEMETRY
            </span>
            <h3 className="text-white text-base font-bold m-0 flex items-center gap-2">
              Lahore River Ravi Corridor Simulator
            </h3>
          </div>
        </div>

        {/* View Angle Reset & Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ravi-ctrl-btn"
            onClick={() => setViewAngle({ pitch: 42, yaw: -18 })}
            title="Reset 3D Perspective"
            aria-label="Reset 3D camera angle"
          >
            <RotateCw size={14} />
            <span>Reset View</span>
          </button>
          <button
            type="button"
            className="ravi-ctrl-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause 4D Temporal Telemetry' : 'Play 4D Temporal Telemetry'}
            aria-label="Toggle temporal playback"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause 4D' : 'Play 4D'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area with Drag-to-Rotate */}
      <div
        className="ravi-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} className="ravi-3d-canvas" />

        {/* Top-Right Hydraulic Gauge HUD */}
        <div className="ravi-gauge-hud">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
            <span className="text-xs text-blue-300 font-bold flex items-center gap-1.5">
              <Waves size={14} /> Hydraulic Discharge
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {currentStage.discharge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-1 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Gauge Height</span>
              <b className="text-white text-sm">{currentStage.riverLevel.toFixed(1)} m</b>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Flood Warning</span>
              <span
                className="font-bold px-1.5 py-0.5 rounded text-[11px] inline-block mt-0.5"
                style={{ background: `${currentStage.color}25`, color: currentStage.color }}
              >
                {currentStage.severity}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-300 m-0 mt-2 leading-relaxed">
            {currentStage.summary}
          </p>
        </div>

        {/* Bottom Interactive Area Selection Pills */}
        <div className="ravi-area-pills">
          {AREAS.map((area) => {
            const isSelected = selectedNode && selectedNode[0] === area[0];
            return (
              <button
                type="button"
                key={area[0]}
                className={`ravi-pill ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedNode(area);
                  if (onSelectArea) onSelectArea(area);
                }}
              >
                <span className="pill-dot" />
                {area[0].split('&')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4D Temporal Timeline Scrubbing Bar */}
      <div className="ravi-timeline-bar">
        <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
          <span className="font-bold flex items-center gap-1.5 text-blue-200">
            <Clock size={14} /> 4D Temporal Telemetry Stream (T-00h to T+48h)
          </span>
          <span className="font-semibold text-white">
            Current Phase: <strong style={{ color: currentStage.color }}>{currentStage.phase}</strong>
          </span>
        </div>

        <div className="ravi-stage-stepper" role="tablist" aria-label="4D time stages">
          {TIMELINE_STAGES.map((stage, idx) => (
            <button
              type="button"
              key={stage.step}
              role="tab"
              aria-selected={stageIndex === idx}
              className={`timeline-step-btn ${stageIndex === idx ? 'current' : ''}`}
              onClick={() => {
                setStageIndex(idx);
                setIsPlaying(false);
              }}
            >
              <div className="step-bar" style={{ background: stageIndex >= idx ? stage.color : 'rgba(255,255,255,0.15)' }} />
              <div className="step-meta">
                <span className="step-time">{stage.timeLabel}</span>
                <span className="step-discharge">{stage.discharge}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
