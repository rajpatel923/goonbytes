import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Camera, Check, Loader2, Video, X } from "lucide-react";

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

  type SecurityEvent = {
    id: string;
    camera: string;
    detected: string;
    timestamp: string;
    status: "live" | "accepted" | "rejected";
  };
  const [liveEvents, setLiveEvents] = useState<SecurityEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<SecurityEvent[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camStarting, setCamStarting] = useState(false);
  const [eventsTab, setEventsTab] = useState<"live" | "past">("live");

  // Match the floating/top nav starry background
  const starBackground =
    'radial-gradient(2px 2px at 20px 30px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 90px 40px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 40px 70px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 150px 10px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 200px 80px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 250px 50px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 300px 30px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 350px 70px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 400px 10px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 450px 90px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 500px 50px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 550px 20px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 600px 60px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 650px 40px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 700px 80px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 750px 10px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 800px 50px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 850px 30px, #ffffff, transparent), ' +
    'radial-gradient(2px 2px at 900px 70px, #ffffff, transparent), ' +
    'radial-gradient(1px 1px at 950px 90px, #ffffff, transparent), ' +
    'linear-gradient(to bottom, rgba(5, 5, 20, 0.15), rgba(15, 10, 40, 0.15))';

  const subNavItemClass = (active: boolean) =>
    cn(
      "w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-300 hover-scale relative overflow-hidden",
      active
        ? "text-primary font-medium"
        : "text-foreground/70 hover:text-foreground hover:bg-muted"
    );

  const startCamera = async () => {
    if (camStarting || streamRef.current) return;
    setCamStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {/* autoplay handled by attribute */});
      }
    } catch (err: any) {
      toast({ title: "Camera error", description: err?.message || "Unable to access camera" });
    } finally {
      setCamStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      (videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null }).srcObject = null;
    }
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

  const simulateIncomingEvent = () => {
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
    setLiveEvents((prev) => [ev, ...prev]);
    toast({ title: "New security event", description: `${ev.detected} • ${ev.camera}` });
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
<div className="min-h-screen pt-20 bg-[#1f2022] text-blue-200">
      <section className="py-4 lg:py-6">
        <div className="w-full max-w-none px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
                        <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Security Dashboard</h1>
                <p className="text-blue-100/80 text-sm">Monitor feeds, events, and SOS in real-time.</p>
              </div>
              <Button onClick={signOut} variant="outline" className="text-black">Sign Out</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(12rem,16rem)_1fr_minmax(18rem,24rem)] gap-3 lg:gap-5 xl:gap-6 items-start max-w-[1600px] mx-auto px-1 sm:px-2">
              <aside className="w-full">
                <Card className="p-2 bg-background/20 backdrop-blur-md border border-border/30 rounded-2xl" style={{ backgroundImage: starBackground, backgroundSize: '1000px 100px', backgroundRepeat: 'repeat-x' }}>
                  <nav className="flex lg:flex-col gap-2 relative">
                    <button className={subNavItemClass(subTab === "feed")} onClick={() => setSubTab("feed") }>
                      <span className="inline-flex items-center gap-2 relative z-10"><Video className="w-4 h-4" /> Feed</span>
                      {subTab === "feed" && (
                        <motion.div className="absolute inset-0 bg-blue-500/10 rounded-lg" layoutId="activeSubNavBg" transition={{ type: "spring", duration: 0.6 }} />
                      )}
                    </button>
                    <button className={subNavItemClass(subTab === "live")} onClick={() => setSubTab("live") }>
                      <span className="inline-flex items-center gap-2 relative z-10"><Camera className="w-4 h-4" /> Live Camera</span>
                      {subTab === "live" && (
                        <motion.div className="absolute inset-0 bg-blue-500/10 rounded-lg" layoutId="activeSubNavBg" transition={{ type: "spring", duration: 0.6 }} />
                      )}
                    </button>
                    <button className={subNavItemClass(subTab === "sos")} onClick={() => setSubTab("sos") }>
                      <span className="inline-flex items-center gap-2 relative z-10"><AlertTriangle className="w-4 h-4" /> Emergency SOS</span>
                      {subTab === "sos" && (
                        <motion.div className="absolute inset-0 bg-blue-500/10 rounded-lg" layoutId="activeSubNavBg" transition={{ type: "spring", duration: 0.6 }} />
                      )}
                    </button>
                  </nav>
                  <div className="mt-3">
                    <Button size="sm" className="w-full" variant="secondary" onClick={simulateIncomingEvent}>
                      Simulate Event
                    </Button>
                  </div>
                </Card>
              </aside>

              <main className="flex-1 min-w-0">
                {subTab === "feed" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Feeds</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card
                          key={i}
                          className="h-56 sm:h-64 lg:h-72 bg-muted/40 border border-border/50 overflow-hidden relative rounded-xl"
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <span>Camera {i + 1} feed</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {subTab === "live" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Live Camera</h2>
                    <Card className="bg-black border border-border/50 overflow-hidden relative rounded-xl min-h-[18rem] lg:min-h-[24rem]">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain bg-black"
                        autoPlay
                        muted
                        playsInline
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={startCamera} disabled={camStarting || !!streamRef.current}>Start</Button>
                        <Button size="sm" variant="destructive" onClick={stopCamera} disabled={!streamRef.current}>Stop</Button>
                      </div>
                    </Card>
                  </div>
                )}

                {subTab === "sos" && (
                  <div className="flex flex-col items-center justify-center gap-4 py-10">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                    <h2 className="text-xl font-semibold">Emergency SOS</h2>
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full"
                      onClick={() => {
                        if (confirm("Trigger Emergency SOS? This will notify principal and police.")) {
                          toast({ title: "SOS triggered", description: "Notifying principal…" });
                          setTimeout(() => toast({ title: "Notifying police station…" }), 600);
                        }
                      }}
                    >
                      Send SOS
                    </Button>
                    <p className="text-sm text-blue-100/80">Use only in emergencies.</p>
                  </div>
                )}
              </main>

<aside className="w-full">
                <Card className="p-3 sm:p-4 bg-background/20 backdrop-blur-md border border-border/30 rounded-2xl" style={{ backgroundImage: starBackground, backgroundSize: '100px 100px', backgroundRepeat: 'repeat-x' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Events</h3>
                  </div>
                  <Tabs value={eventsTab} onValueChange={(v) => setEventsTab(v as "live" | "past")} className="w-full">
                    {/* MODIFIED TabsList */}
                    <TabsList className=" relative grid grid-cols-2 gap-2 p-1 items-center bg-transparent backdrop-blur-md border border-border/30 rounded-full shadow-lg w-auto h-full">
                      
                      {/* SINGLE ANIMATED HIGHLIGHTER */}
                      <motion.div
                        className="absolute top-1 bottom-1 bg-blue-500/20 rounded-full"
                        layout
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        // This uses a simple calculation for the width of the highlighter.
                        // Since there are 2 columns with a gap-2 (0.5rem or 4px) and p-1 (4px padding) 
                        // on the TabsList, the width of each trigger is close to 50%.
                        // The `left` position needs to be '1px' (from p-1) + the width of the 'live' trigger.
                        // A simpler and more robust solution is to use the `left` property based on the index:
                        // 'live' is at 0%, 'past' is at 50% (since they are in a 2-col grid).
                        style={{
                          width: `calc(50% - 4px)`, // Width is 50% minus half the gap (4px total gap / 2 = 2px, but 4px looks better for padding)
                          left: eventsTab === "live" ? "4px" : `calc(50% + 1px)`,
                        }}
                      />

                      <TabsTrigger 
                        value="live" 
                        className="relative px-3 py-2 text-sm rounded-lg data-[state=active]:bg-transparent text-white data-[state=active]:text-white"
                        // Removed the individual motion.div for live
                      >
                        <span className="relative z-10">Live</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="past" 
                        className="relative px-3 py-2 text-sm rounded-lg data-[state=active]:bg-transparent text-white data-[state=active]:text-white"
                        // Removed the individual motion.div for past
                      >
                        <span className="relative z-10">Past</span>
                      </TabsTrigger>
                    </TabsList>
                                        <TabsContent value="live">
                      <div className="mt-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {liveEvents.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-6 text-white">No live events</div>
                        ) : (
                          liveEvents.map((ev) => (
                            <Card key={ev.id} className="p-3 border border-border/50 bg-background/40">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-medium">{ev.detected}</div>
                                  <div className="text-sm text-muted-foreground">{ev.camera} • {ev.timestamp}</div>
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button variant="destructive" onClick={() => rejectEvent(ev.id)} className="gap-2"><X className="w-4 h-4" /> Reject</Button>
                                <Button onClick={() => approveEvent(ev.id)} className="gap-2"><Check className="w-4 h-4" /> Approve</Button>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="past">
                      <div className="mt-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {pastEvents.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-6 text-white">No past events</div>
                        ) : (
                          pastEvents.map((ev) => (
                            <Card key={ev.id} className="p-3 border border-border/50 bg-background/40">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-medium">{ev.detected}</div>
                                  <div className="text-sm text-muted-foreground">{ev.camera} • {ev.timestamp}</div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    ev.status === "accepted"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {ev.status === "accepted" ? "Accepted" : "Rejected"}
                                </span>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
 
