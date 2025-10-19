import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle, Camera, Check, Loader2, Video, X, Shield, Zap, Eye, Bell, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Security Dashboard page: left sub-nav (Feed, Live Camera, Emergency SOS),
// center content (6 feed placeholders or live view or SOS), right Events with Live/Past.
export default function AccountPage() {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  type SubTab = "feed" | "live" | "sos";
  const [subTab, setSubTab] = useState<SubTab>("feed");

  // AI Model Event Types
  type AIModelEvent = {
    event_id: string;
    camera_id: string;
    event_start: string;
    event_end: string;
    combined_score: number;
    scores: {
      video: number;
      audio: number;
    };
    detections: any[]; // Array of detection objects
    severity: "low" | "medium" | "high";
  };

  type SecurityEvent = {
    id: string;
    camera: string;
    detected: string;
    timestamp: string;
    status: "live" | "accepted" | "rejected";
    // AI Model fields
    event_id?: string;
    camera_id?: string;
    event_start?: string;
    event_end?: string;
    combined_score?: number;
    scores?: {
      video: number;
      audio: number;
    };
    detections?: any[];
    severity?: "low" | "medium" | "high";
  };
  const [liveEvents, setLiveEvents] = useState<SecurityEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<SecurityEvent[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camStarting, setCamStarting] = useState(false);
  const [eventsTab, setEventsTab] = useState<"live" | "past">("live");
  const [highSeverityEvent, setHighSeverityEvent] = useState<SecurityEvent | null>(null);
  const [showHighSeverityPopup, setShowHighSeverityPopup] = useState(false);
  const [expandedCamera, setExpandedCamera] = useState<number | null>(null);

  // Animation refs and variants
  const headerRef = useRef(null);
  const mainContentRef = useRef(null);
  const eventsRef = useRef(null);
  
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isMainContentInView = useInView(mainContentRef, { once: true, amount: 0.2 });
  const isEventsInView = useInView(eventsRef, { once: true, amount: 0.2 });

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };


  const startCamera = async () => {
    if (camStarting || streamRef.current) return;
    setCamStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {
            console.log("Autoplay prevented, user interaction required");
          });
        };
      }
      toast({ title: "Camera started", description: "Live feed is now active" });
    } catch (err: any) {
      console.error("Camera error:", err);
      toast({ 
        title: "Camera error", 
        description: err?.message || "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    } finally {
      setCamStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    toast({ title: "Camera stopped", description: "Live feed has been disabled" });
  };

  useEffect(() => {
    if (subTab === "live") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  // Function to handle incoming AI model events
  const handleAIModelEvent = (aiEvent: AIModelEvent) => {
    console.log("Received AI model event:", aiEvent);
    
    // Convert AI event to SecurityEvent format
    const getEventDescription = (detections: any[]) => {
      if (!detections || detections.length === 0) return "Unknown threat detected";
      const types = [...new Set(detections.map(d => d.type))];
      if (types.includes("weapon")) return "Weapon detected";
      if (types.includes("gunshot")) return "Gunshot detected";
      if (types.includes("violence")) return "Violence detected";
      if (types.includes("suspicious_behavior")) return "Suspicious behavior detected";
      if (types.includes("unauthorized_access")) return "Unauthorized access detected";
      if (types.includes("threat")) return "Threat detected";
      return "Security threat detected";
    };

    const securityEvent: SecurityEvent = {
      id: aiEvent.event_id,
      camera: `Camera ${aiEvent.camera_id}`,
      detected: getEventDescription(aiEvent.detections),
      timestamp: new Date(aiEvent.event_start).toLocaleString(),
      status: "live",
      event_id: aiEvent.event_id,
      camera_id: aiEvent.camera_id,
      event_start: aiEvent.event_start,
      event_end: aiEvent.event_end,
      combined_score: aiEvent.combined_score,
      scores: aiEvent.scores,
      detections: aiEvent.detections,
      severity: aiEvent.severity,
    };

    // Add to live events
    setLiveEvents((prev) => [securityEvent, ...prev]);

    // Show appropriate UI based on severity
    if (aiEvent.severity === "high") {
      setHighSeverityEvent(securityEvent);
      setShowHighSeverityPopup(true);
      toast({
        title: "🚨 HIGH SEVERITY ALERT",
        description: `Weapon detected on ${securityEvent.camera} - Immediate action required!`,
        variant: "destructive",
      });
    } else {
      const severityColor = aiEvent.severity === "medium" ? "orange" : "blue";
      toast({
        title: `Security Alert (${aiEvent.severity.toUpperCase()})`,
        description: `${securityEvent.detected} • ${securityEvent.camera}`,
        variant: "default",
      });
    }
  };

  // Simulate AI model event for testing
  const simulateAIModelEvent = () => {
    console.log("Simulate AI Event button clicked!"); // Debug log
    // Random event types and descriptions
    const eventTypes = [
      { type: "weapon", description: "Weapon detected" },
      { type: "gunshot", description: "Gunshot detected" },
      { type: "suspicious_behavior", description: "Suspicious behavior detected" },
      { type: "unauthorized_access", description: "Unauthorized access detected" },
      { type: "violence", description: "Violence detected" },
      { type: "threat", description: "Threat detected" }
    ];

    const severities: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Generate realistic scores based on severity
    let baseScore = 0;
    if (randomSeverity === "high") baseScore = 75 + Math.random() * 25;
    else if (randomSeverity === "medium") baseScore = 50 + Math.random() * 25;
    else baseScore = 25 + Math.random() * 25;

    const videoScore = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20));
    const audioScore = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20));
    const combinedScore = (videoScore + audioScore) / 2;

    // Generate random detection data
    const detections = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      type: randomEvent.type,
      confidence: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 15)),
      bbox: [
        Math.floor(Math.random() * 400) + 50,
        Math.floor(Math.random() * 300) + 50,
        Math.floor(Math.random() * 200) + 100,
        Math.floor(Math.random() * 150) + 100
      ],
      timestamp: new Date(Date.now() - Math.random() * 5000).toISOString(),
      frame_id: Math.floor(Math.random() * 1000) + i
    }));

    const mockAIEvent: AIModelEvent = {
      event_id: `evt_${Math.random().toString(36).substr(2, 12)}`,
      camera_id: `cam_${Math.floor(Math.random() * 6) + 1}`,
      event_start: new Date().toISOString(),
      event_end: new Date(Date.now() + Math.random() * 10000 + 2000).toISOString(),
      combined_score: Math.round(combinedScore * 10) / 10,
      scores: {
        video: Math.round(videoScore * 10) / 10,
        audio: Math.round(audioScore * 10) / 10,
      },
      detections: detections,
      severity: randomSeverity,
    };

    console.log("Generated AI Event:", mockAIEvent);
    handleAIModelEvent(mockAIEvent);
  };

  const simulateIncomingEvent = () => {
    console.log("Simulate button clicked"); // Debug log
    const cams = [
      "Camera 1",
      "Camera 2",
      "Camera 3",
      "Camera 4",
      "Camera 5",
      "Camera 6",
    ];
    const types = ["Weapon detected", "Gunshot heard"];
    const ev: SecurityEvent = {
      id: `${Date.now()}`,
      camera: cams[Math.floor(Math.random() * cams.length)],
      detected: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date().toLocaleString(),
      status: "live",
    };
    console.log("Creating event:", ev); // Debug log
    setLiveEvents((prev) => {
      const newEvents = [ev, ...prev];
      console.log("Updated live events:", newEvents); // Debug log
      return newEvents;
    });
    toast({ 
      title: "New security event", 
      description: `${ev.detected} • ${ev.camera}`,
      variant: "default"
    });
  };

  const approveEvent = (id: string) => {
    const ev = liveEvents.find((e) => e.id === id);
    if (!ev) return;
    toast({ title: "Calling principal…" });
    setTimeout(() => toast({ title: "Calling police station…" }), 500);
    setLiveEvents((prev) => prev.filter((e) => e.id !== id));
    setPastEvents((prev) => [{ ...ev, status: "accepted" }, ...prev]);
  };

  const rejectEvent = (id: string) => {
    const ev = liveEvents.find((e) => e.id === id);
    if (!ev) return;
    setLiveEvents((prev) => prev.filter((e) => e.id !== id));
    setPastEvents((prev) => [{ ...ev, status: "rejected" }, ...prev]);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="bg-gradient-to-b from-[#1f2022] to-[#171819] py-16 md:py-24 overflow-hidden">
        <div className="mx-auto max-w-8xl px-8">
          <motion.div
            ref={headerRef}
            initial="hidden"
            animate={isHeaderInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
            className="flex items-center justify-between mb-12"
          >
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 mb-6">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Security Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Monitor & Respond
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-[-20px]">
                Real-time security monitoring with AI-powered threat detection and instant escalation.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={signOut} 
                variant="outline" 
                className="rounded-full border border-white/20 px-6 py-2 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              >
                Sign Out
              </Button>
            </div>
          </motion.div>

          <motion.div
            ref={mainContentRef}
            initial="hidden"
            animate={isMainContentInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-[minmax(14rem,18rem)_1fr_minmax(20rem,26rem)] gap-8 lg:gap-12 items-start"
          >
            <motion.aside variants={cardVariants} className="w-full">
              <Card className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur hover:border-blue-500/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <nav className="flex lg:flex-col gap-3 relative z-10">
                  <button 
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 hover-scale relative overflow-hidden group/nav",
                      subTab === "feed"
                        ? "text-blue-400 font-medium bg-blue-500/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    )} 
                    onClick={() => setSubTab("feed")}
                  >
                    <span className="inline-flex items-center gap-3 relative z-10">
                      <Video className="w-5 h-5" /> 
                      <span>Feed</span>
                    </span>
                    {subTab === "feed" && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-500/20 rounded-xl z-0" 
                        layoutId="activeSubNavBg" 
                        transition={{ type: "spring", duration: 0.6 }} 
                      />
                    )}
                  </button>
                  <button 
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 hover-scale relative overflow-hidden group/nav",
                      subTab === "live"
                        ? "text-blue-400 font-medium bg-blue-500/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    )} 
                    onClick={() => setSubTab("live")}
                  >
                    <span className="inline-flex items-center gap-3 relative z-10">
                      <Camera className="w-5 h-5" /> 
                      <span>Live Camera</span>
                    </span>
                    {subTab === "live" && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-500/20 rounded-xl z-0" 
                        layoutId="activeSubNavBg" 
                        transition={{ type: "spring", duration: 0.6 }} 
                      />
                    )}
                  </button>
                  <button 
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 hover-scale relative overflow-hidden group/nav",
                      subTab === "sos"
                        ? "text-red-400 font-medium bg-red-500/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    )} 
                    onClick={() => setSubTab("sos")}
                  >
                    <span className="inline-flex items-center gap-3 relative z-10">
                      <AlertTriangle className="w-5 h-5" /> 
                      <span>Emergency SOS</span>
                    </span>
                    {subTab === "sos" && (
                      <motion.div 
                        className="absolute inset-0 bg-red-500/20 rounded-xl z-0" 
                        layoutId="activeSubNavBg" 
                        transition={{ type: "spring", duration: 0.6 }} 
                      />
                    )}
                  </button>
                </nav>
                <div className="mt-6 relative z-20">
                  <Button 
                    size="sm" 
                    className="w-full rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 transition-all relative z-20 pointer-events-auto" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Button click event fired!");
                      simulateAIModelEvent();
                    }}
                    type="button"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Simulate AI Event
                  </Button>
                </div>
              </Card>
            </motion.aside>

            <motion.main variants={cardVariants} className="flex-1 min-w-0">
              {subTab === "feed" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-white">Security Feeds</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        variants={cardVariants}
                        className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur hover:border-blue-500/30 transition-all duration-300 h-80 cursor-pointer hover:scale-105"
                        onClick={() => setExpandedCamera(i)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 group-hover:text-zinc-300 transition-colors">
                          <div className="text-center">
                            <Eye className="w-12 h-12 mx-auto mb-3" />
                            <span className="text-lg font-medium">Camera {i + 1} feed</span>
                            <p className="text-sm text-zinc-500 mt-2">Click to expand</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {subTab === "live" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-white">Live Camera</h2>
                  <Card className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur hover:border-blue-500/30 transition-colors overflow-hidden min-h-[18rem] lg:min-h-[24rem]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain bg-black rounded-2xl"
                      autoPlay
                      muted
                      playsInline
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 transition-all" 
                        onClick={startCamera} 
                        disabled={camStarting || !!streamRef.current}
                      >
                        {camStarting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        {camStarting ? "Starting..." : "Start"}
                      </Button>
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 transition-all" 
                        onClick={stopCamera} 
                        disabled={!streamRef.current}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {subTab === "sos" && (
                <div className="flex flex-col items-center justify-center gap-6 py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                    <div className="absolute inset-0 animate-ping">
                      <AlertTriangle className="w-16 h-16 text-red-400/30" />
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-semibold text-white">Emergency SOS</h2>
                  <p className="text-zinc-400 text-center max-w-md">
                    Use only in genuine emergencies. This will immediately notify school administration and law enforcement.
                  </p>
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full transition-all hover:scale-105 shadow-lg shadow-red-500/25"
                    onClick={() => {
                      if (confirm("Trigger Emergency SOS? This will notify principal and police.")) {
                        toast({ title: "SOS triggered", description: "Notifying principal…" });
                        setTimeout(() => toast({ title: "Notifying police station…" }), 600);
                      }
                    }}
                  >
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    Send SOS
                  </Button>
                  <p className="text-sm text-zinc-500">Use only in emergencies.</p>
                </div>
              )}
            </motion.main>

            <motion.aside variants={cardVariants} className="w-full">
              <Card className="group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur hover:border-blue-500/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Security Events</h3>
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <Tabs value={eventsTab} onValueChange={(v) => setEventsTab(v as "live" | "past")} className="w-full">
                  <TabsList className="relative grid grid-cols-2 gap-2 p-1 items-center bg-transparent backdrop-blur-md border border-border/30 rounded-full shadow-lg w-auto h-full">
                    <motion.div
                      className="absolute top-1 bottom-1 bg-blue-500/20 rounded-full"
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        width: `calc(50% - 4px)`,
                        left: eventsTab === "live" ? "4px" : `calc(50% + 1px)`,
                      }}
                    />
                    <TabsTrigger 
                      value="live" 
                      className="relative px-3 py-2 text-sm rounded-lg data-[state=active]:bg-transparent text-white data-[state=active]:text-white"
                    >
                      <span className="relative z-10">Live</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="past" 
                      className="relative px-3 py-2 text-sm rounded-lg data-[state=active]:bg-transparent text-white data-[state=active]:text-white"
                    >
                      <span className="relative z-10">Past</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="live">
                    <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {liveEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                          <div className="text-sm text-zinc-400">No live events</div>
                          <div className="text-xs text-zinc-500 mt-1">All clear for now</div>
                        </div>
                      ) : (
                        liveEvents.map((ev) => {
                          const severityColor = ev.severity === "high" ? "red" : ev.severity === "medium" ? "orange" : "blue";
                          const severityBg = ev.severity === "high" ? "red-500/10" : ev.severity === "medium" ? "orange-500/10" : "blue-500/10";
                          const severityBorder = ev.severity === "high" ? "red-500/30" : ev.severity === "medium" ? "orange-500/30" : "blue-500/30";
                          
                          return (
                            <motion.div
                              key={ev.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`group relative rounded-xl border border-white/10 bg-zinc-800/40 p-4 backdrop-blur hover:border-${severityColor}-500/30 transition-colors`}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br from-${severityColor}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`} />
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-medium text-white">{ev.detected}</div>
                                    {ev.severity && (
                                      <span className={`text-xs px-2 py-1 rounded-full font-medium bg-${severityBg} text-${severityColor}-300 border border-${severityBorder}`}>
                                        {ev.severity.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-zinc-400">{ev.camera} • {ev.timestamp}</div>
                                  {ev.combined_score && (
                                    <div className="text-xs text-zinc-500 mt-1">
                                      Confidence: {ev.combined_score.toFixed(1)}% 
                                      {ev.scores && (
                                        <span className="ml-2">
                                          (Video: {ev.scores.video.toFixed(1)}%, Audio: {ev.scores.audio.toFixed(1)}%)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className={`w-2 h-2 bg-${severityColor}-400 rounded-full animate-pulse`} />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => rejectEvent(ev.id)} 
                                  className="rounded-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-300 hover:text-red-200 transition-all"
                                >
                                  <X className="w-4 h-4 mr-2" /> 
                                  Reject
                                </Button>
                                <Button 
                                  onClick={() => approveEvent(ev.id)} 
                                  className="rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-300 hover:text-blue-200 transition-all"
                                >
                                  <Check className="w-4 h-4 mr-2" /> 
                                  Approve
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="past">
                    <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {pastEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                          <div className="text-sm text-zinc-400">No past events</div>
                          <div className="text-xs text-zinc-500 mt-1">Event history will appear here</div>
                        </div>
                      ) : (
                        pastEvents.map((ev) => (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative rounded-xl border border-white/10 bg-zinc-800/40 p-4 backdrop-blur hover:border-zinc-500/30 transition-colors"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-medium text-white mb-1">{ev.detected}</div>
                                <div className="text-sm text-zinc-400">{ev.camera} • {ev.timestamp}</div>
                              </div>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  ev.status === "accepted"
                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                }`}
                              >
                                {ev.status === "accepted" ? "Accepted" : "Rejected"}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.aside>
          </motion.div>
        </div>
      </section>

      {/* High Severity Popup */}
      {showHighSeverityPopup && highSeverityEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHighSeverityPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full h-full max-w-7xl max-h-[80vh] bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600/20 to-red-500/20 backdrop-blur-md border-b border-red-500/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🚨 HIGH SEVERITY ALERT</h2>
                    <p className="text-red-300">Immediate action required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHighSeverityPopup(false)}
                  className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="pt-24 p-8 h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Event Details */}
                <div className="space-y-6">
                  <div className="bg-zinc-900/40 rounded-2xl p-6 border border-red-500/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Detection:</span>
                        <span className="text-white font-medium">{highSeverityEvent.detected}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Camera:</span>
                        <span className="text-white font-medium">{highSeverityEvent.camera}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Timestamp:</span>
                        <span className="text-white font-medium">{highSeverityEvent.timestamp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Event ID:</span>
                        <span className="text-white font-mono text-sm">{highSeverityEvent.event_id}</span>
                      </div>
                      {highSeverityEvent.combined_score && (
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Confidence:</span>
                          <span className="text-red-400 font-bold">{highSeverityEvent.combined_score.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scores Breakdown */}
                  {highSeverityEvent.scores && (
                    <div className="bg-zinc-900/40 rounded-2xl p-6 border border-red-500/20">
                      <h3 className="text-xl font-semibold text-white mb-4">Detection Scores</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-zinc-400">Video Analysis</span>
                            <span className="text-white font-medium">{highSeverityEvent.scores.video.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${highSeverityEvent.scores.video}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-zinc-400">Audio Analysis</span>
                            <span className="text-white font-medium">{highSeverityEvent.scores.audio.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${highSeverityEvent.scores.audio}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg rounded-xl"
                      onClick={() => {
                        approveEvent(highSeverityEvent.id);
                        setShowHighSeverityPopup(false);
                      }}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      CONFIRM THREAT - ESCALATE NOW
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10 py-4 text-lg rounded-xl"
                      onClick={() => {
                        rejectEvent(highSeverityEvent.id);
                        setShowHighSeverityPopup(false);
                      }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      FALSE ALARM - DISMISS
                    </Button>
                  </div>
                </div>

                {/* Live Feed Simulation */}
                <div className="bg-zinc-900/40 rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">Live Camera Feed</h3>
                  <div className="relative bg-black rounded-xl h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-red-300 font-medium">Live Feed from {highSeverityEvent.camera}</p>
                      <p className="text-zinc-500 text-sm mt-2">Weapon detection in progress...</p>
                    </div>
                    {/* Simulated detection overlay */}
                    <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      WEAPON DETECTED
                    </div>
                    <div className="absolute bottom-4 right-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Camera Feed Full-Screen Popup */}
      {expandedCamera !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedCamera(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full h-full max-w-7xl max-h-[90vh] bg-zinc-900 rounded-3xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20 backdrop-blur-md border-b border-blue-500/30 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Camera {expandedCamera + 1} Feed</h2>
                    <p className="text-blue-300">Live Security Feed</p>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedCamera(null)}
                  className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Camera Feed Content */}
            <div className="pt-16 h-full flex items-center justify-center bg-black">
              <div className="relative w-full h-full max-w-5xl max-h-[70vh] bg-zinc-800 rounded-2xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-24 h-24 mx-auto mb-6 text-blue-400 animate-pulse" />
                  <h3 className="text-3xl font-bold text-white mb-2">Camera {expandedCamera + 1} Feed</h3>
                  <p className="text-xl text-zinc-400 mb-4">Live Security Feed</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-400 font-medium">LIVE</span>
                  </div>
                  <div className="text-sm text-zinc-500">
                    <p>Resolution: 1920x1080</p>
                    <p>FPS: 30</p>
                    <p>Status: Active</p>
                  </div>
                </div>
                {/* Simulated camera overlay elements */}
                <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  LIVE FEED
                </div>
                <div className="absolute top-4 right-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  REC
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  Camera {expandedCamera + 1}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
 
