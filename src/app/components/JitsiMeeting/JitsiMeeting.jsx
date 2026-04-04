"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2, AlertCircle } from "lucide-react";

export default function JitsiMeeting({
  roomName,
  displayName,
  email,
  onReadyToClose,
  className = "w-full h-full min-h-[600px] rounded-2xl overflow-hidden",
}) {
  const containerRef = useRef(null);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [error, setError] = useState(null);
  const apiRef = useRef(null);

  const initJitsi = () => {
    if (!roomName || !containerRef.current || apiRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      setError("Jitsi Meet API failed to load");
      return;
    }

    try {
      const domain = "meet.jit.si";
      const options = {
        roomName,
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        userInfo: {
          displayName: displayName || "Participant",
          email: email || "",
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      api.addListener("readyToClose", () => {
        onReadyToClose?.();
      });
    } catch (err) {
      console.error("Error initializing Jitsi API:", err);
      setError("Failed to start the meeting.");
    }
  };

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {
          console.error("Error disposing Jitsi API:", e);
        } finally {
          apiRef.current = null;
        }
      }
    };
  }, []);

  if (!roomName) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 ${className}`}>
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="font-semibold text-slate-800">Invalid Meeting Link</p>
        <p className="text-sm text-slate-500 mt-1">Room name cannot be empty.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 ${className}`}>
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="font-semibold text-slate-800">Meeting Error</p>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://meet.jit.si/external_api.js"
        strategy="lazyOnload"
        onLoad={() => {
          setJitsiLoaded(true);
          initJitsi();
        }}
        onError={() => setError("Could not load meeting script.")}
      />
      {!jitsiLoaded && !error && (
        <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 animate-pulse ${className}`}>
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
          <p className="font-semibold text-slate-700">Connecting to secure server...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className={className}
        style={{ display: jitsiLoaded && !error ? "block" : "none" }}
      />
    </>
  );
}
